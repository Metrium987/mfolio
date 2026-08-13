import { describe, expect, it } from "vitest";
import {
  DAY,
  countByWindow,
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
