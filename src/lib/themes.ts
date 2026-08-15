/**
 * Site theming — accent palettes + complete theme presets (the owner's
 * "UI Presets", like the Freebuff Web builder's curated color sets).
 *
 * Two layers, both applied at runtime via CSS variables:
 *
 * 1. **Accent** (`themeColor`) — the accent color used on buttons, links and
 *    kickers. `applyThemeColor` feeds `--accent-light` / `--accent-dark`
 *    (see src/lib/site.tsx); the stylesheet resolves each mode from them.
 *
 * 2. **Theme presets** (`themePreset`) — full coordinated color systems: the
 *    paper (background), surfaces (cards), ink (text), neutrals, borders and
 *    ring, each defined for light AND dark. `applyThemePreset` feeds the
 *    `--p-*` / `--p-dark-*` variables. Absent or unknown preset = the default
 *    Studio look, so existing installs are byte-for-byte unchanged.
 *
 * The "studio" preset IS the stylesheet default: it is listed here for the
 * admin UI, but applyThemePreset skips it at runtime (nothing to override).
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

/** Curated accent palettes — the color sets offered in Sécurité → Apparence. */
export const ACCENT_PALETTES: AccentPalette[] = [
  { id: "terracotta", label: "Terracotta", color: "#A85B32", dark: "#D18963" },
  { id: "ink", label: "Encre", color: "#1F1C18", dark: "#D6D2CA" },
  { id: "midnight", label: "Bleu nuit", color: "#2F4858", dark: "#7E9CB0" },
  { id: "forest", label: "Forêt", color: "#3F6B4F", dark: "#86AC92" },
  { id: "plum", label: "Prune", color: "#7D5BA6", dark: "#B79CD4" },
  { id: "ember", label: "Braise", color: "#B03A2E", dark: "#E27D6F" },
  { id: "antique-gold", label: "Or ancien", color: "#C89B3C", dark: "#E6C87E" },
  { id: "cobalt", label: "Cobalt", color: "#2364AA", dark: "#7BA8DC" },
  { id: "rose", label: "Rose poudré", color: "#B4656F", dark: "#DD9CA4" },
  { id: "sage", label: "Sauge", color: "#7A8B6F", dark: "#AABBA0" },
];

/** The neutral tokens a theme preset overrides for one mode (light or dark). */
export type ThemeTokens = {
  /** Page background (the "paper"). */
  background: string;
  /** Surfaces: cards, popovers, dashboard sidebar. */
  card: string;
  /** Main text color (the "ink"). */
  ink: string;
  /** Subtle fill (inputs backgrounds, muted rows). */
  muted: string;
  /** Secondary text on the muted fills. */
  mutedInk: string;
  /** Hairline borders. */
  border: string;
  /** Hover/selected tint (shadcn `accent` + `secondary`). */
  tint: string;
  /** Focus ring. */
  ring: string;
};

/** A complete, coordinated color theme for the public site (+ dashboard). */
export type ThemePreset = {
  id: string;
  label: string;
  description: string;
  /** Accent family id (ACCENT_PALETTES) — the theme's accent + dark accent. */
  paletteId: string;
  light: ThemeTokens;
  dark: ThemeTokens;
};

/**
 * The 10 validated theme presets. The "studio" tokens mirror the stylesheet
 * defaults exactly (see index.css) — applyThemePreset skips it at runtime.
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "studio",
    label: "Studio",
    description:
      "Le thème d'origine — papier chaud, encre brune, accent terracotta.",
    paletteId: "terracotta",
    light: {
      background: "oklch(0.975 0.005 85)",
      card: "oklch(0.992 0.003 85)",
      ink: "oklch(0.24 0.014 60)",
      muted: "oklch(0.955 0.006 85)",
      mutedInk: "oklch(0.5 0.015 70)",
      border: "oklch(0.89 0.008 85)",
      tint: "oklch(0.945 0.007 85)",
      ring: "oklch(0.7 0.02 70)",
    },
    dark: {
      background: "oklch(0.17 0.01 60)",
      card: "oklch(0.21 0.012 60)",
      ink: "oklch(0.94 0.008 80)",
      muted: "oklch(0.27 0.012 60)",
      mutedInk: "oklch(0.72 0.012 75)",
      border: "oklch(1 0 0 / 10%)",
      tint: "oklch(0.27 0.012 60)",
      ring: "oklch(0.6 0.02 70)",
    },
  },
  {
    id: "encre",
    label: "Encre",
    description:
      "Monochrome éditorial et sobre — papier neutre, encre presque noire.",
    paletteId: "ink",
    light: {
      background: "#F6F5F2",
      card: "#FCFBFA",
      ink: "#1B1A17",
      muted: "#ECEAE6",
      mutedInk: "#6E6B64",
      border: "#DCDAD4",
      tint: "#ECEAE6",
      ring: "#B8B4AC",
    },
    dark: {
      background: "#161614",
      card: "#1F1F1C",
      ink: "#F2F1EE",
      muted: "#2C2B28",
      mutedInk: "#A6A29A",
      border: "#3A3935",
      tint: "#2C2B28",
      ring: "#6E6B64",
    },
  },
  {
    id: "bleu-nuit",
    label: "Bleu nuit",
    description:
      "Papier froid et encre marine — sobre et professionnel.",
    paletteId: "midnight",
    light: {
      background: "#F5F6F8",
      card: "#FCFCFD",
      ink: "#1E2530",
      muted: "#E9ECF0",
      mutedInk: "#67717D",
      border: "#D9DEE5",
      tint: "#E9ECF0",
      ring: "#A7B4C1",
    },
    dark: {
      background: "#141B23",
      card: "#1C242E",
      ink: "#E7EBF0",
      muted: "#28313C",
      mutedInk: "#9AA6B3",
      border: "#3A4652",
      tint: "#28313C",
      ring: "#64778A",
    },
  },
  {
    id: "foret",
    label: "Forêt",
    description:
      "Papier légèrement végétal, encre verte profonde — apaisant.",
    paletteId: "forest",
    light: {
      background: "#F6F7F1",
      card: "#FCFCF8",
      ink: "#2C322B",
      muted: "#ECEFE6",
      mutedInk: "#6C7567",
      border: "#DCE2D5",
      tint: "#ECEFE6",
      ring: "#A9BBA3",
    },
    dark: {
      background: "#1A211B",
      card: "#222A23",
      ink: "#E8EDE5",
      muted: "#2E3730",
      mutedInk: "#9CA89A",
      border: "#3C463C",
      tint: "#2E3730",
      ring: "#6F8875",
    },
  },
  {
    id: "prune",
    label: "Prune",
    description:
      "Papier mauve pâle, encre violacée — doux et singulier.",
    paletteId: "plum",
    light: {
      background: "#F7F5F9",
      card: "#FDFCFE",
      ink: "#322D39",
      muted: "#EFECF3",
      mutedInk: "#746D7E",
      border: "#E1DCE8",
      tint: "#EFECF3",
      ring: "#B9AFC7",
    },
    dark: {
      background: "#1E1A25",
      card: "#26212F",
      ink: "#EFEAF5",
      muted: "#342D40",
      mutedInk: "#A59CB2",
      border: "#403750",
      tint: "#342D40",
      ring: "#7A6D8F",
    },
  },
  {
    id: "braise",
    label: "Braise",
    description:
      "Papier chaud, accent feu — chaleureux et affirmé.",
    paletteId: "ember",
    light: {
      background: "#F5F1EC",
      card: "#FBF8F4",
      ink: "#2F2A23",
      muted: "#EAE4DB",
      mutedInk: "#6F675C",
      border: "#DCD3C6",
      tint: "#EAE4DB",
      ring: "#C0A79A",
    },
    dark: {
      background: "#201B16",
      card: "#29231C",
      ink: "#F1EBE1",
      muted: "#383128",
      mutedInk: "#A69A8B",
      border: "#433A2F",
      tint: "#383128",
      ring: "#8A6B5C",
    },
  },
  {
    id: "or-ancien",
    label: "Or ancien",
    description:
      "Parchemin et encre ambrée — bibliothèque et artisanat.",
    paletteId: "antique-gold",
    light: {
      background: "#F6F0E1",
      card: "#FBF6EA",
      ink: "#443A26",
      muted: "#ECE4CD",
      mutedInk: "#7C7053",
      border: "#DDD2B4",
      tint: "#ECE4CD",
      ring: "#C4B083",
    },
    dark: {
      background: "#241F15",
      card: "#2D271B",
      ink: "#F0E8D4",
      muted: "#3D3626",
      mutedInk: "#B0A483",
      border: "#4A422E",
      tint: "#3D3626",
      ring: "#9C8A5C",
    },
  },
  {
    id: "cobalt",
    label: "Cobalt",
    description:
      "Papier clair très net, accent bleu franc — précis et moderne.",
    paletteId: "cobalt",
    light: {
      background: "#F6F7FA",
      card: "#FDFDFE",
      ink: "#23262E",
      muted: "#ECEEF3",
      mutedInk: "#68707D",
      border: "#DEE1E9",
      tint: "#ECEEF3",
      ring: "#A9B6C9",
    },
    dark: {
      background: "#15181F",
      card: "#1D212A",
      ink: "#EAECF0",
      muted: "#2A2E38",
      mutedInk: "#9AA2B0",
      border: "#39404C",
      tint: "#2A2E38",
      ring: "#5F7390",
    },
  },
  {
    id: "rose-poudre",
    label: "Rose poudré",
    description:
      "Papier blush, encre brune douce — délicat et éditorial.",
    paletteId: "rose",
    light: {
      background: "#F9F5F4",
      card: "#FEFCFB",
      ink: "#3A2F2F",
      muted: "#F1E9E8",
      mutedInk: "#7B6C6A",
      border: "#E6DAD8",
      tint: "#F1E9E8",
      ring: "#CDB4B1",
    },
    dark: {
      background: "#231C1C",
      card: "#2B2424",
      ink: "#F2EAEA",
      muted: "#3B3232",
      mutedInk: "#AB9C9A",
      border: "#463A3A",
      tint: "#3B3232",
      ring: "#936F6F",
    },
  },
  {
    id: "sauge",
    label: "Sauge",
    description:
      "Papier gris-vert, accent sauge — naturel et posé.",
    paletteId: "sage",
    light: {
      background: "#F5F6F2",
      card: "#FBFCF9",
      ink: "#2B3129",
      muted: "#E9EDE4",
      mutedInk: "#697264",
      border: "#D8DFD2",
      tint: "#E9EDE4",
      ring: "#A7B49C",
    },
    dark: {
      background: "#191D18",
      card: "#21261F",
      ink: "#E7EBE3",
      muted: "#2D332B",
      mutedInk: "#99A496",
      border: "#3A4238",
      tint: "#2D332B",
      ring: "#6C7D68",
    },
  },
];

/** Find a theme preset by id (undefined for absent/unknown ids). */
export function findPreset(id: string | null | undefined): ThemePreset | undefined {
  if (!id) return undefined;
  return THEME_PRESETS.find((preset) => preset.id === id);
}

// ---------------------------------------------------------------------------
// Design axis — orthogonal to the color presets
// ---------------------------------------------------------------------------

/**
 * A site design: the structure of the public site — typefaces, shapes and
 * depth — independent from the color presets, so any palette works with any
 * design (3 designs × 10 palettes = 30 combinations, no 30 themes to
 * maintain). Applied at runtime as `--ds-*` variables + `.site-root[data-
 * design]` CSS overrides in index.css; the dashboard keeps its own structure.
 */
export type SiteDesign = {
  id: string;
  label: string;
  description: string;
  /** Display typeface (headings) — Fontshare family loaded in index.html. */
  displayFont: string;
  /** Body typeface. */
  bodyFont: string;
  /** Full CSS font stacks applied as --ds-display / --ds-sans on the site root. */
  displayStack: string;
  bodyStack: string;
  /** Corner treatment on cards and frames. */
  radius: "soft" | "round" | "sharp";
  /** Card rendering: hairline frames, elevated with soft shadow, or bare rows. */
  cards: "frame" | "elevated" | "bare";
  /** Hero heading scale. */
  hero: "standard" | "large";
};

/**
 * The 3 validated designs. "editorial" IS the current Studio look: its
 * stacks mirror the stylesheet defaults, so absent/unknown ids change
 * nothing (existing installs stay byte-for-byte identical).
 */
export const DESIGN_PRESETS: SiteDesign[] = [
  {
    id: "editorial",
    label: "Éditorial",
    description:
      "L'identité Studio d'origine — serif Zodiak, fils fins, présentation de galerie.",
    displayFont: "Zodiak",
    bodyFont: "Switzer",
    displayStack: '"Zodiak", Georgia, "Times New Roman", serif',
    bodyStack:
      '"Switzer", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    radius: "soft",
    cards: "frame",
    hero: "standard",
  },
  {
    id: "moderne",
    label: "Moderne",
    description:
      "Clash Display + Satoshi, cartes arrondies et ombres douces — le contre-pied du plat.",
    displayFont: "Clash Display",
    bodyFont: "Satoshi",
    displayStack: '"Clash Display", "Zodiak", Georgia, serif',
    bodyStack: '"Satoshi", "Switzer", ui-sans-serif, system-ui, sans-serif',
    radius: "round",
    cards: "elevated",
    hero: "large",
  },
  {
    id: "minimal",
    label: "Minimal",
    description:
      "Sentient + General Sans, coins francs, air et hairlines — l'atelier d'architecte.",
    displayFont: "Sentient",
    bodyFont: "General Sans",
    displayStack: '"Sentient", "Zodiak", Georgia, serif',
    bodyStack: '"General Sans", "Switzer", ui-sans-serif, system-ui, sans-serif',
    radius: "sharp",
    cards: "frame",
    hero: "standard",
  },
];

/** Find a design by id (undefined for absent/unknown ids). */
export function findDesign(
  id: string | null | undefined,
): SiteDesign | undefined {
  if (!id) return undefined;
  return DESIGN_PRESETS.find((design) => design.id === id);
}

/** The accent palette family attached to a preset (accent + dark variant). */
export function presetAccent(
  preset: ThemePreset | undefined,
): AccentPalette | undefined {
  if (!preset) return undefined;
  return ACCENT_PALETTES.find((palette) => palette.id === preset.paletteId);
}

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
