import { useMutation } from "convex/react";
import { Inbox, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatTimestamp, SERVICE_ICON_NAMES } from "@/lib/site";
import { SectionEditor } from "./SectionEditor";
import {
  ImageField,
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

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export function SkillsEditor({ skills }: { skills: Doc<"skills"> | null | undefined }) {
  const updateSkills = useMutation(api.siteMutations.updateSkills);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(skills, {
    title: "",
    description: "",
    items: [],
    visibility: true,
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateSkills({ data: draft.value });
      draft.reset();
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
      visibility={draft.value.visibility}
      onVisibilityChange={(visibility) => draft.set({ ...draft.value, visibility })}
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
                className="max-w-xs bg-background"
              />
              <span className="w-10 text-right font-mono text-sm text-muted-foreground">
                {item.level}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Supprimer"
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
              value={[item.level]}
              min={0}
              max={100}
              step={1}
              onValueChange={([level]) =>
                draft.set((prev) => ({
                  ...prev,
                  items: prev.items.map((i, n) =>
                    n === index ? { ...i, level } : i,
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
              items: [...prev.items, { name: "", level: 60 }],
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
  const updateServices = useMutation(api.siteMutations.updateServices);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(services, {
    title: "",
    description: "",
    items: [],
    visibility: true,
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateServices({ data: draft.value });
      draft.reset();
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
      visibility={draft.value.visibility}
      onVisibilityChange={(visibility) => draft.set({ ...draft.value, visibility })}
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
                  <SelectContent>
                    {SERVICE_ICON_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TextField
                label="Nom"
                value={item.name}
                onChange={(name) =>
                  draft.set((prev) => ({
                    ...prev,
                    items: prev.items.map((i, n) =>
                      n === index ? { ...i, name } : i,
                    ),
                  }))
                }
                placeholder="Design d'interface"
              />
            </div>
            <TextAreaField
              label="Description"
              value={item.description}
              onChange={(description) =>
                draft.set((prev) => ({
                  ...prev,
                  items: prev.items.map((i, n) =>
                    n === index ? { ...i, description } : i,
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
              items: [
                ...prev.items,
                { name: "", description: "", icon: "Layers" },
              ],
            }))
          }
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export function ResumeEditor({ resume }: { resume: Doc<"resume"> | null | undefined }) {
  const updateResume = useMutation(api.siteMutations.updateResume);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(resume, {
    title: "",
    description: "",
    experiences: [],
    educations: [],
    visibility: true,
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateResume({ data: draft.value });
      draft.reset();
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
      description="Expériences professionnelles et formation, affichées en deux colonnes."
      visibility={draft.value.visibility}
      onVisibilityChange={(visibility) => draft.set({ ...draft.value, visibility })}
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
                  value={item.title}
                  onChange={(title) =>
                    draft.set((prev) => ({
                      ...prev,
                      experiences: prev.experiences.map((i, n) =>
                        n === index ? { ...i, title } : i,
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
                value={item.date}
                onChange={(date) =>
                  draft.set((prev) => ({
                    ...prev,
                    experiences: prev.experiences.map((i, n) =>
                      n === index ? { ...i, date } : i,
                    ),
                  }))
                }
                placeholder="2022 — Aujourd'hui"
              />
              <TextAreaField
                label="Description"
                value={item.description}
                onChange={(description) =>
                  draft.set((prev) => ({
                    ...prev,
                    experiences: prev.experiences.map((i, n) =>
                      n === index ? { ...i, description } : i,
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
                  { title: "", company: "", date: "", description: "" },
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
                  value={item.title}
                  onChange={(title) =>
                    draft.set((prev) => ({
                      ...prev,
                      educations: prev.educations.map((i, n) =>
                        n === index ? { ...i, title } : i,
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
              <TextField
                label="Période"
                value={item.date}
                onChange={(date) =>
                  draft.set((prev) => ({
                    ...prev,
                    educations: prev.educations.map((i, n) =>
                      n === index ? { ...i, date } : i,
                    ),
                  }))
                }
                placeholder="2016 — 2018"
              />
              <TextAreaField
                label="Description"
                value={item.description}
                onChange={(description) =>
                  draft.set((prev) => ({
                    ...prev,
                    educations: prev.educations.map((i, n) =>
                      n === index ? { ...i, description } : i,
                    ),
                  }))
                }
                rows={3}
              />
            </ItemCard>
          ))}
          <AddButton
            label="Ajouter une formation"
            onClick={() =>
              draft.set((prev) => ({
                ...prev,
                educations: [
                  ...prev.educations,
                  { title: "", institution: "", date: "", description: "" },
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
// Portfolio
// ---------------------------------------------------------------------------

export function PortfolioEditor({ portfolio }: { portfolio: Doc<"portfolio"> | null | undefined }) {
  const updatePortfolio = useMutation(api.siteMutations.updatePortfolio);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(portfolio, {
    title: "",
    description: "",
    projects: [],
    visibility: true,
  });

  const save = async () => {
    setSaving(true);
    try {
      await updatePortfolio({ data: draft.value });
      draft.reset();
      toast.success("Section « Portfolio » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Portfolio"
      description="Les projets, avec catégorie, image et liens. Les catégories servent de filtre sur le site."
      visibility={draft.value.visibility}
      onVisibilityChange={(visibility) => draft.set({ ...draft.value, visibility })}
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
                label="Nom"
                value={project.name}
                onChange={(name) =>
                  draft.set((prev) => ({
                    ...prev,
                    projects: prev.projects.map((i, n) =>
                      n === index ? { ...i, name } : i,
                    ),
                  }))
                }
              />
              <TextField
                label="Catégorie"
                value={project.category}
                onChange={(category) =>
                  draft.set((prev) => ({
                    ...prev,
                    projects: prev.projects.map((i, n) =>
                      n === index ? { ...i, category } : i,
                    ),
                  }))
                }
                placeholder="Web, Design, Produit…"
              />
            </div>
            <ImageField
              label="Image"
              value={project.imageUrl}
              onChange={(imageUrl) =>
                draft.set((prev) => ({
                  ...prev,
                  projects: prev.projects.map((i, n) =>
                    n === index ? { ...i, imageUrl } : i,
                  ),
                }))
              }
            />
            <TextAreaField
              label="Description"
              value={project.description}
              onChange={(description) =>
                draft.set((prev) => ({
                  ...prev,
                  projects: prev.projects.map((i, n) =>
                    n === index ? { ...i, description } : i,
                  ),
                }))
              }
              rows={3}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Lien démo"
                value={project.demoUrl}
                onChange={(demoUrl) =>
                  draft.set((prev) => ({
                    ...prev,
                    projects: prev.projects.map((i, n) =>
                      n === index ? { ...i, demoUrl } : i,
                    ),
                  }))
                }
                placeholder="https://…"
              />
              <TextField
                label="Lien code source"
                value={project.sourceUrl}
                onChange={(sourceUrl) =>
                  draft.set((prev) => ({
                    ...prev,
                    projects: prev.projects.map((i, n) =>
                      n === index ? { ...i, sourceUrl } : i,
                    ),
                  }))
                }
                placeholder="https://…"
              />
            </div>
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
                  name: "",
                  description: "",
                  category: "",
                  imageUrl: "",
                  sourceUrl: "",
                  demoUrl: "",
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
// Blog
// ---------------------------------------------------------------------------

export function BlogEditor({ blog }: { blog: Doc<"blog"> | null | undefined }) {
  const updateBlog = useMutation(api.siteMutations.updateBlog);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(blog, {
    title: "",
    description: "",
    posts: [],
    visibility: true,
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateBlog({ data: draft.value });
      draft.reset();
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
      visibility={draft.value.visibility}
      onVisibilityChange={(visibility) => draft.set({ ...draft.value, visibility })}
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
// Messages inbox
// ---------------------------------------------------------------------------

export function MessagesView({
  messages,
}: {
  messages: Doc<"messages">[] | null | undefined;
}) {
  const deleteMessage = useMutation(api.siteMutations.deleteMessage);

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
                  <p className="font-medium text-foreground">{message.name}</p>
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
                          Le message de {message.name} sera définitivement
                          supprimé.
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
