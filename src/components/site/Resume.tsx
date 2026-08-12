import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { Container, Reveal, SectionHeading } from "./Section";

function ExperienceEntry({
  position,
  company,
  period,
  details,
}: {
  position: string;
  company: string;
  period: string;
  details: string;
}) {
  return (
    <li className="relative border-l border-border pb-10 pl-6 last:pb-0">
      <span className="absolute -left-[5px] top-1.5 size-2 rounded-full border border-border bg-background" />
      <p className="text-[11px] uppercase tracking-[0.18em] text-(--studio-accent)">
        {period}
      </p>
      <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-foreground">
        {position}
      </h3>
      <p className="mt-0.5 text-sm font-medium text-muted-foreground">{company}</p>
      {details && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">
          {details}
        </p>
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
      <p className="text-[11px] uppercase tracking-[0.18em] text-(--studio-accent)">
        {period}
      </p>
      <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-foreground">
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
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="kicker mb-8">{t("resume.experience")}</p>
            {resume.experiences.length > 0 ? (
              <ul>
                {resume.experiences.map((experience, index) => (
                  <ExperienceEntry
                    key={`${experience.position}-${experience.period}`}
                    position={pick(
                      experience.position,
                      resume.en?.experiences?.[index]?.position,
                    )}
                    company={experience.company}
                    period={experience.period}
                    details={pick(
                      experience.details,
                      resume.en?.experiences?.[index]?.details,
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
          <Reveal delay={0.12}>
            <p className="kicker mb-8">{t("resume.education")}</p>
            {resume.educations.length > 0 ? (
              <ul>
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
        </div>
      </div>
    </Container>
  );
}
