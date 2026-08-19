import { EmailStatus } from '@prisma/client';

export { EmailStatus };

export interface AuthenticatedUser {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatar?: string | null;
}

export interface ScheduleEmailInput {
  senderName?: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: string; // ISO 8601 string
  delayBetweenEmails: number; // in milliseconds
  hourlyLimit: number;
}

export interface EmailJobData {
  emailId: string;
  campaignId: string;
  userId: string;
  recipient: string;
  senderName?: string;
  subject: string;
  body: string;
  senderEmail?: string;
  hourlyLimit: number;
}

export interface SendEmailOptions {
  from?: string;
  senderName?: string;
  to: string;
  subject: string;
  html: string;
  smtpConfig?: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ScheduleCalculationItem {
  recipient: string;
  scheduledAt: Date;
  delayMs: number;
}
