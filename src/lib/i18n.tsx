import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SiteLang = "fr" | "en";

const STORAGE_KEY = "mfolio_lang";

/**
 * Hardcoded site chrome (nav, buttons, section labels…). DeepL translates the
 * owner's content; these UI strings ship with the app in both languages.
 */
export const UI_STRINGS = {
  "nav.skills": { fr: "Compétences", en: "Skills" },
  "nav.services": { fr: "Services", en: "Services" },
  "nav.resume": { fr: "Parcours", en: "Resume" },
  "nav.portfolio": { fr: "Projets", en: "Projects" },
  "nav.blog": { fr: "Journal", en: "Journal" },
  "nav.languages": { fr: "Langues", en: "Languages" },
  "nav.interests": { fr: "Intérêts", en: "Interests" },
  "nav.contact": { fr: "Contact", en: "Contact" },
  "header.admin": { fr: "Admin", en: "Admin" },
  "header.menu": { fr: "Menu", en: "Menu" },
  "header.email": { fr: "Email", en: "Email" },
  "header.themeDark": { fr: "Activer le mode sombre", en: "Enable dark mode" },
  "header.themeLight": { fr: "Activer le mode clair", en: "Enable light mode" },
  "footer.networks": { fr: "Réseaux", en: "Networks" },
  "footer.poweredBy": { fr: "Propulsé par", en: "Powered by" },
  "hero.contact": { fr: "Me contacter", en: "Contact me" },
  "hero.downloadCv": { fr: "Télécharger le CV", en: "Download CV" },
  "hero.printCv": { fr: "Imprimer / PDF", en: "Print / PDF" },
  "hero.printHint": {
    fr: "Imprime ou enregistre en PDF un CV propre (parcours et compétences).",
    en: "Print or save as PDF a clean CV (experience and skills).",
  },
  "hero.networks": { fr: "Réseaux & profils", en: "Networks & profiles" },
  "hero.portrait": { fr: "Fig. 01 — Portrait", en: "Fig. 01 — Portrait" },
  "hero.alt": { fr: "Portrait de", en: "Portrait of" },
  "skills.kicker": { fr: "Compétences", en: "Skills" },
  "skills.none": {
    fr: "Aucune compétence renseignée pour le moment.",
    en: "No skills listed yet.",
  },
  "services.kicker": { fr: "Services", en: "Services" },
  "resume.kicker": { fr: "Parcours", en: "Resume" },
  "resume.experience": { fr: "Expérience", en: "Experience" },
  "resume.education": { fr: "Formation", en: "Education" },
  "resume.noExperience": {
    fr: "Aucune expérience renseignée.",
    en: "No experience listed yet.",
  },
  "resume.noEducation": {
    fr: "Aucune formation renseignée.",
    en: "No education listed yet.",
  },
  "languages.kicker": { fr: "Langues", en: "Languages" },
  "languages.none": {
    fr: "Aucune langue renseignée pour le moment.",
    en: "No languages listed yet.",
  },
  "interests.kicker": { fr: "Centres d'intérêt", en: "Interests" },
  "interests.none": {
    fr: "Aucun centre d'intérêt renseigné pour le moment.",
    en: "No interests listed yet.",
  },
  "portfolio.kicker": { fr: "Portfolio", en: "Portfolio" },
  "portfolio.all": { fr: "Tous", en: "All" },
  "portfolio.project": { fr: "Projet", en: "Project" },
  "portfolio.role": { fr: "Rôle", en: "Role" },
  "portfolio.result": { fr: "Résultat", en: "Result" },
  "portfolio.viewProject": { fr: "Voir le projet", en: "View project" },
  "portfolio.noProjects": {
    fr: "Aucun projet dans cette catégorie.",
    en: "No projects in this category.",
  },
  "blog.kicker": { fr: "Journal", en: "Journal" },
  "blog.readMore": { fr: "Lire l'article →", en: "Read article →" },
  "blog.noPosts": {
    fr: "Aucun article publié pour le moment.",
    en: "No posts published yet.",
  },
  "contact.description": {
    fr: "Un projet en tête ? Une question ? Écrivez-moi — je réponds sous 48 heures.",
    en: "Have a project in mind? A question? Write to me — I reply within 48 hours.",
  },
  "contact.writeMe": { fr: "Écrivez-moi", en: "Write to me" },
  "contact.name": { fr: "Nom", en: "Name" },
  "contact.namePlaceholder": { fr: "Votre nom", en: "Your name" },
  "contact.email": { fr: "Email", en: "Email" },
  "contact.emailPlaceholder": { fr: "vous@exemple.fr", en: "you@example.com" },
  "contact.subject": { fr: "Sujet", en: "Subject" },
  "contact.subjectPlaceholder": {
    fr: "Mission, opportunité, question…",
    en: "Project, opportunity, question…",
  },
  "contact.message": { fr: "Message", en: "Message" },
  "contact.messagePlaceholder": {
    fr: "Parlez-moi de votre projet…",
    en: "Tell me about your project…",
  },
  "contact.send": { fr: "Envoyer le message", en: "Send message" },
  "contact.sending": { fr: "Envoi…", en: "Sending…" },
  "contact.sent": { fr: "Envoyé !", en: "Sent!" },
  "contact.phone": { fr: "Téléphone", en: "Phone" },
  "contact.location": { fr: "Localisation", en: "Location" },
  "contact.error": {
    fr: "L'envoi a échoué. Réessayez dans un instant.",
    en: "Sending failed. Please try again in a moment.",
  },
  "loading": { fr: "Chargement…", en: "Loading…" },
  "a11y.skipToContent": { fr: "Aller au contenu", en: "Skip to content" },
  "maintenance.title": { fr: "Site en maintenance", en: "Site under maintenance" },
  "maintenance.body": {
    fr: "Le portfolio est en cours de rafraîchissement. Revenez dans quelques instants — le propriétaire a activé le mode maintenance.",
    en: "The portfolio is being refreshed. Please come back in a few minutes — the owner enabled maintenance mode.",
  },
  "maintenance.owner": { fr: "Accès propriétaire", en: "Owner access" },
} as const;

export type UIStringKey = keyof typeof UI_STRINGS;

type SiteLangContextValue = {
  lang: SiteLang;
  setLang: (lang: SiteLang) => void;
  /** UI chrome string for the current language. */
  t: (key: UIStringKey) => string;
  /**
   * Content helper: returns the English mirror when EN is selected and the
   * mirror exists, otherwise the French source. `fr` may be an empty string.
   */
  pick: (fr: string, en?: string | null) => string;
};

const SiteLangContext = createContext<SiteLangContextValue | null>(null);

export function SiteLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>(() => {
    if (typeof window === "undefined") return "fr";
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "fr";
    } catch {
      return "fr";
    }
  });

  const setLang = useCallback((next: SiteLang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode) — in-memory only
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<SiteLangContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => UI_STRINGS[key][lang],
      pick: (fr, en) => (lang === "en" && en ? en : fr),
    }),
    [lang, setLang],
  );

  return (
    <SiteLangContext.Provider value={value}>{children}</SiteLangContext.Provider>
  );
}

export function useSiteLang(): SiteLangContextValue {
  const context = useContext(SiteLangContext);
  if (!context) {
    throw new Error("useSiteLang must be used within a SiteLangProvider");
  }
  return context;
}
