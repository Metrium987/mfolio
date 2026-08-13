import { Loader2, Save } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ToggleField } from "./fields";

export function SectionEditor({
  title,
  description,
  visibility,
  onVisibilityChange,
  onSave,
  saving,
  dirty,
  children,
  showVisibility = true,
  showSave = true,
}: {
  title: string;
  description: string;
  visibility: boolean;
  onVisibilityChange: (visible: boolean) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
  children: ReactNode;
  showVisibility?: boolean;
  /** Hide the bottom "Enregistrer" bar — sections that publish automatically. */
  showSave?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Section
          </p>
          <h1 className="mt-1 font-display text-2xl font-light tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {showVisibility && (
          <ToggleField
            label="Visible sur le site"
            description="Affiche ou masque cette section du portfolio"
            checked={visibility}
            onChange={onVisibilityChange}
          />
        )}
      </div>

      <div className="border border-border bg-card p-5 sm:p-6">{children}</div>

      {showSave && (
        <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3">
          {dirty && (
            <span className="text-xs text-muted-foreground">
              Modifications non enregistrées
            </span>
          )}
          <Button
            onClick={onSave}
            disabled={saving || !dirty}
            className="rounded-full"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      )}
    </div>
  );
}
