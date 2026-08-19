import { scheduleEmailService, ScheduleResult } from './schedule-email.service';
import { ScheduleEmailInput } from '../types';

export class SchedulerService {
  async scheduleCampaign(userId: string, input: ScheduleEmailInput): Promise<ScheduleResult> {
    return scheduleEmailService.scheduleCampaign(userId, input);
  }
}

export const schedulerService = new SchedulerService();
