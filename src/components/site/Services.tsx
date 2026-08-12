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
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {services.items.map((service, index) => (
            <Reveal key={service.title} delay={Math.min(index * 0.06, 0.3)}>
              <div className="group flex h-full flex-col bg-background p-7 transition-colors duration-300 hover:bg-card">
                <div className="mb-6 flex size-11 items-center justify-center border border-border text-(--studio-accent) transition-colors group-hover:border-(--studio-accent)">
                  <ServiceIcon name={service.icon} className="size-5" />
                </div>
                <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
                  {pick(service.title, services.en?.items?.[index]?.title)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {pick(service.details, services.en?.items?.[index]?.details)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Container>
  );
}
