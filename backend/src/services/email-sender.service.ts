import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env.config';
import { SendEmailOptions, SendEmailResult } from '../types';
import { logger } from '../utils/logger';

function formatRecipientName(email: string): string {
  if (!email || !email.includes('@')) return 'there';
  const prefix = email.split('@')[0].replace(/[0-9._-]+/g, ' ').trim();
  if (!prefix || prefix.length < 2) return 'there';
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

export class EmailSenderService {
  private dynamicTransporter: Transporter | null = null;
  private dynamicAccount: nodemailer.TestAccount | null = null;

  /**
   * Returns a configured Nodemailer transporter using official Gmail SMTP or Ethereal sandbox.
   * Forces direct SSL (Port 465) for Gmail to maximize reputation score.
   */
  async getTransporter(customConfig?: {
    host: string;
    port: number;
    user: string;
    pass: string;
  }): Promise<Transporter> {
    if (customConfig && customConfig.user && customConfig.pass) {
      const isGmail = customConfig.host.includes('gmail.com') || customConfig.user.includes('@gmail.com');
      return nodemailer.createTransport({
        service: isGmail ? 'gmail' : undefined,
        host: isGmail ? 'smtp.gmail.com' : customConfig.host,
        port: isGmail ? 465 : customConfig.port,
        secure: isGmail ? true : customConfig.port === 465,
        auth: {
          user: customConfig.user,
          pass: customConfig.pass.replace(/\s+/g, ''),
        },
      });
    }

    if (env.ETHEREAL_USER && env.ETHEREAL_PASSWORD) {
      const isGmail = env.ETHEREAL_HOST.includes('gmail.com') || env.ETHEREAL_USER.includes('@gmail.com');
      return nodemailer.createTransport({
        service: isGmail ? 'gmail' : undefined,
        host: isGmail ? 'smtp.gmail.com' : env.ETHEREAL_HOST,
        port: isGmail ? 465 : env.ETHEREAL_PORT,
        secure: isGmail ? true : env.ETHEREAL_PORT === 465,
        auth: {
          user: env.ETHEREAL_USER,
          pass: env.ETHEREAL_PASSWORD.replace(/\s+/g, ''),
        },
      });
    }

    // Auto-generate test account if none configured
    if (!this.dynamicTransporter) {
      logger.info('No SMTP credentials provided in env. Generating temporary Ethereal test account...');
      this.dynamicAccount = await nodemailer.createTestAccount();
      this.dynamicTransporter = nodemailer.createTransport({
        host: this.dynamicAccount.smtp.host,
        port: this.dynamicAccount.smtp.port,
        secure: this.dynamicAccount.smtp.secure,
        auth: {
          user: this.dynamicAccount.user,
          pass: this.dynamicAccount.pass,
        },
      });
      logger.info(`Generated temporary Ethereal account: ${this.dynamicAccount.user}`);
    }

    return this.dynamicTransporter;
  }

  /**
   * Sends an email via Nodemailer matching 100% human-sent Gmail web client formatting
   * to guarantee Primary Inbox delivery for external recipients.
   */
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const transporter = await this.getTransporter(options.smtpConfig);
      const activeSender = options.smtpConfig?.user || env.ETHEREAL_USER || 'no-reply@ethereal.email';

      // Humanized personalization
      const recipientName = formatRecipientName(options.to);
      const customizedBody = options.html
        .replace(/\{\{\s*name\s*\}\}/gi, recipientName)
        .replace(/\{\{\s*email\s*\}\}/gi, options.to);

      // Clean plain text representation
      const textContent = customizedBody
        .replace(/<style[^>]*>.*<\/style>/gis, '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

      // Standard Gmail web client HTML wrapper
      const htmlContent = customizedBody.includes('<html')
        ? customizedBody
        : `<div dir="ltr" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222222;line-height:1.5;">${customizedBody.replace(/\n/g, '<br/>')}</div>`;

      const senderDisplayName = options.senderName?.trim() || 'Sasidhar';
      const fromAddress = options.from && options.from.includes('<')
        ? options.from
        : `"${senderDisplayName}" <${activeSender}>`;

      const mailOptions = {
        from: fromAddress,
        to: options.to,
        replyTo: activeSender,
        subject: options.subject,
        html: htmlContent,
        text: textContent,
      };

      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

      logger.info(`✉️ Email successfully dispatched to [${options.to}] (MessageId: ${info.messageId})`);
      if (previewUrl) {
        logger.info(`🔗 Ethereal Preview URL: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error: any) {
      logger.error(`Failed to send email to [${options.to}]:`, { error: error.message });
      return {
        success: false,
        error: error.message || 'Unknown SMTP error',
      };
    }
  }
}

export const emailSenderService = new EmailSenderService();
