import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Palette,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { THEME_PRESETS } from "@/lib/themes";

// ---------------------------------------------------------------------------
// SetupWizard — first-time onboarding form.
//
// Step 1: Identity — name, email, phone, address, tagline picker
// Step 2: Appearance — theme preset picker
// Step 3: Confirmation — "Your portfolio is ready"
//
// Writes directly to Convex via setupWizardData mutation.
// ---------------------------------------------------------------------------

const SUGGESTED_TAGLINES = [
  "Designer produit & développeuse",
  "Développeur full-stack passionné",
  "Ingénieur logiciel & architecte web",
  "Designer UI/UX & créatif digital",
  "Chef de projet technique & innovant",
  "Consultant en transformation digitale",
  "Freelance polyvalent & autonome",
  "Créatif & développeur web",
  "Spécialiste React & TypeScript",
  "Lead developer & mentor technique",
];

type WizardStep = "identity" | "appearance" | "done";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
};

export function SetupWizard({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const setupWizardData = useMutation(api.siteMutations.setupWizardData);

  const [step, setStep] = useState<WizardStep>("identity");
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedTaglines, setSelectedTaglines] = useState<string[]>([]);
  const [customTagline, setCustomTagline] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("studio");

  const toggleTagline = useCallback((tagline: string) => {
    setSelectedTaglines((prev) =>
      prev.includes(tagline)
        ? prev.filter((t) => t !== tagline)
        : [...prev, tagline].slice(0, 3),
    );
  }, []);

  const addCustomTagline = useCallback(() => {
    const trimmed = customTagline.trim();
    if (trimmed && !selectedTaglines.includes(trimmed)) {
      setSelectedTaglines((prev) => [...prev, trimmed].slice(0, 3));
      setCustomTagline("");
    }
  }, [customTagline, selectedTaglines]);

  const allTaglines =
    selectedTaglines.length > 0
      ? selectedTaglines
      : customTagline.trim()
        ? [customTagline.trim()]
        : [];

  const handleFinish = async () => {
    if (!name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    setSaving(true);
    try {
      await setupWizardData({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        taglines: allTaglines,
        themePreset: selectedTheme,
      });
      toast.success("Votre portfolio est configuré !");
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const progress =
    step === "identity" ? 33 : step === "appearance" ? 66 : 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onComplete}
        className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title="Fermer le wizard"
      >
        <X className="size-5" />
      </button>

      <div className="w-full max-w-lg px-5">
        {/* Progress bar */}
        <div className="mb-6 h-0.5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-(--studio-accent)"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {(["identity", "appearance", "done"] as const).map((s, i) => {
            const labels = ["Identité", "Apparence", "Terminé"];
            const isActive =
              s === step ||
              (step === "done" && s === "done");
            const isDone =
              (step === "appearance" && s === "identity") ||
              (step === "done");
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex size-7 items-center justify-center rounded-full border text-xs font-medium transition-all ${
                    isDone
                      ? "border-transparent bg-(--studio-accent) text-white"
                      : isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="size-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-xs ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}
                >
                  {labels[i]}
                </span>
                {i < 2 && (
                  <div
                    className={`h-px w-6 transition-colors ${isDone ? "bg-(--studio-accent)" : "bg-border"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === "identity" && (
              <div>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-card text-(--studio-accent)">
                    <User className="size-6" />
                  </div>
                  <h2 className="font-display text-2xl font-light tracking-tight text-foreground">
                    Qui êtes-vous ?
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ces informations pré-rempliront votre portfolio. Vous
                    pourrez tout modifier ensuite.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                      Nom complet *
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex. Marie Dupont"
                      className="h-10"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="marie@example.com"
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                        Téléphone
                      </label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                      Ville / Adresse
                    </label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Lyon, France"
                      className="h-10"
                    />
                  </div>

                  {/* Tagline picker */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                      Phrase d'accroche{" "}
                      <span className="text-muted-foreground">
                        (jusqu'à 3, optionnel)
                      </span>
                    </label>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Ces phrases défilent sous votre nom sur le site. Choisissez
                      celles qui vous représentent.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_TAGLINES.map((tagline) => {
                        const isSelected =
                          selectedTaglines.includes(tagline);
                        return (
                          <button
                            key={tagline}
                            type="button"
                            onClick={() => toggleTagline(tagline)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                              isSelected
                                ? "border-(--studio-accent) bg-(--studio-accent)/10 text-(--studio-accent)"
                                : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                            }`}
                          >
                            {isSelected && (
                              <Check className="mr-1 inline size-3" />
                            )}
                            {tagline}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom tagline */}
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={customTagline}
                        onChange={(e) => setCustomTagline(e.target.value)}
                        placeholder="Ou écrivez la vôtre…"
                        className="h-9 flex-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomTagline();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomTagline}
                        disabled={!customTagline.trim()}
                        className="shrink-0 rounded-full"
                      >
                        Ajouter
                      </Button>
                    </div>

                    {selectedTaglines.length > 0 && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {selectedTaglines.length}/3 sélectionnée
                        {selectedTaglines.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === "appearance" && (
              <div>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-card text-(--studio-accent)">
                    <Palette className="size-6" />
                  </div>
                  <h2 className="font-display text-2xl font-light tracking-tight text-foreground">
                    Choisissez votre thème
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    L'ambiance visuelle de votre portfolio. Vous pourrez changer
                    à tout moment depuis Apparence.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = selectedTheme === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedTheme(preset.id)}
                        className={`group relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all ${
                          isSelected
                            ? "border-(--studio-accent) ring-1 ring-(--studio-accent)/30"
                            : "border-border hover:border-foreground/30"
                        }`}
                      >
                        {/* Mini color preview */}
                        <div className="mb-2 flex gap-1">
                          <div
                            className="size-5 rounded-full border border-black/10"
                            style={{ backgroundColor: preset.light.background }}
                          />
                          <div
                            className="size-5 rounded-full border border-black/10"
                            style={{ backgroundColor: preset.light.card }}
                          />
                          <div
                            className="size-5 rounded-full border border-black/10"
                            style={{ backgroundColor: preset.light.ink }}
                          />
                          <div
                            className="size-5 rounded-full border border-black/10"
                            style={{ backgroundColor: preset.light.border }}
                          />
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          {preset.label}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {preset.description}
                        </p>
                        {isSelected && (
                          <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-(--studio-accent) text-white">
                            <Check className="size-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === "done" && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-(--studio-accent)/10 text-(--studio-accent)">
                  <Check className="size-7" />
                </div>
                <h2 className="font-display text-2xl font-light tracking-tight text-foreground">
                  C'est prêt !
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Votre portfolio a été pré-rempli avec vos informations.{" "}
                  {name && (
                    <>
                      <strong>{name}</strong> s'affiche déjà sur le site.
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vous pouvez maintenant ajouter votre parcours, vos compétences
                  et vos projets depuis le tableau de bord.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDirection(-1);
              setStep("identity");
            }}
            disabled={step === "identity"}
            className="rounded-full"
          >
            <ArrowLeft className="size-4 mr-1" />
            Précédent
          </Button>

          <div className="flex items-center gap-2">
            {step === "identity" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDirection(1);
                  setStep("appearance");
                }}
                className="rounded-full"
              >
                Passer
              </Button>
            )}
            {step === "identity" && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setDirection(1);
                  setStep("appearance");
                }}
                disabled={!name.trim()}
                className="rounded-full"
              >
                Suivant
                <ArrowRight className="size-4 ml-1" />
              </Button>
            )}
            {step === "appearance" && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setDirection(1);
                  handleFinish();
                }}
                disabled={saving}
                className="rounded-full"
              >
                {saving ? (
                  <Loader2 className="size-4 mr-1 animate-spin" />
                ) : (
                  <Check className="size-4 mr-1" />
                )}
                Terminer
              </Button>
            )}
            {step === "done" && (
              <Button type="button" size="sm" onClick={onComplete} className="rounded-full">
                Voir le tableau de bord
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
