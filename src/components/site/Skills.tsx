import type { Doc } from "@/convex/_generated/dataModel";
import { proficiencyToLevel } from "@/lib/levels";
import { useSiteLang } from "@/lib/i18n";
import { LevelDots } from "./LevelDots";
import { Container, Reveal, SectionHeading } from "./Section";

/**
 * Skills (« Compétences ») with optional proficiency levels — the standard
 * French CV rubric. Uses the same 5-dot indicator as the Languages section:
 *  - "list"  : editorial rows with hairline separators (name left, dots right)
 *  - "cards" : grid of vignettes (name + dots)
 * When `showProficiency` is false, the dots are hidden.
 */
export function Skills({
  skills,
  showProficiency,
  layout = "cards",
}: {
  skills: Doc<"skills">;
  showProficiency: boolean;
  layout?: "list" | "cards";
}) {
  const { t, pick } = useSiteLang();

  return (
    <Container id="skills" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker={t("skills.kicker")}
          title={pick(skills.title, skills.en?.title)}
          description={pick(skills.description, skills.en?.description)}
        />
        {skills.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("skills.none")}</p>
        ) : layout === "cards" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {skills.items.map((skill, index) => (
              <Reveal
                key={skill.name}
                delay={Math.min(index * 0.04, 0.25)}
                className="min-w-0"
              >
                <article className="group flex h-full flex-col border border-border bg-card p-6 transition-colors duration-300 hover:border-foreground/40">
                  <h3 className="font-display text-xl font-light tracking-tight text-foreground">
                    {pick(skill.name, skills.en?.items?.[index]?.name)}
                  </h3>
                  {showProficiency && (
                    <div className="mt-auto pt-5">
                      <LevelDots level={proficiencyToLevel(skill.proficiency)} />
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="border-t border-border">
            {skills.items.map((skill, index) => (
              <Reveal
                key={skill.name}
                delay={Math.min(index * 0.04, 0.25)}
              >
                <div className="group flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-b border-border py-5 transition-colors duration-300 hover:bg-card/30 md:py-6">
                  <span className="font-display text-xl font-light tracking-tight text-foreground">
                    {pick(skill.name, skills.en?.items?.[index]?.name)}
                  </span>
                  {showProficiency && (
                    <LevelDots level={proficiencyToLevel(skill.proficiency)} />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
