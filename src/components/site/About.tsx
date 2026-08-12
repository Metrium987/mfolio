import { ArrowDown } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { Container, Reveal } from "./Section";

export function About({
  about,
  visibilityCv,
}: {
  about: Doc<"about">;
  visibilityCv: boolean;
}) {
  const paragraphs = about.description.split(/\n{2,}/).filter(Boolean);

  return (
    <Container id="about" className="py-24 md:py-32">
      <div className="grid items-start gap-14 lg:grid-cols-[0.4fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="kicker mb-4">À propos</p>
            <h2 className="font-display text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              {about.name}
            </h2>
          </Reveal>
          {visibilityCv && about.cvUrl && (
            <Reveal delay={0.1}>
              <a
                href={about.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                Télécharger le CV
                <ArrowDown className="size-4" />
              </a>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1}>
          <div className="space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </Container>
  );
}
