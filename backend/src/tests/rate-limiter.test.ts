import { getHourWindowKey, getNextHourWindowDate } from '../utils/date-calculator';

describe('Rate Limiter Key & Reschedule Calculation', () => {
  it('should generate consistent Redis rate limit keys per user and hour', () => {
    const userId = 'user-abc';
    const senderId = 'sender-xyz';
    const date = new Date('2026-08-18T10:15:30.000Z');

    const key = `email-rate:${userId}:${senderId}:${getHourWindowKey(date)}`;
    expect(key).toBe('email-rate:user-abc:sender-xyz:2026-08-18T10');
  });

  it('should correctly shift schedule to next hour on rate limit overflow', () => {
    const overflowTime = new Date('2026-08-18T10:59:00.000Z');
    const rescheduledTime = getNextHourWindowDate(overflowTime);

    expect(rescheduledTime.toISOString()).toBe('2026-08-18T11:00:00.000Z');
  });
});
