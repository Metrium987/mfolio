import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeading } from "./Section";

/**
 * Map a free-text proficiency level to a 1–5 scale for the dots indicator.
 * Recognizes the usual French / English / CECRL labels; defaults to 3.
 */
function levelToDots(level: string): number {
  const s = level
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/(natif|native|maternelle|mother|bilingue|bilingual|c2)/.test(s)) return 5;
  if (/(courant|fluent|avance|advanced|c1|professionnel|professional|full)/.test(s)) return 4;
  if (/(intermediaire|intermediate|b2|operationnel|conversationnel|operational)/.test(s)) return 3;
  if (/(debutant|beginner|a2|notions|elementaire|basic|scolaire|elementary)/.test(s)) return 2;
  if (/a1/.test(s)) return 1;
  return 3;
}

function Dots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={cn(
            "h-1.5 w-5 transition-colors",
            dot <= level ? "bg-(--studio-accent)" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Languages spoken with proficiency levels — the standard French CV rubric
 * (« Langues »). Two rendering styles:
 *  - "list"  : editorial rows with hairline separators (name left, level right)
 *  - "cards" : grid of vignettes with a 5-dot proficiency indicator
 */
export function Languages({
  languages,
  layout = "cards",
}: {
  languages: Doc<"languages">;
  layout?: "list" | "cards";
}) {
  const { t, pick } = useSiteLang();

  return (
    <Container id="languages" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker={t("languages.kicker")}
          title={pick(languages.title, languages.en?.title)}
          description={pick(languages.description, languages.en?.description)}
        />
        {languages.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("languages.none")}</p>
        ) : layout === "cards" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {languages.items.map((item, index) => {
              const name = pick(item.name, languages.en?.items?.[index]?.name);
              const level = pick(item.level, languages.en?.items?.[index]?.level);
              return (
                <Reveal
                  key={`${item.name}-${index}`}
                  delay={Math.min(index * 0.05, 0.25)}
                  className="min-w-0"
                >
                  <article className="group flex h-full flex-col border border-border bg-card p-6 transition-colors duration-300 hover:border-foreground/40">
                    <h3 className="font-display text-xl font-light tracking-tight text-foreground">
                      {name}
                    </h3>
                    {level && (
                      <span className="mt-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {level}
                      </span>
                    )}
                    <div className="mt-auto pt-5">
                      <Dots level={levelToDots(level ?? "")} />
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="border-t border-border">
            {languages.items.map((item, index) => (
              <Reveal
                key={`${item.name}-${index}`}
                delay={Math.min(index * 0.04, 0.25)}
              >
                <div className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5 border-b border-border py-5 transition-colors duration-300 hover:bg-card/30 md:py-6">
                  <span className="font-display text-xl font-light tracking-tight text-foreground">
                    {pick(item.name, languages.en?.items?.[index]?.name)}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-300 group-hover:text-(--studio-accent)">
                    {pick(item.level, languages.en?.items?.[index]?.level)}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
