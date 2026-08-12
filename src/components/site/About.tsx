import { ArrowDown } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { Container, Reveal } from "./Section";

export function About({ about }: { about: Doc<"about"> }) {
  const paragraphs = about.description.split(/\n{2,}/).filter(Boolean);

  return (
    <Container id="about" className="py-24 md:py-32">
      <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {about.imageUrl && (
          <Reveal>
            <figure className="border border-border bg-card p-2 shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_48px_-28px_rgba(28,25,21,0.3)]">
              <img
                src={about.imageUrl}
                alt={about.title}
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </figure>
            <p className="mt-3 text-right text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Fig. 02 — Atelier
            </p>
          </Reveal>
        )}

        <div>
          <Reveal>
            <p className="kicker mb-4">À propos</p>
            <h2 className="font-display text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              {about.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-5">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-[15px] leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
          {about.resumeUrl && (
            <Reveal delay={0.18}>
              <a
                href={about.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                Télécharger le CV
                <ArrowDown className="size-4" />
              </a>
            </Reveal>
          )}
        </div>
      </div>
    </Container>
  );
}
