import { Worker, Job } from 'bullmq';
import { env } from '../config/env.config';
import { getRedisConnectionOptions } from '../config/redis.config';
import { EMAIL_QUEUE_NAME, rescheduleEmailJob } from '../queues/email.queue';
import { emailRepository } from '../repositories/email.repository';
import { senderService } from '../services/sender.service';
import { rateLimiterService } from '../services/rate-limiter.service';
import { emailSenderService } from '../services/email-sender.service';
import { EmailJobData, EmailStatus } from '../types';
import { logger } from '../utils/logger';

export let emailWorker: Worker<EmailJobData> | null = null;

export function startEmailWorker(): Worker<EmailJobData> | null {
  if (emailWorker) {
    return emailWorker;
  }

  try {
    logger.info(`Starting BullMQ Email Worker with concurrency: ${env.WORKER_CONCURRENCY}...`);

    emailWorker = new Worker<EmailJobData>(
      EMAIL_QUEUE_NAME,
      async (job: Job<EmailJobData>) => {
        const { emailId, campaignId, userId, recipient, senderName, subject, body, hourlyLimit } = job.data;

        logger.info(`[Worker] Picked up job ${job.id} for email ${emailId} -> ${recipient}`);

        const emailRecord = await emailRepository.findById(emailId);
        if (!emailRecord) {
          return { success: false, reason: 'RECORD_NOT_FOUND' };
        }

        if (emailRecord.status === EmailStatus.SENT) {
          return { success: true, reason: 'ALREADY_SENT' };
        }

        const claimed = await emailRepository.claimForProcessing(emailId);
        if (!claimed) {
          return { success: false, reason: 'ALREADY_CLAIMED_OR_PROCESSED' };
        }

        const senderConfig = await senderService.getSenderForUser(userId);

        const limitToEnforce = hourlyLimit || env.MAX_EMAILS_PER_HOUR;
        const rateLimitResult = await rateLimiterService.checkAndIncrement(
          userId,
          senderConfig.senderId || 'default-ethereal',
          limitToEnforce
        );

        if (!rateLimitResult.allowed && rateLimitResult.rescheduleTo) {
          const nextTime = rateLimitResult.rescheduleTo;
          const delayMs = Math.max(0, nextTime.getTime() - Date.now());

          await emailRepository.reschedule(emailId, nextTime);
          await rescheduleEmailJob(job.data, delayMs);

          return { success: false, reason: 'RATE_LIMIT_RESCHEDULED', nextTime };
        }

        const sendResult = await emailSenderService.sendEmail({
          from: senderConfig.email,
          senderName,
          to: recipient,
          subject,
          html: body,
          smtpConfig: {
            host: senderConfig.host,
            port: senderConfig.port,
            user: senderConfig.user,
            pass: senderConfig.pass,
          },
        });

        if (sendResult.success) {
          await emailRepository.markAsSent(emailId, sendResult.previewUrl);
          return { success: true, messageId: sendResult.messageId, previewUrl: sendResult.previewUrl };
        } else {
          await emailRepository.markAsFailed(emailId, sendResult.error || 'Unknown error');
          throw new Error(sendResult.error || 'SMTP delivery failed');
        }
      },
      {
        connection: getRedisConnectionOptions(),
        concurrency: env.WORKER_CONCURRENCY,
        limiter: { max: 100, duration: 1000 },
      }
    );

    emailWorker.on('completed', (job) => {
      logger.debug(`Job ${job.id} completed successfully.`);
    });

    emailWorker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} failed with error: ${err.message}`);
    });

    emailWorker.on('error', (err) => {
      logger.warn(`BullMQ Worker notice: ${err.message}`);
    });

    return emailWorker;
  } catch (err: any) {
    logger.warn(`BullMQ Worker offline: ${err.message}`);
    return null;
  }
}

export async function stopEmailWorker(): Promise<void> {
  if (emailWorker) {
    try {
      await emailWorker.close();
    } catch {}
    emailWorker = null;
  }
}
