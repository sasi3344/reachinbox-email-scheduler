/**
 * Generates an hourly window key for Redis rate-limiting based on UTC time.
 * Format: YYYY-MM-DDTHH (e.g., 2026-08-18T14)
 */
export function getHourWindowKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}`;
}

/**
 * Returns the Date representing the beginning of the next UTC hour window.
 * E.g., for 2026-08-18T14:35:20.000Z -> 2026-08-18T15:00:00.000Z
 */
export function getNextHourWindowDate(date: Date = new Date()): Date {
  const next = new Date(date.getTime());
  next.setUTCHours(next.getUTCHours() + 1, 0, 0, 0);
  return next;
}

/**
 * Calculates delay in milliseconds from now until the target date.
 * Returns 0 if targetDate is in the past.
 */
export function getDelayMsUntil(targetDate: Date): number {
  const diff = targetDate.getTime() - Date.now();
  return diff > 0 ? diff : 0;
}

/**
 * Adds milliseconds to a date and returns a new Date object.
 */
export function addMilliseconds(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}
