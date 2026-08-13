import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { Container, Reveal, SectionHeading } from "./Section";

/**
 * Languages spoken with proficiency levels — a standard rubric of the French
 * CV (rubrique « Langues »). Editorial rows with hairline separators: the
 * language in display type on the left, the level in small caps on the right.
 */
export function Languages({ languages }: { languages: Doc<"languages"> }) {
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
        ) : (
          <div className="border-t border-border">
            {languages.items.map((item, index) => (
              <Reveal
                key={`${item.name}-${index}`}
                delay={Math.min(index * 0.04, 0.25)}
              >
                <div className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5 border-b border-border py-5 transition-colors duration-300 hover:bg-card/30 md:py-6">
                  <span className="font-display text-xl font-light tracking-tight text-foreground md:text-2xl">
                    {pick(item.name, languages.en?.items?.[index]?.name)}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-300 group-hover:text-(--studio-accent)">
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
