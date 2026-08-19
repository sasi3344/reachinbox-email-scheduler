import { describe, it, expect } from 'vitest';
import {
  getHourWindowKey,
  getNextHourWindowDate,
  getDelayMsUntil,
  addMilliseconds,
} from '../src/utils/date.util.js';

describe('Date Utilities', () => {
  it('should format UTC hour window key correctly', () => {
    const fixedDate = new Date('2026-08-18T14:35:20.000Z');
    const key = getHourWindowKey(fixedDate);
    expect(key).toBe('2026-08-18T14');
  });

  it('should compute next hour window boundary in UTC', () => {
    const fixedDate = new Date('2026-08-18T14:45:00.000Z');
    const nextWindow = getNextHourWindowDate(fixedDate);
    expect(nextWindow.toISOString()).toBe('2026-08-18T15:00:00.000Z');
  });

  it('should roll over to next day when hour is 23', () => {
    const fixedDate = new Date('2026-08-18T23:50:00.000Z');
    const nextWindow = getNextHourWindowDate(fixedDate);
    expect(nextWindow.toISOString()).toBe('2026-08-19T00:00:00.000Z');
  });

  it('should calculate delay milliseconds correctly', () => {
    const now = Date.now();
    const futureDate = new Date(now + 5000);
    const delay = getDelayMsUntil(futureDate);
    expect(delay).toBeGreaterThanOrEqual(4900);
    expect(delay).toBeLessThanOrEqual(5100);

    const pastDate = new Date(now - 5000);
    expect(getDelayMsUntil(pastDate)).toBe(0);
  });

  it('should add milliseconds accurately', () => {
    const base = new Date('2026-08-18T10:00:00.000Z');
    const result = addMilliseconds(base, 2000);
    expect(result.toISOString()).toBe('2026-08-18T10:00:02.000Z');
  });
});
