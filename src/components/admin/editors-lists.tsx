import { useAction, useMutation } from "convex/react";
import {
  ImagePlus,
  Inbox,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
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
import { Slider } from "@/components/ui/slider";
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

function ItemCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Supprimer"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
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
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}) {
  return (
    <Field label={label} hint="Chaque catégorie sert de filtre sur le site.">
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
        <AddButton label="Ajouter une catégorie" onClick={() => onChange([...value, ""])} />
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
  const draft = useSectionDraft(skills, {
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
      description="La liste des compétences avec leur niveau (0-100 %)."
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
            <div className="flex items-center justify-between gap-3">
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
              <span className="w-10 shrink-0 text-right font-mono text-sm text-muted-foreground">
                {item.proficiency}%
              </span>
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
            <Slider
              value={[item.proficiency]}
              min={0}
              max={100}
              step={1}
              onValueChange={([proficiency]) =>
                draft.set((prev) => ({
                  ...prev,
                  items: prev.items.map((i, n) =>
                    n === index ? { ...i, proficiency } : i,
                  ),
                }))
              }
              className="mt-4"
            />
          </div>
        ))}
        <AddButton
          label="Ajouter une compétence"
          onClick={() =>
            draft.set((prev) => ({
              ...prev,
              items: [...prev.items, { name: "", proficiency: 60 }],
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

  const save = async () => {
    setSaving(true);
    try {
      await updateServices({ data: draft.value });
      draft.commit(draft.value);
      toast.success("Section « Services » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Services"
      description="Les prestations proposées, affichées en grille."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="Services" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} placeholder="Ce que je peux faire pour vous." />
      </div>

      <div className="mt-6 space-y-4">
        {draft.value.items.map((item, index) => (
          <ItemCard
            key={index}
            title={`Service ${index + 1}`}
            onRemove={() =>
              draft.set((prev) => ({
                ...prev,
                items: prev.items.filter((_, n) => n !== index),
              }))
            }
          >
            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Icône</p>
                <Select
                  value={item.icon}
                  onValueChange={(icon) =>
                    draft.set((prev) => ({
                      ...prev,
                      items: prev.items.map((i, n) =>
                        n === index ? { ...i, icon } : i,
                      ),
                    }))
                  }
                >
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
              <TextField
                label="Titre"
                value={item.title}
                onChange={(title) =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.map((i, n) =>
                      n === index ? { ...i, title } : i,
                    ),
                  }))
                }
                placeholder="Design d'interface"
              />
            </div>
            <TextAreaField
              label="Détails"
              value={item.details}
              onChange={(details) =>
                draft.set((prev) => ({
                  ...prev,
                  items: prev.items.map((i, n) =>
                    n === index ? { ...i, details } : i,
                  ),
                }))
              }
              rows={3}
            />
          </ItemCard>
        ))}
        <AddButton
          label="Ajouter un service"
          onClick={() =>
            draft.set((prev) => ({
              ...prev,
              items: [...prev.items, { title: "", details: "", icon: "Layers" }],
            }))
          }
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Resume — experiences + educations (full Ezfolio fields)
// ---------------------------------------------------------------------------

export function ResumeEditor({ resume }: { resume: Doc<"resume"> | null | undefined }) {
  const updateResume = useAction(api.translate.updateResume);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(resume, {
    title: "",
    description: "",
    experiences: [],
    educations: [],
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateResume({ data: draft.value });
      draft.commit(draft.value);
      toast.success("Section « Parcours » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Parcours"
      description="Expériences professionnelles et formation (diplôme, institution, période, CGPA, département, mémoire)."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="Parcours" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} placeholder="Mon expérience et ma formation." />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-[13px] font-medium">Expériences</p>
          {draft.value.experiences.map((item, index) => (
            <ItemCard
              key={index}
              title={`Expérience ${index + 1}`}
              onRemove={() =>
                draft.set((prev) => ({
                  ...prev,
                  experiences: prev.experiences.filter((_, n) => n !== index),
                }))
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Poste"
                  value={item.position}
                  onChange={(position) =>
                    draft.set((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((i, n) =>
                        n === index ? { ...i, position } : i,
                      ),
                    }))
                  }
                />
                <TextField
                  label="Entreprise"
                  value={item.company}
                  onChange={(company) =>
                    draft.set((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((i, n) =>
                        n === index ? { ...i, company } : i,
                      ),
                    }))
                  }
                />
              </div>
              <TextField
                label="Période"
                value={item.period}
                onChange={(period) =>
                  draft.set((prev) => ({
                    ...prev,
                    experiences: prev.experiences.map((i, n) =>
                      n === index ? { ...i, period } : i,
                    ),
                  }))
                }
                placeholder="2022 — Aujourd'hui"
              />
              <TextAreaField
                label="Détails"
                value={item.details}
                onChange={(details) =>
                  draft.set((prev) => ({
                    ...prev,
                    experiences: prev.experiences.map((i, n) =>
                      n === index ? { ...i, details } : i,
                    ),
                  }))
                }
                rows={3}
              />
            </ItemCard>
          ))}
          <AddButton
            label="Ajouter une expérience"
            onClick={() =>
              draft.set((prev) => ({
                ...prev,
                experiences: [
                  ...prev.experiences,
                  { position: "", company: "", period: "", details: "" },
                ],
              }))
            }
          />
        </div>

        <div className="space-y-4">
          <p className="text-[13px] font-medium">Formations</p>
          {draft.value.educations.map((item, index) => (
            <ItemCard
              key={index}
              title={`Formation ${index + 1}`}
              onRemove={() =>
                draft.set((prev) => ({
                  ...prev,
                  educations: prev.educations.filter((_, n) => n !== index),
                }))
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Diplôme"
                  value={item.degree}
                  onChange={(degree) =>
                    draft.set((prev) => ({
                      ...prev,
                      educations: prev.educations.map((i, n) =>
                        n === index ? { ...i, degree } : i,
                      ),
                    }))
                  }
                />
                <TextField
                  label="Établissement"
                  value={item.institution}
                  onChange={(institution) =>
                    draft.set((prev) => ({
                      ...prev,
                      educations: prev.educations.map((i, n) =>
                        n === index ? { ...i, institution } : i,
                      ),
                    }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Période"
                  value={item.period}
                  onChange={(period) =>
                    draft.set((prev) => ({
                      ...prev,
                      educations: prev.educations.map((i, n) =>
                        n === index ? { ...i, period } : i,
                      ),
                    }))
                  }
                  placeholder="2016 — 2018"
                />
                <TextField
                  label="Moyenne (CGPA)"
                  value={item.cgpa}
                  onChange={(cgpa) =>
                    draft.set((prev) => ({
                      ...prev,
                      educations: prev.educations.map((i, n) =>
                        n === index ? { ...i, cgpa } : i,
                      ),
                    }))
                  }
                  placeholder="16,2 / 20"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Département"
                  value={item.department}
                  onChange={(department) =>
                    draft.set((prev) => ({
                      ...prev,
                      educations: prev.educations.map((i, n) =>
                        n === index ? { ...i, department } : i,
                      ),
                    }))
                  }
                />
                <TextField
                  label="Mémoire / spécialité"
                  value={item.thesis}
                  onChange={(thesis) =>
                    draft.set((prev) => ({
                      ...prev,
                      educations: prev.educations.map((i, n) =>
                        n === index ? { ...i, thesis } : i,
                      ),
                    }))
                  }
                />
              </div>
            </ItemCard>
          ))}
          <AddButton
            label="Ajouter une formation"
            onClick={() =>
              draft.set((prev) => ({
                ...prev,
                educations: [
                  ...prev.educations,
                  {
                    degree: "",
                    institution: "",
                    period: "",
                    cgpa: "",
                    department: "",
                    thesis: "",
                  },
                ],
              }))
            }
          />
        </div>
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Portfolio — projects with categories, thumbnail and multiple images
// ---------------------------------------------------------------------------

export function PortfolioEditor({ portfolio }: { portfolio: Doc<"portfolio"> | null | undefined }) {
  const updatePortfolio = useAction(api.translate.updatePortfolio);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(portfolio, {
    title: "",
    description: "",
    projects: [],
  });

  const save = async () => {
    setSaving(true);
    try {
      await updatePortfolio({ data: draft.value });
      draft.commit(draft.value);
      toast.success("Section « Projets » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Projets"
      description="Les projets du portfolio, avec catégories, vignette, galerie et lien."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="Portfolio" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} placeholder="Une sélection de projets récents." />
      </div>

      <div className="mt-6 space-y-4">
        {draft.value.projects.map((project, index) => (
          <ItemCard
            key={index}
            title={`Projet ${index + 1}`}
            onRemove={() =>
              draft.set((prev) => ({
                ...prev,
                projects: prev.projects.filter((_, n) => n !== index),
              }))
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Titre"
                value={project.title}
                onChange={(title) =>
                  draft.set((prev) => ({
                    ...prev,
                    projects: prev.projects.map((i, n) =>
                      n === index ? { ...i, title } : i,
                    ),
                  }))
                }
              />
              <TextField
                label="Lien du projet"
                value={project.link}
                onChange={(link) =>
                  draft.set((prev) => ({
                    ...prev,
                    projects: prev.projects.map((i, n) =>
                      n === index ? { ...i, link } : i,
                    ),
                  }))
                }
                placeholder="https://…"
              />
            </div>
            <TagsEditor
              label="Catégories"
              value={project.categories}
              onChange={(categories) =>
                draft.set((prev) => ({
                  ...prev,
                  projects: prev.projects.map((i, n) =>
                    n === index ? { ...i, categories } : i,
                  ),
                }))
              }
              placeholder="Web, Design, Produit…"
            />
            <ImageField
              label="Vignette"
              value={project.thumbnail}
              onChange={(thumbnail) =>
                draft.set((prev) => ({
                  ...prev,
                  projects: prev.projects.map((i, n) =>
                    n === index ? { ...i, thumbnail } : i,
                  ),
                }))
              }
              guide={{ ratio: "4:3", formats: "JPG, WebP", size: "~1200 × 900 px" }}
            />
            <ImagesEditor
              label="Galerie d'images"
              value={project.images}
              onChange={(images) =>
                draft.set((prev) => ({
                  ...prev,
                  projects: prev.projects.map((i, n) =>
                    n === index ? { ...i, images } : i,
                  ),
                }))
              }
              guide={{ ratio: "16:10", formats: "JPG, WebP", size: "~1200 × 750 px" }}
            />
            <TextAreaField
              label="Détails"
              value={project.details}
              onChange={(details) =>
                draft.set((prev) => ({
                  ...prev,
                  projects: prev.projects.map((i, n) =>
                    n === index ? { ...i, details } : i,
                  ),
                }))
              }
              rows={3}
            />
          </ItemCard>
        ))}
        <AddButton
          label="Ajouter un projet"
          onClick={() =>
            draft.set((prev) => ({
              ...prev,
              projects: [
                ...prev.projects,
                {
                  title: "",
                  categories: [],
                  link: "",
                  details: "",
                  thumbnail: "",
                  images: [],
                },
              ],
            }))
          }
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Blog (bonus — pas dans Ezfolio, conservé)
// ---------------------------------------------------------------------------

export function BlogEditor({ blog }: { blog: Doc<"blog"> | null | undefined }) {
  const updateBlog = useAction(api.translate.updateBlog);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(blog, {
    title: "",
    description: "",
    posts: [],
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateBlog({ data: draft.value });
      draft.commit(draft.value);
      toast.success("Section « Journal » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Journal"
      description="Les articles du blog, lus sur le site dans une fenêtre dédiée."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="Journal" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} placeholder="Notes de travail et réflexions." />
      </div>

      <div className="mt-6 space-y-4">
        {draft.value.posts.map((post, index) => (
          <ItemCard
            key={index}
            title={`Article ${index + 1}`}
            onRemove={() =>
              draft.set((prev) => ({
                ...prev,
                posts: prev.posts.filter((_, n) => n !== index),
              }))
            }
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <TextField
                label="Titre"
                value={post.title}
                onChange={(title) =>
                  draft.set((prev) => ({
                    ...prev,
                    posts: prev.posts.map((i, n) =>
                      n === index ? { ...i, title } : i,
                    ),
                  }))
                }
              />
              <TextField
                label="Date"
                value={post.date}
                onChange={(date) =>
                  draft.set((prev) => ({
                    ...prev,
                    posts: prev.posts.map((i, n) =>
                      n === index ? { ...i, date } : i,
                    ),
                  }))
                }
                placeholder="12 juin 2026"
              />
            </div>
            <ImageField
              label="Image de couverture"
              value={post.imageUrl}
              onChange={(imageUrl) =>
                draft.set((prev) => ({
                  ...prev,
                  posts: prev.posts.map((i, n) =>
                    n === index ? { ...i, imageUrl } : i,
                  ),
                }))
              }
              guide={{ ratio: "16:10", formats: "JPG, WebP", size: "~1200 × 675 px" }}
            />
            <TextAreaField
              label="Extrait"
              value={post.excerpt}
              onChange={(excerpt) =>
                draft.set((prev) => ({
                  ...prev,
                  posts: prev.posts.map((i, n) =>
                    n === index ? { ...i, excerpt } : i,
                  ),
                }))
              }
              rows={2}
            />
            <TextAreaField
              label="Contenu"
              value={post.content}
              onChange={(content) =>
                draft.set((prev) => ({
                  ...prev,
                  posts: prev.posts.map((i, n) =>
                    n === index ? { ...i, content } : i,
                  ),
                }))
              }
              rows={8}
              hint="Une ligne vide crée un nouveau paragraphe."
            />
          </ItemCard>
        ))}
        <AddButton
          label="Ajouter un article"
          onClick={() =>
            draft.set((prev) => ({
              ...prev,
              posts: [
                ...prev.posts,
                { title: "", date: "", excerpt: "", content: "", imageUrl: "" },
              ],
            }))
          }
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Languages — spoken languages with proficiency level (French CV rubric)
// ---------------------------------------------------------------------------

export function LanguagesEditor({
  languages,
}: {
  languages: Doc<"languages"> | null | undefined;
}) {
  const updateLanguages = useAction(api.translate.updateLanguages);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(languages, {
    title: "",
    description: "",
    items: [],
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateLanguages({ data: draft.value });
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
      description="Les langues parlées avec leur niveau — rubrique standard du CV français (Natif, Courant, Intermédiaire…)."
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
          <ItemCard
            key={index}
            title={`Langue ${index + 1}`}
            onRemove={() =>
              draft.set((prev) => ({
                ...prev,
                items: prev.items.filter((_, n) => n !== index),
              }))
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Langue"
                value={item.name}
                onChange={(name) =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.map((i, n) =>
                      n === index ? { ...i, name } : i,
                    ),
                  }))
                }
                placeholder="Français"
              />
              <TextField
                label="Niveau"
                value={item.level}
                onChange={(level) =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.map((i, n) =>
                      n === index ? { ...i, level } : i,
                    ),
                  }))
                }
                placeholder="Natif, Courant, Intermédiaire…"
              />
            </div>
          </ItemCard>
        ))}
        <AddButton
          label="Ajouter une langue"
          onClick={() =>
            draft.set((prev) => ({
              ...prev,
              items: [...prev.items, { name: "", level: "" }],
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

  const save = async () => {
    setSaving(true);
    try {
      await updateInterests({ data: draft.value });
      draft.commit(draft.value);
      toast.success("Section « Centres d'intérêt » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Centres d'intérêt"
      description="Vos passions et activités — rubrique standard du CV français, avec un détail optionnel par élément."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="Centres d'intérêt" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} placeholder="Ce qui nourrit ma pratique, en dehors des écrans." />
      </div>

      <div className="mt-6 space-y-3">
        {draft.value.items.map((item, index) => (
          <ItemCard
            key={index}
            title={`Intérêt ${index + 1}`}
            onRemove={() =>
              draft.set((prev) => ({
                ...prev,
                items: prev.items.filter((_, n) => n !== index),
              }))
            }
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_1.5fr]">
              <TextField
                label="Intérêt"
                value={item.name}
                onChange={(name) =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.map((i, n) =>
                      n === index ? { ...i, name } : i,
                    ),
                  }))
                }
                placeholder="Photographie"
              />
              <TextField
                label="Détail (optionnel)"
                value={item.details}
                onChange={(details) =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.map((i, n) =>
                      n === index ? { ...i, details } : i,
                    ),
                  }))
                }
                placeholder="Façades et lumière naturelle"
              />
            </div>
          </ItemCard>
        ))}
        <AddButton
          label="Ajouter un centre d'intérêt"
          onClick={() =>
            draft.set((prev) => ({
              ...prev,
              items: [...prev.items, { name: "", details: "" }],
            }))
          }
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

  const remove = async (id: Doc<"messages">["_id"]) => {
    try {
      await deleteMessage({ id });
      toast.success("Message supprimé");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (!messages) {
    return (
      <div className="flex items-center gap-2 border border-border bg-card p-6 text-sm text-muted-foreground">
        <Inbox className="size-4" />
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Boîte de réception
        </p>
        <h1 className="mt-1 font-display text-2xl font-light tracking-tight text-foreground">
          Messages reçus
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Les demandes envoyées depuis le formulaire de contact du site.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="border border-dashed border-border bg-card p-10 text-center">
          <Inbox className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Aucun message pour le moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <article
              key={message._id}
              className="border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{message.subject || "(sans objet)"}</p>
                  <p className="mt-0.5 text-sm text-foreground/90">{message.name}</p>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm text-(--studio-accent) hover:underline"
                  >
                    {message.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(message.createdAt)}
                  </span>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={message.replied}
                      onCheckedChange={(replied) =>
                        void markMessageReplied({ id: message._id, replied })
                      }
                    />
                    Répondu
                  </label>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" title="Supprimer">
                        <Trash2 className="size-4" />
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
              <p className="mt-4 whitespace-pre-line border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
                {message.message}
              </p>
            </article>
          ))}
        </div>
      )}
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
