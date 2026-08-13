import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { Container, Reveal, SectionHeading } from "./Section";

function Bar({ value }: { value: number }) {
  const width = Math.min(Math.max(value, 0), 100);
  return (
    <div className="mt-3 h-px w-full bg-border" aria-hidden="true">
      <div
        className="h-px bg-(--studio-accent) transition-[width] duration-700 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/**
 * Skills (« Compétences ») with optional proficiency levels — the standard
 * French CV rubric. Two rendering styles:
 *  - "list"  : editorial rows with hairline separators (name left, level right)
 *  - "cards" : grid of vignettes
 * When `showProficiency` is false, the percentage + bar are hidden.
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
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl font-light tracking-tight text-foreground">
                      {pick(skill.name, skills.en?.items?.[index]?.name)}
                    </h3>
                    {showProficiency && (
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {skill.proficiency}%
                      </span>
                    )}
                  </div>
                  {showProficiency && (
                    <div className="mt-auto pt-5">
                      <Bar value={skill.proficiency} />
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
                <div className="group border-b border-border py-5 transition-colors duration-300 hover:bg-card/30 md:py-6">
                  <div className="flex items-baseline justify-between gap-x-8 gap-y-1.5">
                    <span className="font-display text-xl font-light tracking-tight text-foreground">
                      {pick(skill.name, skills.en?.items?.[index]?.name)}
                    </span>
                    {showProficiency && (
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-300 group-hover:text-(--studio-accent)">
                        {skill.proficiency}%
                      </span>
                    )}
                  </div>
                  {showProficiency && <Bar value={skill.proficiency} />}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
