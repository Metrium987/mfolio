import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { ServiceIcon } from "@/lib/site";
import { Container, Reveal, SectionHeading } from "./Section";

export function Services({ services }: { services: Doc<"services"> }) {
  const { t, pick } = useSiteLang();

  return (
    <Container id="services" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker={t("services.kicker")}
          title={pick(services.title, services.en?.title)}
          description={pick(services.description, services.en?.description)}
        />
        {/* Editorial index list — the standard for high-end portfolio
            "services" sections (and the opposite of the nested-card anti-
            pattern). Each service is a numbered row with a hairline
            separator: index + icon on the left, large display title and a
            readable description on the right. Any count — 1, 5, 7, 21 —
            reads as an intentional list. */}
        <div className="border-t border-border">
          {services.items.map((service, index) => (
            <Reveal
              key={service.title}
              delay={Math.min(index * 0.04, 0.25)}
              className="min-w-0"
            >
              <div className="group grid grid-cols-1 gap-4 border-b border-border py-10 transition-colors duration-300 hover:bg-card/40 md:grid-cols-[9rem_1fr] md:items-start md:gap-12 md:py-12">
                <div className="flex items-center gap-5">
                  <span className="w-8 shrink-0 font-display text-sm tracking-[0.2em] text-muted-foreground transition-colors duration-300 group-hover:text-(--studio-accent)">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex size-12 shrink-0 items-center justify-center border border-border text-(--studio-accent) transition-colors duration-300 group-hover:border-(--studio-accent)">
                    <ServiceIcon name={service.icon} className="size-5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-light tracking-tight text-foreground">
                    {pick(service.title, services.en?.items?.[index]?.title)}
                  </h3>
                  {pick(service.details, services.en?.items?.[index]?.details) && (
                    <p className="mt-3 max-w-2xl break-words text-sm leading-relaxed text-muted-foreground">
                      {pick(service.details, services.en?.items?.[index]?.details)}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Container>
  );
}
