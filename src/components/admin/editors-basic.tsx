import { useMutation } from "convex/react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionEditor } from "./SectionEditor";
import {
  Field,
  ImageField,
  TextAreaField,
  TextField,
  ToggleField,
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

type VisibilityKey = Extract<keyof Doc<"settings">, `visibility${string}`>;

const VISIBILITY_ITEMS: { key: VisibilityKey; label: string }[] = [
  { key: "visibilityAbout", label: "Section « À propos »" },
  { key: "visibilitySkill", label: "Section « Compétences »" },
  { key: "visibilityEducation", label: "Section « Formation »" },
  { key: "visibilityExperience", label: "Section « Expérience »" },
  { key: "visibilityProject", label: "Section « Projets »" },
  { key: "visibilityService", label: "Section « Services »" },
  { key: "visibilityContact", label: "Section « Contact »" },
  { key: "visibilityFooter", label: "Pied de page" },
  { key: "visibilityCv", label: "Bouton « Télécharger le CV »" },
  { key: "visibilitySkillProficiency", label: "Niveaux des compétences" },
  { key: "visibilityBlog", label: "Section « Journal »" },
];

function StringListEditor({
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
    <Field label={label}>
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(event) =>
                onChange(
                  value.map((i, n) => (n === index ? event.target.value : i)),
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...value, ""])}
        >
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>
    </Field>
  );
}

function SocialLinksEditor({
  value,
  onChange,
}: {
  value: { title: string; link: string }[];
  onChange: (value: { title: string; link: string }[]) => void;
}) {
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
            onChange={(event) =>
              onChange(
                value.map((s, n) =>
                  n === index ? { ...s, title: event.target.value } : s,
                ),
              )
            }
            placeholder="Nom (ex : GitHub)"
            className="w-40 bg-background"
          />
          <Input
            value={social.link}
            onChange={(event) =>
              onChange(
                value.map((s, n) =>
                  n === index ? { ...s, link: event.target.value } : s,
                ),
              )
            }
            placeholder="https://…"
            className="min-w-44 flex-1 bg-background"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Supprimer"
            onClick={() => onChange(value.filter((_, n) => n !== index))}
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
// About — persona, hero and contact info (Ezfolio "About")
// ---------------------------------------------------------------------------

export function AboutEditor({ about }: { about: Doc<"about"> | null | undefined }) {
  const updateAbout = useMutation(api.siteMutations.updateAbout);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(about, {
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    cover: "",
    description: "",
    taglines: [],
    socials: [],
    cvUrl: "",
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
      description="Votre identité : nom, coordonnées, portrait, couverture, slogans, réseaux et CV. Source de l'accueil et du contact du site."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom" value={draft.value.name} onChange={(name) => draft.set({ ...draft.value, name })} placeholder="Camille Roussel" />
        <TextField label="Email" type="email" value={draft.value.email} onChange={(email) => draft.set({ ...draft.value, email })} placeholder="vous@exemple.fr" />
        <TextField label="Téléphone" value={draft.value.phone} onChange={(phone) => draft.set({ ...draft.value, phone })} placeholder="+33 6 12 34 56 78" />
        <TextField label="Adresse / ville" value={draft.value.address} onChange={(address) => draft.set({ ...draft.value, address })} placeholder="Lyon, France" />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <ImageField label="Portrait (avatar)" value={draft.value.avatar} onChange={(avatar) => draft.set({ ...draft.value, avatar })} />
        <ImageField label="Image de couverture" value={draft.value.cover} onChange={(cover) => draft.set({ ...draft.value, cover })} hint="Bannière en haut du site." />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TextField label="Lien du CV" value={draft.value.cvUrl} onChange={(cvUrl) => draft.set({ ...draft.value, cvUrl })} placeholder="https://…" hint="Laissez vide pour masquer le bouton." />
        <StringListEditor
          label="Slogans (accueil)"
          value={draft.value.taglines}
          onChange={(taglines) => draft.set({ ...draft.value, taglines })}
          placeholder="Designer produit & développeuse"
        />
      </div>

      <div className="mt-6">
        <TextAreaField
          label="Description"
          value={draft.value.description}
          onChange={(description) => draft.set({ ...draft.value, description })}
          rows={8}
          placeholder="Séparez les paragraphes par une ligne vide."
          hint="Une ligne vide crée un nouveau paragraphe."
        />
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
// Integrations — external service keys (Google Analytics, DeepL)
// ---------------------------------------------------------------------------

function IntegrationsCard({
  settings,
}: {
  settings: Doc<"settings"> | null | undefined;
}) {
  const updateIntegrations = useMutation(api.siteMutations.updateIntegrations);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(
    settings?.googleAnalyticsId ?? "",
  );
  const [deeplApiKey, setDeeplApiKey] = useState(settings?.deeplApiKey ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGoogleAnalyticsId(settings?.googleAnalyticsId ?? "");
    setDeeplApiKey(settings?.deeplApiKey ?? "");
  }, [settings?.googleAnalyticsId, settings?.deeplApiKey]);

  const dirty =
    googleAnalyticsId !== (settings?.googleAnalyticsId ?? "") ||
    deeplApiKey !== (settings?.deeplApiKey ?? "");

  const save = async () => {
    setSaving(true);
    try {
      await updateIntegrations({
        googleAnalyticsId: googleAnalyticsId.trim(),
        deeplApiKey: deeplApiKey.trim(),
      });
      toast.success("Clés API enregistrées");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement des clés");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="kicker">Intégrations</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Les clés des services externes connectés au site public.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Google Analytics ID"
          value={googleAnalyticsId}
          onChange={setGoogleAnalyticsId}
          placeholder="G-XXXXXXXXXX"
          hint="Identifiant de mesure GA4. Laissez vide pour désactiver le suivi."
        />
        <TextField
          label="Clé API DeepL"
          value={deeplApiKey}
          onChange={setDeeplApiKey}
          placeholder="Votre clé d'authentification DeepL"
          type="password"
          hint="Utilisée pour la traduction automatique du contenu (FR → EN). Stockée en base, jamais affichée sur le site."
        />
      </div>
      <div className="flex items-center justify-end gap-3">
        {dirty && (
          <span className="text-xs text-muted-foreground">
            Modifications non enregistrées
          </span>
        )}
        <Button
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-full"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Enregistrement…" : "Enregistrer les clés"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Site — identity + dashboard appearance (Ezfolio "Settings")
// ---------------------------------------------------------------------------

export function SiteEditor({
  site,
  settings,
}: {
  site: Doc<"site"> | null | undefined;
  settings: Doc<"settings"> | null | undefined;
}) {
  const updateSite = useMutation(api.siteMutations.updateSite);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(site, {
    siteName: "",
    tagline: "",
    footerText: "",
    logoUrl: "",
    faviconUrl: "",
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateSite({ data: draft.value });
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
      title="Paramètres du site"
      description="Nom du site, slogan, texte de pied de page, logo et favicon."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
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
        <ImageField label="Logo" value={draft.value.logoUrl} onChange={(logoUrl) => draft.set({ ...draft.value, logoUrl })} hint="Utilisé dans le tableau de bord." />
        <ImageField label="Favicon" value={draft.value.faviconUrl} onChange={(faviconUrl) => draft.set({ ...draft.value, faviconUrl })} hint="L'icône de l'onglet du navigateur." />
      </div>

      <div className="mt-8 space-y-4 border-t border-border/70 pt-6">
        <IntegrationsCard settings={settings} />
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Config — portfolio rendering (Ezfolio "Config")
// ---------------------------------------------------------------------------

export function ConfigEditor({ settings }: { settings: Doc<"settings"> | null | undefined }) {
  const updateSettings = useMutation(api.siteMutations.updateSettings);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(settings, {
    themeColor: "#A85B32",
    googleAnalyticsId: "",
    deeplApiKey: "",
    maintenanceMode: false,
    metaTitle: "",
    metaDescription: "",
    metaAuthor: "",
    metaImage: "",
    scriptHeader: "",
    scriptFooter: "",
    visibilityAbout: true,
    visibilitySkill: true,
    visibilityEducation: true,
    visibilityExperience: true,
    visibilityProject: true,
    visibilityService: true,
    visibilityContact: true,
    visibilityFooter: true,
    visibilityCv: true,
    visibilitySkillProficiency: true,
    visibilityBlog: true,
  });

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({
        data: { ...draft.value, deeplApiKey: draft.value.deeplApiKey ?? "" },
      });
      draft.reset();
      toast.success("Configuration enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Config"
      description="Le rendu global du portfolio : couleur, maintenance, SEO, scripts et visibilité des sections."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="space-y-2">
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

      <div className="mt-6 space-y-4">
        <ToggleField
          label="Mode maintenance"
          description="Masque le portfolio aux visiteurs (le tableau de bord reste accessible)"
          checked={draft.value.maintenanceMode}
          onChange={(maintenanceMode) => draft.set({ ...draft.value, maintenanceMode })}
        />
        <div className="rounded-md border border-dashed border-border bg-background px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          Les clés API (Google Analytics, DeepL) se configurent dans le menu
          «&nbsp;Paramètres&nbsp;» → section Intégrations.
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-[13px] font-medium">Visibilité des sections</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {VISIBILITY_ITEMS.map((item) => (
            <ToggleField
              key={item.key}
              label={item.label}
              checked={draft.value[item.key]}
              onChange={(checked) =>
                draft.set({ ...draft.value, [item.key]: checked })
              }
            />
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-[13px] font-medium">Référencement (SEO)</p>
        <TextField label="Titre de la page" value={draft.value.metaTitle} onChange={(metaTitle) => draft.set({ ...draft.value, metaTitle })} placeholder="Camille Roussel — Designer produit" />
        <TextAreaField label="Description" value={draft.value.metaDescription} onChange={(metaDescription) => draft.set({ ...draft.value, metaDescription })} rows={3} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Auteur" value={draft.value.metaAuthor} onChange={(metaAuthor) => draft.set({ ...draft.value, metaAuthor })} placeholder="Camille Roussel" />
          <ImageField label="Image de partage" value={draft.value.metaImage} onChange={(metaImage) => draft.set({ ...draft.value, metaImage })} />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-[13px] font-medium">Scripts personnalisés</p>
        <TextAreaField
          label="Script d'en-tête (dans <head>)"
          value={draft.value.scriptHeader}
          onChange={(scriptHeader) => draft.set({ ...draft.value, scriptHeader })}
          rows={4}
          hint="HTML/JS injecté tel quel sur le site public."
        />
        <TextAreaField
          label="Script de pied de page"
          value={draft.value.scriptFooter}
          onChange={(scriptFooter) => draft.set({ ...draft.value, scriptFooter })}
          rows={4}
        />
      </div>
    </SectionEditor>
  );
}
