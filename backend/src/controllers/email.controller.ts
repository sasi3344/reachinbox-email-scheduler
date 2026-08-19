import { Request, Response } from 'express';
import { z } from 'zod';
import { scheduleEmailService } from '../services/schedule-email.service';
import { emailRepository } from '../repositories/email.repository';
import { logger } from '../utils/logger';

export const scheduleEmailSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
    body: z.string().min(1, 'Email body is required'),
    recipients: z
      .array(z.string().email('Invalid email address'))
      .min(1, 'At least one valid recipient is required'),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid ISO 8601 start time',
    }),
    delayBetweenEmails: z.number().int().min(0, 'Delay must be a non-negative integer'),
    hourlyLimit: z.number().int().min(1, 'Hourly limit must be at least 1'),
  }),
});

export class EmailController {
  /**
   * Schedules a new email campaign
   */
  async schedule(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { subject, body, recipients, startTime, delayBetweenEmails, hourlyLimit } = req.body;

      const result = await scheduleEmailService.scheduleCampaign(userId, {
        subject,
        body,
        recipients,
        startTime,
        delayBetweenEmails,
        hourlyLimit,
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: {
          campaignId: result.campaignId,
          totalEmails: result.totalEmails,
        },
      });
    } catch (error: any) {
      logger.error('Error scheduling email campaign:', { error: error.message });
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to schedule emails',
      });
    }
  }

  /**
   * Retrieves currently scheduled / processing emails for the authenticated user
   */
  async getScheduled(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const emails = await emailRepository.findScheduled(userId, limit);

      return res.status(200).json({
        success: true,
        data: emails,
      });
    } catch (error: any) {
      logger.error('Error fetching scheduled emails:', { error: error.message });
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve scheduled emails',
      });
    }
  }

  /**
   * Retrieves sent and failed emails for the authenticated user
   */
  async getSent(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const emails = await emailRepository.findSent(userId, limit);

      return res.status(200).json({
        success: true,
        data: emails,
      });
    } catch (error: any) {
      logger.error('Error fetching sent emails:', { error: error.message });
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve sent emails',
      });
    }
  }

  /**
   * Retrieves details for a specific email
   */
  async getById(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const email = await emailRepository.findById(id, userId);

      if (!email) {
        return res.status(404).json({
          success: false,
          message: 'Email not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: email,
      });
    } catch (error: any) {
      logger.error(`Error fetching email ${req.params.id}:`, { error: error.message });
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve email details',
      });
    }
  }
}

export const emailController = new EmailController();
