import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// HelpTour — contextual help system for each dashboard section.
//
// Activated by clicking the "?" button in the dashboard header. Shows a
// floating tooltip panel with section-specific tips. No external library —
// built with Framer Motion + Portal-like overlay, matching the Studio theme.
//
// Props:
//   activeSection — current dashboard nav id (e.g. "about", "skills", etc.)
//   onNavigate    — callback to switch sections when a tip links to another
// ---------------------------------------------------------------------------

type HelpTip = {
  title: string;
  text: string;
  link?: { label: string; section: string };
};

const SECTION_HELP: Record<string, { title: string; tips: HelpTip[] }> = {
  overview: {
    title: "Vue d'ensemble",
    tips: [
      {
        title: "Tableau de bord",
        text: "C'est votre page d'accueil dans l'admin. Elle résume votre contenu, vos visiteurs et vos messages en un coup d'œil.",
      },
      {
        title: "Statistiques",
        text: "Les graphiques se remplissent automatiquement au fil des visites. Les données sont conservées 90 jours.",
      },
      {
        title: "Messages",
        text: "Les messages du formulaire de contact apparaissent ici. Marquez-les comme traités ou répondez directement par email.",
        link: { label: "Voir Messages", section: "messages" },
      },
    ],
  },
  config: {
    title: "Config",
    tips: [
      {
        title: "Visibilité des sections",
        text: "Activez ou désactivez chaque partie de votre portfolio. Les sections masquées ne sont plus visibles sur le site public.",
      },
      {
        title: "Ordre d'affichage",
        text: "Glissez-déposez les sections (⋮⋮) ou utilisez les flèches ↑↓ pour réorganiser l'ordre sur le site. L'en-tête (À propos) est toujours en premier.",
      },
      {
        title: "Style d'affichage",
        text: "Choisissez entre « Liste » (rangées éditoriales) ou « Cartes » (grille) pour chaque section concernée.",
      },
      {
        title: "Parcours — ordre interne",
        text: "La norme française place l'expérience avant la formation. Les profils juniors préfèrent souvent l'inverse. Choisissez ce qui vous valorise.",
      },
    ],
  },
  about: {
    title: "À propos",
    tips: [
      {
        title: "Identité",
        text: "Votre nom, email, téléphone et adresse s'affichent dans le hero du site et la section Contact.",
      },
      {
        title: "Images",
        text: "La photo de profil (portrait) apparaît dans le hero. La photo de couverture est en arrière-plan. Formats recommandés : carré pour le portrait, paysage pour la couverture.",
      },
      {
        title: "Slogans",
        text: "Les slogans défilent en animation sous votre nom. Ajoutez-en plusieurs pour un effet rotatif. Commencez par la première lettre en majuscule.",
      },
      {
        title: "Réseaux sociaux",
        text: "Ajoutez vos profils LinkedIn, GitHub, Dribbble… Les icônes apparaissent dans le hero avec des liens cliquables.",
      },
      {
        title: "CV",
        text: "Le lien CV permet aux visiteurs de télécharger ou consulter votre CV. Vous pouvez aussi activer l'impression PDF depuis le bouton « Imprimer / PDF ».",
      },
    ],
  },
  skills: {
    title: "Compétences",
    tips: [
      {
        title: "Niveaux 1 à 5",
        text: "Chaque compétence a un niveau de maîtrise (1 = débutant, 5 = expert). Les barres s'affichent sur le site en mode « Cartes ».",
      },
      {
        title: "Réorganisation",
        text: "Utilisez les flèches ↑↓ ou glissez-déposez (⋮⋮) pour classer vos compétences par ordre de pertinence.",
      },
      {
        title: "Visibilité des niveaux",
        text: "Dans Config → Visibilité, vous pouvez masquer les barres de niveau si vous préférez une liste sobre.",
        link: { label: "Voir Config", section: "config" },
      },
    ],
  },
  languages: {
    title: "Langues",
    tips: [
      {
        title: "Niveaux de maîtrise",
        text: "Choisissez un niveau parmi les options (Courant, Intermédiaire, etc.). Le niveau s'affiche en points sur le site.",
      },
      {
        title: "Layout",
        text: "En mode « Cartes », les langues s'affichent en grille avec des pastilles de niveau. En mode « Liste », c'est une présentation éditoriale.",
        link: { label: "Changer le layout", section: "config" },
      },
    ],
  },
  interests: {
    title: "Centres d'intérêt",
    tips: [
      {
        title: "Personnalisation",
        text: "Ajoutez vos centres d'intérêt avec un nom, une description et une icône. L'icône est choisie parmi une bibliothèque de 140+ icônes Lucide.",
      },
      {
        title: "Utilité",
        text: "Cette section humanise votre profil. Même en dehors du travail, vos passions donnent du caractère à votre portfolio.",
      },
    ],
  },
  services: {
    title: "Services",
    tips: [
      {
        title: "Ce que vous proposez",
        text: "Décrivez les services que vous offrez (consulting, développement, design…). Chaque service a un titre, une icône et une description.",
      },
      {
        title: "Icônes",
        text: "Choisissez une icône qui représente chaque service. La bibliothèque contient 140+ icônes organisées par domaine (Design, Tech, Business…).",
      },
    ],
  },
  resume: {
    title: "Parcours",
    tips: [
      {
        title: "Expériences",
        text: "Ajoutez chaque poste avec le titre, l'entreprise, la période, le lieu, le type de contrat et les détails. Les achievements en gras ressortent sur le site.",
      },
      {
        title: "Formations",
        text: "Dans l'onglet Formations, ajoutez vos diplômes avec l'institution, la période et le mémoire si pertinent.",
      },
      {
        title: "Ordre",
        text: "Vous pouvez choisir l'ordre des deux blocs dans Config → Parcours (expériences d'abord ou formations d'abord).",
        link: { label: "Voir Config", section: "config" },
      },
    ],
  },
  portfolio: {
    title: "Projets",
    tips: [
      {
        title: "Ajouter un projet",
        text: "Chaque projet a un titre, des catégories, un lien, une description, une vignette et des images. Les images se téléversent directement dans le stockage.",
      },
      {
        title: "Catégories",
        text: "Les catégories permettent de filtrer les projets sur le site. Ajoutez-en plusieurs (séparées par des virgules) pour un filtrage fin.",
      },
      {
        title: "Layout",
        text: "En mode « Cartes », les projets s'affichent en grille avec vignettes. En mode « Liste », c'est une présentation détaillée.",
        link: { label: "Changer le layout", section: "config" },
      },
    ],
  },
  blog: {
    title: "Journal",
    tips: [
      {
        title: "Articles",
        text: "Ajoutez des articles avec un titre, une date, un extrait, le contenu complet et une image. Utile pour du blogging ou des notes de recherche.",
      },
      {
        title: "Contenu",
        text: "Le champ contenu supporte le texte enrichi. Écrivez des articles de qualité — ils améliorent votre référencement (SEO).",
      },
    ],
  },
  visitors: {
    title: "Visiteurs",
    tips: [
      {
        title: "Suivi automatique",
        text: "Les visites sont enregistrées automatiquement (navigateur, plateforme, nouveau/retour). Aucune action requise de votre part.",
      },
      {
        title: "Purge",
        text: "Les données de plus de 90 jours sont automatiquement supprimées quotidiennement pour garder la base légère.",
      },
    ],
  },
  messages: {
    title: "Messages",
    tips: [
      {
        title: "Boîte de réception",
        text: "Les messages du formulaire de contact arrivent ici. Prévisualisez-les en cliquant sur l'œil, et marquez-les comme traités.",
      },
      {
        title: "Répondre",
        text: "Le bouton « Répondre » (✉️) ouvre votre client email avec le destinataire pré-rempli. Utile pour répondre rapidement depuis votre boîte mail.",
      },
      {
        title: "Export CSV",
        text: "Vous pouvez exporter tous vos messages en CSV pour les sauvegarder ou les analyser dans un tableur.",
      },
    ],
  },
  site: {
    title: "Paramètres",
    tips: [
      {
        title: "Identité du site",
        text: "Le nom du site, le slogan et le texte de pied de page s'affichent sur le portfolio public.",
      },
      {
        title: "Logo & Favicon",
        text: "Le logo remplace le nom du site dans le header. La favicon est l'icône de l'onglet du navigateur.",
      },
      {
        title: "SEO",
        text: "Le titre meta, la description et l'auteur affectent votre référencement Google et les partages sur les réseaux sociaux.",
      },
      {
        title: "Scripts personnalisés",
        text: "Vous pouvez injecter du HTML/JS dans le <head> ou avant </body> (analytics, chat, pixel…). Code de confiance uniquement.",
      },
      {
        title: "Sauvegarde JSON",
        text: "Exportez tout votre contenu en un fichier JSON. Utile pour sauvegarder, migrer ou quitter la plateforme sans rien perdre.",
      },
    ],
  },
  integrations: {
    title: "Intégrations",
    tips: [
      {
        title: "DeepL",
        text: "La clé API DeepL (offre gratuite) permet la traduction automatique FR → EN de tout votre contenu. Entrez-la ici.",
      },
      {
        title: "Google Analytics",
        text: "Renseignez votre ID GA pour suivre les visiteurs en parallèle des stats internes.",
      },
      {
        title: "Notifications email",
        text: "Vous recevez un email de notification quand un visiteur vous contacte via le formulaire. Désactivez si vous ne voulez pas d'email.",
      },
      {
        title: "SMTP Gmail",
        text: "Pour des notifications plus fiables, activez SMTP avec un mot de passe d'application Gmail. Le guide intégré vous explique la marche à suivre.",
      },
    ],
  },
  appearance: {
    title: "Apparence",
    tips: [
      {
        title: "Thèmes de couleurs",
        text: "10 palettes harmonieuses, chacune avec un mode clair et sombre. Cliquez sur un thème pour l'appliquer instantanément.",
      },
      {
        title: "Designs",
        text: "3 styles distincts qui changent la typographie, les formes et la profondeur : Éditorial, Moderne ou Minimal.",
      },
      {
        title: "Mode maintenance",
        text: "Activez-le pour masquer le site public aux visiteurs. Vous gardez accès au dashboard.",
      },
    ],
  },
  security: {
    title: "Sécurité",
    tips: [
      {
        title: "Identifiants de connexion",
        text: "Changez immédiatement l'email et le mot de passe par défaut. Les identifiants actuels sont connus publiquement.",
      },
      {
        title: "Mode maintenance",
        text: "Activez-le pour afficher une page de maintenance au lieu du site. Les visiteurs ne voient plus votre portfolio.",
        link: { label: "Voir Apparence", section: "appearance" },
      },
      {
        title: "Restauration usine",
        text: "Vide tout le contenu (projets, articles, messages) en un clic. Le compte admin est conservé. Tapez RESTAURER pour confirmer.",
      },
      {
        title: "Charger la démo",
        text: "Re-peuple le portfolio avec les données d'exemple (Camille Roussel). Utile après une restauration ou pour tester.",
      },
      {
        title: "Exporter avant de tout effacer",
        text: "Utilisez Paramètres → Exporter tout (JSON) avant une restauration. C'est votre filet de sécurité.",
        link: { label: "Voir Paramètres", section: "site" },
      },
    ],
  },
};

// Default help for sections not in the registry
const DEFAULT_HELP: { title: string; tips: HelpTip[] } = {
  title: "Aide",
  tips: [
    {
      title: "Navigation",
      text: "Utilisez le menu de gauche pour naviguer entre les sections. Chaque section gère un aspect de votre portfolio.",
    },
  ],
};

export function HelpTour({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate: (section: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const sectionHelp = SECTION_HELP[activeSection] ?? DEFAULT_HELP;
  const tips = sectionHelp.tips;
  const currentTip = tips[tipIndex];

  // Reset tip index when section changes
  useEffect(() => {
    setTipIndex(0);
  }, [activeSection]);

  const next = useCallback(() => {
    setTipIndex((prev) => Math.min(prev + 1, tips.length - 1));
  }, [tips.length]);

  const prev = useCallback(() => {
    setTipIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Help toggle button */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title={`Aide — ${sectionHelp.title}`}
        onClick={() => {
          setOpen((o) => !o);
          setTipIndex(0);
        }}
        className="relative"
      >
        <HelpCircle className="size-4" />
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-(--studio-accent) opacity-50" />
            <span className="relative inline-flex size-2.5 rounded-full bg-(--studio-accent)" />
          </span>
        )}
      </Button>

      {/* Help panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-4 text-(--studio-accent)" />
                <p className="text-sm font-medium text-foreground">
                  {sectionHelp.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Tip content */}
            <div className="px-4 py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeSection}-${tipIndex}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.12 }}
                >
                  <p className="text-[13px] font-medium text-foreground">
                    {currentTip.title}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                    {currentTip.text}
                  </p>
                  {currentTip.link && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(currentTip.link!.section);
                        setOpen(false);
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-(--studio-accent) hover:underline"
                    >
                      {currentTip.link.label}
                      <ChevronRight className="size-3" />
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
              <span className="text-[11px] text-muted-foreground">
                {tipIndex + 1} / {tips.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={tipIndex === 0}
                  onClick={prev}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={tipIndex >= tips.length - 1}
                  onClick={next}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
