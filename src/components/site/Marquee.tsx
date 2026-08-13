import { useReducedMotion } from "framer-motion";

/**
 * Kinetic marquee — a slowly scrolling band of keywords (services, skills…)
 * in large display type. This is the editorial "signature" element of
 * award-winning portfolios: motion and typography as decoration, with no
 * extra content to maintain. Falls back to a static wrapped row for users
 * who prefer reduced motion.
 */
export function Marquee({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  const list = items.filter(Boolean);
  if (list.length === 0) return null;

  if (reduce) {
    return (
      <div
        aria-hidden
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-y border-border/70 bg-card/40 px-6 py-6"
      >
        {list.map((item) => (
          <span
            key={item}
            className="font-display text-2xl font-light italic tracking-tight text-foreground/80 md:text-3xl"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="overflow-hidden border-y border-border/70 bg-card/40 py-7"
    >
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {list.map((item) => (
              <span key={`${copy}-${item}`} className="flex items-center">
                <span className="whitespace-nowrap font-display text-3xl font-light italic tracking-tight text-foreground/80 md:text-4xl">
                  {item}
                </span>
                <span className="mx-10 size-1.5 shrink-0 rounded-full bg-(--studio-accent)" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
