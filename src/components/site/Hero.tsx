import { useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { monogram } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container, Reveal } from "./Section";

export function Hero({
  about,
  siteName,
  visibilityCv,
}: {
  about: Doc<"about">;
  siteName: string;
  visibilityCv: boolean;
}) {
  const { t, pick } = useSiteLang();
  const reduceMotion = useReducedMotion();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const taglines = about.taglines.filter(Boolean);
  const currentTagline = taglines[taglineIndex] ?? "";
  const currentText = pick(currentTagline, about.en?.taglines?.[taglineIndex]);
  // Reduced-motion users get the full tagline instantly — the typing reveal is
  // a decorative enhancement, not a content requirement.
  const visibleText = reduceMotion
    ? currentText
    : currentText.slice(0, typedCount);

  // Reset the typewriter whenever the active tagline changes.
  useEffect(() => {
    // Intentional: rewind the typing animation for the new tagline.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTypedCount(0);
  }, [taglineIndex]);

  // Type the tagline character by character, hold it, then advance to the
  // next one (a slow, editorial rhythm — roughly 6 s per tagline).
  useEffect(() => {
    if (reduceMotion || taglines.length === 0) return;
    if (typedCount < currentText.length) {
      const timeout = setTimeout(
        () => setTypedCount((count) => count + 1),
        45,
      );
      return () => clearTimeout(timeout);
    }
    if (taglines.length < 2) return; // single tagline: stop after typing
    const timeout = setTimeout(() => {
      setTaglineIndex((index) => (index + 1) % taglines.length);
    }, 4600);
    return () => clearTimeout(timeout);
  }, [reduceMotion, typedCount, currentText.length, taglines.length]);

  return (
    <Container id="top" className="relative pb-24 pt-16 sm:pt-20">
      {/* Subtle warm wash in the theme accent — depth without clutter. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[540px] bg-[radial-gradient(70%_120%_at_50%_0%,color-mix(in_oklab,var(--studio-accent)_10%,transparent),transparent_72%)]"
      />
      {/* Faint dot-grid texture fading downward — gallery depth. */}
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      {about.cover && (
        <Reveal className="mb-14">
          <div className="relative">
            <div className="absolute -inset-2 -z-10 border border-border/60" />
            <figure className="border border-border bg-card p-2 shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_48px_-28px_rgba(28,25,21,0.3)]">
              <img
                src={about.cover}
                alt=""
                className="aspect-[21/9] w-full object-cover sm:aspect-[21/8]"
                loading="eager"
              />
            </figure>
          </div>
        </Reveal>
      )}

      <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="kicker mb-6">
              Portfolio — {new Date().getFullYear()} · {siteName}
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              {about.name}
            </h1>
          </Reveal>

          {taglines.length > 0 && (
            <Reveal delay={0.12}>
              <div className="mt-5 min-h-16 font-display text-2xl font-light italic tracking-tight text-(--studio-accent)">
                {/* Full tagline stays in the DOM for screen readers and crawlers. */}
                <span className="sr-only">{currentText}</span>
                {/* The typed reveal is decorative and hidden from assistive tech. */}
                <span aria-hidden="true">
                  {visibleText}
                  <span className="typewriter-caret" />
                </span>
              </div>
            </Reveal>
          )}

          {about.description && (
            <Reveal delay={0.18}>
              {/* The hero is the "À propos" section of the portfolio — it
                  carries the full description (all paragraphs), so there is
                  no duplicate section below it. */}
              <div className="mt-5 max-w-xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                {pick(about.description, about.en?.description)
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("hero.contact")}
                <ArrowUpRight className="size-4" />
              </a>
              {visibilityCv && about.cvUrl && (
                <a
                  href={about.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground"
                >
                  {t("hero.downloadCv")}
                  <ArrowDown className="size-4" />
                </a>
              )}
            </div>
          </Reveal>

          {about.socials.length > 0 && (
            <Reveal delay={0.3}>
              <div className="mt-12 border-t border-border/70 pt-6">
                <p className="kicker mb-4">{t("hero.networks")}</p>
                <div className="flex flex-wrap gap-3">
                  {about.socials.map((social) => (
                    <a
                      key={social.title}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.title}
                      className={cn(
                        "flex size-11 items-center justify-center rounded-full border border-border text-xs font-semibold tracking-wide",
                        "text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background",
                      )}
                    >
                      {monogram(social.title)}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {about.avatar && (
          <Reveal delay={0.2} className="mx-auto w-full max-w-sm lg:max-w-none">
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-sm border border-border/60" />
              <figure className="border border-border bg-card p-2 shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_48px_-28px_rgba(28,25,21,0.3)]">
                <img
                  src={about.avatar}
                  alt={`${t("hero.alt")} ${about.name}`}
                  className="aspect-[4/5] w-full object-cover"
                  loading="eager"
                />
              </figure>
              <p className="mt-3 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t("hero.portrait")}
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </Container>
  );
}
