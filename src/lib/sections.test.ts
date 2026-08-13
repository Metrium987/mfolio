import { describe, expect, it } from "vitest";
import {
  DEFAULT_SECTION_ORDER,
  SECTION_IDS,
  SECTION_LABELS,
} from "./sections";

describe("sections contract", () => {
  it("has a unique list of section ids", () => {
    expect(new Set(SECTION_IDS).size).toBe(SECTION_IDS.length);
    expect(SECTION_IDS).toHaveLength(8);
  });

  it("default order is a permutation of the section ids", () => {
    expect([...DEFAULT_SECTION_ORDER].sort()).toEqual([...SECTION_IDS].sort());
  });

  it("provides a human label for every section id", () => {
    for (const id of SECTION_IDS) {
      expect(SECTION_LABELS[id]).toBeTruthy();
    }
  });
});
