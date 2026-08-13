import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { ServiceIcon } from "@/lib/site";
import { Container, Reveal, SectionHeading } from "./Section";

export function Services({
  services,
  layout = "cards",
}: {
  services: Doc<"services">;
  layout?: "list" | "cards";
}) {
  const { t, pick } = useSiteLang();

  return (
    <Container id="services" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker={t("services.kicker")}
          title={pick(services.title, services.en?.title)}
          description={pick(services.description, services.en?.description)}
        />
        {layout === "cards" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.items.map((service, index) => (
              <Reveal
                key={service.title}
                delay={Math.min(index * 0.05, 0.25)}
                className="min-w-0"
              >
                <article className="group flex h-full flex-col border border-border bg-card p-6 transition-colors duration-300 hover:border-foreground/40">
                  <div className="flex size-12 shrink-0 items-center justify-center border border-border text-(--studio-accent) transition-colors duration-300 group-hover:border-(--studio-accent)">
                    <ServiceIcon name={service.icon} className="size-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-light tracking-tight text-foreground">
                    {pick(service.title, services.en?.items?.[index]?.title)}
                  </h3>
                  {pick(
                    service.details,
                    services.en?.items?.[index]?.details,
                  ) && (
                    <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">
                      {pick(
                        service.details,
                        services.en?.items?.[index]?.details,
                      )}
                    </p>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="border-t border-border">
            {services.items.map((service, index) => (
              <Reveal
                key={service.title}
                delay={Math.min(index * 0.04, 0.25)}
                className="min-w-0"
              >
                <div className="group flex items-start gap-6 border-b border-border py-10 transition-colors duration-300 hover:bg-card/40 md:py-12">
                  <div className="flex size-12 shrink-0 items-center justify-center border border-border text-(--studio-accent) transition-colors duration-300 group-hover:border-(--studio-accent)">
                    <ServiceIcon name={service.icon} className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-light tracking-tight text-foreground">
                      {pick(service.title, services.en?.items?.[index]?.title)}
                    </h3>
                    {pick(
                      service.details,
                      services.en?.items?.[index]?.details,
                    ) && (
                      <p className="mt-3 max-w-2xl break-words text-sm leading-relaxed text-muted-foreground">
                        {pick(
                          service.details,
                          services.en?.items?.[index]?.details,
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
