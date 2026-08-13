import { describe, expect, it } from "vitest";
import {
  DAY,
  countByWindow,
  deviceBucket,
  distinctCount,
  distinctCountSince,
  groupCounts,
  hourHistogram,
  startOfDayUTC,
  startOfMonthUTC,
  startOfWeekUTC,
} from "./stats";

describe("startOfDayUTC", () => {
  it("truncates to midnight UTC", () => {
    const ts = Date.UTC(2024, 0, 15, 12, 34, 56);
    expect(startOfDayUTC(ts)).toBe(Date.UTC(2024, 0, 15));
  });
});

describe("startOfWeekUTC", () => {
  it("returns the Monday of the same week", () => {
    // Thursday 2024-01-18 → Monday 2024-01-15
    const thursday = Date.UTC(2024, 0, 18, 10, 0, 0);
    expect(startOfWeekUTC(thursday)).toBe(Date.UTC(2024, 0, 15));
    // Sunday 2024-01-21 → Monday 2024-01-15
    const sunday = Date.UTC(2024, 0, 21, 10, 0, 0);
    expect(startOfWeekUTC(sunday)).toBe(Date.UTC(2024, 0, 15));
    // Monday itself stays on its own day
    const monday = Date.UTC(2024, 0, 15, 6, 0, 0);
    expect(startOfWeekUTC(monday)).toBe(Date.UTC(2024, 0, 15));
  });
});

describe("startOfMonthUTC", () => {
  it("returns the first day of the month", () => {
    const ts = Date.UTC(2024, 1, 15, 12, 0, 0); // Feb 15
    expect(startOfMonthUTC(ts)).toBe(Date.UTC(2024, 1, 1));
  });
});

describe("countByWindow", () => {
  it("counts only items created at or after the window start", () => {
    const now = Date.UTC(2024, 0, 15, 12, 0, 0);
    const items = [
      { createdAt: now - DAY }, // too old
      { createdAt: now - DAY + 1 }, // inside
      { createdAt: now }, // inside
      { createdAt: now + 1000 }, // inside
    ];
    expect(countByWindow(items, now - DAY + 1)).toBe(3);
    expect(countByWindow(items, now)).toBe(2);
    expect(countByWindow([], now)).toBe(0);
  });
});

describe("distinctCount", () => {
  it("counts unique non-empty values", () => {
    expect(distinctCount(["a", "b", "a", undefined, ""])).toBe(2);
    expect(distinctCount([])).toBe(0);
    expect(distinctCount([undefined, undefined])).toBe(0);
  });
});

describe("distinctCountSince", () => {
  it("filters by window before counting distinct keys", () => {
    const items = [
      { createdAt: 100, id: "a" },
      { createdAt: 200, id: "a" },
      { createdAt: 300, id: "b" },
    ];
    expect(distinctCountSince(items, (i) => i.id, 200)).toBe(2);
    expect(distinctCountSince(items, (i) => i.id, 300)).toBe(1);
    expect(distinctCountSince(items, (i) => i.id, 999)).toBe(0);
  });
});

describe("groupCounts", () => {
  it("counts per key, sorted descending, capped by top", () => {
    const items = ["b", "a", "b", "c", "b", "a"].map((key) => ({ key }));
    expect(groupCounts(items, (i) => i.key, 2)).toEqual([
      { key: "b", count: 3 },
      { key: "a", count: 2 },
    ]);
    expect(groupCounts(items, (i) => i.key)).toHaveLength(3);
    expect(groupCounts<{ key: string }>([], (i) => i.key)).toEqual([]);
  });
});

describe("hourHistogram", () => {
  it("buckets createdAt into 24 UTC hours", () => {
    const items = [
      { createdAt: Date.UTC(2024, 0, 1, 8, 0, 0) },
      { createdAt: Date.UTC(2024, 0, 1, 8, 30, 0) },
      { createdAt: Date.UTC(2024, 0, 1, 20, 0, 0) },
    ];
    const hours = hourHistogram(items);
    expect(hours).toHaveLength(24);
    expect(hours[8]).toBe(2);
    expect(hours[20]).toBe(1);
    expect(hours[0]).toBe(0);
    expect(hourHistogram([])).toEqual(new Array(24).fill(0));
  });
});

describe("deviceBucket", () => {
  it("maps platform labels to device buckets", () => {
    expect(deviceBucket("Android")).toBe("mobile");
    expect(deviceBucket("iOS")).toBe("mobile");
    expect(deviceBucket("Windows")).toBe("desktop");
    expect(deviceBucket("macOS")).toBe("desktop");
    expect(deviceBucket("Linux")).toBe("desktop");
    expect(deviceBucket("Inconnu")).toBe("other");
    expect(deviceBucket("")).toBe("other");
  });
});
