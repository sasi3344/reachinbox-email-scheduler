import { Queue, JobsOptions } from 'bullmq';
import { getRedisConnectionOptions } from '../config/redis.config';
import { EmailJobData, EmailStatus } from '../types';
import { emailRepository } from '../repositories/email.repository';
import { emailSenderService } from '../services/email-sender.service';
import { senderService } from '../services/sender.service';
import { logger } from '../utils/logger';

export const EMAIL_QUEUE_NAME = 'emailQueue';

export let emailQueue: Queue<EmailJobData> | null = null;

try {
  emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
    connection: getRedisConnectionOptions(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { age: 86400 * 7, count: 5000 },
      removeOnFail: { age: 86400 * 14, count: 5000 },
    },
  });

  emailQueue.on('error', (err) => {
    logger.warn(`BullMQ notice: ${err.message}`);
  });
} catch (e: any) {
  logger.warn(`BullMQ Queue operating in memory fallback: ${e.message}`);
}

export interface AddEmailJobInput {
  emailId: string;
  campaignId: string;
  userId: string;
  recipient: string;
  senderName?: string;
  subject: string;
  body: string;
  senderEmail?: string;
  hourlyLimit: number;
  delayMs: number;
}

/**
 * Fallback worker execution in case Redis is offline
 */
async function executeEmailJobDirect(input: AddEmailJobInput) {
  try {
    const claimed = await emailRepository.claimForProcessing(input.emailId);
    if (!claimed) return;

    const senderConfig = await senderService.getSenderForUser(input.userId);
    const sendResult = await emailSenderService.sendEmail({
      from: senderConfig.email,
      senderName: input.senderName,
      to: input.recipient,
      subject: input.subject,
      html: input.body,
      smtpConfig: {
        host: senderConfig.host,
        port: senderConfig.port,
        user: senderConfig.user,
        pass: senderConfig.pass,
      },
    });

    if (sendResult.success) {
      await emailRepository.markAsSent(input.emailId, sendResult.previewUrl);
    } else {
      await emailRepository.markAsFailed(input.emailId, sendResult.error || 'Delivery failed');
    }
  } catch (err: any) {
    logger.error(`Error processing email ${input.emailId}: ${err.message}`);
    await emailRepository.markAsFailed(input.emailId, err.message);
  }
}

export async function addEmailJob(input: AddEmailJobInput) {
  const jobId = `email-${input.emailId}`;
  if (emailQueue) {
    try {
      return await emailQueue.add(
        'sendEmail',
        {
          emailId: input.emailId,
          campaignId: input.campaignId,
          userId: input.userId,
          recipient: input.recipient,
          senderName: input.senderName,
          subject: input.subject,
          body: input.body,
          senderEmail: input.senderEmail,
          hourlyLimit: input.hourlyLimit,
        },
        { jobId, delay: Math.max(0, input.delayMs) }
      );
    } catch {
      // Fallback to in-process timer
      setTimeout(() => executeEmailJobDirect(input), Math.max(0, input.delayMs));
      return { id: jobId };
    }
  } else {
    setTimeout(() => executeEmailJobDirect(input), Math.max(0, input.delayMs));
    return { id: jobId };
  }
}

export async function addEmailJobsBulk(inputs: AddEmailJobInput[]) {
  if (inputs.length === 0) return [];

  if (emailQueue) {
    try {
      const bulkPayload = inputs.map((input) => ({
        name: 'sendEmail',
        data: {
          emailId: input.emailId,
          campaignId: input.campaignId,
          userId: input.userId,
          recipient: input.recipient,
          senderName: input.senderName,
          subject: input.subject,
          body: input.body,
          senderEmail: input.senderEmail,
          hourlyLimit: input.hourlyLimit,
        },
        opts: {
          jobId: `email-${input.emailId}`,
          delay: Math.max(0, input.delayMs),
        },
      }));
      return await emailQueue.addBulk(bulkPayload);
    } catch {
      inputs.forEach((input) => {
        setTimeout(() => executeEmailJobDirect(input), Math.max(0, input.delayMs));
      });
      return inputs.map((i) => ({ id: `email-${i.emailId}` }));
    }
  } else {
    inputs.forEach((input) => {
      setTimeout(() => executeEmailJobDirect(input), Math.max(0, input.delayMs));
    });
    return inputs.map((i) => ({ id: `email-${i.emailId}` }));
  }
}

export async function rescheduleEmailJob(input: EmailJobData, delayMs: number) {
  const newJobId = `email-${input.emailId}-reschedule-${Date.now()}`;
  if (emailQueue) {
    try {
      return await emailQueue.add('sendEmail', input, {
        jobId: newJobId,
        delay: Math.max(0, delayMs),
      });
    } catch {
      setTimeout(() => executeEmailJobDirect({ ...input, delayMs }), Math.max(0, delayMs));
      return { id: newJobId };
    }
  } else {
    setTimeout(() => executeEmailJobDirect({ ...input, delayMs }), Math.max(0, delayMs));
    return { id: newJobId };
  }
}
