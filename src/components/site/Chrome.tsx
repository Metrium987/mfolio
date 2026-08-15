import { ArrowUpRight, Mail, Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang, type SiteLang } from "@/lib/i18n";
import { APP_NAME, monogram, type Social } from "@/lib/site";
import type { SiteAppearanceMode } from "@/lib/themes";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LANGS: SiteLang[] = ["fr", "en"];
const THEME_KEY = "mfolio_theme";

function LangSwitcher() {
  const { lang, setLang } = useSiteLang();
  return (
    <div
      className="flex items-center rounded-full border border-border p-0.5 text-xs font-medium"
      aria-label="Language"
    >
      {LANGS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors",
            lang === option
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/**
 * Dark/light toggle for the visitor — persisted per browser.
 *
 * `defaultMode` is the owner's ambiance choice (Sécurité → Apparence): it is
 * applied only until the visitor makes their own choice (or has one stored).
 * "auto" keeps following the OS preference for first-time visitors.
 */
function ThemeToggle({ defaultMode = "auto" }: { defaultMode?: SiteAppearanceMode }) {
  const { t } = useSiteLang();

  const readStored = (): "dark" | "light" | null => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      if (stored === "dark") return "dark";
      if (stored === "light") return "light";
    } catch {
      // storage unavailable — treated as "no stored choice"
    }
    return null;
  };

  const prefersDarkOS = (): boolean =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

  const [choice, setChoice] = useState<"dark" | "light" | null>(() =>
    typeof window === "undefined" ? null : readStored(),
  );
  const [dark, setDark] = useState<boolean>(() => {
    const stored = readStored();
    if (stored) return stored === "dark";
    if (defaultMode === "dark") return true;
    if (defaultMode === "light") return false;
    return prefersDarkOS();
  });

  // The owner's default may arrive after mount (settings load asynchronously):
  // apply it until the visitor has an explicit choice.
  useEffect(() => {
    if (choice !== null) return;
    if (defaultMode === "dark") setDark(true);
    else if (defaultMode === "light") setDark(false);
  }, [defaultMode, choice]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    if (choice !== null) {
      try {
        window.localStorage.setItem(THEME_KEY, choice);
      } catch {
        // storage unavailable (private mode) — in-memory only
      }
    }
  }, [dark, choice]);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !dark;
        setDark(next);
        setChoice(next ? "dark" : "light");
      }}
      aria-label={dark ? t("header.themeLight") : t("header.themeDark")}
      title={dark ? t("header.themeLight") : t("header.themeDark")}
      className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function SiteHeader({
  siteName,
  links,
  logoUrl,
  email,
  themeMode = "auto",
}: {
  siteName: string;
  links: { label: string; id: string }[];
  logoUrl?: string;
  email?: string;
  /** Owner-chosen ambiance (Sécurité → Apparence) — the visitor default. */
  themeMode?: SiteAppearanceMode;
}) {
  const { t } = useSiteLang();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 font-display text-lg font-medium tracking-tight text-foreground"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="max-h-9 w-auto max-w-40 object-contain"
            />
          ) : (
            siteName
          )}
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {email && (
            <a
              href={`mailto:${email}`}
              aria-label={t("header.email")}
              title={email}
              className="hidden size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground lg:flex"
            >
              <Mail className="size-4" />
            </a>
          )}
          <LangSwitcher />
          <ThemeToggle defaultMode={themeMode} />
          <Link
            to="/dashboard"
            className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-foreground sm:inline-flex"
          >
            {t("header.admin")}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {/* Mobile navigation — the desktop nav is hidden below md */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t("header.menu")}
                className="flex size-9 items-center justify-center rounded-full border border-border text-foreground md:hidden"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-l border-border">
              <SheetTitle className="sr-only">{t("header.menu")}</SheetTitle>
              <div className="flex h-full flex-col px-2 pt-8">
                <nav className="flex flex-col gap-1">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground"
                    >
                      <Mail className="size-3.5" />
                      {email}
                    </a>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground"
                  >
                    {t("header.admin")}
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({
  site,
  socials,
}: {
  site?: Doc<"site"> | null;
  socials?: Social[];
}) {
  const { t, pick } = useSiteLang();
  const siteName = site?.siteName || "Portfolio";
  const tagline = pick(site?.tagline ?? "", site?.en?.tagline);
  const footerText = pick(site?.footerText ?? "", site?.en?.footerText);

  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-xl font-medium tracking-tight">
            {siteName}
          </p>
          {tagline && (
            <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>
          )}
          {footerText && (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">
              {footerText}
            </p>
          )}
        </div>
        {socials && socials.length > 0 && (
          <div>
            <p className="kicker mb-4">{t("footer.networks")}</p>
            <div className="flex flex-wrap gap-3">
              {socials.map((social) => (
                <a
                  key={social.title}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.title}
                  className="flex size-10 items-center justify-center rounded-full border border-border text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  {monogram(social.title)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-border/50">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 text-xs text-muted-foreground sm:px-8">
          <span>
            © {new Date().getFullYear()} {siteName}
          </span>
          <Link
            to="/dashboard"
            className="transition-colors hover:text-foreground"
          >
            {t("footer.poweredBy")} {APP_NAME}
          </Link>
        </div>
      </div>
    </footer>
  );
}
