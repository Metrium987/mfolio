import { useAction, useMutation } from "convex/react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  ImagePlus,
  Inbox,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  LEVEL_OPTIONS,
  levelToNumber,
  proficiencyToLevel,
} from "@/lib/levels";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  formatTimestamp,
  SERVICE_ICON_GROUPS,
  ServiceIcon,
} from "@/lib/site";
import { SectionEditor } from "./SectionEditor";
import {
  Field,
  ImageField,
  ImageGuideChip,
  type ImageGuide,
  TextAreaField,
  TextField,
  useSectionDraft,
} from "./fields";
import { ManageList, PreviewLabel } from "./manage-list";

/** Common French contract types offered as a pick-list in the Resume editor. */
const CONTRACT_TYPES = [
  "CDI",
  "CDD",
  "Intérim",
  "Freelance",
  "Indépendant",
  "Stage",
  "Alternance",
  "Apprentissage",
  "Contrat pro",
  "Bénévolat",
  "Volontariat",
] as const;

/** Icon picker shared by the Services and Interests editors. */
function IconSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Icône</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {SERVICE_ICON_GROUPS.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.icons.map((name) => (
                <SelectItem key={name} value={name}>
                  <span className="flex items-center gap-2">
                    <ServiceIcon
                      name={name}
                      className="size-4 text-(--studio-accent)"
                    />
                    {name}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Swap two items of a draft list, returning a new array (no-op out of range). */
function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Plus className="size-4" />
      {label}
    </Button>
  );
}

/** Simple string-list editor (categories, keywords…). */
function TagsEditor({
  label,
  value,
  onChange,
  placeholder,
  hint = "Chaque catégorie sert de filtre sur le site.",
  addLabel = "Ajouter une catégorie",
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  hint?: string;
  addLabel?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {value.map((tag, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={tag}
              onChange={(event) =>
                onChange(
                  value.map((t, n) => (n === index ? event.target.value : t)),
                )
              }
              placeholder={placeholder}
              className="flex-1 bg-background"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Supprimer"
              onClick={() => onChange(value.filter((_, n) => n !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <AddButton label={addLabel} onClick={() => onChange([...value, ""])} />
      </div>
    </Field>
  );
}

/** Multiple images per project (Ezfolio thumbnail + images). */
function ImagesEditor({
  label,
  value,
  onChange,
  guide,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  guide?: ImageGuide;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getUrl = useAction(api.files.getUrl);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFile = async (index: number, file: File) => {
    setUploadingIndex(index);
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
        onChange(value.map((v, n) => (n === index ? url : v)));
        toast.success("Image importée");
      }
    } catch (error) {
      console.error(error);
      toast.error("Le téléchargement de l'image a échoué");
    } finally {
      setUploadingIndex(null);
      if (inputRefs.current[index]) inputRefs.current[index].value = "";
    }
  };

  return (
    <Field
      label={label}
      hint="Les images de la galerie, visibles en cliquant sur le projet sur le site."
      labelExtra={guide ? <ImageGuideChip guide={guide} /> : undefined}
    >
      <div className="space-y-2">
        {value.map((image, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden border border-border bg-background">
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="px-1 text-center text-[10px] text-muted-foreground">
                  Vide
                </span>
              )}
            </div>
            <Input
              value={image}
              onChange={(event) =>
                onChange(
                  value.map((v, n) => (n === index ? event.target.value : v)),
                )
              }
              placeholder="https://… ou importez une image"
              className="min-w-44 flex-1 bg-background text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              title="Importer"
              disabled={uploadingIndex === index}
              onClick={() => inputRefs.current[index]?.click()}
            >
              {uploadingIndex === index ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Supprimer"
              onClick={() => onChange(value.filter((_, n) => n !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(index, file);
              }}
            />
          </div>
        ))}
        <AddButton
          label="Ajouter une image"
          onClick={() => onChange([...value, ""])}
        />
      </div>
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export function SkillsEditor({ skills }: { skills: Doc<"skills"> | null | undefined }) {
  const updateSkills = useAction(api.translate.updateSkills);
  const [saving, setSaving] = useState(false);

  // Normalize legacy 0–100 % proficiencies to the unified 1–5 scale on load.
  const normalized = useMemo(
    () =>
      skills
        ? {
            ...skills,
            items: skills.items.map((item) => ({
              ...item,
              proficiency: proficiencyToLevel(item.proficiency),
            })),
          }
        : undefined,
    [skills],
  );
  const draft = useSectionDraft(normalized, {
    title: "",
    description: "",
    items: [],
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateSkills({ data: draft.value });
      draft.commit(draft.value);
      toast.success("Section « Compétences » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Compétences"
      description="La liste des compétences avec leur niveau — 5 niveaux (menu déroulant)."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="Compétences" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} placeholder="Les outils que j'utilise au quotidien." />
      </div>

      <div className="mt-6 space-y-3">
        {draft.value.items.map((item, index) => (
          <div key={index} className="rounded-md border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={item.name}
                onChange={(event) =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.map((i, n) =>
                      n === index ? { ...i, name: event.target.value } : i,
                    ),
                  }))
                }
                placeholder="Nom de la compétence"
                className="min-w-0 max-w-xs flex-1 bg-background"
              />
              <div className="min-w-44 flex-1">
                <Select
                  value={String(item.proficiency)}
                  onValueChange={(value) =>
                    draft.set((prev) => ({
                      ...prev,
                      items: prev.items.map((i, n) =>
                        n === index
                          ? { ...i, proficiency: Number(value) }
                          : i,
                      ),
                    }))
                  }
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Monter"
                disabled={index === 0}
                className="shrink-0"
                onClick={() =>
                  draft.set((prev) => {
                    const items = [...prev.items];
                    [items[index - 1], items[index]] = [
                      items[index],
                      items[index - 1],
                    ];
                    return { ...prev, items };
                  })
                }
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Descendre"
                disabled={index === draft.value.items.length - 1}
                className="shrink-0"
                onClick={() =>
                  draft.set((prev) => {
                    const items = [...prev.items];
                    [items[index], items[index + 1]] = [
                      items[index + 1],
                      items[index],
                    ];
                    return { ...prev, items };
                  })
                }
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Supprimer"
                className="shrink-0"
                onClick={() =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.filter((_, n) => n !== index),
                  }))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        <AddButton
          label="Ajouter une compétence"
          onClick={() =>
            draft.set((prev) => ({
              ...prev,
              items: [...prev.items, { name: "", proficiency: 3 }],
            }))
          }
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export function ServicesEditor({ services }: { services: Doc<"services"> | null | undefined }) {
  const updateServices = useAction(api.translate.updateServices);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(services, {
    title: "",
    description: "",
    items: [],
  });

  const persist = async (data: typeof draft.value, silent = false) => {
    setSaving(true);
    try {
      await updateServices({ data });
      draft.commit(data);
      if (!silent) toast.success("Section « Services » enregistrée");
    } catch (error) {
      console.error(error);
      if (!silent) toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  // Kept for the SectionEditor contract; with showSave={false} it is only
  // reachable programmatically.
  const save = () => void persist(draft.value);

  return (
    <SectionEditor
      title="Services"
      description="Les prestations proposées, affichées en grille."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      showSave={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} onBlur={() => void persist(draft.value, true)} placeholder="Services" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} onBlur={() => void persist(draft.value, true)} placeholder="Ce que je peux faire pour vous." />
      </div>

      <div className="mt-8 space-y-3">
        <ManageList
          items={draft.value.items}
          onItemsChange={(items) => draft.set((prev) => ({ ...prev, items }))}
          emptyItem={() => ({ title: "", details: "", icon: "Layers" })}
          saving={saving}
          onSaved={(items) => void persist({ ...draft.value, items })}
          addLabel="Ajouter un service"
          itemLabel={(item, index) => item.title.trim() || `Service ${index + 1}`}
          summary={(item) => (
            <div className="flex min-w-0 items-center gap-3">
              {item.icon && (
                <ServiceIcon
                  name={item.icon}
                  className="size-4 shrink-0 text-(--studio-accent)"
                />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {item.title.trim() || "Sans titre"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {item.details.trim() || "—"}
                </p>
              </div>
            </div>
          )}
          form={(item, update) => (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                <IconSelect
                  value={item.icon}
                  onChange={(icon) => update({ icon })}
                />
                <TextField
                  label="Titre"
                  value={item.title}
                  onChange={(title) => update({ title })}
                  placeholder="Design d'interface"
                />
              </div>
              <TextAreaField
                label="Détails"
                value={item.details}
                onChange={(details) => update({ details })}
                rows={3}
              />
            </div>
          )}
          preview={(item) => (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {item.icon && (
                  <ServiceIcon
                    name={item.icon}
                    className="size-5 text-(--studio-accent)"
                  />
                )}
                <p className="font-medium text-foreground">
                  {item.title || "Sans titre"}
                </p>
              </div>
              {item.details && (
                <div>
                  <PreviewLabel>Détails</PreviewLabel>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.details}
                  </p>
                </div>
              )}
            </div>
          )}
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Resume — experiences + educations (full Ezfolio fields)
// ---------------------------------------------------------------------------

export function ResumeEditor({
  resume,
}: {
  resume: Doc<"resume"> | null | undefined;
}) {
  const updateResume = useAction(api.translate.updateResume);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(resume, {
    title: "",
    description: "",
    experiences: [],
    educations: [],
  });

  const persist = async (data: typeof draft.value, silent = false) => {
    setSaving(true);
    try {
      await updateResume({ data });
      draft.commit(data);
      if (!silent) toast.success("Section « Parcours » enregistrée");
    } catch (error) {
      console.error(error);
      if (!silent) toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  // Kept for the SectionEditor contract; with showSave={false} it is only
  // reachable programmatically.
  const save = () => void persist(draft.value);

  return (
    <SectionEditor
      title="Parcours"
      description="Expériences professionnelles et formation (diplôme, institution, période, CGPA, département, mémoire)."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      showSave={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} onBlur={() => void persist(draft.value, true)} placeholder="Parcours" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} onBlur={() => void persist(draft.value, true)} placeholder="Mon expérience et ma formation." />
      </div>

      <div className="mt-8 space-y-10">
        <div className="space-y-3">
          <p className="text-[13px] font-medium">Expériences</p>
          <ManageList
            items={draft.value.experiences}
            onItemsChange={(experiences) =>
              draft.set((prev) => ({ ...prev, experiences }))
            }
            emptyItem={() => ({
              position: "",
              company: "",
              period: "",
              location: "",
              contractType: "",
              details: "",
              achievements: [],
            })}
            saving={saving}
            onSaved={(experiences) =>
              void persist({ ...draft.value, experiences })
            }
            addLabel="Ajouter une expérience"
            itemLabel={(item, index) =>
              item.position.trim() || `Expérience ${index + 1}`
            }
            summary={(item) => (
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {item.position.trim() || "Sans intitulé"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {[item.company, item.period].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            )}
            form={(item, update) => (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Poste"
                    value={item.position}
                    onChange={(position) => update({ position })}
                  />
                  <TextField
                    label="Entreprise"
                    value={item.company}
                    onChange={(company) => update({ company })}
                  />
                </div>
                <TextField
                  label="Période"
                  value={item.period}
                  onChange={(period) => update({ period })}
                  placeholder="2022 — Aujourd'hui"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Lieu"
                    value={item.location}
                    onChange={(location) => update({ location })}
                    placeholder="Lyon, France"
                    hint="Facultatif — masqué sur le site si vide."
                  />
                  <Field
                    label="Type de contrat"
                    hint="Facultatif — « Non précisé » masque le champ."
                  >
                    <Select
                      value={item.contractType || "none"}
                      onValueChange={(contractType) =>
                        update({
                          contractType:
                            contractType === "none" ? "" : contractType,
                        })
                      }
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Non précisé</SelectItem>
                        {CONTRACT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <TextAreaField
                  label="Détails"
                  value={item.details}
                  onChange={(details) => update({ details })}
                  rows={3}
                />
                <TagsEditor
                  label="Réalisations clés"
                  value={item.achievements ?? []}
                  onChange={(achievements) => update({ achievements })}
                  placeholder="+38 % de conversion…"
                  hint="Accomplissements mesurables, affichés en puces. Facultatif — laissez vide pour masquer."
                  addLabel="Ajouter une réalisation"
                />
              </div>
            )}
            preview={(item) => (
              <div className="space-y-4">
                <div>
                  <PreviewLabel>Poste</PreviewLabel>
                  <p className="mt-1 font-medium text-foreground">
                    {item.position}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <PreviewLabel>Entreprise</PreviewLabel>
                    <p className="mt-1 text-sm text-foreground">
                      {item.company || "—"}
                    </p>
                  </div>
                  <div>
                    <PreviewLabel>Période</PreviewLabel>
                    <p className="mt-1 text-sm text-foreground">
                      {item.period || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <PreviewLabel>Lieu</PreviewLabel>
                    <p className="mt-1 text-sm text-foreground">
                      {item.location || "—"}
                    </p>
                  </div>
                  <div>
                    <PreviewLabel>Type de contrat</PreviewLabel>
                    <p className="mt-1 text-sm text-foreground">
                      {item.contractType || "—"}
                    </p>
                  </div>
                </div>
                {item.details && (
                  <div>
                    <PreviewLabel>Détails</PreviewLabel>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {item.details}
                    </p>
                  </div>
                )}
                {item.achievements.length > 0 && (
                  <div>
                    <PreviewLabel>Réalisations clés</PreviewLabel>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {item.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-3">
          <p className="text-[13px] font-medium">Formations</p>
          <ManageList
            items={draft.value.educations}
            onItemsChange={(educations) =>
              draft.set((prev) => ({ ...prev, educations }))
            }
            emptyItem={() => ({
              degree: "",
              institution: "",
              period: "",
              cgpa: "",
              department: "",
              thesis: "",
            })}
            saving={saving}
            onSaved={(educations) =>
              void persist({ ...draft.value, educations })
            }
            addLabel="Ajouter une formation"
            itemLabel={(item, index) =>
              item.degree.trim() || `Formation ${index + 1}`
            }
            summary={(item) => (
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {item.degree.trim() || "Sans intitulé"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {[item.institution, item.period].filter(Boolean).join(" · ") ||
                    "—"}
                </p>
              </div>
            )}
            form={(item, update) => (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Diplôme"
                    value={item.degree}
                    onChange={(degree) => update({ degree })}
                  />
                  <TextField
                    label="Établissement"
                    value={item.institution}
                    onChange={(institution) => update({ institution })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Période"
                    value={item.period}
                    onChange={(period) => update({ period })}
                    placeholder="2016 — 2018"
                  />
                  <TextField
                    label="Moyenne (CGPA)"
                    value={item.cgpa}
                    onChange={(cgpa) => update({ cgpa })}
                    placeholder="16,2 / 20"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Département"
                    value={item.department}
                    onChange={(department) => update({ department })}
                  />
                  <TextField
                    label="Mémoire / spécialité"
                    value={item.thesis}
                    onChange={(thesis) => update({ thesis })}
                  />
                </div>
              </div>
            )}
            preview={(item) => (
              <div className="space-y-4">
                <div>
                  <PreviewLabel>Diplôme</PreviewLabel>
                  <p className="mt-1 font-medium text-foreground">
                    {item.degree}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <PreviewLabel>Établissement</PreviewLabel>
                    <p className="mt-1 text-sm text-foreground">
                      {item.institution || "—"}
                    </p>
                  </div>
                  <div>
                    <PreviewLabel>Période</PreviewLabel>
                    <p className="mt-1 text-sm text-foreground">
                      {item.period || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <PreviewLabel>Moyenne (CGPA)</PreviewLabel>
                    <p className="mt-1 text-sm text-foreground">
                      {item.cgpa || "—"}
                    </p>
                  </div>
                  <div>
                    <PreviewLabel>Département</PreviewLabel>
                    <p className="mt-1 text-sm text-foreground">
                      {item.department || "—"}
                    </p>
                  </div>
                </div>
                {item.thesis && (
                  <div>
                    <PreviewLabel>Mémoire / spécialité</PreviewLabel>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.thesis}
                    </p>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Portfolio — projects with categories, thumbnail and multiple images
// ---------------------------------------------------------------------------

export function PortfolioEditor({
  portfolio,
}: {
  portfolio: Doc<"portfolio"> | null | undefined;
}) {
  const updatePortfolio = useAction(api.translate.updatePortfolio);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(portfolio, {
    title: "",
    description: "",
    projects: [],
  });

  // role/result are normalized for projects saved before those fields existed.
  const persist = async (data: typeof draft.value, silent = false) => {
    setSaving(true);
    try {
      await updatePortfolio({
        data: {
          ...data,
          projects: data.projects.map((project) => ({
            ...project,
            role: project.role ?? "",
            result: project.result ?? "",
          })),
        },
      });
      draft.commit(data);
      if (!silent) toast.success("Section « Projets » enregistrée");
    } catch (error) {
      console.error(error);
      if (!silent) toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  // Kept for the SectionEditor contract; with showSave={false} it is only
  // reachable programmatically.
  const save = () => void persist(draft.value);

  return (
    <SectionEditor
      title="Projets"
      description="Les projets du portfolio, avec catégories, vignette, galerie et lien."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      showSave={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} onBlur={() => void persist(draft.value, true)} placeholder="Portfolio" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} onBlur={() => void persist(draft.value, true)} placeholder="Une sélection de projets récents." />
      </div>

      <div className="mt-8 space-y-3">
        <ManageList
          items={draft.value.projects}
          onItemsChange={(projects) =>
            draft.set((prev) => ({ ...prev, projects }))
          }
          emptyItem={() => ({
            title: "",
            categories: [],
            link: "",
            details: "",
            thumbnail: "",
            images: [],
            role: "",
            result: "",
          })}            saving={saving}
            onSaved={(projects) =>
              void persist({ ...draft.value, projects })
            }
            addLabel="Ajouter un projet"
            itemLabel={(item, index) =>
              item.title.trim() || `Projet ${index + 1}`
            }
          summary={(item) => (
            <div className="min-w-0">
              <p className="font-medium text-foreground">
                {item.title.trim() || "Sans titre"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {item.categories.length > 0
                  ? item.categories.join(", ")
                  : "—"}
              </p>
            </div>
          )}
          form={(item, update) => (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Titre"
                  value={item.title}
                  onChange={(title) => update({ title })}
                />
                <TextField
                  label="Lien du projet"
                  value={item.link}
                  onChange={(link) => update({ link })}
                  placeholder="https://…"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Rôle"
                  value={item.role ?? ""}
                  onChange={(role) => update({ role })}
                  placeholder="Designer produit & développeur"
                />
                <TextField
                  label="Résultat / impact"
                  value={item.result ?? ""}
                  onChange={(result) => update({ result })}
                  placeholder="+38 % de conversion"
                />
              </div>
              <TagsEditor
                label="Catégories"
                value={item.categories}
                onChange={(categories) => update({ categories })}
                placeholder="Web, Design, Produit…"
              />
              <ImageField
                label="Vignette"
                value={item.thumbnail}
                onChange={(thumbnail) => update({ thumbnail })}
                guide={{ ratio: "4:3", formats: "JPG, WebP", size: "~1200 × 900 px" }}
              />
              <ImagesEditor
                label="Galerie d'images"
                value={item.images}
                onChange={(images) => update({ images })}
                guide={{ ratio: "16:10", formats: "JPG, WebP", size: "~1200 × 750 px" }}
              />
              <TextAreaField
                label="Détails"
                value={item.details}
                onChange={(details) => update({ details })}
                rows={3}
              />
            </div>
          )}
          preview={(item) => (
            <div className="space-y-4">
              <div>
                <PreviewLabel>Projet</PreviewLabel>
                <p className="mt-1 font-medium text-foreground">
                  {item.title}
                </p>
              </div>
              {item.link && (
                <div>
                  <PreviewLabel>Lien</PreviewLabel>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block break-all text-sm text-(--studio-accent) hover:underline"
                  >
                    {item.link}
                  </a>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <PreviewLabel>Rôle</PreviewLabel>
                  <p className="mt-1 text-sm text-foreground">
                    {item.role || "—"}
                  </p>
                </div>
                <div>
                  <PreviewLabel>Résultat / impact</PreviewLabel>
                  <p className="mt-1 text-sm text-foreground">
                    {item.result || "—"}
                  </p>
                </div>
              </div>
              {item.categories.length > 0 && (
                <div>
                  <PreviewLabel>Catégories</PreviewLabel>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {item.categories.map((category, i) => (
                      <Badge key={i} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {item.thumbnail && (
                <div>
                  <PreviewLabel>Vignette</PreviewLabel>
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="mt-2 aspect-[4/3] w-full border border-border object-cover"
                  />
                </div>
              )}
              {item.images.length > 0 && (
                <div>
                  <PreviewLabel>Galerie</PreviewLabel>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {item.images.map((image, i) => (
                      <img
                        key={i}
                        src={image}
                        alt=""
                        className="aspect-video w-full border border-border object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
              {item.details && (
                <div>
                  <PreviewLabel>Détails</PreviewLabel>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.details}
                  </p>
                </div>
              )}
            </div>
          )}
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Blog (bonus — pas dans Ezfolio, conservé)
// ---------------------------------------------------------------------------

export function BlogEditor({
  blog,
}: {
  blog: Doc<"blog"> | null | undefined;
}) {
  const updateBlog = useAction(api.translate.updateBlog);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(blog, {
    title: "",
    description: "",
    posts: [],
  });

  const persist = async (data: typeof draft.value, silent = false) => {
    setSaving(true);
    try {
      await updateBlog({ data });
      draft.commit(data);
      if (!silent) toast.success("Section « Journal » enregistrée");
    } catch (error) {
      console.error(error);
      if (!silent) toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  // Kept for the SectionEditor contract; with showSave={false} it is only
  // reachable programmatically.
  const save = () => void persist(draft.value);

  return (
    <SectionEditor
      title="Journal"
      description="Les articles du blog, lus sur le site dans une fenêtre dédiée."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      showSave={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} onBlur={() => void persist(draft.value, true)} placeholder="Journal" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} onBlur={() => void persist(draft.value, true)} placeholder="Notes de travail et réflexions." />
      </div>

      <div className="mt-8 space-y-3">
        <ManageList
          items={draft.value.posts}
          onItemsChange={(posts) => draft.set((prev) => ({ ...prev, posts }))}
          emptyItem={() => ({
            title: "",
            date: "",
            excerpt: "",
            content: "",
            imageUrl: "",
          })}            saving={saving}
            onSaved={(posts) => void persist({ ...draft.value, posts })}
            addLabel="Ajouter un article"
            itemLabel={(item, index) =>
              item.title.trim() || `Article ${index + 1}`
            }
          summary={(item) => (
            <div className="min-w-0">
              <p className="font-medium text-foreground">
                {item.title.trim() || "Sans titre"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {item.date || "—"}
              </p>
            </div>
          )}
          form={(item, update) => (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
                <TextField
                  label="Titre"
                  value={item.title}
                  onChange={(title) => update({ title })}
                />
                <TextField
                  label="Date"
                  value={item.date}
                  onChange={(date) => update({ date })}
                  placeholder="12 juin 2026"
                />
              </div>
              <ImageField
                label="Image de couverture"
                value={item.imageUrl}
                onChange={(imageUrl) => update({ imageUrl })}
                guide={{ ratio: "16:10", formats: "JPG, WebP", size: "~1200 × 675 px" }}
              />
              <TextAreaField
                label="Extrait"
                value={item.excerpt}
                onChange={(excerpt) => update({ excerpt })}
                rows={2}
              />
              <TextAreaField
                label="Contenu"
                value={item.content}
                onChange={(content) => update({ content })}
                rows={8}
                hint="Une ligne vide crée un nouveau paragraphe."
              />
            </div>
          )}
          preview={(item) => (
            <div className="space-y-4">
              <div>
                <PreviewLabel>Article</PreviewLabel>
                <p className="mt-1 font-medium text-foreground">
                  {item.title}
                </p>
              </div>
              {item.date && (
                <div>
                  <PreviewLabel>Date</PreviewLabel>
                  <p className="mt-1 text-sm text-foreground">{item.date}</p>
                </div>
              )}
              {item.imageUrl && (
                <div>
                  <PreviewLabel>Image de couverture</PreviewLabel>
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="mt-2 aspect-video w-full border border-border object-cover"
                  />
                </div>
              )}
              {item.excerpt && (
                <div>
                  <PreviewLabel>Extrait</PreviewLabel>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.excerpt}
                  </p>
                </div>
              )}
              {item.content && (
                <div>
                  <PreviewLabel>Contenu</PreviewLabel>
                  <div className="mt-1 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {item.content
                      .split(/\n{2,}/)
                      .filter(Boolean)
                      .map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Languages — spoken languages with proficiency level (French CV rubric)
// ---------------------------------------------------------------------------

/** Draft shape for the Languages editor — levels are stored as 1–5 numbers. */
type LanguagesDraftDoc = {
  _id: unknown;
  _creationTime: unknown;
  en?: unknown;
  title: string;
  description: string;
  items: { name: string; level: number }[];
};

export function LanguagesEditor({
  languages,
}: {
  languages: Doc<"languages"> | null | undefined;
}) {
  const updateLanguages = useAction(api.translate.updateLanguages);
  const [saving, setSaving] = useState(false);

  // Normalize legacy free-text levels to the unified 1–5 scale on load.
  const normalized = useMemo<LanguagesDraftDoc | undefined>(() => {
    if (!languages) return undefined;
    const doc = languages as unknown as {
      title: string;
      description: string;
      items: { name: string; level: string | number }[];
    };
    return {
      _id: undefined,
      _creationTime: undefined,
      title: doc.title,
      description: doc.description,
      items: doc.items.map((item) => ({
        name: item.name,
        level: levelToNumber(item.level),
      })),
    };
  }, [languages]);
  const draft = useSectionDraft<LanguagesDraftDoc>(normalized, {
    title: "",
    description: "",
    items: [],
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateLanguages({
        data: draft.value as unknown as Parameters<
          typeof updateLanguages
        >[0]["data"],
      });
      draft.commit(draft.value);
      toast.success("Section « Langues » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Langues"
      description="Les langues parlées avec leur niveau — 5 niveaux (menu déroulant)."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="Langues" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} placeholder="Les langues que je parle au quotidien." />
      </div>

      <div className="mt-6 space-y-3">
        {draft.value.items.map((item, index) => (
          <div key={index} className="rounded-md border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={item.name}
                onChange={(event) =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.map((i, n) =>
                      n === index ? { ...i, name: event.target.value } : i,
                    ),
                  }))
                }
                placeholder="Français"
                className="min-w-0 max-w-xs flex-1 bg-background"
              />
              <div className="min-w-44 flex-1">
                <Select
                  value={String(item.level)}
                  onValueChange={(level) =>
                    draft.set((prev) => ({
                      ...prev,
                      items: prev.items.map((i, n) =>
                        n === index ? { ...i, level: Number(level) } : i,
                      ),
                    }))
                  }
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Monter"
                disabled={index === 0}
                className="shrink-0"
                onClick={() =>
                  draft.set((prev) => ({
                    ...prev,
                    items: moveItem(prev.items, index, -1),
                  }))
                }
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Descendre"
                disabled={index === draft.value.items.length - 1}
                className="shrink-0"
                onClick={() =>
                  draft.set((prev) => ({
                    ...prev,
                    items: moveItem(prev.items, index, 1),
                  }))
                }
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Supprimer"
                className="shrink-0"
                onClick={() =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.filter((_, n) => n !== index),
                  }))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        <AddButton
          label="Ajouter une langue"
          onClick={() =>
            draft.set((prev) => ({
              ...prev,
              items: [...prev.items, { name: "", level: 3 }],
            }))
          }
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Interests — hobbies / centers of interest (French CV rubric)
// ---------------------------------------------------------------------------

export function InterestsEditor({
  interests,
}: {
  interests: Doc<"interests"> | null | undefined;
}) {
  const updateInterests = useAction(api.translate.updateInterests);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(interests, {
    title: "",
    description: "",
    items: [],
  });

  const persist = async (data: typeof draft.value, silent = false) => {
    setSaving(true);
    try {
      // Normalize icons for items saved before the icon field existed.
      await updateInterests({
        data: {
          ...data,
          items: data.items.map((item) => ({
            name: item.name,
            details: item.details,
            icon: item.icon ?? "",
          })),
        },
      });
      draft.commit(data);
      if (!silent) toast.success("Section « Centres d'intérêt » enregistrée");
    } catch (error) {
      console.error(error);
      if (!silent) toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  // Kept for the SectionEditor contract; with showSave={false} it is only
  // reachable programmatically.
  const save = () => void persist(draft.value);

  return (
    <SectionEditor
      title="Centres d'intérêt"
      description="Vos passions et activités — rubrique standard du CV français, avec un détail optionnel par élément."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      showSave={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} onBlur={() => void persist(draft.value, true)} placeholder="Centres d'intérêt" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} onBlur={() => void persist(draft.value, true)} placeholder="Ce qui nourrit ma pratique, en dehors des écrans." />
      </div>

      <div className="mt-8 space-y-3">
        <ManageList
          items={draft.value.items}
          onItemsChange={(items) => draft.set((prev) => ({ ...prev, items }))}
          emptyItem={() => ({ name: "", details: "", icon: "Sparkles" })}
          saving={saving}
          onSaved={(items) => void persist({ ...draft.value, items })}
          addLabel="Ajouter un centre d'intérêt"
          itemLabel={(item, index) => item.name.trim() || `Intérêt ${index + 1}`}
          summary={(item) => (
            <div className="flex min-w-0 items-center gap-3">
              {item.icon && (
                <ServiceIcon
                  name={item.icon}
                  className="size-4 shrink-0 text-(--studio-accent)"
                />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {item.name.trim() || "Sans titre"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {item.details.trim() || "—"}
                </p>
              </div>
            </div>
          )}
          form={(item, update) => (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[220px_1.2fr_1.6fr]">
                <IconSelect
                  value={item.icon ?? ""}
                  onChange={(icon) => update({ icon })}
                />
                <TextField
                  label="Intérêt"
                  value={item.name}
                  onChange={(name) => update({ name })}
                  placeholder="Photographie"
                />
                <TextField
                  label="Détail (optionnel)"
                  value={item.details}
                  onChange={(details) => update({ details })}
                  placeholder="Façades et lumière naturelle"
                />
              </div>
            </div>
          )}
          preview={(item) => (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {item.icon && (
                  <ServiceIcon
                    name={item.icon}
                    className="size-5 text-(--studio-accent)"
                  />
                )}
                <p className="font-medium text-foreground">
                  {item.name || "Sans titre"}
                </p>
              </div>
              {item.details && (
                <div>
                  <PreviewLabel>Détail</PreviewLabel>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.details}
                  </p>
                </div>
              )}
            </div>
          )}
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Messages — with subject and "replied" status (Ezfolio "Message")
// ---------------------------------------------------------------------------

export function MessagesView({
  messages,
}: {
  messages: Doc<"messages">[] | null | undefined;
}) {
  const deleteMessage = useMutation(api.siteMutations.deleteMessage);
  const markMessageReplied = useMutation(api.siteMutations.markMessageReplied);

  const [previewId, setPreviewId] = useState<Id<"messages"> | null>(null);

  const remove = async (id: Doc<"messages">["_id"]) => {
    try {
      await deleteMessage({ id });
      toast.success("Message supprimé");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  /** Client-side CSV export of the loaded messages (the 200 most recent). */
  const exportCsv = () => {
    if (!messages || messages.length === 0) return;
    const escape = (cell: string | number | boolean) =>
      `"${String(cell).replace(/"/g, '""')}"`;
    const rows = [
      ["Date", "Nom", "Email", "Sujet", "Message", "Répondu"],
      ...messages.map((m) => [
        new Date(m.createdAt).toISOString(),
        m.name,
        m.email,
        m.subject,
        m.message,
        m.replied ? "Oui" : "Non",
      ]),
    ];
    const csv = rows.map((row) => row.map(escape).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!messages) {
    return (
      <div className="flex items-center gap-2 border border-border bg-card p-6 text-sm text-muted-foreground">
        <Inbox className="size-4" />
        Chargement…
      </div>
    );
  }

  const previewMessage = previewId
    ? messages.find((message) => message._id === previewId)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Boîte de réception
          </p>
          <h1 className="mt-1 font-display text-2xl font-light tracking-tight text-foreground">
            Messages reçus
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Les demandes envoyées depuis le formulaire de contact du site (les
            200 plus récentes).
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportCsv}
            className="rounded-full"
          >
            <Download className="size-4" />
            Exporter en CSV
          </Button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="border border-dashed border-border bg-card p-10 text-center">
          <Inbox className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Aucun message pour le moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message._id}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-md border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">
                    {message.subject || "(sans objet)"}
                  </p>
                  {message.replied && (
                    <Badge variant="outline">Répondu</Badge>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {message.name} · {message.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <span className="mr-2 text-xs text-muted-foreground">
                  {formatTimestamp(message.createdAt)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Voir le message"
                  onClick={() => setPreviewId(message._id)}
                >
                  <Eye className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Le message de {message.name} sera définitivement supprimé.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void remove(message._id)}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal — full message, sender and replied toggle */}
      <Dialog
        open={previewId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {previewMessage?.subject || "(sans objet)"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Message complet reçu via le formulaire de contact.
            </DialogDescription>
          </DialogHeader>
          {previewMessage && (
            <div className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <PreviewLabel>De</PreviewLabel>
                  <p className="mt-1 font-medium text-foreground">
                    {previewMessage.name}
                  </p>
                </div>
                <div>
                  <PreviewLabel>Email</PreviewLabel>
                  <a
                    href={`mailto:${previewMessage.email}`}
                    className="mt-1 inline-block text-(--studio-accent) hover:underline"
                  >
                    {previewMessage.email}
                  </a>
                </div>
              </div>
              <div>
                <PreviewLabel>Reçu le</PreviewLabel>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatTimestamp(previewMessage.createdAt)}
                </p>
              </div>
              <div className="whitespace-pre-line border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
                {previewMessage.message}
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <Switch
                checked={previewMessage?.replied ?? false}
                onCheckedChange={(replied) => {
                  if (previewMessage) {
                    void markMessageReplied({
                      id: previewMessage._id,
                      replied,
                    });
                  }
                }}
              />
              Répondu
            </label>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPreviewId(null)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visitors — tracking list (Ezfolio "Visitor")
// ---------------------------------------------------------------------------

export function VisitorsView({
  visitors,
}: {
  visitors: Doc<"visitors">[] | null | undefined;
}) {
  const deleteVisitor = useMutation(api.siteMutations.deleteVisitor);

  if (!visitors) {
    return (
      <div className="flex items-center gap-2 border border-border bg-card p-6 text-sm text-muted-foreground">
        <Users className="size-4" />
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Statistiques
        </p>
        <h1 className="mt-1 font-display text-2xl font-light tracking-tight text-foreground">
          Visiteurs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Les visites du site public, collectées automatiquement.
        </p>
      </div>

      {visitors.length === 0 ? (
        <div className="border border-dashed border-border bg-card p-10 text-center">
          <Users className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Aucune visite enregistrée pour le moment.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Navigateur</th>
                <th className="px-4 py-3 font-medium">Plateforme</th>
                <th className="px-4 py-3 font-medium">Visiteur</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor._id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatTimestamp(visitor.createdAt)}
                  </td>
                  <td className="px-4 py-3">{visitor.browser}</td>
                  <td className="px-4 py-3">{visitor.platform}</td>
                  <td className="px-4 py-3">
                    {visitor.isNew ? (
                      <Badge variant="default">Nouveau</Badge>
                    ) : (
                      <Badge variant="outline">Retour</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="Supprimer"
                      onClick={() => void deleteVisitor({ id: visitor._id })}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
