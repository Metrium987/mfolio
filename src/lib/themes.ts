/**
 * Site theming — named accent palettes + the owner-controlled ambiance
 * (light / dark / auto) applied to the public site.
 *
 * The palette presets are curated color sets: each one carries its own
 * light-mode accent and a lightened "dark" variant (used on dark
 * backgrounds, where a dark accent would be unreadable). Custom colors
 * typed by the owner get a computed dark variant via `lightenHex`.
 */

/** Ambiance of the public site as chosen by the owner (default for visitors). */
export type SiteAppearanceMode = "auto" | "light" | "dark";

export type AccentPalette = {
  id: string;
  label: string;
  /** Accent used on light backgrounds (also what is stored in settings). */
  color: string;
  /** Accent used on dark backgrounds — must stay readable on the dark ink. */
  dark: string;
};

/** Curated palettes — the color sets offered in Sécurité → Apparence. */
export const ACCENT_PALETTES: AccentPalette[] = [
  { id: "terracotta", label: "Terracotta", color: "#A85B32", dark: "#D18963" },
  { id: "ink", label: "Encre", color: "#1F1C18", dark: "#8A857C" },
  { id: "midnight", label: "Bleu nuit", color: "#2F4858", dark: "#7E9CB0" },
  { id: "forest", label: "Forêt", color: "#3F6B4F", dark: "#86AC92" },
  { id: "plum", label: "Prune", color: "#7D5BA6", dark: "#B79CD4" },
  { id: "ember", label: "Braise", color: "#B03A2E", dark: "#E27D6F" },
  { id: "antique-gold", label: "Or ancien", color: "#C89B3C", dark: "#E6C87E" },
  { id: "cobalt", label: "Cobalt", color: "#2364AA", dark: "#7BA8DC" },
  { id: "rose", label: "Rose poudré", color: "#B4656F", dark: "#DD9CA4" },
  { id: "sage", label: "Sauge", color: "#7A8B6F", dark: "#AABBA0" },
];

/** Find the curated palette matching a hex color (case-insensitive). */
export function findPalette(
  hex: string | null | undefined,
): AccentPalette | undefined {
  if (!hex) return undefined;
  const normalized = hex.toLowerCase();
  return ACCENT_PALETTES.find((palette) => palette.color.toLowerCase() === normalized);
}

function channel(hex: string, index: number): number {
  return parseInt(hex.slice(index, index + 2), 16);
}

/**
 * Mix a hex color toward white so it stays legible on the dark ink
 * background. Used for custom colors that have no curated dark variant.
 * `amount` is the share of white (0 → unchanged, 1 → white).
 */
export function lightenHex(hex: string, amount = 0.4): string {
  const r = channel(hex, 1);
  const g = channel(hex, 3);
  const b = channel(hex, 5);
  const mix = (c: number) =>
    Math.round(c + (255 - c) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${mix(r)}${mix(g)}${mix(b)}`.toUpperCase();
}

/** The dark-mode accent for any theme color (palette variant or computed). */
export function darkVariant(hex: string): string {
  return findPalette(hex)?.dark ?? lightenHex(hex);
}
