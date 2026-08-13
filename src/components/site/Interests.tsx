import type { Doc } from "@/convex/_generated/dataModel";
import { useSiteLang } from "@/lib/i18n";
import { ServiceIcon } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeading } from "./Section";

export function Interests({
  interests,
  layout = "cards",
}: {
  interests: Doc<"interests">;
  layout?: "list" | "cards";
}) {
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
        ) : layout === "cards" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {interests.items.map((item, index) => (
              <Reveal
                key={`${item.name}-${index}`}
                delay={Math.min(index * 0.05, 0.25)}
                className="min-w-0"
              >
                <article className="group flex h-full flex-col border border-border bg-card p-6 transition-colors duration-300 hover:border-foreground/40">
                  {item.icon && (
                    <div className="flex size-12 shrink-0 items-center justify-center border border-border text-(--studio-accent) transition-colors duration-300 group-hover:border-(--studio-accent)">
                      <ServiceIcon name={item.icon} className="size-5" />
                    </div>
                  )}
                  <h3
                    className={cn(
                      "font-display text-xl font-light tracking-tight text-foreground",
                      item.icon && "mt-5",
                    )}
                  >
                    {pick(item.name, interests.en?.items?.[index]?.name)}
                  </h3>
                  {pick(
                    item.details,
                    interests.en?.items?.[index]?.details,
                  ) && (
                    <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">
                      {pick(
                        item.details,
                        interests.en?.items?.[index]?.details,
                      )}
                    </p>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="border-t border-border">
            {interests.items.map((item, index) => (
              <Reveal
                key={`${item.name}-${index}`}
                delay={Math.min(index * 0.04, 0.25)}
              >
                <div className="group flex items-start gap-6 border-b border-border py-7 transition-colors duration-300 hover:bg-card/30 md:py-8">
                  {item.icon && (
                    <div className="flex size-12 shrink-0 items-center justify-center border border-border text-(--studio-accent) transition-colors duration-300 group-hover:border-(--studio-accent)">
                      <ServiceIcon name={item.icon} className="size-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-light tracking-tight text-foreground">
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
