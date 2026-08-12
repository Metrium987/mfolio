import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeading } from "./Section";

export function Portfolio({ portfolio }: { portfolio: Doc<"portfolio"> }) {
  const categories = useMemo(() => {
    const seen = new Set<string>();
    portfolio.projects.forEach((project) => {
      project.categories
        .map((category) => category.trim())
        .filter(Boolean)
        .forEach((category) => seen.add(category));
    });
    return Array.from(seen);
  }, [portfolio.projects]);

  const [active, setActive] = useState<string>("Tous");
  const visible =
    active === "Tous"
      ? portfolio.projects
      : portfolio.projects.filter((project) => project.categories.includes(active));

  return (
    <Container id="portfolio" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker="Portfolio"
          title={portfolio.title}
          description={portfolio.description}
        />

        {categories.length > 0 && (
          <div className="mb-12 flex flex-wrap items-center gap-2">
            {["Tous", ...categories].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors",
                  active === category
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {visible.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project, index) => (
              <Reveal key={project.title} delay={Math.min(index * 0.05, 0.25)}>
                <article className="group flex h-full flex-col border border-border bg-card p-2 transition-colors duration-300 hover:border-foreground/40">
                  {project.thumbnail && (
                    <div className="overflow-hidden">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-(--studio-accent)">
                      {project.categories.filter(Boolean).join(" · ") ||
                        "Projet"}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-foreground">
                      {project.title}
                    </h3>
                    {project.details && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {project.details}
                      </p>
                    )}
                    {project.link && (
                      <div className="mt-5 flex items-center border-t border-border/70 pt-4">
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground transition-colors hover:text-(--studio-accent)"
                        >
                          <ExternalLink className="size-3.5" />
                          Voir le projet
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun projet dans cette catégorie.
          </p>
        )}
      </div>
    </Container>
  );
}
