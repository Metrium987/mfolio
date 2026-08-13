/**
 * Portfolio section identifiers, shared between the Convex backend (seed,
 * settings schema) and the React frontend (landing render order, admin
 * reorder UI).
 *
 * The default order follows the standard French CV structure
 * (en-tête → résumé → expérience → formation → compétences → langues →
 * centres d'intérêt), followed by the portfolio-specific sections:
 * services, projects, journal and contact.
 */
export const SECTION_IDS = [
  "about",
  "resume",
  "skills",
  "languages",
  "interests",
  "services",
  "portfolio",
  "blog",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const DEFAULT_SECTION_ORDER: SectionId[] = [...SECTION_IDS];

/** Human labels for the admin reorder UI (dashboard language is French). */
export const SECTION_LABELS: Record<SectionId, string> = {
  about: "À propos",
  resume: "Parcours",
  skills: "Compétences",
  languages: "Langues",
  interests: "Centres d'intérêt",
  services: "Services",
  portfolio: "Projets",
  blog: "Journal",
  contact: "Contact",
};
