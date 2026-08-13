import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { Container, Reveal, SectionHeading } from "./Section";

export function Skills({
  skills,
  showProficiency,
}: {
  skills: Doc<"skills">;
  showProficiency: boolean;
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
        {showProficiency ? (
          <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
            {skills.items.map((skill, index) => (
              <Reveal key={skill.name} delay={Math.min(index * 0.04, 0.3)}>
                <div className="group">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium text-foreground">
                      {pick(skill.name, skills.en?.items?.[index]?.name)}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {skill.proficiency}%
                    </span>
                  </div>
                  <div className="mt-2.5 h-px w-full bg-border" />
                  <div className="relative h-px w-full bg-transparent">
                    <div
                      className="absolute inset-y-0 left-0 bg-(--studio-accent) transition-[width] duration-700 ease-out group-hover:opacity-80"
                      style={{
                        width: `${Math.min(Math.max(skill.proficiency, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {skills.items.map((skill, index) => (
              <Reveal key={skill.name} delay={Math.min(index * 0.03, 0.2)}>
                <span className="inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground">
                  {pick(skill.name, skills.en?.items?.[index]?.name)}
                </span>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
