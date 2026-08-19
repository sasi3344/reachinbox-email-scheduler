import { ScheduleCalculationItem } from '../types';

export interface ScheduleOptions {
  startTime: Date | string;
  delayBetweenEmailsMs: number;
  minDelayMs: number;
  hourlyLimit?: number;
}

/**
 * Calculates deterministic scheduled times and delay offsets for a list of recipients.
 * Enforces minimum delay boundaries and returns ISO-compatible dates.
 */
export function calculateEmailSchedules(
  recipients: string[],
  options: ScheduleOptions
): ScheduleCalculationItem[] {
  const { startTime, delayBetweenEmailsMs, minDelayMs } = options;

  const baseStartTime = new Date(startTime);
  const now = new Date();

  // If start time is in the past, default to now
  const effectiveStartMs = Math.max(baseStartTime.getTime(), now.getTime());
  
  // Enforce system minimum delay
  const effectiveDelayMs = Math.max(delayBetweenEmailsMs, minDelayMs);

  return recipients.map((recipient, index) => {
    const scheduledTimeMs = effectiveStartMs + index * effectiveDelayMs;
    const scheduledAt = new Date(scheduledTimeMs);
    const delayFromNow = Math.max(0, scheduledTimeMs - Date.now());

    return {
      recipient,
      scheduledAt,
      delayMs: delayFromNow,
    };
  });
}

/**
 * Calculates the start timestamp of the next hour window in UTC (e.g. 14:45 -> 15:00 UTC).
 */
export function getNextHourWindowDate(currentDate: Date = new Date()): Date {
  const nextHour = new Date(currentDate);
  nextHour.setUTCMilliseconds(0);
  nextHour.setUTCSeconds(0);
  nextHour.setUTCMinutes(0);
  nextHour.setUTCHours(nextHour.getUTCHours() + 1);
  return nextHour;
}

/**
 * Generates an hour window string key in UTC (e.g., "2026-08-18T14").
 */
export function getHourWindowKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}`;
}
