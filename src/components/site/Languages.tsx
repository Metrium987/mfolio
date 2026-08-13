import type { Doc } from "@/convex/_generated/dataModel";
import { displayLevel, levelToNumber } from "@/lib/levels";
import { useSiteLang } from "@/lib/i18n";
import { LevelDots } from "./LevelDots";
import { Container, Reveal, SectionHeading } from "./Section";

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
  const { t, pick, lang } = useSiteLang();

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
              // Level is stored as a 1–5 number (FR) or translated text (EN) —
              // same language rule as `pick`, but the types differ.
              const level =
                lang === "en" && languages.en?.items?.[index]?.level
                  ? languages.en.items[index].level
                  : item.level;
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
                    {level !== undefined && level !== "" && (
                      <span className="mt-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {displayLevel(level)}
                      </span>
                    )}
                    <div className="mt-auto pt-5">
                      <LevelDots level={levelToNumber(level ?? "")} />
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
                    {displayLevel(
                      lang === "en" && languages.en?.items?.[index]?.level
                        ? languages.en.items[index].level
                        : item.level,
                    )}
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
