import { ExternalLink, FolderGit2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeading } from "./Section";

export function Portfolio({ portfolio }: { portfolio: Doc<"portfolio"> }) {
  const categories = useMemo(() => {
    const seen = new Set<string>();
    portfolio.projects.forEach((project) => {
      if (project.category.trim()) seen.add(project.category.trim());
    });
    return Array.from(seen);
  }, [portfolio.projects]);

  const [active, setActive] = useState<string>("Tous");
  const visible =
    active === "Tous"
      ? portfolio.projects
      : portfolio.projects.filter((project) => project.category === active);

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
              <Reveal key={project.name} delay={Math.min(index * 0.05, 0.25)}>
                <article className="group border border-border bg-card p-2 transition-colors duration-300 hover:border-foreground/40">
                  {project.imageUrl && (
                    <div className="overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  )}
                  <div className="px-2 pb-2 pt-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-(--studio-accent)">
                      {project.category || "Projet"}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-foreground">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                    {(project.demoUrl || project.sourceUrl) && (
                      <div className="mt-5 flex items-center gap-4 border-t border-border/70 pt-4">
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground transition-colors hover:text-(--studio-accent)"
                          >
                            <ExternalLink className="size-3.5" />
                            Démo
                          </a>
                        )}
                        {project.sourceUrl && (
                          <a
                            href={project.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <FolderGit2 className="size-3.5" />
                            Code
                          </a>
                        )}
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
