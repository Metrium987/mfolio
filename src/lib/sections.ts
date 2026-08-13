/**
 * Orderable portfolio section identifiers, shared between the Convex backend
 * (seed, settings schema) and the React frontend (landing render order, admin
 * reorder UI).
 *
 * The hero (en-tête — the owner's name, portrait, taglines, description and
 * action buttons) is the "À propos" section of the portfolio. It is always
 * the first section of the page and is deliberately NOT part of the orderable
 * list below — it cannot be moved or duplicated.
 *
 * The default order of the remaining sections follows the standard French CV
 * structure (résumé → compétences → langues → centres d'intérêt), followed by
 * the portfolio-specific sections: services, projects, journal and contact.
 */
export const SECTION_IDS = [
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
  resume: "Parcours",
  skills: "Compétences",
  languages: "Langues",
  interests: "Centres d'intérêt",
  services: "Services",
  portfolio: "Projets",
  blog: "Journal",
  contact: "Contact",
};
