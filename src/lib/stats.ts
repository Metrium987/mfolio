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

/** Count of distinct non-empty string values. */
export function distinctCount(values: (string | undefined)[]): number {
  return new Set(values.filter((value): value is string => Boolean(value))).size;
}

/**
 * Distinct count of a key among items created at/after `since` (UTC window).
 */
export function distinctCountSince<T extends { createdAt: number }>(
  items: T[],
  getKey: (item: T) => string | undefined,
  since: number,
): number {
  return distinctCount(
    items.filter((item) => item.createdAt >= since).map(getKey),
  );
}

/**
 * Counts per key, sorted by count descending. `top` caps the number of
 * returned groups (used for browser/device breakdowns).
 */
export function groupCounts<T>(
  items: T[],
  getKey: (item: T) => string,
  top = Infinity,
): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

/** 24-bucket histogram of UTC hours from `createdAt` timestamps. */
export function hourHistogram(items: { createdAt: number }[]): number[] {
  const hours = new Array<number>(24).fill(0);
  for (const item of items) {
    hours[new Date(item.createdAt).getUTCHours()] += 1;
  }
  return hours;
}

/**
 * Normalizes a platform label (see detectPlatform in lib/site.tsx) into a
 * displayable device bucket. Tablets are not detected today, so iOS/Android
 * both map to "mobile".
 */
export function deviceBucket(
  platform: string,
): "mobile" | "desktop" | "other" {
  switch (platform) {
    case "Android":
    case "iOS":
      return "mobile";
    case "Windows":
    case "macOS":
    case "Linux":
      return "desktop";
    default:
      return "other";
  }
}
