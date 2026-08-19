import crypto from 'crypto';
import { env } from '../config/env.config';
import { campaignRepository } from '../repositories/campaign.repository';
import { emailRepository } from '../repositories/email.repository';
import { addEmailJobsBulk, AddEmailJobInput } from '../queues/email.queue';
import { calculateEmailSchedules } from '../utils/date-calculator';
import { ScheduleEmailInput } from '../types';
import { logger } from '../utils/logger';

export interface ScheduleResult {
  campaignId: string;
  totalEmails: number;
  message: string;
}

export class ScheduleEmailService {
  async scheduleCampaign(
    userId: string,
    input: ScheduleEmailInput,
    senderEmail?: string
  ): Promise<ScheduleResult> {
    const { subject, body, recipients, startTime, delayBetweenEmails, hourlyLimit } = input;

    // 1. Sanitize & deduplicate recipient emails
    const validRecipients = Array.from(
      new Set(
        recipients
          .map((r) => r.trim().toLowerCase())
          .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r))
      )
    );

    if (validRecipients.length === 0) {
      throw new Error('No valid recipient email addresses provided.');
    }

    // 2. Enforce system minimum delay
    const effectiveDelay = Math.max(delayBetweenEmails, env.MIN_EMAIL_DELAY_MS);
    const effectiveHourlyLimit = hourlyLimit > 0 ? hourlyLimit : env.MAX_EMAILS_PER_HOUR;

    logger.info(
      `Scheduling campaign for user ${userId}: ${validRecipients.length} recipients, start ${startTime}, delay ${effectiveDelay}ms, hourly limit ${effectiveHourlyLimit}`
    );

    // 3. Calculate schedule slots
    const schedules = calculateEmailSchedules(validRecipients, {
      startTime,
      delayBetweenEmailsMs: effectiveDelay,
      minDelayMs: env.MIN_EMAIL_DELAY_MS,
      hourlyLimit: effectiveHourlyLimit,
    });

    // 4. Create Campaign in Repository
    const campaign = await campaignRepository.create({
      user: { connect: { id: userId } },
      subject,
      body,
      startTime: new Date(startTime),
      delayBetweenEmails: effectiveDelay,
      hourlyLimit: effectiveHourlyLimit,
      totalRecipients: validRecipients.length,
    });

    // 5. Generate Email records with pre-assigned deterministic UUIDs for high performance bulk insert
    const emailRecordsToInsert = schedules.map((item) => {
      const emailId = crypto.randomUUID();
      const jobId = `email-${emailId}`;
      return {
        id: emailId,
        campaignId: campaign.id,
        userId,
        recipient: item.recipient,
        subject,
        body,
        scheduledAt: item.scheduledAt,
        jobId,
        senderEmail: senderEmail || null,
        status: 'SCHEDULED' as const,
        attempts: 0,
        delayMs: item.delayMs,
      };
    });

    // Insert all emails via repository
    await emailRepository.createMany(
      emailRecordsToInsert.map(({ delayMs, ...record }) => record as any)
    );

    logger.info(`Persisted ${emailRecordsToInsert.length} email records for campaign ${campaign.id}`);

    // 6. Bulk enqueue delayed jobs
    const queueJobs: AddEmailJobInput[] = emailRecordsToInsert.map((rec) => ({
      emailId: rec.id,
      campaignId: campaign.id,
      userId,
      recipient: rec.recipient,
      senderName: input.senderName,
      subject,
      body,
      senderEmail: rec.senderEmail || undefined,
      hourlyLimit: effectiveHourlyLimit,
      delayMs: rec.delayMs,
    }));

    await addEmailJobsBulk(queueJobs);

    return {
      campaignId: campaign.id,
      totalEmails: validRecipients.length,
      message: 'Emails scheduled successfully',
    };
  }
}

export const scheduleEmailService = new ScheduleEmailService();
