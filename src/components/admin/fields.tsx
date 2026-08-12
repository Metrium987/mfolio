import { useAction, useMutation } from "convex/react";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Social } from "@/lib/site";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Field wrappers
// ---------------------------------------------------------------------------

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-[13px] font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="bg-background"
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="bg-background"
      />
    </Field>
  );
}

export function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image picker (upload to Convex storage or paste a URL)
// ---------------------------------------------------------------------------

export function ImageField({
  label,
  value,
  onChange,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  className?: string;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getUrl = useAction(api.files.getUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = (await result.json()) as { storageId: string };
      const url = await getUrl({ storageId: storageId as Id<"_storage"> });
      if (url) {
        onChange(url);
        toast.success("Image importée");
      } else {
        toast.error("Impossible de récupérer l'image");
      }
    } catch (error) {
      console.error(error);
      toast.error("Le téléchargement de l'image a échoué");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Field label={label} hint={hint} className={className}>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative flex h-28 w-44 shrink-0 items-center justify-center overflow-hidden border border-border bg-background">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-3 text-center text-xs text-muted-foreground">
              Aucune image
            </span>
          )}
        </div>
        <div className="min-w-56 flex-1 space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {uploading ? "Envoi…" : "Importer"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
              >
                <X className="size-4" />
                Retirer
              </Button>
            )}
          </div>
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="…ou collez l'URL d'une image"
            className="bg-background text-xs"
          />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Social links list editor
// ---------------------------------------------------------------------------

export function SocialLinksEditor({
  value,
  onChange,
}: {
  value: Social[];
  onChange: (value: Social[]) => void;
}) {
  const update = (index: number, patch: Partial<Social>) => {
    onChange(value.map((social, i) => (i === index ? { ...social, ...patch } : social)));
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Aucun réseau social. Ajoutez-en un ci-dessous.
        </p>
      )}
      {value.map((social, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2">
          <Input
            value={social.title}
            onChange={(event) => update(index, { title: event.target.value })}
            placeholder="Nom (ex : GitHub)"
            className="w-40 bg-background"
          />
          <Input
            value={social.link}
            onChange={(event) => update(index, { link: event.target.value })}
            placeholder="https://…"
            className="min-w-44 flex-1 bg-background"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Supprimer"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, { title: "", link: "" }])}
      >
        <Plus className="size-4" />
        Ajouter un réseau
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section draft hook — mirrors a Convex doc locally until "Save" is pressed
// ---------------------------------------------------------------------------

type Draft<T> = Omit<T, "_id" | "_creationTime">;

export function useSectionDraft<T extends { _id: unknown; _creationTime: unknown }>(
  doc: T | null | undefined,
  empty: Draft<T>,
) {
  const [draft, setDraft] = useState<Draft<T> | null>(null);

  useEffect(() => {
    if (doc && draft === null) {
      const { _id, _creationTime, ...fields } = doc;
      void _id;
      void _creationTime;
      setDraft(fields);
    }
  }, [doc, draft]);

  const source = useMemo<Draft<T> | undefined>(() => {
    if (!doc) return undefined;
    const { _id, _creationTime, ...fields } = doc;
    void _id;
    void _creationTime;
    return fields;
  }, [doc]);

  const value: Draft<T> = draft ?? source ?? empty;
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(source);

  const set = useCallback(
    (updater: Draft<T> | ((prev: Draft<T>) => Draft<T>)) => {
      setDraft((prev) => {
        const base: Draft<T> = prev ?? source ?? empty;
        return typeof updater === "function"
          ? (updater as (p: Draft<T>) => Draft<T>)(base)
          : updater;
      });
    },
    [source, empty],
  );

  const reset = useCallback(() => setDraft(null), []);

  return { value, set, dirty, reset };
}
