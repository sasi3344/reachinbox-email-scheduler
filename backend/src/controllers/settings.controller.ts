import { Request, Response } from 'express';
import { senderService } from '../services/sender.service';

export class SettingsController {
  async getSmtpSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const sender = await senderService.getSenderForUser(userId);
      return res.status(200).json({
        success: true,
        data: {
          email: sender.email,
          host: sender.host,
          port: sender.port,
          user: sender.user,
          isCustom: sender.senderId !== 'default-ethereal',
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async saveSmtpSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { email, host, port, user, pass } = req.body;

      if (!email || !host || !user || !pass) {
        return res.status(400).json({
          success: false,
          message: 'Email, host, user, and password/app-password are required for custom SMTP.',
        });
      }

      const saved = await senderService.saveSenderForUser(userId, {
        email,
        host,
        port: parseInt(port, 10) || 587,
        user,
        pass,
      });

      return res.status(200).json({
        success: true,
        message: 'SMTP settings updated successfully! Emails will now be sent via your SMTP account.',
        data: saved,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const settingsController = new SettingsController();
