/**
 * Unified 1–5 proficiency scale shared by the Languages and Skills sections.
 *
 * The admin editors offer LEVEL_OPTIONS in a dropdown and store the number
 * (1–5). The public site renders the 5-bar indicator directly from that
 * number — no free text, no guessing. Legacy values (free-text language
 * levels, 0–100 % skill proficiencies) are mapped by the helpers below.
 */

export const LEVEL_OPTIONS = [
  { value: 1, label: "Notions" },
  { value: 2, label: "Débutant" },
  { value: 3, label: "Intermédiaire" },
  { value: 4, label: "Avancé" },
  { value: 5, label: "Expert / Natif" },
] as const;

export type LevelValue = (typeof LEVEL_OPTIONS)[number]["value"];

/** Canonical French label for a 1–5 level. */
export function levelLabel(level: number): string {
  return LEVEL_OPTIONS.find((option) => option.value === level)?.label ??
    String(level);
}

function clampLevel(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value)));
}

/**
 * Map a stored value to the 1–5 scale:
 *  - numbers pass through (clamped to 1–5);
 *  - legacy free-text labels are recognized (French / English / CECRL),
 *    defaulting to 3 when unknown.
 */
export function levelToNumber(level: string | number): number {
  if (typeof level === "number") return clampLevel(level);
  const s = level
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/(natif|native|maternelle|mother|bilingue|bilingual|c2|expert|maitrise)/.test(s))
    return 5;
  if (/(courant|fluent|avance|advanced|c1|professionnel|professional|full)/.test(s))
    return 4;
  if (/(intermediaire|intermediate|b2|operationnel|conversationnel|operational)/.test(s))
    return 3;
  if (/(debutant|beginner|a2|notions|elementaire|basic|scolaire|elementary)/.test(s))
    return 2;
  if (/a1/.test(s)) return 1;
  return 3;
}

/**
 * Map a skill value to the 1–5 scale: legacy 0–100 % proficiencies are
 * divided by 20, already-normalized 1–5 values pass through (clamped).
 */
export function proficiencyToLevel(proficiency: number): number {
  if (proficiency > 5) return clampLevel(proficiency / 20);
  return clampLevel(proficiency);
}

/**
 * Text shown next to a language: the canonical label for a stored 1–5 number,
 * or the translated text as-is (English mirror stays free text).
 */
export function displayLevel(level: string | number): string {
  return typeof level === "number" ? levelLabel(level) : level;
}
