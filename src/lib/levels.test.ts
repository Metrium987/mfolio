import { describe, expect, it } from "vitest";
import {
  LEVEL_OPTIONS,
  displayLevel,
  levelLabel,
  levelToNumber,
  proficiencyToLevel,
} from "./levels";

describe("LEVEL_OPTIONS", () => {
  it("exposes exactly 5 levels from 1 to 5 with unique labels", () => {
    expect(LEVEL_OPTIONS).toHaveLength(5);
    expect(LEVEL_OPTIONS.map((option) => option.value)).toEqual([1, 2, 3, 4, 5]);
    const labels = LEVEL_OPTIONS.map((option) => option.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("levelLabel", () => {
  it("returns the canonical label for known levels", () => {
    expect(levelLabel(1)).toBe("Notions");
    expect(levelLabel(3)).toBe("Intermédiaire");
    expect(levelLabel(5)).toBe("Expert / Natif");
  });

  it("falls back to the raw number for unknown levels", () => {
    expect(levelLabel(7)).toBe("7");
  });
});

describe("levelToNumber", () => {
  it("passes numbers through and clamps to 1–5", () => {
    expect(levelToNumber(3)).toBe(3);
    expect(levelToNumber(0)).toBe(1);
    expect(levelToNumber(9)).toBe(5);
    expect(levelToNumber(2.6)).toBe(3);
  });

  it("recognizes French free-text levels", () => {
    expect(levelToNumber("Natif")).toBe(5);
    expect(levelToNumber("Bilingue")).toBe(5);
    expect(levelToNumber("Courant")).toBe(4);
    expect(levelToNumber("Avancé")).toBe(4);
    expect(levelToNumber("Intermédiaire")).toBe(3);
    expect(levelToNumber("Opérationnel")).toBe(3);
    expect(levelToNumber("Débutant")).toBe(2);
    expect(levelToNumber("Notions")).toBe(2);
    expect(levelToNumber("A1")).toBe(1);
  });

  it("recognizes English and CEFR labels (accents-insensitive)", () => {
    expect(levelToNumber("Native")).toBe(5);
    expect(levelToNumber("Advanced")).toBe(4);
    expect(levelToNumber("C1")).toBe(4);
    expect(levelToNumber("Intermediate")).toBe(3);
    expect(levelToNumber("B2")).toBe(3);
    expect(levelToNumber("Basic")).toBe(2);
  });

  it("defaults to 3 for unknown text", () => {
    expect(levelToNumber("blabla")).toBe(3);
    expect(levelToNumber("")).toBe(3);
  });
});

describe("proficiencyToLevel", () => {
  it("maps legacy 0–100 % proficiencies to 1–5 bars", () => {
    expect(proficiencyToLevel(100)).toBe(5);
    expect(proficiencyToLevel(92)).toBe(5);
    expect(proficiencyToLevel(85)).toBe(4);
    expect(proficiencyToLevel(40)).toBe(2);
    expect(proficiencyToLevel(0)).toBe(1);
  });

  it("passes already-normalized 1–5 values through (clamped)", () => {
    expect(proficiencyToLevel(5)).toBe(5);
    expect(proficiencyToLevel(3)).toBe(3);
    expect(proficiencyToLevel(0)).toBe(1);
  });
});

describe("displayLevel", () => {
  it("labels stored numbers and keeps free text as-is", () => {
    expect(displayLevel(4)).toBe("Avancé");
    expect(displayLevel("Fluent")).toBe("Fluent");
  });
});
