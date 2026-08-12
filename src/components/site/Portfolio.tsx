import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeading } from "./Section";

export function Portfolio({ portfolio }: { portfolio: Doc<"portfolio"> }) {
  const { t, pick } = useSiteLang();

  // Deduplicated French categories, with their English mirror when available.
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

  const categoryEn = useMemo(() => {
    const map = new Map<string, string>();
    portfolio.projects.forEach((project, index) => {
      project.categories.forEach((category, catIndex) => {
        const en = portfolio.en?.projects?.[index]?.categories?.[catIndex];
        if (en && !map.has(category)) map.set(category, en);
      });
    });
    return map;
  }, [portfolio.projects, portfolio.en]);

  // Filtering always happens on the French source categories; only the label
  // is translated, so the active filter stays correct in both languages.
  const [active, setActive] = useState<string | null>(null);

  return (
    <Container id="portfolio" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker={t("portfolio.kicker")}
          title={pick(portfolio.title, portfolio.en?.title)}
          description={pick(portfolio.description, portfolio.en?.description)}
        />

        {categories.length > 0 && (
          <div className="mb-12 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActive(null)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors",
                active === null
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {t("portfolio.all")}
            </button>
            {categories.map((category) => (
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
                {pick(category, categoryEn.get(category))}
              </button>
            ))}
          </div>
        )}

        {portfolio.projects.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.projects.map((project, index) => {
              // Skip filtered projects, but keep the original index so the
              // English mirror (aligned by position) stays correct.
              if (active !== null && !project.categories.includes(active)) {
                return null;
              }
              return (
                <Reveal
                  key={project.title}
                  delay={Math.min(index * 0.05, 0.25)}
                >
                  <article className="group flex h-full flex-col border border-border bg-card p-2 transition-colors duration-300 hover:border-foreground/40">
                    {project.thumbnail && (
                      <div className="overflow-hidden">
                        <img
                          src={project.thumbnail}
                          alt={pick(
                            project.title,
                            portfolio.en?.projects?.[index]?.title,
                          )}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-(--studio-accent)">
                        {project.categories
                          .map((category, catIndex) =>
                            pick(
                              category,
                              portfolio.en?.projects?.[index]?.categories?.[
                                catIndex
                              ],
                            ),
                          )
                          .filter(Boolean)
                          .join(" · ") || t("portfolio.project")}
                      </p>
                      <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-foreground">
                        {pick(
                          project.title,
                          portfolio.en?.projects?.[index]?.title,
                        )}
                      </h3>
                      {project.details && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {pick(
                            project.details,
                            portfolio.en?.projects?.[index]?.details,
                          )}
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
                            {t("portfolio.viewProject")}
                          </a>
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("portfolio.noProjects")}
          </p>
        )}
      </div>
    </Container>
  );
}
