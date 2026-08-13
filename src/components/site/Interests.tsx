import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { Container, Reveal, SectionHeading } from "./Section";

/**
 * Centers of interest — a standard rubric of the French CV (rubrique
 * « Centres d'intérêt »). Numbered editorial rows with hairline separators,
 * mirroring the Services section: index on the left, name and detail below.
 */
export function Interests({ interests }: { interests: Doc<"interests"> }) {
  const { t, pick } = useSiteLang();

  return (
    <Container id="interests" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker={t("interests.kicker")}
          title={pick(interests.title, interests.en?.title)}
          description={pick(interests.description, interests.en?.description)}
        />
        {interests.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("interests.none")}</p>
        ) : (
          <div className="border-t border-border">
            {interests.items.map((item, index) => (
              <Reveal
                key={`${item.name}-${index}`}
                delay={Math.min(index * 0.04, 0.25)}
              >
                <div className="group grid grid-cols-1 gap-2 border-b border-border py-7 transition-colors duration-300 hover:bg-card/30 md:grid-cols-[8rem_1fr] md:items-baseline md:gap-12 md:py-8">
                  <span className="w-8 font-display text-sm tracking-[0.2em] text-muted-foreground transition-colors duration-300 group-hover:text-(--studio-accent)">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-light tracking-tight text-foreground md:text-2xl">
                      {pick(item.name, interests.en?.items?.[index]?.name)}
                    </h3>
                    {pick(
                      item.details,
                      interests.en?.items?.[index]?.details,
                    ) && (
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {pick(
                          item.details,
                          interests.en?.items?.[index]?.details,
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
