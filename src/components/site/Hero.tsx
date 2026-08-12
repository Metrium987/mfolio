import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
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
  const [taglineIndex, setTaglineIndex] = useState(0);
  const taglines = about.taglines.filter(Boolean);

  useEffect(() => {
    if (taglines.length < 2) return;
    const interval = setInterval(
      () => setTaglineIndex((index) => (index + 1) % taglines.length),
      3800,
    );
    return () => clearInterval(interval);
  }, [taglines.length]);

  return (
    <Container id="top" className="pb-24 pt-16 sm:pt-20">
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
            <h1 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
              {about.name}
            </h1>
          </Reveal>

          {taglines.length > 0 && (
            <Reveal delay={0.12}>
              <div className="mt-5 min-h-10 font-display text-2xl font-light italic tracking-tight text-(--studio-accent) sm:text-3xl">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={taglineIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {taglines[taglineIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </Reveal>
          )}

          {about.description && (
            <Reveal delay={0.18}>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                {about.description.split(/\n{2,}/)[0]}
              </p>
            </Reveal>
          )}

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Me contacter
                <ArrowUpRight className="size-4" />
              </a>
              {visibilityCv && about.cvUrl && (
                <a
                  href={about.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground"
                >
                  Télécharger le CV
                  <ArrowDown className="size-4" />
                </a>
              )}
            </div>
          </Reveal>

          {about.socials.length > 0 && (
            <Reveal delay={0.3}>
              <div className="mt-12 border-t border-border/70 pt-6">
                <p className="kicker mb-4">Réseaux & profils</p>
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
                  alt={`Portrait de ${about.name}`}
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
