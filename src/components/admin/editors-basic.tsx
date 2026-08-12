import { useMutation } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionEditor } from "./SectionEditor";
import {
  Field,
  ImageField,
  SocialLinksEditor,
  TextAreaField,
  TextField,
  useSectionDraft,
} from "./fields";

const SWATCHES = [
  "#A85B32",
  "#1F1C18",
  "#2F4858",
  "#3F6B4F",
  "#7D5BA6",
  "#B03A2E",
  "#C89B3C",
  "#2364AA",
];

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export function HeroEditor({ hero }: { hero: Doc<"hero"> | null | undefined }) {
  const updateHero = useMutation(api.siteMutations.updateHero);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(hero, {
    name: "",
    title: "",
    subtitle: "",
    intro: "",
    avatarUrl: "",
    socials: [],
    buttons: [],
    visibility: true,
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateHero({ data: draft.value });
      draft.reset();
      toast.success("Section « Accueil » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Accueil"
      description="Le haut de page : nom, titre, présentation, réseaux et boutons."
      visibility={draft.value.visibility}
      onVisibilityChange={(visibility) => draft.set({ ...draft.value, visibility })}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom" value={draft.value.name} onChange={(name) => draft.set({ ...draft.value, name })} placeholder="Camille Roussel" />
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="Designer produit & développeuse" />
        <TextField label="Sous-titre" value={draft.value.subtitle} onChange={(subtitle) => draft.set({ ...draft.value, subtitle })} placeholder="Une courte phrase d'accroche" className="sm:col-span-2" />
        <TextAreaField label="Introduction" value={draft.value.intro} onChange={(intro) => draft.set({ ...draft.value, intro })} rows={4} placeholder="2-3 phrases de présentation" className="sm:col-span-2" />
        <ImageField label="Portrait" value={draft.value.avatarUrl} onChange={(avatarUrl) => draft.set({ ...draft.value, avatarUrl })} hint="Importez une image ou collez une URL." className="sm:col-span-2" />
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-[13px] font-medium">Boutons</p>
        {draft.value.buttons.map((button, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_1.2fr_auto_auto]"
          >
            <Input
              value={button.label}
              onChange={(event) =>
                draft.set((prev) => ({
                  ...prev,
                  buttons: prev.buttons.map((b, i) =>
                    i === index ? { ...b, label: event.target.value } : b,
                  ),
                }))
              }
              placeholder="Libellé (ex : Me contacter)"
              className="bg-background"
            />
            <Input
              value={button.url}
              onChange={(event) =>
                draft.set((prev) => ({
                  ...prev,
                  buttons: prev.buttons.map((b, i) =>
                    i === index ? { ...b, url: event.target.value } : b,
                  ),
                }))
              }
              placeholder="https://… (ex : #contact)"
              className="bg-background"
            />
            <Select
              value={button.style}
              onValueChange={(style) =>
                draft.set((prev) => ({
                  ...prev,
                  buttons: prev.buttons.map((b, i) =>
                    i === index
                      ? { ...b, style: style as "primary" | "outline" }
                      : b,
                  ),
                }))
              }
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Principal</SelectItem>
                <SelectItem value="outline">Contour</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Supprimer le bouton"
              onClick={() =>
                draft.set((prev) => ({
                  ...prev,
                  buttons: prev.buttons.filter((_, i) => i !== index),
                }))
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            draft.set((prev) => ({
              ...prev,
              buttons: [
                ...prev.buttons,
                { label: "", url: "", style: "outline" as const },
              ],
            }))
          }
        >
          <Plus className="size-4" />
          Ajouter un bouton
        </Button>
      </div>

      <div className="mt-6">
        <SocialLinksEditor
          value={draft.value.socials}
          onChange={(socials) => draft.set({ ...draft.value, socials })}
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export function AboutEditor({ about }: { about: Doc<"about"> | null | undefined }) {
  const updateAbout = useMutation(api.siteMutations.updateAbout);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(about, {
    title: "",
    description: "",
    imageUrl: "",
    resumeUrl: "",
    visibility: true,
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateAbout({ data: draft.value });
      draft.reset();
      toast.success("Section « À propos » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="À propos"
      description="Présentation personnelle, photo et lien de CV."
      visibility={draft.value.visibility}
      onVisibilityChange={(visibility) => draft.set({ ...draft.value, visibility })}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="À propos" />
        <TextField label="Lien du CV" value={draft.value.resumeUrl} onChange={(resumeUrl) => draft.set({ ...draft.value, resumeUrl })} placeholder="https://…" hint="Laissez vide pour masquer le bouton." />
        <TextAreaField
          label="Description"
          value={draft.value.description}
          onChange={(description) => draft.set({ ...draft.value, description })}
          rows={9}
          placeholder="Séparez les paragraphes par une ligne vide."
          hint="Une ligne vide crée un nouveau paragraphe."
          className="sm:col-span-2"
        />
        <ImageField
          label="Photo"
          value={draft.value.imageUrl}
          onChange={(imageUrl) => draft.set({ ...draft.value, imageUrl })}
          className="sm:col-span-2"
        />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export function ContactEditor({ contact }: { contact: Doc<"contact"> | null | undefined }) {
  const updateContact = useMutation(api.siteMutations.updateContact);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(contact, {
    title: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    socials: [],
    visibility: true,
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateContact({ data: draft.value });
      draft.reset();
      toast.success("Section « Contact » enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Contact"
      description="Coordonnées affichées et réseaux sociaux."
      visibility={draft.value.visibility}
      onVisibilityChange={(visibility) => draft.set({ ...draft.value, visibility })}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Titre" value={draft.value.title} onChange={(title) => draft.set({ ...draft.value, title })} placeholder="Contact" />
        <TextField label="Description" value={draft.value.description} onChange={(description) => draft.set({ ...draft.value, description })} placeholder="Un projet en tête ? Écrivez-moi." className="sm:col-span-2" />
        <TextField label="Email" type="email" value={draft.value.email} onChange={(email) => draft.set({ ...draft.value, email })} placeholder="vous@exemple.fr" />
        <TextField label="Téléphone" value={draft.value.phone} onChange={(phone) => draft.set({ ...draft.value, phone })} placeholder="+33 6 12 34 56 78" />
        <TextField label="Adresse / ville" value={draft.value.address} onChange={(address) => draft.set({ ...draft.value, address })} placeholder="Lyon, France" className="sm:col-span-2" />
      </div>
      <div className="mt-6">
        <Field label="Réseaux sociaux">
          <SocialLinksEditor
            value={draft.value.socials}
            onChange={(socials) => draft.set({ ...draft.value, socials })}
          />
        </Field>
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function SettingsEditor({ settings }: { settings: Doc<"settings"> | null | undefined }) {
  const updateSettings = useMutation(api.siteMutations.updateSettings);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(settings, {
    siteName: "",
    tagline: "",
    footerText: "",
    themeColor: "#A85B32",
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({ data: draft.value });
      draft.reset();
      toast.success("Paramètres enregistrés");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Paramètres"
      description="Nom du site, signature et couleur de thème."
      visibility={true}
      onVisibilityChange={() => undefined}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
      showVisibility={false}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom du site" value={draft.value.siteName} onChange={(siteName) => draft.set({ ...draft.value, siteName })} placeholder="Camille Roussel" />
        <TextField label="Slogan" value={draft.value.tagline} onChange={(tagline) => draft.set({ ...draft.value, tagline })} placeholder="Designer produit & développeuse" />
        <TextAreaField
          label="Texte de pied de page"
          value={draft.value.footerText}
          onChange={(footerText) => draft.set({ ...draft.value, footerText })}
          rows={3}
          className="sm:col-span-2"
        />
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-[13px] font-medium">Couleur de thème</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(draft.value.themeColor) ? draft.value.themeColor : "#A85B32"}
            onChange={(event) => draft.set({ ...draft.value, themeColor: event.target.value })}
            className="h-10 w-16 cursor-pointer border border-border bg-background p-1"
            title="Choisir une couleur"
          />
          <Input
            value={draft.value.themeColor}
            onChange={(event) => draft.set({ ...draft.value, themeColor: event.target.value })}
            placeholder="#A85B32"
            className="w-32 bg-background font-mono text-xs"
          />
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => draft.set({ ...draft.value, themeColor: color })}
                className="size-7 rounded-full border border-border transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Appliquée aux boutons, liens et accents du site.
        </p>
      </div>
    </SectionEditor>
  );
}
