export type EmailStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatar?: string | null;
}

export interface Email {
  id: string;
  campaignId: string;
  userId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: EmailStatus;
  attempts: number;
  errorMessage?: string | null;
  jobId?: string | null;
  senderEmail?: string | null;
  previewUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  userId: string;
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
  totalRecipients: number;
  createdAt: string;
  updatedAt: string;
  emails?: Email[];
  _count?: {
    emails: number;
  };
}

export interface ScheduleEmailPayload {
  senderName?: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface HealthStatus {
  status: string;
  database: string;
  redis: string;
  worker: string;
  timestamp: string;
}
