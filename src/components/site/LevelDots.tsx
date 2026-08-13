import { cn } from "@/lib/utils";

/**
 * Shared 5-dot proficiency indicator, used by the Languages and Skills
 * sections. `level` is the number of filled dots (0–5).
 */
export function LevelDots({
  level,
  className,
}: {
  level: number;
  className?: string;
}) {
  const filled = Math.max(0, Math.min(5, Math.round(level)));
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      aria-hidden="true"
    >
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={cn(
            "h-1.5 w-5 transition-colors",
            dot <= filled ? "bg-(--studio-accent)" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}
