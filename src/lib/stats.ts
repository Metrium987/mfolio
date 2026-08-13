/**
 * Pure date-window helpers for the dashboard visitor/message stats.
 * Extracted from the Convex query so they can be unit tested without a
 * Convex runtime. No imports allowed here — this module is shared between
 * the frontend tests (vitest) and the backend.
 */

export const DAY = 24 * 60 * 60 * 1000;

export function startOfDayUTC(ts: number): number {
  const date = new Date(ts);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

export function startOfWeekUTC(ts: number): number {
  const date = new Date(startOfDayUTC(ts));
  // Monday as first day of the week
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day);
  return date.getTime();
}

export function startOfMonthUTC(ts: number): number {
  const date = new Date(ts);
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

export function countByWindow(
  items: { createdAt: number }[],
  since: number,
): number {
  return items.filter((item) => item.createdAt >= since).length;
}
