import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSiteLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeading } from "./Section";

export function Portfolio({
  portfolio,
  layout = "cards",
}: {
  portfolio: Doc<"portfolio">;
  layout?: "list" | "cards";
}) {
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
  // Open project dialog — the original array index is kept so the English
  // mirror (aligned by position) stays correct.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openProject = openIndex !== null ? portfolio.projects[openIndex] : null;
  const openProjectEn =
    openIndex !== null ? portfolio.en?.projects?.[openIndex] : null;

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
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
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
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
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
          layout === "cards" ? (
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
                    <button
                      type="button"
                      onClick={() => setOpenIndex(index)}
                      className="group block w-full text-left"
                    >
                      <article className="flex h-full flex-col border border-border bg-card p-2 transition-colors duration-300 hover:border-foreground/40">
                        {project.thumbnail && (
                          <div className="overflow-hidden">
                            <img
                              src={project.thumbnail}
                              alt={pick(
                                project.title,
                                portfolio.en?.projects?.[index]?.title,
                              )}
                              loading="lazy"
                              decoding="async"
                              className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                          <p className="text-xs uppercase tracking-[0.2em] text-(--studio-accent)">
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
                          <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-foreground">
                            {pick(
                              project.title,
                              portfolio.en?.projects?.[index]?.title,
                            )}
                          </h3>
                          {project.role && (
                            <p className="mt-1 text-sm font-medium text-muted-foreground">
                              {pick(
                                project.role,
                                portfolio.en?.projects?.[index]?.role,
                              )}
                            </p>
                          )}
                          {project.details && (
                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                              {pick(
                                project.details,
                                portfolio.en?.projects?.[index]?.details,
                              )}
                            </p>
                          )}
                          <span className="mt-5 inline-flex items-center gap-1.5 border-t border-border/70 pt-4 text-sm font-medium text-foreground transition-colors group-hover:text-(--studio-accent)">
                            {t("portfolio.viewProject")}
                            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </article>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="border-t border-border">
              {portfolio.projects.map((project, index) => {
                // Skip filtered projects, but keep the original index so the
                // English mirror (aligned by position) stays correct.
                if (active !== null && !project.categories.includes(active)) {
                  return null;
                }
                return (
                  <Reveal
                    key={project.title}
                    delay={Math.min(index * 0.04, 0.2)}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(index)}
                      className="group block w-full text-left"
                    >
                      <article className="flex flex-col gap-6 border-b border-border py-8 transition-colors duration-300 hover:bg-card/40 sm:flex-row sm:items-start md:py-10">
                        {project.thumbnail && (
                          <div className="shrink-0 overflow-hidden sm:w-60">
                            <img
                              src={project.thumbnail}
                              alt={pick(
                                project.title,
                                portfolio.en?.projects?.[index]?.title,
                              )}
                              loading="lazy"
                              decoding="async"
                              className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            />
                          </div>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="text-xs uppercase tracking-[0.2em] text-(--studio-accent)">
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
                          <h3 className="mt-2 font-display text-2xl font-light tracking-tight text-foreground">
                            {pick(
                              project.title,
                              portfolio.en?.projects?.[index]?.title,
                            )}
                          </h3>
                          {project.role && (
                            <p className="mt-1 text-sm font-medium text-muted-foreground">
                              {pick(
                                project.role,
                                portfolio.en?.projects?.[index]?.role,
                              )}
                            </p>
                          )}
                          {project.details && (
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                              {pick(
                                project.details,
                                portfolio.en?.projects?.[index]?.details,
                              )}
                            </p>
                          )}
                          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-(--studio-accent)">
                            {t("portfolio.viewProject")}
                            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </article>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("portfolio.noProjects")}
          </p>
        )}
      </div>

      {/* Project detail — full gallery, description and link (Ezfolio modal) */}
      <Dialog
        open={openProject !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto border-border sm:max-w-3xl">
          {openProject && (
            <ProjectGallery
              images={[
                openProject.thumbnail,
                ...openProject.images.filter((image) => image !== openProject.thumbnail),
              ].filter(Boolean)}
              title={pick(
                openProject.title,
                openProjectEn?.title,
              )}
            />
          )}
          {openProject && (
            <>
              <DialogHeader>
                <p className="text-xs uppercase tracking-[0.2em] text-(--studio-accent)">
                  {openProject.categories
                    .map((category, catIndex) =>
                      pick(
                        category,
                        openProjectEn?.categories?.[catIndex],
                      ),
                    )
                    .filter(Boolean)
                    .join(" · ") || t("portfolio.project")}
                </p>
                <DialogTitle className="font-display text-2xl font-light tracking-tight">
                  {pick(openProject.title, openProjectEn?.title)}
                </DialogTitle>
              </DialogHeader>
              {(openProject.role || openProject.result) && (
                <div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-border/70 py-3 text-sm">
                  {openProject.role && (
                    <span>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {t("portfolio.role")} ·{" "}
                      </span>
                      <span className="font-medium text-foreground">
                        {pick(openProject.role, openProjectEn?.role)}
                      </span>
                    </span>
                  )}
                  {openProject.result && (
                    <span>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {t("portfolio.result")} ·{" "}
                      </span>
                      <span className="font-medium text-foreground">
                        {pick(openProject.result, openProjectEn?.result)}
                      </span>
                    </span>
                  )}
                </div>
              )}
              {openProject.details && (
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
                  {pick(openProject.details, openProjectEn?.details)}
                </p>
              )}
              {openProject.link && (
                <a
                  href={openProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 border-t border-border/70 pt-4 text-sm font-medium text-foreground transition-colors hover:text-(--studio-accent)"
                >
                  <ExternalLink className="size-3.5" />
                  {t("portfolio.viewProject")}
                </a>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

/** Simple gallery: main image + clickable thumbnails. */
function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const safeIndex = Math.min(Math.max(current, 0), Math.max(images.length - 1, 0));
  const currentImage = images[safeIndex] ?? "";

  if (!currentImage) return null;

  return (
    <div>
      <figure className="border border-border bg-card p-2">
        <img
          src={currentImage}
          alt={title}
          className="aspect-[16/10] w-full object-cover"
        />
      </figure>
      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Image ${index + 1}`}
              className={cn(
                "size-16 overflow-hidden border transition-colors",
                index === safeIndex
                  ? "border-foreground"
                  : "border-border opacity-60 hover:opacity-100",
              )}
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
