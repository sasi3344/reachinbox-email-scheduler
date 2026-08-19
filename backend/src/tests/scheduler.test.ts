import { calculateEmailSchedules, getHourWindowKey, getNextHourWindowDate } from '../utils/date-calculator';

describe('Schedule & Date Calculator Utility', () => {
  it('should compute incremental schedules respecting delay between emails', () => {
    const recipients = ['user1@test.com', 'user2@test.com', 'user3@test.com'];
    const startTime = new Date(Date.now() + 60000); // 1 minute in future
    const delayMs = 3000;
    const minDelayMs = 2000;

    const schedules = calculateEmailSchedules(recipients, {
      startTime,
      delayBetweenEmailsMs: delayMs,
      minDelayMs,
    });

    expect(schedules).toHaveLength(3);
    expect(schedules[0].recipient).toBe('user1@test.com');
    expect(schedules[1].recipient).toBe('user2@test.com');
    expect(schedules[2].recipient).toBe('user3@test.com');

    // Check interval spacing
    const diff1 = schedules[1].scheduledAt.getTime() - schedules[0].scheduledAt.getTime();
    const diff2 = schedules[2].scheduledAt.getTime() - schedules[1].scheduledAt.getTime();

    expect(diff1).toBe(3000);
    expect(diff2).toBe(3000);
  });

  it('should enforce MIN_EMAIL_DELAY_MS if requested delay is too small', () => {
    const recipients = ['a@test.com', 'b@test.com'];
    const startTime = new Date(Date.now() + 10000);
    const requestedDelayMs = 500; // less than min 2000ms
    const minDelayMs = 2000;

    const schedules = calculateEmailSchedules(recipients, {
      startTime,
      delayBetweenEmailsMs: requestedDelayMs,
      minDelayMs,
    });

    const diff = schedules[1].scheduledAt.getTime() - schedules[0].scheduledAt.getTime();
    expect(diff).toBe(2000);
  });

  it('should format hour window string correctly', () => {
    const testDate = new Date('2026-08-18T14:35:00.000Z');
    const windowKey = getHourWindowKey(testDate);
    expect(windowKey).toBe('2026-08-18T14');
  });

  it('should calculate the top of next hour correctly for rescheduling', () => {
    const testDate = new Date('2026-08-18T14:35:10.000Z');
    const nextHour = getNextHourWindowDate(testDate);
    
    expect(nextHour.getUTCHours()).toBe(15);
    expect(nextHour.getUTCMinutes()).toBe(0);
    expect(nextHour.getUTCSeconds()).toBe(0);
  });
});
