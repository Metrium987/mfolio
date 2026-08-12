import {
  Camera,
  Code,
  Compass,
  Layers,
  Layout,
  Megaphone,
  Monitor,
  Palette,
  PenLine,
  PenTool,
  Search,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type Social = { name: string; url: string };

/** Two-letter monogram used for social links (lucide has no brand icons). */
export function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Applies the admin-chosen theme color to the live site by overriding the
 * --primary / --studio-accent CSS variables. No-op when no valid color is set
 * (the stylesheet default applies).
 */
export function applyThemeColor(hex: string | null | undefined) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  const root = document.documentElement;
  root.style.setProperty("--primary", hex);
  root.style.setProperty("--studio-accent", hex);
  root.style.setProperty("--primary-foreground", readableOn(hex));
}

function readableOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55
    ? "oklch(0.24 0.014 60)"
    : "oklch(0.977 0.005 85)";
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Icon registry for the Services section (name → lucide icon). */
const serviceIconRegistry: Record<string, LucideIcon> = {
  PenTool,
  Code,
  Palette,
  Compass,
  Monitor,
  Smartphone,
  Layout,
  Search,
  Camera,
  Megaphone,
  PenLine,
  Layers,
  Wrench,
};

export const SERVICE_ICON_NAMES = [
  "PenTool",
  "Code",
  "Palette",
  "Compass",
  "Monitor",
  "Smartphone",
  "Layout",
  "Search",
  "Camera",
  "Megaphone",
  "PenLine",
  "Layers",
  "Wrench",
];

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = serviceIconRegistry[name] ?? Layers;
  return <Icon className={className} aria-hidden />;
}
