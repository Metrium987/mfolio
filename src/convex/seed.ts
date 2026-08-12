import { mutation } from "./_generated/server";
import type { Infer } from "convex/values";
import {
  aboutValidator,
  blogValidator,
  contactValidator,
  heroValidator,
  portfolioValidator,
  resumeValidator,
  servicesValidator,
  settingsValidator,
  skillsValidator,
} from "./schema";

/**
 * Sample content seeded the first time the app runs (Ezfolio ships with
 * demo content — the owner replaces it from the admin dashboard).
 */

const sampleSettings: Infer<typeof settingsValidator> = {
  siteName: "Camille Roussel",
  tagline: "Designer produit & développeuse",
  footerText:
    "Conçu et développé avec soin. Les textes et images sont modifiables depuis le tableau de bord.",
  themeColor: "#A85B32",
};

const sampleHero: Infer<typeof heroValidator> = {
  name: "Camille Roussel",
  title: "Designer produit & développeuse front-end",
  subtitle: "Des interfaces claires, utiles et élégantes.",
  intro:
    "Basée à Lyon, j'accompagne studios et startups de l'idée au produit : recherche, design system et code de production avec React. Je crois aux outils simples, aux détails soignés et aux interfaces qui tiennent leurs promesses.",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  socials: [
    { name: "GitHub", url: "https://github.com/" },
    { name: "LinkedIn", url: "https://linkedin.com/" },
    { name: "Dribbble", url: "https://dribbble.com/" },
    { name: "X", url: "https://x.com/" },
  ],
  buttons: [
    { label: "Me contacter", url: "#contact", style: "primary" },
    { label: "Télécharger le CV", url: "#about", style: "outline" },
  ],
  visibility: true,
};

const sampleAbout: Infer<typeof aboutValidator> = {
  title: "À propos",
  description:
    "Depuis huit ans, je conçois et je construis des produits numériques pour des équipes de toutes tailles — jeunes pousses, studios et grands comptes.\n\nMon approche est simple : comprendre le problème avant de dessiner la solution, prototyper vite, et livrer un code propre, accessible et durable.\n\nQuand je ne suis pas derrière un écran, je donne des ateliers de design, j'écris sur mon journal et je photographie les façades de Lyon.",
  imageUrl:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  resumeUrl: "",
  visibility: true,
};

const sampleSkills: Infer<typeof skillsValidator> = {
  title: "Compétences",
  description: "Les outils et savoir-faire que j'utilise au quotidien.",
  items: [
    { name: "React", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Node.js", level: 80 },
    { name: "Figma", level: 92 },
    { name: "Tailwind CSS", level: 88 },
    { name: "Design systems", level: 85 },
    { name: "Recherche utilisateur", level: 75 },
    { name: "Motion & interaction", level: 70 },
  ],
  visibility: true,
};

const sampleServices: Infer<typeof servicesValidator> = {
  title: "Services",
  description:
    "Ce que je peux faire pour vous — du premier croquis au déploiement.",
  items: [
    {
      name: "Design d'interface",
      description:
        "Maquettes, prototypes interactifs et design systems cohérents, pensés pour vos utilisateurs.",
      icon: "PenTool",
    },
    {
      name: "Développement web",
      description:
        "Applications React rapides, accessibles et faciles à maintenir, de la maquette à la mise en production.",
      icon: "Code",
    },
    {
      name: "Identité visuelle",
      description:
        "Direction artistique, logotypes et chartes graphiques qui racontent votre histoire.",
      icon: "Palette",
    },
    {
      name: "Conseil & audit",
      description:
        "Revue UX/UI de produits existants, avec un plan d'action priorisé et chiffré.",
      icon: "Compass",
    },
  ],
  visibility: true,
};

const sampleResume: Infer<typeof resumeValidator> = {
  title: "Parcours",
  description: "Mon expérience et ma formation.",
  experiences: [
    {
      title: "Designer produit senior",
      company: "Atelier Nord",
      date: "2022 — Aujourd'hui",
      description:
        "Refonte complète du produit phare (SaaS analytics). Mise en place du design system, pilotage des tests utilisateurs et accompagnement de deux designers juniors.",
    },
    {
      title: "Développeuse front-end",
      company: "Studio Hémisphère",
      date: "2020 — 2022",
      description:
        "Développement de sites et d'applications React pour des clients culturels et éditoriaux. Veille technique et contribution au socle de composants du studio.",
    },
    {
      title: "UX/UI Designer indépendante",
      company: "Freelance",
      date: "2018 — 2020",
      description:
        "Accompagnement de startups en early-stage : cadrage, wireframes, design d'interfaces et premiers prototypes haute fidélité.",
    },
  ],
  educations: [
    {
      title: "Master Design numérique",
      institution: "Université Lumière Lyon 2",
      date: "2016 — 2018",
      description:
        "Spécialisation design d'interaction, ergonomie des interfaces et recherche utilisateur.",
    },
    {
      title: "Licence Informatique",
      institution: "Université Claude Bernard Lyon 1",
      date: "2013 — 2016",
      description:
        "Fondamentaux de l'algorithmique, du développement web et des bases de données.",
    },
  ],
  visibility: true,
};

const samplePortfolio: Infer<typeof portfolioValidator> = {
  title: "Portfolio",
  description: "Une sélection de projets récents.",
  projects: [
    {
      name: "Maison — site éditorial",
      description:
        "Un magazine en ligne : direction artistique, design system éditorial et site React statique, noté 98/100 aux audits.",
      category: "Web",
      imageUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
      sourceUrl: "https://github.com/",
      demoUrl: "https://example.com/",
    },
    {
      name: "Aurora — design system",
      description:
        "Bibliothèque de composants Figma + React pour une équipe produit de 20 personnes : tokens, documentation et tests.",
      category: "Design",
      imageUrl:
        "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
      sourceUrl: "https://github.com/",
      demoUrl: "https://example.com/",
    },
    {
      name: "Kiosk — app mobile",
      description:
        "Application de billetterie pensée pour les petites salles de concert : paiement en deux écrans, mode hors-ligne.",
      category: "Produit",
      imageUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      sourceUrl: "https://github.com/",
      demoUrl: "https://example.com/",
    },
    {
      name: "Traces — portfolio interactif",
      description:
        "Site expérimental en Three.js : une déambulation scénarisée dans les archives d'un photographe.",
      category: "Web",
      imageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      sourceUrl: "https://github.com/",
      demoUrl: "https://example.com/",
    },
    {
      name: "Jardin Public — identité",
      description:
        "Identité visuelle pour une pépinière urbaine : logotype, typographies, papeterie et signalétique.",
      category: "Design",
      imageUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      sourceUrl: "https://github.com/",
      demoUrl: "https://example.com/",
    },
    {
      name: "Voisin — réseau de quartier",
      description:
        "Du research au MVP : entretiens, parcours de partage entre voisins, prototype testé sur 60 foyers lyonnais.",
      category: "Produit",
      imageUrl:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      sourceUrl: "https://github.com/",
      demoUrl: "https://example.com/",
    },
  ],
  visibility: true,
};

const sampleBlog: Infer<typeof blogValidator> = {
  title: "Journal",
  description: "Notes de travail, réflexions et retours d'expérience.",
  posts: [
    {
      title: "Pourquoi j'ai remplacé mon portefolio par un CMS",
      date: "12 juin 2026",
      excerpt:
        "Je passe plus de temps à mettre à jour mon site qu'à le coder. Voici comment j'ai organisé mon contenu autour d'un tableau de bord simple.",
      content:
        "Pendant des années, mon portfolio était un projet React versionné à la main : chaque ajout de projet demandait une pull request, une revue et un déploiement.\n\nEn le remplaçant par un petit CMS à document unique par section, tout a changé : je mets à jour mon site depuis le tableau de bord, en deux minutes, sans toucher au code.\n\nMon conseil : ne sous-estimez pas le coût d'édition. Un portfolio vit de ses mises à jour — il faut que la publication soit plus rapide que la procrastination.",
      imageUrl:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Design systems : 5 leçons apprises sur le terrain",
      date: "2 mai 2026",
      excerpt:
        "Après trois années à construire et maintenir des design systems, voici ce qui marche vraiment — et ce que j'aurais aimé savoir plus tôt.",
      content:
        "Un design system n'est pas une bibliothèque de composants : c'est un contrat entre les équipes.\n\n1. Commencez par les tokens, pas par les boutons.\n2. Documentez les usages, pas seulement les propriétés.\n3. Acceptez le legacy : migrez par incréments.\n4. Chaque composant a un propriétaire.\n5. La gouvernance vaut plus que la perfection.\n\nLe plus difficile n'est jamais de dessiner les composants — c'est de faire en sorte qu'ils soient adoptés, compris et challengés.",
      imageUrl:
        "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Réaliser des maquettes accessibles dès le premier jour",
      date: "18 mars 2026",
      excerpt:
        "L'accessibilité se décide à la phase de design. Quelques réflexes simples qui évitent des refontes coûteuses.",
      content:
        "Contraste, taille des cibles tactiles, ordre de lecture, états de focus : autant de décisions qui appartiennent au design, pas seulement au développement.\n\nTrois réflexes concrets :\n\n• Vérifiez les contrastes dans le fichier de maquette (pas après coup).\n• Dessinez toujours les états focus, hover et disabled.\n• Testez votre prototype au clavier une fois par semaine.\n\nL'accessibilité n'est pas une contrainte : c'est la qualité de base d'un produit numérique.",
      imageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  visibility: true,
};

const sampleContact: Infer<typeof contactValidator> = {
  title: "Contact",
  description:
    "Un projet en tête ? Une question ? Écrivez-moi — je réponds sous 48 heures.",
  email: "bonjour@camilleroussel.fr",
  phone: "+33 6 12 34 56 78",
  address: "Lyon, France",
  socials: [
    { name: "GitHub", url: "https://github.com/" },
    { name: "LinkedIn", url: "https://linkedin.com/" },
    { name: "Dribbble", url: "https://dribbble.com/" },
    { name: "X", url: "https://x.com/" },
  ],
  visibility: true,
};

/**
 * Seeds all portfolio content once (idempotent — no-op when already seeded).
 * Called from the landing page and the dashboard on first load.
 */
export const ensureSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) return;

    await ctx.db.insert("settings", sampleSettings);
    await ctx.db.insert("hero", sampleHero);
    await ctx.db.insert("about", sampleAbout);
    await ctx.db.insert("skills", sampleSkills);
    await ctx.db.insert("services", sampleServices);
    await ctx.db.insert("resume", sampleResume);
    await ctx.db.insert("portfolio", samplePortfolio);
    await ctx.db.insert("blog", sampleBlog);
    await ctx.db.insert("contact", sampleContact);
  },
});
