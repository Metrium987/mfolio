import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  FileText,
  Languages,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SECTION_ORDER,
  SECTION_IDS,
  SECTION_LABELS,
  type SectionId,
} from "@/lib/sections";
import { SectionEditor } from "./SectionEditor";
import { SortableList } from "./sortable-list";
import {
  DESIGN_PRESETS,
  THEME_PRESETS,
  darkVariant,
  findPreset,
  presetAccent,
  type SiteAppearanceMode,
  type ThemeTokens,
} from "@/lib/themes";
import {
  Field,
  FieldGroup,
  ImageField,
  TextAreaField,
  TextField,
  ToggleField,
  useSectionDraft,
} from "./fields";

/** Three-choice control for the site ambiance (Sécurité → Apparence). */
function AmbiancePicker({
  value,
  onChange,
}: {
  value: SiteAppearanceMode;
  onChange: (value: SiteAppearanceMode) => void;
}) {
  const options: { value: SiteAppearanceMode; label: string }[] = [
    { value: "auto", label: "Automatique" },
    { value: "light", label: "Clair" },
    { value: "dark", label: "Sombre" },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Near-white (or near-ink) text that stays readable on the accent. */
function onAccent(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55
    ? "oklch(0.24 0.014 60)"
    : "oklch(0.977 0.005 85)";
}

/**
 * Miniature mockup of the public site — lets the owner judge a theme without
 * leaving the dashboard (light and dark side by side, live-updating).
 */
function MiniSitePreview({
  tokens,
  accent,
  label,
}: {
  tokens: ThemeTokens;
  accent: string;
  label: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-md border"
      style={{
        backgroundColor: tokens.background,
        borderColor: tokens.border,
      }}
    >
      {/* Fake header: accent dot + site name + nav hint */}
      <div
        className="flex items-center justify-between border-b px-3 py-2"
        style={{ borderColor: tokens.border }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <span
            className="h-1 w-12 rounded-full"
            style={{ backgroundColor: tokens.ink, opacity: 0.75 }}
          />
        </div>
        <span
          className="h-1 w-8 rounded-full"
          style={{ backgroundColor: tokens.mutedInk, opacity: 0.5 }}
        />
      </div>
      {/* Fake hero: headline, subhead, buttons */}
      <div className="space-y-2 px-3 pt-3">
        <span
          className="block h-2 w-3/4 rounded-full"
          style={{ backgroundColor: tokens.ink }}
        />
        <span
          className="block h-1.5 w-1/2 rounded-full"
          style={{ backgroundColor: tokens.mutedInk }}
        />
        <div className="flex items-center gap-2 pt-1">
          <span
            className="rounded-full px-2.5 py-1 text-[9px] font-semibold"
            style={{ backgroundColor: accent, color: onAccent(accent) }}
          >
            Bouton
          </span>
          <span
            className="rounded-full border px-2.5 py-1 text-[9px]"
            style={{ borderColor: tokens.border, color: tokens.ink }}
          >
            Lien
          </span>
        </div>
      </div>
      {/* Fake nav + mode label */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-3">
        <span
          className="text-[9px] uppercase tracking-[0.18em]"
          style={{ color: accent }}
        >
          À propos
        </span>
        <span
          className="h-1 w-px"
          style={{ backgroundColor: tokens.border }}
        />
        <span className="text-[9px]" style={{ color: tokens.mutedInk }}>
          Parcours · Projets · Contact
        </span>
        <span
          className="ml-auto text-[9px] uppercase tracking-[0.2em]"
          style={{ color: tokens.mutedInk }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Default settings shape — shared by the Config and Paramètres editors so
 * both drafts stay complete (the settings doc carries SEO, scripts, keys…).
 */
const EMPTY_SETTINGS: Omit<Doc<"settings">, "_id" | "_creationTime" | "en"> = {
  themeColor: "#A85B32",
  themeMode: "auto",
  themePreset: "studio",
  design: "editorial",
  googleAnalyticsId: "",
  deeplApiKey: "",
  maintenanceMode: false,
  metaTitle: "",
  metaDescription: "",
  metaAuthor: "",
  metaImage: "",
  scriptHeader: "",
  scriptFooter: "",
  sectionOrder: [...DEFAULT_SECTION_ORDER],
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
  visibilityLanguages: true,
  visibilityInterests: true,
  servicesLayout: "cards",
  interestsLayout: "cards",
  resumeOrder: "experience-first",
};

/** Two-choice segmented control for a section's rendering style. */
function LayoutPicker({
  value,
  onChange,
}: {
  value: "list" | "cards";
  onChange: (value: "list" | "cards") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border p-0.5">
      {(["list", "cards"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-medium transition-colors",
            value === option
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option === "list" ? "Liste" : "Cartes"}
        </button>
      ))}
    </div>
  );
}

/** Two-choice control for the order of the two Parcours sub-sections. */
function ResumeOrderPicker({
  value,
  onChange,
}: {
  value: "experience-first" | "education-first";
  onChange: (value: "experience-first" | "education-first") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border p-0.5">
      {(
        [
          ["experience-first", "Expérience d'abord"],
          ["education-first", "Formation d'abord"],
        ] as const
      ).map(([option, label]) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-medium transition-colors",
            value === option
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

type VisibilityKey = Extract<keyof Doc<"settings">, `visibility${string}`>;

const VISIBILITY_ITEMS: { key: VisibilityKey; label: string }[] = [
  { key: "visibilityAbout", label: "En-tête (nom, portrait, boutons)" },
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
  { key: "visibilityLanguages", label: "Section « Langues »" },
  { key: "visibilityInterests", label: "Section « Centres d'intérêt »" },
];

function StringListEditor({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
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

/** CV upload: import a PDF into Convex storage, or paste a direct URL. */
function CvField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getUrl = useAction(api.files.getUrl);
  const setCvUrl = useMutation(api.siteMutations.setCvUrl);
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
        // Persist immediately (no separate save click) and mirror it into
        // the section draft so the form and the site stay in sync.
        await setCvUrl({ cvUrl: url });
        onChange(url);
        toast.success("CV importé et enregistré — il est disponible sur le site.");
      } else {
        toast.error("Impossible de récupérer le fichier");
      }
    } catch (error) {
      console.error(error);
      toast.error("Le téléchargement du CV a échoué");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    try {
      await setCvUrl({ cvUrl: "" });
      onChange("");
      toast.success("CV retiré — le bouton de téléchargement est masqué sur le site.");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du retrait du CV");
    }
  };

  return (
    <Field
      label="CV (PDF)"
      hint="Importez votre CV en PDF — il sera proposé en téléchargement sur le site."
    >
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
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
              <FileText className="size-4" />
            )}
            {uploading
              ? "Envoi…"
              : value
                ? "Remplacer le CV"
                : "Importer le CV (PDF)"}
          </Button>
          {value && (
            <>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium text-(--studio-accent) hover:underline"
              >
                Voir le CV
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleRemove()}
              >
                Retirer
              </Button>
            </>
          )}
        </div>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="…ou collez l'URL directe de votre CV"
          className="bg-background text-xs"
        />
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
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
  const updateAbout = useAction(api.translate.updateAbout);
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
      draft.commit(draft.value);
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
      <div className="space-y-8">
        <FieldGroup
          title="Coordonnées"
          description="Votre identité et vos moyens de contact."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Nom" value={draft.value.name} onChange={(name) => draft.set({ ...draft.value, name })} placeholder="Camille Roussel" />
            <TextField label="Email" type="email" value={draft.value.email} onChange={(email) => draft.set({ ...draft.value, email })} placeholder="vous@exemple.fr" />
            <TextField label="Téléphone" value={draft.value.phone} onChange={(phone) => draft.set({ ...draft.value, phone })} placeholder="+33 6 12 34 56 78" />
            <TextField label="Adresse / ville" value={draft.value.address} onChange={(address) => draft.set({ ...draft.value, address })} placeholder="Lyon, France" />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Images"
          description="Portrait et couverture — la première impression du site."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageField
              label="Portrait (avatar)"
              value={draft.value.avatar}
              onChange={(avatar) => draft.set({ ...draft.value, avatar })}
              guide={{ ratio: "4:5", formats: "JPG, WebP, PNG", size: "~1000 × 1250 px" }}
            />
            <ImageField
              label="Image de couverture"
              value={draft.value.cover}
              onChange={(cover) => draft.set({ ...draft.value, cover })}
              hint="Bannière en haut du site."
              guide={{ ratio: "21:9", formats: "JPG, WebP", size: "~1600 × 700 px" }}
            />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Accueil"
          description="Slogans et CV affichés dans l'en-tête."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <CvField
              value={draft.value.cvUrl}
              onChange={(cvUrl) => draft.set({ ...draft.value, cvUrl })}
            />
            <StringListEditor
              label="Slogans (accueil)"
              value={draft.value.taglines}
              onChange={(taglines) => draft.set({ ...draft.value, taglines })}
              placeholder="Designer produit & développeuse"
              hint="Slogans courts — ils défilent en « machine à écrire » sur l'accueil. Idéalement une ligne (moins de 60 caractères)."
            />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Présentation"
          description="La description détaillée affichée sous votre nom — une ligne vide crée un nouveau paragraphe."
        >
          <TextAreaField
            label="Description"
            value={draft.value.description}
            onChange={(description) => draft.set({ ...draft.value, description })}
            rows={8}
            placeholder="Séparez les paragraphes par une ligne vide."
          />
        </FieldGroup>

        <FieldGroup
          title="Réseaux sociaux"
          description="Les liens affichés dans l'en-tête du site."
        >
          <SocialLinksEditor
            value={draft.value.socials}
            onChange={(socials) => draft.set({ ...draft.value, socials })}
          />
        </FieldGroup>
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Integrations — external service keys (Google Analytics, DeepL)
// ---------------------------------------------------------------------------

export function IntegrationsEditor({
  settings,
}: {
  settings: Doc<"settings"> | null | undefined;
}) {
  const updateIntegrations = useMutation(api.siteMutations.updateIntegrations);
  const translateAllContent = useAction(api.translate.translateAllContent);
  const integrations = useQuery(api.site.getIntegrations);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(
    settings?.googleAnalyticsId ?? "",
  );
  // API keys are write-only (never sent back to the browser): these fields
  // only ever hold what the owner just typed.
  const [deeplApiKey, setDeeplApiKey] = useState("");
  const [notificationEmail, setNotificationEmail] = useState(
    settings?.notificationEmail ?? "",
  );
  const [contactNotifications, setContactNotifications] = useState(
    settings?.contactNotifications !== false,
  );
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const deeplKeySet = integrations?.deeplKeySet ?? false;

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time form sync
       when the fetched settings arrive (before any user interaction) */
    setGoogleAnalyticsId(settings?.googleAnalyticsId ?? "");
    setNotificationEmail(settings?.notificationEmail ?? "");
    setContactNotifications(settings?.contactNotifications !== false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [
    settings?.googleAnalyticsId,
    settings?.notificationEmail,
    settings?.contactNotifications,
  ]);

  const dirty =
    googleAnalyticsId !== (settings?.googleAnalyticsId ?? "") ||
    notificationEmail !== (settings?.notificationEmail ?? "") ||
    contactNotifications !== (settings?.contactNotifications !== false) ||
    deeplApiKey.trim() !== "";

  /** Translate every section once and report the outcome. */
  const translateAll = async () => {
    setTranslating(true);
    try {
      const results = await translateAllContent();
      const ok = Object.values(results).filter((r) => r === "ok").length;
      const failed = Object.values(results).filter((r) => r === "failed").length;
      if (failed > 0) {
        toast.error(
          `${ok} section(s) traduite(s), ${failed} en échec — vérifiez votre clé DeepL.`,
        );
      } else {
        toast.success(`${ok} section(s) traduite(s) en anglais.`);
      }
    } catch (error) {
      console.error(error);
      toast.error("La traduction a échoué. Vérifiez votre clé DeepL.");
    } finally {
      setTranslating(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const newKey = deeplApiKey.trim();
      await updateIntegrations({
        googleAnalyticsId: googleAnalyticsId.trim(),
        deeplApiKey: newKey,
        notificationEmail: notificationEmail.trim(),
        contactNotifications,
      });
      setDeeplApiKey("");
      if (newKey) {
        // First time a key is set (or replaced): translate existing content
        // right away so the EN version is never left empty.
        toast.success("Clé DeepL enregistrée — traduction du contenu en cours…");
        await translateAll();
      } else {
        toast.success("Intégrations enregistrées");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement des clés");
    } finally {
      setSaving(false);
    }
  };

  const removeKey = async () => {
    setSaving(true);
    try {
      await updateIntegrations({
        googleAnalyticsId: googleAnalyticsId.trim(),
        clearDeeplKey: true,
      });
      toast.success(
        "Clé DeepL supprimée — les traductions déjà générées sont conservées.",
      );
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression de la clé");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Intégrations"
      description="Clés et canaux des services externes connectés au site public : traduction automatique, statistiques et notifications."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={() => void save()}
      saving={saving}
      dirty={dirty}
    >
      <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Google Analytics ID"
          value={googleAnalyticsId}
          onChange={setGoogleAnalyticsId}
          placeholder="G-XXXXXXXXXX"
          hint="Identifiant de mesure GA4. Laissez vide pour désactiver le suivi."
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[13px] font-medium">Clé API DeepL</label>
            {deeplKeySet && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Clé configurée
              </span>
            )}
          </div>
          <Input
            type="password"
            value={deeplApiKey}
            onChange={(event) => setDeeplApiKey(event.target.value)}
            placeholder={
              deeplKeySet
                ? "•••••••• (conserver la clé actuelle)"
                : "Votre clé d'authentification DeepL"
            }
            className="bg-background"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Traduction automatique du contenu (FR → EN). La clé n'est jamais
            renvoyée au navigateur — laissez le champ vide pour la conserver.
          </p>
        </div>
      </div>
      <TextField
        label="Email de notification"
        value={notificationEmail}
        onChange={setNotificationEmail}
        placeholder="vous@exemple.com"
        hint="Reçoit les messages du formulaire de contact, envoyés via la passerelle email intégrée. Vide = votre email de contact."
      />
      <ToggleField
        label="Notifications de contact (email)"
        description="Envoie un email quand un visiteur écrit via le formulaire — coupez-le si vous déployez l'app ailleurs. Le message reste toujours dans la boîte de réception."
        checked={contactNotifications}
        onChange={setContactNotifications}
      />
      {deeplKeySet && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void translateAll()}
            disabled={translating || saving}
            className="rounded-full"
          >
            {translating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Languages className="size-4" />
            )}
            {translating ? "Traduction…" : "Traduire tout le contenu"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void removeKey()}
            disabled={saving}
            className="rounded-full text-muted-foreground"
          >
            Retirer la clé
          </Button>
        </div>
      )}
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Appearance — design, theme presets, ambiance and accent (own dashboard
// section)
// ---------------------------------------------------------------------------

/** Three-choice control for the site design (structure, typefaces, shapes). */
function DesignPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      {DESIGN_PRESETS.map((design) => {
        const active = value === design.id;
        return (
          <button
            key={design.id}
            type="button"
            onClick={() => onChange(design.id)}
            aria-pressed={active}
            className={cn(
              "rounded-md border p-3.5 text-left transition-colors",
              active
                ? "border-foreground bg-accent"
                : "border-border bg-background hover:border-foreground/50",
            )}
          >
            <span
              className="block text-2xl leading-none tracking-tight text-foreground"
              style={{ fontFamily: design.displayStack }}
            >
              Aa
            </span>
            <span className="mt-2 block text-sm font-medium text-foreground">
              {design.label}
            </span>
            <span
              className="mt-1 block text-[11px] leading-snug text-muted-foreground"
              style={{ fontFamily: design.bodyStack }}
            >
              {design.description}
            </span>
            {active && (
              <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                <Check className="size-3" />
                Actif
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function AppearanceEditor({
  settings,
}: {
  settings: Doc<"settings"> | null | undefined;
}) {
  const updateSettings = useAction(api.translate.updateSettings);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(settings, EMPTY_SETTINGS);

  // Live preview: the selected preset's tokens (Studio by default), with the
  // accent — custom color included — applied on top.
  const previewPreset =
    findPreset(draft.value.themePreset) ?? THEME_PRESETS[0];
  const previewAccent = /^#[0-9a-fA-F]{6}$/.test(draft.value.themeColor)
    ? draft.value.themeColor
    : presetAccent(previewPreset)?.color ?? "#A85B32";
  const previewAccentDark = darkVariant(previewAccent);

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({
        data: {
          ...draft.value,
          design: draft.value.design ?? "editorial",
          sectionOrder: draft.value.sectionOrder?.length
            ? draft.value.sectionOrder
            : [...DEFAULT_SECTION_ORDER],
          servicesLayout: draft.value.servicesLayout ?? "cards",
          interestsLayout: draft.value.interestsLayout ?? "cards",
          resumeOrder: draft.value.resumeOrder ?? "experience-first",
          deeplApiKey: draft.value.deeplApiKey ?? "",
        },
      });
      draft.commit(draft.value);
      toast.success("Apparence enregistrée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionEditor
      title="Apparence"
      description="Le thème, l'ambiance et la couleur d'accent du site public — appliqués aux boutons, liens et accents, en clair comme en sombre."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="space-y-8">
        <FieldGroup
          title="Design"
          description="La structure du site public — typographies, formes et profondeur. Chaque design fonctionne avec tous les thèmes de couleurs ; le tableau de bord garde sa propre structure."
        >
          <DesignPicker
            value={draft.value.design ?? "editorial"}
            onChange={(design) => draft.set({ ...draft.value, design })}
          />
        </FieldGroup>

        <FieldGroup
          title="Aperçu"
          description="Le rendu du site public dans le thème sélectionné — l'accent personnalisé est appliqué si vous en avez défini un. Le visiteur garde toujours la main sur son ambiance clair/sombre."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniSitePreview
              tokens={previewPreset.light}
              accent={previewAccent}
              label="Clair"
            />
            <MiniSitePreview
              tokens={previewPreset.dark}
              accent={previewAccentDark}
              label="Sombre"
            />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Thème & ambiance"
          description="Le thème (papier, encre, surfaces), l'ambiance par défaut et la couleur d'accent du site public."
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <div>
                <p className="text-[13px] font-medium">
                  Ambiance par défaut
                </p>
                <p className="text-xs text-muted-foreground">
                  L'ambiance vue par les visiteurs à leur arrivée. Le visiteur
                  peut toujours basculer clair/sombre depuis l'en-tête du site.
                </p>
              </div>
              <AmbiancePicker
                value={draft.value.themeMode ?? "auto"}
                onChange={(themeMode) =>
                  draft.set({ ...draft.value, themeMode })
                }
              />
            </div>

            <div className="space-y-2.5">
              <div>
                <p className="text-[13px] font-medium">Thèmes</p>
                <p className="text-xs text-muted-foreground">
                  Des ensembles complets — papier, encre et accent vont
                  ensemble, en clair comme en sombre. Choisir un thème règle
                  aussi la couleur d'accent.
                </p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {THEME_PRESETS.map((preset) => {
                  const accent = presetAccent(preset);
                  const active = draft.value.themePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        draft.set({
                          ...draft.value,
                          themePreset: preset.id,
                          themeColor: accent?.color ?? draft.value.themeColor,
                        })
                      }
                      className={cn(
                        "rounded-md border p-3 text-left transition-colors",
                        active
                          ? "border-foreground bg-accent"
                          : "border-border bg-background hover:border-foreground/50",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="size-5 shrink-0 rounded-full border border-black/10"
                          style={{ backgroundColor: accent?.color }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {preset.label}
                        </span>
                        {active && (
                          <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="size-3" />
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-[13px] font-medium">
                  Couleur personnalisée
                </p>
                <p className="text-xs text-muted-foreground">
                  Un réglage fin au-delà du thème — la famille de couleurs du
                  thème reste appliquée et une variante sombre est générée
                  automatiquement.
                </p>
              </div>
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
              </div>
            </div>
          </div>
        </FieldGroup>
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Account security — change the owner login email / password
// ---------------------------------------------------------------------------

export function SecurityEditor({
  settings,
}: {
  settings: Doc<"settings"> | null | undefined;
}) {
  const account = useQuery(api.credentials.getPasswordAccount);
  const updateAdminEmail = useMutation(api.credentials.updateAdminEmail);
  const updateAdminPassword = useAction(api.credentials.updateAdminPassword);
  const updateSettings = useAction(api.translate.updateSettings);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const draft = useSectionDraft(settings, EMPTY_SETTINGS);

  useEffect(() => {
    // Sync the form field with the fetched account (before user interaction).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (account) setEmail(account.email);
  }, [account]);

  const saveEmail = async () => {
    const value = email.trim();
    if (!value) return;
    setSavingEmail(true);
    try {
      await updateAdminEmail({ newEmail: value });
      toast.success("Email de connexion mis à jour");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async () => {
    if (password.length < 8) return;
    setSavingPassword(true);
    try {
      await updateAdminPassword({ newPassword: password });
      setPassword("");
      toast.success("Mot de passe mis à jour");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateSettings({
        data: {
          ...draft.value,
          sectionOrder: draft.value.sectionOrder?.length
            ? draft.value.sectionOrder
            : [...DEFAULT_SECTION_ORDER],
          servicesLayout: draft.value.servicesLayout ?? "cards",
          interestsLayout: draft.value.interestsLayout ?? "cards",
          portfolioLayout: draft.value.portfolioLayout ?? "cards",
          blogLayout: draft.value.blogLayout ?? "cards",
          resumeOrder: draft.value.resumeOrder ?? "experience-first",
          deeplApiKey: draft.value.deeplApiKey ?? "",
        },
      });
      draft.commit(draft.value);
      toast.success("Réglages enregistrés");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <SectionEditor
      title="Sécurité du compte"
      description="Maintenance et identifiants de connexion du propriétaire."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={saveSettings}
      saving={savingSettings}
      dirty={draft.dirty}
    >
      <div className="space-y-8">
        <FieldGroup
          title="Maintenance"
          description="Masquez temporairement le portfolio public pendant vos mises à jour."
        >
          <ToggleField
            label="Mode maintenance"
            description="Masque le portfolio aux visiteurs (le tableau de bord reste accessible)"
            checked={draft.value.maintenanceMode}
            onChange={(maintenanceMode) => draft.set({ ...draft.value, maintenanceMode })}
          />
        </FieldGroup>

        <FieldGroup
          title="Identifiants de connexion"
          description="L'email et le mot de passe utilisés pour se connecter au tableau de bord."
        >
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">
                  Email de connexion
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@admin.com"
                  className="bg-background"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  L'email utilisé pour se connecter avec le mot de passe.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">
                  Nouveau mot de passe
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="bg-background"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  8 caractères minimum. Laissez vide pour ne rien changer.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void saveEmail()}
                disabled={
                  savingEmail ||
                  !email.trim() ||
                  email.trim() === account?.email
                }
                className="rounded-full"
              >
                {savingEmail ? <Loader2 className="size-4 animate-spin" /> : null}
                Mettre à jour l'email
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void savePassword()}
                disabled={savingPassword || password.length < 8}
                className="rounded-full"
              >
                {savingPassword ? <Loader2 className="size-4 animate-spin" /> : null}
                Changer le mot de passe
              </Button>
            </div>
          </div>
        </FieldGroup>
      </div>
    </SectionEditor>
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
  const updateSite = useAction(api.translate.updateSite);
  const updateSettings = useAction(api.translate.updateSettings);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(site, {
    siteName: "",
    tagline: "",
    footerText: "",
    logoUrl: "",
    faviconUrl: "",
  });
  // SEO + custom scripts live on the settings doc — edited from this page.
  const settingsDraft = useSectionDraft(settings, EMPTY_SETTINGS);

  const save = async () => {
    setSaving(true);
    try {
      await updateSite({ data: draft.value });
      await updateSettings({ data: settingsDraft.value });
      draft.commit(draft.value);
      settingsDraft.commit(settingsDraft.value);
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
      description="Identité, référencement (SEO) et scripts personnalisés — tout ce qui configure le site public."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty || settingsDraft.dirty}
    >
      <div className="space-y-8">
        <FieldGroup
          title="Identité du site"
          description="Nom, slogan et texte de pied de page."
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
        </FieldGroup>

        <FieldGroup
          title="Logo & favicon"
          description="L'identité visuelle dans l'onglet et l'en-tête du navigateur."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageField
              label="Logo"
              value={draft.value.logoUrl}
              onChange={(logoUrl) => draft.set({ ...draft.value, logoUrl })}
              hint="Affiché dans l'en-tête du site et le tableau de bord."
              guide={{
                ratio: "libre (carré idéal)",
                formats: "PNG transparent ou SVG",
                size: "~500 × 500 px ou plus",
              }}
            />
            <ImageField
              label="Favicon"
              value={draft.value.faviconUrl}
              onChange={(faviconUrl) => draft.set({ ...draft.value, faviconUrl })}
              hint="L'icône de l'onglet du navigateur."
              guide={{
                ratio: "carré",
                formats: "ICO, PNG ou SVG",
                size: "64 × 64 px min — 512 × 512 idéal",
              }}
            />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Référencement (SEO)"
          description="Titre, description et image de partage affichés par les moteurs de recherche et les réseaux sociaux."
        >
          <div className="space-y-4">
            <TextField label="Titre de la page" value={settingsDraft.value.metaTitle} onChange={(metaTitle) => settingsDraft.set({ ...settingsDraft.value, metaTitle })} placeholder="Camille Roussel — Designer produit" />
            <TextAreaField label="Description" value={settingsDraft.value.metaDescription} onChange={(metaDescription) => settingsDraft.set({ ...settingsDraft.value, metaDescription })} rows={3} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Auteur" value={settingsDraft.value.metaAuthor} onChange={(metaAuthor) => settingsDraft.set({ ...settingsDraft.value, metaAuthor })} placeholder="Camille Roussel" />
              <ImageField
                label="Image de partage"
                value={settingsDraft.value.metaImage}
                onChange={(metaImage) => settingsDraft.set({ ...settingsDraft.value, metaImage })}
                guide={{ ratio: "1.91:1", formats: "JPG, PNG", size: "1200 × 630 px" }}
              />
            </div>
          </div>
        </FieldGroup>

        <FieldGroup
          title="Scripts personnalisés"
          description="Code HTML/JS injecté tel quel sur le site public — il s'exécute dans le navigateur de chaque visiteur. Réservé au propriétaire ; ne collez que du code de confiance (analytics, chat…)."
        >
          <div className="space-y-4">
            <TextAreaField
              label="Script d'en-tête (dans <head>)"
              value={settingsDraft.value.scriptHeader}
              onChange={(scriptHeader) => settingsDraft.set({ ...settingsDraft.value, scriptHeader })}
              rows={4}
              hint="HTML/JS injecté tel quel dans le <head> du site public."
            />
            <TextAreaField
              label="Script de pied de page"
              value={settingsDraft.value.scriptFooter}
              onChange={(scriptFooter) => settingsDraft.set({ ...settingsDraft.value, scriptFooter })}
              rows={4}
              hint="HTML/JS injecté tel quel avant la fermeture du <body>."
            />
          </div>
        </FieldGroup>
      </div>
    </SectionEditor>
  );
}

// ---------------------------------------------------------------------------
// Config — portfolio rendering (Ezfolio "Config")
// ---------------------------------------------------------------------------

export function ConfigEditor({ settings }: { settings: Doc<"settings"> | null | undefined }) {
  const updateSettings = useAction(api.translate.updateSettings);
  const [saving, setSaving] = useState(false);
  const draft = useSectionDraft(settings, EMPTY_SETTINGS);

  // Sanitized display order — stale ids (e.g. "about" from an older save)
  // are dropped so the list only ever shows real, reorderable sections.
  const order = (
    draft.value.sectionOrder?.length
      ? draft.value.sectionOrder
      : DEFAULT_SECTION_ORDER
  ).filter((id): id is SectionId => SECTION_IDS.includes(id as SectionId));

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({
        data: {
          ...draft.value,
          sectionOrder: order,
          servicesLayout: draft.value.servicesLayout ?? "cards",
          interestsLayout: draft.value.interestsLayout ?? "cards",
          resumeOrder: draft.value.resumeOrder ?? "experience-first",
          deeplApiKey: draft.value.deeplApiKey ?? "",
        },
      });
      draft.commit(draft.value);
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
      description="L'ordre, la visibilité et le style d'affichage des sections du portfolio."
      visibility={true}
      onVisibilityChange={() => undefined}
      showVisibility={false}
      onSave={save}
      saving={saving}
      dirty={draft.dirty}
    >
      <div className="space-y-8">
        <FieldGroup
          title="Visibilité des sections"
          description="Affichez ou masquez chaque partie du portfolio."
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
        </FieldGroup>

        <FieldGroup
          title="Ordre d'affichage des sections"
          description="L'en-tête (votre nom, votre portrait, vos boutons) est la section « À propos » du site — elle est toujours affichée en premier et ne peut pas être déplacée. Les sections ci-dessous suivent par défaut l'ordre du CV français : Parcours → Compétences → Langues → Centres d'intérêt → Services → Projets → Journal → Contact. Glissez-déposez avec la souris (⋮⋮) ou utilisez les flèches pour réorganiser."
        >
          <SortableList
            className="space-y-1.5"
            items={order}
            onReorder={(next) =>
              draft.set({ ...draft.value, sectionOrder: next })
            }
            renderRow={(id, index, dragHandle) => {
              const label = SECTION_LABELS[id];
              const move = (dir: -1 | 1) => {
                const target = index + dir;
                if (target < 0 || target >= order.length) return;
                const next = [...order];
                [next[index], next[target]] = [next[target], next[index]];
                draft.set({ ...draft.value, sectionOrder: next });
              };
              return (
                <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                  {dragHandle}
                  <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Monter"
                    disabled={index === 0}
                    onClick={() => move(-1)}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Descendre"
                    disabled={index === order.length - 1}
                    onClick={() => move(1)}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </div>
              );
            }}
          />
        </FieldGroup>

        <FieldGroup
          title="Style d'affichage des sections"
          description="Liste ou grille de cartes pour les sections concernées."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Services</p>
                <p className="text-xs text-muted-foreground">Liste ou vignettes</p>
              </div>
              <LayoutPicker
                value={draft.value.servicesLayout ?? "cards"}
                onChange={(servicesLayout) =>
                  draft.set({ ...draft.value, servicesLayout })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Centres d'intérêt
                </p>
                <p className="text-xs text-muted-foreground">Liste ou vignettes</p>
              </div>
              <LayoutPicker
                value={draft.value.interestsLayout ?? "cards"}
                onChange={(interestsLayout) =>
                  draft.set({ ...draft.value, interestsLayout })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Langues</p>
                <p className="text-xs text-muted-foreground">
                  Liste ou vignettes (niveau en points)
                </p>
              </div>
              <LayoutPicker
                value={draft.value.languagesLayout ?? "cards"}
                onChange={(languagesLayout) =>
                  draft.set({ ...draft.value, languagesLayout })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Compétences</p>
                <p className="text-xs text-muted-foreground">
                  Liste ou vignettes (niveau en points)
                </p>
              </div>
              <LayoutPicker
                value={draft.value.skillsLayout ?? "cards"}
                onChange={(skillsLayout) =>
                  draft.set({ ...draft.value, skillsLayout })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Projets</p>
                <p className="text-xs text-muted-foreground">
                  Grille de cartes ou rangées éditoriales
                </p>
              </div>
              <LayoutPicker
                value={draft.value.portfolioLayout ?? "cards"}
                onChange={(portfolioLayout) =>
                  draft.set({ ...draft.value, portfolioLayout })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Journal</p>
                <p className="text-xs text-muted-foreground">
                  Grille de cartes ou liste d'articles
                </p>
              </div>
              <LayoutPicker
                value={draft.value.blogLayout ?? "cards"}
                onChange={(blogLayout) =>
                  draft.set({ ...draft.value, blogLayout })
                }
              />
            </div>
          </div>
        </FieldGroup>

        <FieldGroup
          title="Section Parcours — ordre interne"
          description="La norme française place l'expérience d'abord ; les profils juniors préfèrent souvent la formation en premier. Choisissez ce qui vous valorise le plus."
        >
          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Formation / Expérience
              </p>
              <p className="text-xs text-muted-foreground">
                Ordre des deux blocs de la section Parcours
              </p>
            </div>
            <ResumeOrderPicker
              value={draft.value.resumeOrder ?? "experience-first"}
              onChange={(resumeOrder) =>
                draft.set({ ...draft.value, resumeOrder })
              }
            />
          </div>
        </FieldGroup>
      </div>
    </SectionEditor>
  );
}
