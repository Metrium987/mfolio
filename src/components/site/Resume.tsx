import type { Doc } from "@/convex/_generated/dataModel";
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
  return (
    <Container id="resume" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker="Parcours"
          title={resume.title}
          description={resume.description}
        />
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="kicker mb-8">Expérience</p>
            {resume.experiences.length > 0 ? (
              <ul>
                {resume.experiences.map((experience) => (
                  <ExperienceEntry
                    key={`${experience.position}-${experience.period}`}
                    position={experience.position}
                    company={experience.company}
                    period={experience.period}
                    details={experience.details}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune expérience renseignée.
              </p>
            )}
          </Reveal>
          <Reveal delay={0.12}>
            <p className="kicker mb-8">Formation</p>
            {resume.educations.length > 0 ? (
              <ul>
                {resume.educations.map((education) => (
                  <EducationEntry
                    key={`${education.degree}-${education.period}`}
                    degree={education.degree}
                    institution={education.institution}
                    period={education.period}
                    cgpa={education.cgpa}
                    department={education.department}
                    thesis={education.thesis}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune formation renseignée.
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
