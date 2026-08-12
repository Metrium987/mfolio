import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { monogram, type Social } from "@/lib/site";

export function SiteHeader({
  siteName,
  links,
}: {
  siteName: string;
  links: { label: string; id: string }[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className="font-display text-lg font-medium tracking-tight text-foreground"
        >
          {siteName}
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-foreground"
        >
          Admin
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter({
  siteName,
  tagline,
  footerText,
  socials,
}: {
  siteName: string;
  tagline?: string;
  footerText?: string;
  socials?: Social[];
}) {
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
            <p className="kicker mb-4">Réseaux</p>
            <div className="flex flex-wrap gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  className="flex size-10 items-center justify-center rounded-full border border-border text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  {monogram(social.name)}
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
          <span>Édité depuis le tableau de bord</span>
        </div>
      </div>
    </footer>
  );
}
