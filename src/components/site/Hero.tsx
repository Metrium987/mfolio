import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { monogram } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container, Reveal } from "./Section";

export function Hero({ hero, siteName }: { hero: Doc<"hero">; siteName: string }) {
  return (
    <Container id="top" className="pb-24 pt-16 sm:pt-24">
      <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="kicker mb-6">
              Portfolio — {new Date().getFullYear()} · {siteName}
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
              {hero.name}
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-5 font-display text-2xl font-light italic tracking-tight text-(--studio-accent) sm:text-3xl">
              {hero.title}
            </p>
          </Reveal>

          {hero.subtitle && (
            <Reveal delay={0.18}>
              <p className="mt-4 text-base font-medium text-foreground/90">
                {hero.subtitle}
              </p>
            </Reveal>
          )}

          {hero.intro && (
            <Reveal delay={0.24}>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                {hero.intro}
              </p>
            </Reveal>
          )}

          {hero.buttons.length > 0 && (
            <Reveal delay={0.3}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {hero.buttons.map((button) =>
                  button.style === "primary" ? (
                    <a
                      key={button.label}
                      href={button.url}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      {button.label}
                      <ArrowUpRight className="size-4" />
                    </a>
                  ) : (
                    <a
                      key={button.label}
                      href={button.url}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground"
                    >
                      {button.label}
                      <ArrowDown className="size-4" />
                    </a>
                  ),
                )}
              </div>
            </Reveal>
          )}

          {hero.socials.length > 0 && (
            <Reveal delay={0.36}>
              <div className="mt-12 border-t border-border/70 pt-6">
                <p className="kicker mb-4">Réseaux & profils</p>
                <div className="flex flex-wrap gap-3">
                  {hero.socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.name}
                      className={cn(
                        "flex size-11 items-center justify-center rounded-full border border-border text-xs font-semibold tracking-wide",
                        "text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background",
                      )}
                    >
                      {monogram(social.name)}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {hero.avatarUrl && (
          <Reveal delay={0.2} className="mx-auto w-full max-w-sm lg:max-w-none">
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-sm border border-border/60" />
              <figure className="border border-border bg-card p-2 shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_48px_-28px_rgba(28,25,21,0.3)]">
                <img
                  src={hero.avatarUrl}
                  alt={`Portrait de ${hero.name}`}
                  className="aspect-[4/5] w-full object-cover"
                  loading="eager"
                />
              </figure>
              <p className="mt-3 text-right text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Fig. 01 — Portrait
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </Container>
  );
}
