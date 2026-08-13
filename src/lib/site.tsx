import {
  Anchor,
  Aperture,
  Award,
  Banknote,
  Bitcoin,
  Blocks,
  BookOpen,
  Boxes,
  Brain,
  Briefcase,
  BriefcaseBusiness,
  Brush,
  Bug,
  Building,
  Building2,
  Calculator,
  CalendarDays,
  Car,
  ChartColumn,
  ChartLine,
  ChartPie,
  ChefHat,
  ClipboardList,
  Cloud,
  Code,
  Coffee,
  Component,
  Compass,
  Construction,
  Cpu,
  CreditCard,
  Database,
  Droplets,
  Dumbbell,
  Eraser,
  Euro,
  Factory,
  FileSignature,
  FileText,
  Film,
  Flower2,
  Frame,
  Gift,
  GitBranch,
  Globe,
  GraduationCap,
  Hammer,
  Handshake,
  HardHat,
  Headphones,
  HeartPulse,
  Home,
  Image as ImageIcon,
  Key,
  KeyRound,
  Landmark,
  Languages,
  Layers,
  Layout,
  Leaf,
  Library,
  Lightbulb,
  Mail,
  Map,
  MapPin,
  Megaphone,
  MessageSquare,
  Mic,
  Monitor,
  Music,
  Navigation,
  Network,
  Newspaper,
  Package,
  Paintbrush,
  Palette,
  PartyPopper,
  PawPrint,
  PenLine,
  PenTool,
  PencilRuler,
  PiggyBank,
  Pill,
  Plane,
  Podcast,
  Presentation,
  Puzzle,
  Quote,
  Receipt,
  Recycle,
  Rocket,
  Route,
  Rss,
  Ruler,
  Scale,
  School,
  Search,
  Send,
  Server,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Sparkles,
  Spline,
  Sprout,
  Star,
  Stethoscope,
  Sun,
  Target,
  Terminal,
  Thermometer,
  TrendingUp,
  Trophy,
  Truck,
  UserRound,
  Users,
  UtensilsCrossed,
  Video,
  Wallet,
  WandSparkles,
  Wheat,
  Wifi,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Social = { title: string; link: string };

/** Product brand — the name of the application itself (not the owner's name). */
export const APP_NAME = "Mfolio";
export const APP_DESCRIPTION =
  "Un portfolio moderne et professionnel, entièrement configurable depuis votre tableau de bord.";

/** Two-letter monogram used for social links (lucide has no brand icons). */
export function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Detect browser name from the user agent (Ezfolio-style visitor tracking). */
export function detectBrowser(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Opera")) return "Opera";
  return "Autre";
}

/** Detect device platform from the user agent. */
/**
 * Visitor fingerprint for the anti-spam rate limit. Persisted in
 * localStorage so a returning visitor keeps the same id; shared by the
 * landing tracker and the contact form.
 */
export const VISITOR_STORAGE_KEY = "mfolio_visitor";

export function getOrCreateVisitorId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;
    const id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(VISITOR_STORAGE_KEY, id);
    return id;
  } catch {
    // storage unavailable (private mode) — rate limit is simply not applied
    return undefined;
  }
}

export function detectPlatform(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Inconnu";
}

/** Applies the site favicon by replacing the <link rel="icon"> href. */
export function applyFavicon(url: string | null | undefined) {
  if (!url) return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
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

/**
 * Icon groups for the Services section (label → icon names). The list is
 * deliberately broad so the app fits any profession — it is shared on
 * GitHub, not tied to one trade. Add new lucide icons here and they will
 * appear everywhere automatically.
 */
export const SERVICE_ICON_GROUPS: { label: string; icons: string[] }[] = [
  {
    label: "Design & créatif",
    icons: [
      "Palette",
      "PenTool",
      "PenLine",
      "Paintbrush",
      "Brush",
      "PencilRuler",
      "Ruler",
      "Layers",
      "Component",
      "Puzzle",
      "Spline",
      "Eraser",
      "Sparkles",
      "WandSparkles",
      "Frame",
      "Aperture",
      "Image",
    ],
  },
  {
    label: "Développement & tech",
    icons: [
      "Code",
      "Terminal",
      "GitBranch",
      "Cpu",
      "Database",
      "Server",
      "Cloud",
      "Network",
      "Wifi",
      "Bug",
      "Blocks",
      "Workflow",
      "Monitor",
      "Smartphone",
      "Layout",
    ],
  },
  {
    label: "Business & conseil",
    icons: [
      "Compass",
      "Briefcase",
      "BriefcaseBusiness",
      "ChartLine",
      "ChartColumn",
      "ChartPie",
      "Presentation",
      "ClipboardList",
      "Handshake",
      "Headphones",
      "Lightbulb",
      "Rocket",
      "Target",
      "TrendingUp",
      "Users",
      "UserRound",
      "Brain",
    ],
  },
  {
    label: "Communication & marketing",
    icons: [
      "Megaphone",
      "Search",
      "Video",
      "Film",
      "Mic",
      "Podcast",
      "Music",
      "Globe",
      "Languages",
      "Newspaper",
      "Quote",
      "MessageSquare",
      "Mail",
      "Send",
      "Rss",
      "BookOpen",
    ],
  },
  {
    label: "Finance & droit",
    icons: [
      "Wallet",
      "Banknote",
      "CreditCard",
      "PiggyBank",
      "Receipt",
      "Calculator",
      "Euro",
      "Bitcoin",
      "Landmark",
      "Scale",
      "FileText",
      "FileSignature",
    ],
  },
  {
    label: "Santé, bien-être & sport",
    icons: [
      "HeartPulse",
      "Stethoscope",
      "Pill",
      "Dumbbell",
      "Flower2",
      "Leaf",
      "Sprout",
      "Sun",
    ],
  },
  {
    label: "Éducation & formation",
    icons: ["GraduationCap", "School", "Library"],
  },
  {
    label: "Immobilier, bâtiment & artisanat",
    icons: [
      "Home",
      "Key",
      "Building2",
      "Building",
      "Hammer",
      "HardHat",
      "Construction",
      "Factory",
      "Wrench",
    ],
  },
  {
    label: "Transport & logistique",
    icons: [
      "Truck",
      "Package",
      "Boxes",
      "Plane",
      "Car",
      "Anchor",
      "Map",
      "MapPin",
      "Route",
      "Navigation",
    ],
  },
  {
    label: "Événementiel, restauration & divers",
    icons: [
      "CalendarDays",
      "PartyPopper",
      "Gift",
      "Trophy",
      "Award",
      "Star",
      "Coffee",
      "ChefHat",
      "UtensilsCrossed",
      "PawPrint",
      "ShieldCheck",
      "KeyRound",
      "Zap",
      "Snowflake",
      "Thermometer",
      "Droplets",
      "Recycle",
      "Wheat",
    ],
  },
];

const serviceIconRegistry: Record<string, LucideIcon> = {
  Palette,
  PenTool,
  PenLine,
  Paintbrush,
  Brush,
  PencilRuler,
  Ruler,
  Layers,
  Component,
  Puzzle,
  Spline,
  Eraser,
  Sparkles,
  WandSparkles,
  Frame,
  Aperture,
  Image: ImageIcon,
  Code,
  Terminal,
  GitBranch,
  Cpu,
  Database,
  Server,
  Cloud,
  Network,
  Wifi,
  Bug,
  Blocks,
  Workflow,
  Monitor,
  Smartphone,
  Layout,
  Compass,
  Briefcase,
  BriefcaseBusiness,
  ChartLine,
  ChartColumn,
  ChartPie,
  Presentation,
  ClipboardList,
  Handshake,
  Headphones,
  Lightbulb,
  Rocket,
  Target,
  TrendingUp,
  Users,
  UserRound,
  Brain,
  Megaphone,
  Search,
  Video,
  Film,
  Mic,
  Podcast,
  Music,
  Globe,
  Languages,
  Newspaper,
  Quote,
  MessageSquare,
  Mail,
  Send,
  Rss,
  BookOpen,
  Wallet,
  Banknote,
  CreditCard,
  PiggyBank,
  Receipt,
  Calculator,
  Euro,
  Bitcoin,
  Landmark,
  Scale,
  FileText,
  FileSignature,
  HeartPulse,
  Stethoscope,
  Pill,
  Dumbbell,
  Flower2,
  Leaf,
  Sprout,
  Sun,
  GraduationCap,
  School,
  Library,
  Home,
  Key,
  Building2,
  Building,
  Hammer,
  HardHat,
  Construction,
  Factory,
  Wrench,
  Truck,
  Package,
  Boxes,
  Plane,
  Car,
  Anchor,
  Map,
  MapPin,
  Route,
  Navigation,
  CalendarDays,
  PartyPopper,
  Gift,
  Trophy,
  Award,
  Star,
  Coffee,
  ChefHat,
  UtensilsCrossed,
  PawPrint,
  ShieldCheck,
  KeyRound,
  Zap,
  Snowflake,
  Thermometer,
  Droplets,
  Recycle,
  Wheat,
};

export const SERVICE_ICON_NAMES = Object.keys(serviceIconRegistry);

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
