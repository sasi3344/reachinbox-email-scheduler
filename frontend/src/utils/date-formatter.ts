import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '—';
  return format(date, 'MMM dd, yyyy · hh:mm:ss a');
}

export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatLocalInputDefault(): string {
  // Returns local date/time in YYYY-MM-DDTHH:mm format suitable for datetime-local input
  const now = new Date(Date.now() + 60000); // 1 minute in future
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
  return localISOTime;
}
