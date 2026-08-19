import axios, { AxiosError } from 'axios';
import { ApiResponse, Email, EmailCampaign, HealthStatus, ScheduleEmailPayload, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('reachinbox_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SmtpSettings {
  email: string;
  host: string;
  port: number;
  user: string;
  isCustom?: boolean;
}

export interface SaveSmtpPayload {
  email: string;
  host: string;
  port: number;
  user: string;
  pass: string;
}

export const api = {
  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to get user profile');
    }
    return res.data.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('reachinbox_token');
    await apiClient.post('/auth/logout');
  },

  async loginWithEmail(email: string, name?: string): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/email-login', {
      email,
      name,
    });
    if (res.data.success && res.data.data) {
      localStorage.setItem('reachinbox_token', res.data.data.token);
      return res.data.data;
    }
    throw new Error(res.data.message || 'Email login failed');
  },

  async devLogin(): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/dev-login');
    if (res.data.success && res.data.data) {
      localStorage.setItem('reachinbox_token', res.data.data.token);
      return res.data.data;
    }
    throw new Error(res.data.message || 'Dev login failed');
  },

  async scheduleEmails(payload: ScheduleEmailPayload): Promise<{ campaignId: string; totalEmails: number }> {
    const res = await apiClient.post<ApiResponse<{ campaignId: string; totalEmails: number }>>(
      '/emails/schedule',
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to schedule campaign');
    }
    return res.data.data;
  },

  async getScheduledEmails(limit = 100): Promise<Email[]> {
    const res = await apiClient.get<ApiResponse<Email[]>>(`/emails/scheduled?limit=${limit}`);
    return res.data.data || [];
  },

  async getSentEmails(limit = 100): Promise<Email[]> {
    const res = await apiClient.get<ApiResponse<Email[]>>(`/emails/sent?limit=${limit}`);
    return res.data.data || [];
  },

  async getCampaigns(): Promise<EmailCampaign[]> {
    const res = await apiClient.get<ApiResponse<EmailCampaign[]>>('/campaigns');
    return res.data.data || [];
  },

  async getHealth(): Promise<HealthStatus> {
    const res = await apiClient.get<HealthStatus>('/health');
    return res.data;
  },

  async getSmtpSettings(): Promise<SmtpSettings> {
    const res = await apiClient.get<ApiResponse<SmtpSettings>>('/settings/smtp');
    return res.data.data || { email: '', host: '', port: 587, user: '', isCustom: false };
  },

  async saveSmtpSettings(payload: SaveSmtpPayload): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>('/settings/smtp', payload);
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to save SMTP settings');
    }
    return res.data;
  },
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ApiResponse>;
    return err.response?.data?.message || err.message || 'Network request failed';
  }
  return (error as Error)?.message || 'An unexpected error occurred';
}
