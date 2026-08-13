import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { Container, Reveal, SectionHeading } from "./Section";

function ExperienceEntry({
  position,
  company,
  period,
  location,
  contractType,
  details,
  achievements,
}: {
  position: string;
  company: string;
  period: string;
  location: string;
  contractType: string;
  details: string;
  achievements: string[];
}) {
  // Every rubric is optional: only filled parts are rendered and joined with
  // a thin separator — no orphan "·", no empty rows when a field is left
  // blank (e.g. no contract type, no location).
  const meta = [company, location, contractType]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
  const bullets = achievements.filter((achievement) => achievement.trim());

  return (
    <li className="relative border-l border-border pb-10 pl-6 last:pb-0">
      <span className="absolute -left-[5px] top-1.5 size-2 rounded-full border border-border bg-background" />
      {period.trim() && (
        <p className="text-xs uppercase tracking-[0.2em] text-(--studio-accent)">
          {period}
        </p>
      )}
      {position.trim() && (
        <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-foreground">
          {position}
        </h3>
      )}
      {meta && (
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">{meta}</p>
      )}
      {details.trim() && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">
          {details}
        </p>
      )}
      {bullets.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {bullets.map((achievement, index) => (
            <li
              key={`${achievement}-${index}`}
              className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground/90"
            >
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-(--studio-accent)" />
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function EducationEntry({
  degree,
  institution,
  period,
  cgpa,
  department,
  thesis,
}: {
  degree: string;
  institution: string;
  period: string;
  cgpa: string;
  department: string;
  thesis: string;
}) {
  return (
    <li className="relative border-l border-border pb-10 pl-6 last:pb-0">
      <span className="absolute -left-[5px] top-1.5 size-2 rounded-full border border-border bg-background" />
      <p className="text-xs uppercase tracking-[0.2em] text-(--studio-accent)">
        {period}
      </p>
      <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-foreground">
        {degree}
      </h3>
      <p className="mt-0.5 text-sm font-medium text-muted-foreground">
        {institution}
        {cgpa ? ` — ${cgpa}` : ""}
      </p>
      {(department || thesis) && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">
          {[department, thesis].filter(Boolean).join(" · ")}
        </p>
      )}
    </li>
  );
}

export function Resume({ resume }: { resume: Doc<"resume"> }) {
  const { t, pick } = useSiteLang();

  return (
    <Container id="resume" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker={t("resume.kicker")}
          title={pick(resume.title, resume.en?.title)}
          description={pick(resume.description, resume.en?.description)}
        />
        <div className="space-y-16 lg:space-y-20">
          <Reveal>
            <p className="kicker mb-8">{t("resume.education")}</p>
            {resume.educations.length > 0 ? (
              <ul className="max-w-3xl">
                {resume.educations.map((education, index) => (
                  <EducationEntry
                    key={`${education.degree}-${education.period}`}
                    degree={pick(
                      education.degree,
                      resume.en?.educations?.[index]?.degree,
                    )}
                    institution={education.institution}
                    period={education.period}
                    cgpa={education.cgpa}
                    department={pick(
                      education.department,
                      resume.en?.educations?.[index]?.department,
                    )}
                    thesis={pick(
                      education.thesis,
                      resume.en?.educations?.[index]?.thesis,
                    )}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("resume.noEducation")}
              </p>
            )}
          </Reveal>
          <Reveal delay={0.1}>
            <p className="kicker mb-8">{t("resume.experience")}</p>
            {resume.experiences.length > 0 ? (
              <ul className="max-w-3xl">
                {resume.experiences.map((experience, index) => (
                  <ExperienceEntry
                    key={`${experience.position}-${experience.period}`}
                    position={pick(
                      experience.position,
                      resume.en?.experiences?.[index]?.position,
                    )}
                    company={experience.company}
                    period={experience.period}
                    location={pick(
                      experience.location ?? "",
                      resume.en?.experiences?.[index]?.location,
                    )}
                    contractType={pick(
                      experience.contractType ?? "",
                      resume.en?.experiences?.[index]?.contractType,
                    )}
                    details={pick(
                      experience.details,
                      resume.en?.experiences?.[index]?.details,
                    )}
                    achievements={(experience.achievements ?? []).map(
                      (achievement, achievementIndex) =>
                        pick(
                          achievement,
                          resume.en?.experiences?.[index]?.achievements?.[
                            achievementIndex
                          ],
                        ),
                    )}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("resume.noExperience")}
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
