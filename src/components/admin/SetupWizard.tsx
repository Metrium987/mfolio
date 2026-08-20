import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  TrendingUp,
  Palette,
  Eye,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// SetupWizard — one-shot onboarding wizard for first-time admin login.
//
// The wizard guides the owner through 5 steps to personalize the portfolio.
// It does NOT write any data — each step links to the relevant admin section
// where the user can edit and save. The wizard is purely navigational guidance.
//
// Props:
//   onNavigate(sectionId) — callback to switch the dashboard active tab
//   onClose()             — callback to dismiss the wizard and mark it completed
// ---------------------------------------------------------------------------

type WizardStep = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof User;
  section: string; // Dashboard nav id to navigate to
  tips: string[];
  accent: string; // CSS color for step accent
};

const STEPS: WizardStep[] = [
  {
    id: "identity",
    title: "Identité",
    subtitle: "Qui êtes-vous ? Vos visiteurs verront ces informations en premier.",
    icon: User,
    section: "about",
    tips: [
      "Ajoutez votre nom complet — il sera affiché en gros dans le hero du site",
      "Téléversez une photo de profil (portrait) et une photo de couverture",
      "Renseignez votre email, téléphone et ville",
    ],
    accent: "var(--studio-accent)",
  },
  {
    id: "experience",
    title: "Parcours",
    subtitle: "Mettez en avant vos expériences professionnelles et formations.",
    icon: Briefcase,
    section: "resume",
    tips: [
      "Ajoutez vos expériences avec le bouton « Ajouter une expérience »",
      "Remplissez le poste, l'entreprise, la période et les détails",
      "Puis ajoutez vos formations dans l'onglet « Formations »",
    ],
    accent: "var(--studio-accent)",
  },
  {
    id: "skills",
    title: "Compétences",
    subtitle: "Listez vos compétences techniques et non-techniques.",
    icon: TrendingUp,
    section: "skills",
    tips: [
      "Ajoutez vos compétences avec un nom et un niveau (1 à 5)",
      "Les niveaux sont visibles sur le site sous forme de barres",
      "Vous pouvez réorganiser l'ordre avec les flèches ↑↓ ou en glissant",
    ],
    accent: "var(--studio-accent)",
  },
  {
    id: "design",
    title: "Apparence",
    subtitle: "Choisissez le thème et le design qui correspondent à votre style.",
    icon: Palette,
    section: "appearance",
    tips: [
      "Explorez les 10 thèmes de couleurs — chacun a un mode clair et sombre",
      "Choisissez un design : Éditorial, Moderne ou Minimal",
      "Vous pouvez changer à tout moment sans rien perdre",
    ],
    accent: "var(--studio-accent)",
  },
  {
    id: "publish",
    title: "Publier",
    subtitle: "Consultez votre portfolio et partagez-le au monde.",
    icon: Eye,
    section: "overview",
    tips: [
      "Cliquez « Voir le site » dans le menu pour prévisualiser votre portfolio",
      "Copiez l'URL et partagez-la sur LinkedIn, en signature d'email, etc.",
      "Le SEO est déjà configuré — personnalisez-le dans Paramètres si besoin",
    ],
    accent: "var(--studio-accent)",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
};

export function SetupWizard({
  onNavigate,
  onClose,
}: {
  onNavigate: (section: string) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    }
  };
  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleGoToSection = () => {
    onNavigate(current.section);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title="Fermer le guide"
      >
        <X className="size-5" />
      </button>

      <div className="w-full max-w-lg px-5">
        {/* Progress bar */}
        <div className="mb-8 h-0.5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: current.accent }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full border text-xs font-medium transition-all ${
                  i < step
                    ? "border-transparent bg-(--studio-accent) text-white"
                    : i === step
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-6 transition-colors ${
                    i < step ? "bg-(--studio-accent)" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content with animation */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="text-center"
          >
            {/* Icon */}
            <div
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-border bg-card"
              style={{ color: current.accent }}
            >
              <Icon className="size-6" />
            </div>

            {/* Title + subtitle */}
            <h2 className="font-display text-2xl font-light tracking-tight text-foreground">
              {current.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {current.subtitle}
            </p>

            {/* Tips */}
            <div className="mt-6 space-y-2.5 text-left">
              {current.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-md border border-border bg-card px-4 py-3"
                >
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor: current.accent,
                      color: "white",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[13px] leading-relaxed text-muted-foreground">
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={step === 0}
            className="rounded-full"
          >
            <ArrowLeft className="size-4 mr-1" />
            Précédent
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGoToSection}
              className="rounded-full"
            >
              Ouvrir « {current.title} »
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                size="sm"
                onClick={goNext}
                className="rounded-full"
              >
                Suivant
                <ArrowRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={onClose}
                className="rounded-full"
              >
                <Check className="size-4 mr-1" />
                Terminer
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
