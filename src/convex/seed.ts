import { mutation } from "./_generated/server";
import type { Infer } from "convex/values";
import { levelToNumber, proficiencyToLevel } from "../lib/levels";
import { DEFAULT_SECTION_ORDER } from "../lib/sections";
import { getCurrentAdmin } from "./users";
import {
  aboutValidator,
  blogValidator,
  interestsValidator,
  languagesValidator,
  portfolioValidator,
  resumeValidator,
  servicesValidator,
  settingsValidator,
  siteValidator,
  skillsValidator,
} from "./schema";

const sampleSite: Infer<typeof siteValidator> = {
  siteName: "Camille Roussel",
  tagline: "Designer produit & développeuse",
  footerText:
    "Conçu et développé avec soin. Les textes et images sont modifiables depuis le tableau de bord.",
  logoUrl: "",
  faviconUrl: "",
};

const sampleSettings: Infer<typeof settingsValidator> = {
  themeColor: "#A85B32",
  themePreset: "studio",
  design: "editorial",
  googleAnalyticsId: "",
  deeplApiKey: "",
  notificationEmail: "",
  // SMTP off by default — Gmail values pre-filled, the owner just adds the
  // address + an app password (Intégrations) to switch off the relay.
  smtpEnabled: false,
  smtpHost: "smtp.gmail.com",
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: "",
  smtpPass: "",
  maintenanceMode: false,
  metaTitle: "Camille Roussel — Designer produit & développeuse",
  metaDescription:
    "Portfolio de Camille Roussel : design d'interface, développement web et identité visuelle. Contact pour tout projet.",
  metaAuthor: "Camille Roussel",
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
  contactNotifications: true,
  servicesLayout: "cards",
  interestsLayout: "cards",
  languagesLayout: "cards",
  skillsLayout: "cards",
  portfolioLayout: "cards",
  blogLayout: "cards",
  resumeOrder: "experience-first",
};

const sampleAbout: Infer<typeof aboutValidator> = {
  name: "Camille Roussel",
  email: "bonjour@camilleroussel.fr",
  phone: "+33 6 12 34 56 78",
  address: "Lyon, France",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  cover:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  description:
    "Depuis huit ans, je conçois et je construis des produits numériques pour des équipes de toutes tailles — jeunes pousses, studios et grands comptes.\n\nMon approche est simple : comprendre le problème avant de dessiner la solution, prototyper vite, et livrer un code propre, accessible et durable.\n\nQuand je ne suis pas derrière un écran, je donne des ateliers de design, j'écris sur mon journal et je photographie les façades de Lyon.",
  taglines: [
    "Designer produit & développeuse front-end",
    "Créatrice de design systems",
    "Photographe des façades lyonnaises",
  ],
  socials: [
    { title: "GitHub", link: "https://github.com/" },
    { title: "LinkedIn", link: "https://linkedin.com/" },
    { title: "Dribbble", link: "https://dribbble.com/" },
    { title: "X", link: "https://x.com/" },
  ],
  cvUrl: "",
};

const sampleSkills: Infer<typeof skillsValidator> = {
  title: "Compétences",
  description: "Les outils et savoir-faire que j'utilise au quotidien.",
  items: [
    { name: "React", proficiency: 5 },
    { name: "TypeScript", proficiency: 5 },
    { name: "Node.js", proficiency: 4 },
    { name: "Figma", proficiency: 5 },
    { name: "Tailwind CSS", proficiency: 4 },
    { name: "Design systems", proficiency: 4 },
    { name: "Recherche utilisateur", proficiency: 3 },
    { name: "Motion & interaction", proficiency: 4 },
  ],
};

const sampleServices: Infer<typeof servicesValidator> = {
  title: "Services",
  description:
    "Ce que je peux faire pour vous — du premier croquis au déploiement.",
  items: [
    {
      title: "Design d'interface",
      details:
        "Maquettes, prototypes interactifs et design systems cohérents, pensés pour vos utilisateurs.",
      icon: "PenTool",
    },
    {
      title: "Développement web",
      details:
        "Applications React rapides, accessibles et faciles à maintenir, de la maquette à la mise en production.",
      icon: "Code",
    },
    {
      title: "Identité visuelle",
      details:
        "Direction artistique, logotypes et chartes graphiques qui racontent votre histoire.",
      icon: "Palette",
    },
    {
      title: "Conseil & audit",
      details:
        "Revue UX/UI de produits existants, avec un plan d'action priorisé et chiffré.",
      icon: "Compass",
    },
  ],
};

const sampleResume: Infer<typeof resumeValidator> = {
  title: "Parcours",
  description: "Mon expérience et ma formation.",
  experiences: [
    {
      position: "Designer produit senior",
      company: "Atelier Nord",
      period: "2022 — Aujourd'hui",
      location: "Lyon, France",
      contractType: "CDI",
      details:
        "Refonte complète du produit phare (SaaS analytics). Mise en place du design system, pilotage des tests utilisateurs et accompagnement de deux designers juniors.",
      achievements: [
        "Refonte du produit phare adoptée par 3 000 équipes.",
        "Design system déployé et documenté, repris par 20 designers.",
        "Accompagnement de deux designers juniors.",
      ],
    },
    {
      position: "Développeuse front-end",
      company: "Studio Hémisphère",
      period: "2020 — 2022",
      location: "Paris, France",
      contractType: "CDD",
      details:
        "Développement de sites et d'applications React pour des clients culturels et éditoriaux. Veille technique et contribution au socle de composants du studio.",
      achievements: [
        "Développement de sites React pour des clients culturels et éditoriaux.",
        "Contribution au socle de composants réutilisables du studio.",
      ],
    },
    {
      position: "UX/UI Designer indépendante",
      company: "Freelance",
      period: "2018 — 2020",
      location: "Lyon, France",
      contractType: "Freelance",
      details:
        "Accompagnement de startups en early-stage : cadrage, wireframes, design d'interfaces et premiers prototypes haute fidélité.",
      achievements: [
        "Cadrage et wireframes pour des startups en early-stage.",
        "Design d'interfaces et premiers prototypes haute fidélité.",
      ],
    },
  ],
  educations: [
    {
      degree: "Master Design numérique",
      institution: "Université Lumière Lyon 2",
      period: "2016 — 2018",
      cgpa: "16,2 / 20",
      department: "Design d'interaction",
      thesis: "Les design systems comme outil de cohérence éditoriale",
    },
    {
      degree: "Licence Informatique",
      institution: "Université Claude Bernard Lyon 1",
      period: "2013 — 2016",
      cgpa: "14,8 / 20",
      department: "Informatique",
      thesis: "Développement web",
    },
  ],
};

const samplePortfolio: Infer<typeof portfolioValidator> = {
  title: "Portfolio",
  description: "Une sélection de projets récents.",
  projects: [
    {
      title: "Maison — site éditorial",
      categories: ["Web"],
      link: "https://example.com/",
      details:
        "Un magazine en ligne : direction artistique, design system éditorial et site React statique, noté 98/100 aux audits.",
      role: "Designer produit & développeur",
      result: "Score Lighthouse 98/100 · 40 000 lecteurs mensuels.",
      thumbnail:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Aurora — design system",
      categories: ["Design", "Produit"],
      link: "https://example.com/",
      details:
        "Bibliothèque de composants Figma + React pour une équipe produit de 20 personnes : tokens, documentation et tests.",
      role: "Design system lead",
      result: "Adopté par une équipe produit de 20 personnes.",
      thumbnail:
        "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Kiosk — app mobile",
      categories: ["Produit"],
      link: "https://example.com/",
      details:
        "Application de billetterie pensée pour les petites salles de concert : paiement en deux écrans, mode hors-ligne.",
      role: "Product designer",
      result: "Parcours de paiement réduit de 5 à 2 écrans.",
      thumbnail:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Traces — portfolio interactif",
      categories: ["Web"],
      link: "https://example.com/",
      details:
        "Site expérimental en Three.js : une déambulation scénarisée dans les archives d'un photographe.",
      role: "Développeur créatif",
      result: "Honorable mention — Awwwards.",
      thumbnail:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Jardin Public — identité",
      categories: ["Design"],
      link: "https://example.com/",
      details:
        "Identité visuelle pour une pépinière urbaine : logotype, typographies, papeterie et signalétique.",
      role: "Directeur artistique",
      result: "Identité déployée sur 12 points de vente.",
      thumbnail:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      title: "Voisin — réseau de quartier",
      categories: ["Produit", "Web"],
      link: "https://example.com/",
      details:
        "Du research au MVP : entretiens, parcours de partage entre voisins, prototype testé sur 60 foyers lyonnais.",
      role: "Designer & chercheur UX",
      result: "MVP testé auprès de 60 foyers lyonnais.",
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ],
};

// Levels are stored as 1–5 numbers; the cast keeps this sample valid while the
// schema transitions from free-text levels to the numeric scale.
const sampleLanguages = {
  title: "Langues",
  description: "Les langues que je parle au quotidien.",
  items: [
    { name: "Français", level: 5 },
    { name: "Anglais", level: 4 },
    { name: "Espagnol", level: 3 },
  ],
} as unknown as Infer<typeof languagesValidator>;

const sampleInterests: Infer<typeof interestsValidator> = {
  title: "Centres d'intérêt",
  description: "Ce qui nourrit ma pratique, en dehors des écrans.",
  items: [
    { name: "Photographie", details: "Façades et lumière naturelle", icon: "Camera" },
    { name: "Randonnée", details: "Sentiers du Rhône et des Alpes", icon: "Route" },
    { name: "Cuisine", details: "Pâtisserie et recettes de saison", icon: "ChefHat" },
  ],
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
};

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

const sampleMessages = [
  {
    name: "Alice Martin",
    email: "alice.martin@studio-exemple.fr",
    subject: "Mission freelance — refonte de site",
    message:
      "Bonjour, nous cherchons une designer produit pour accompagner la refonte de notre site vitrine (3 mois). Votre profil nous intéresse beaucoup — seriez-vous disponible ?",
    replied: false,
    createdAt: NOW - 2 * DAY,
  },
  {
    name: "Karim Benali",
    email: "karim.benali@cabinet-exemple.com",
    subject: "Opportunité CDI — poste de designer senior",
    message:
      "Madame, je vous contacte au nom d'un cabinet de recrutement spécialisé dans les métiers du numérique. Un de nos clients recherche un designer produit senior à Lyon. Pouvons-nous échanger ?",
    replied: true,
    createdAt: NOW - 6 * DAY,
  },
  {
    name: "Sofia Ricci",
    email: "sofia@exemple.io",
    subject: "Demande de conseil UX",
    message:
      "Bonjour, j'ai lu votre article sur les design systems et j'aimerais vos conseils pour structurer le nôtre (équipe de 5). Est-ce un service que vous proposez ?",
    replied: false,
    createdAt: NOW - 9 * DAY,
  },
];

const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge"];
const PLATFORMS = ["Windows", "macOS", "Android", "iOS"];

const sampleVisitors = Array.from({ length: 22 }, (_, index) => ({
  trackingId: `demo-${index}-${Math.random().toString(36).slice(2, 10)}`,
  isNew: index % 3 === 0,
  browser: BROWSERS[index % BROWSERS.length],
  platform: PLATFORMS[index % PLATFORMS.length],
  createdAt: NOW - (index + 1) * (DAY / 3) - Math.floor(Math.random() * 6) * 3600000,
}));

/**
 * Seeds all portfolio content once (idempotent — no-op when already seeded).
 * Called from the landing page and the dashboard on first load.
 *
 * When the schema changed between versions, stale docs from previous schemas
 * may still exist in the database (e.g. an old "settings" doc with a
 * different shape). To guarantee a clean slate matching the current model,
 * every managed table is wiped before inserting the samples — only when the
 * seed actually runs (i.e. the brand-new "site" table is empty).
 */
export const ensureSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const [
      site,
      settings,
      about,
      skills,
      services,
      resume,
      portfolio,
      blog,
      languages,
      interests,
    ] = await Promise.all([
      ctx.db.query("site").first(),
      ctx.db.query("settings").first(),
      ctx.db.query("about").first(),
      ctx.db.query("skills").first(),
      ctx.db.query("services").first(),
      ctx.db.query("resume").first(),
      ctx.db.query("portfolio").first(),
      ctx.db.query("blog").first(),
      ctx.db.query("languages").first(),
      ctx.db.query("interests").first(),
    ]);

    // A complete seed has one document per content table, and the settings
    // document must carry the current schema's visibility config. Stale docs
    // left over from an earlier schema iteration (or a partially applied
    // seed) can leave the site with a `site` doc but no sections — reseed
    // from scratch whenever that happens so the portfolio always renders
    // fully. Checking for the previous `site`-only state is not enough.
    const settingsCurrent =
      settings &&
      typeof settings.maintenanceMode === "boolean" &&
      typeof settings.visibilityAbout === "boolean" &&
      typeof settings.visibilitySkill === "boolean" &&
      typeof settings.visibilityContact === "boolean";
    const aboutCurrent = about && Array.isArray(about.socials);

    // Fields added after an earlier seed run may be missing from an existing
    // settings doc (e.g. deeplApiKey, sectionOrder, new visibility flags).
    // Patch just those fields instead of wiping the whole database, which
    // would discard owner customizations.
    if (settings && typeof settings.deeplApiKey !== "string") {
      await ctx.db.patch(settings._id, { deeplApiKey: "" });
    }
    if (settings && typeof settings.notificationEmail !== "string") {
      await ctx.db.patch(settings._id, { notificationEmail: "" });
    }
    // The Resend integration and the OTP login toggle were removed — delete
    // their leftover fields from the document. They are no longer in the
    // schema, and Convex object validators reject unknown keys, so keeping
    // them would break the Config editor's save (and with it the
    // maintenance-mode toggle). smtpUser/smtpPass are real schema fields
    // again (Gmail SMTP, Intégrations) and must NOT be stripped here.
    if (settings) {
      const legacy = settings as unknown as Record<string, unknown>;
      if ("resendApiKey" in legacy || "emailOtpEnabled" in legacy) {
        const {
          _id,
          _creationTime,
          resendApiKey: _resend,
          emailOtpEnabled: _emailOtpEnabled,
          ...clean
        } = legacy;
        void _id;
        void _creationTime;
        void _resend;
        void _emailOtpEnabled;
        await ctx.db.replace(settings._id, clean as never);
      }
    }
    // SMTP fields added later — default to Gmail, disabled, so existing
    // installs keep using the relay until the owner configures SMTP.
    if (settings && typeof settings.smtpEnabled !== "boolean") {
      await ctx.db.patch(settings._id, {
        smtpEnabled: false,
        smtpHost: "smtp.gmail.com",
        smtpPort: 465,
        smtpSecure: true,
        smtpUser: "",
        smtpPass: "",
      });
    }
    if (settings && !Array.isArray(settings.sectionOrder)) {
      await ctx.db.patch(settings._id, {
        sectionOrder: [...DEFAULT_SECTION_ORDER],
        visibilityLanguages: true,
        visibilityInterests: true,
      });
    }
    // The hero (en-tête) is the "À propos" section and is always first —
    // drop a stale "about" id left in sectionOrder by an earlier version.
    if (
      settings &&
      Array.isArray(settings.sectionOrder) &&
      settings.sectionOrder.includes("about")
    ) {
      await ctx.db.patch(settings._id, {
        sectionOrder: settings.sectionOrder.filter((id) => id !== "about"),
      });
    }
    // The design axis was added later — default to Éditorial (the Studio
    // look) for existing settings docs.
    if (settings && typeof settings.design !== "string") {
      await ctx.db.patch(settings._id, { design: "editorial" });
    }
    // Layout fields added later — default to the card/vignette rendering.
    if (settings) {
      const validLayout = (v?: string): v is "list" | "cards" =>
        v === "list" || v === "cards";
      const layoutPatch: {
        servicesLayout?: "list" | "cards";
        interestsLayout?: "list" | "cards";
        languagesLayout?: "list" | "cards";
        skillsLayout?: "list" | "cards";
        portfolioLayout?: "list" | "cards";
        blogLayout?: "list" | "cards";
      } = {};
      if (!validLayout(settings.servicesLayout)) {
        layoutPatch.servicesLayout = "cards";
      }
      if (!validLayout(settings.interestsLayout)) {
        layoutPatch.interestsLayout = "cards";
      }
      if (!validLayout(settings.languagesLayout)) {
        layoutPatch.languagesLayout = "cards";
      }
      if (!validLayout(settings.skillsLayout)) {
        layoutPatch.skillsLayout = "cards";
      }
      if (!validLayout(settings.portfolioLayout)) {
        layoutPatch.portfolioLayout = "cards";
      }
      if (!validLayout(settings.blogLayout)) {
        layoutPatch.blogLayout = "cards";
      }
      if (
        layoutPatch.servicesLayout ||
        layoutPatch.interestsLayout ||
        layoutPatch.languagesLayout ||
        layoutPatch.skillsLayout ||
        layoutPatch.portfolioLayout ||
        layoutPatch.blogLayout
      ) {
        await ctx.db.patch(settings._id, layoutPatch);
      }
    }
    // The Parcours sub-section order was added later — default to the French
    // norm (experience first) for existing settings docs.
    if (
      settings &&
      settings.resumeOrder !== "experience-first" &&
      settings.resumeOrder !== "education-first"
    ) {
      await ctx.db.patch(settings._id, { resumeOrder: "experience-first" });
    }
    // Interests gained an icon field later — backfill an empty string so the
    // items still validate against the current schema when edited.
    if (
      interests &&
      Array.isArray(interests.items) &&
      interests.items.some((item) => typeof item.icon !== "string")
    ) {
      await ctx.db.patch(interests._id, {
        items: interests.items.map((item) => ({
          name: item.name,
          details: item.details,
          icon: typeof item.icon === "string" ? item.icon : "",
        })),
      });
    }
    // Levels migrated to the unified 1–5 scale: languages were free text,
    // skills were 0–100 %. Convert any legacy values so the editors and the
    // site agree on one scale.
    const legacyLanguages = languages as unknown as {
      items: { name: string; level: string | number }[];
    } | null;
    if (
      legacyLanguages &&
      legacyLanguages.items.some((item) => typeof item.level !== "number")
    ) {
      await ctx.db.patch(
        languages!._id,
        {
          items: legacyLanguages.items.map((item) => ({
            name: item.name,
            level: levelToNumber(item.level),
          })),
        } as never,
      );
    }
    if (
      skills &&
      skills.items.some((item) => item.proficiency > 5)
    ) {
      await ctx.db.patch(skills._id, {
        items: skills.items.map((item) => ({
          name: item.name,
          proficiency: proficiencyToLevel(item.proficiency),
        })),
      });
    }
    // Projects gained role/result fields later — backfill empty strings so
    // they validate against the current schema when edited.
    if (
      portfolio &&
      Array.isArray(portfolio.projects) &&
      portfolio.projects.some(
        (project) =>
          typeof project.role !== "string" ||
          typeof project.result !== "string",
      )
    ) {
      await ctx.db.patch(portfolio._id, {
        projects: portfolio.projects.map((project) => ({
          title: project.title,
          categories: project.categories,
          link: project.link,
          details: project.details,
          thumbnail: project.thumbnail,
          images: project.images,
          role: typeof project.role === "string" ? project.role : "",
          result: typeof project.result === "string" ? project.result : "",
        })),
      });
    }
    // Experiences gained location/contractType/achievements later — backfill
    // empty values so they validate against the current schema when edited.
    if (
      resume &&
      Array.isArray(resume.experiences) &&
      resume.experiences.some(
        (experience) =>
          typeof experience.location !== "string" ||
          typeof experience.contractType !== "string" ||
          !Array.isArray(experience.achievements),
      )
    ) {
      await ctx.db.patch(resume._id, {
        experiences: resume.experiences.map((experience) => ({
          position: experience.position,
          company: experience.company,
          period: experience.period,
          details: experience.details,
          location:
            typeof experience.location === "string" ? experience.location : "",
          contractType:
            typeof experience.contractType === "string"
              ? experience.contractType
              : "",
          achievements: Array.isArray(experience.achievements)
            ? experience.achievements
            : [],
        })),
      });
    }

    if (
      site &&
      settingsCurrent &&
      aboutCurrent &&
      skills &&
      services &&
      resume &&
      portfolio &&
      blog
    ) {
      // The core site is complete — additive migration only: insert the new
      // rubric tables if missing, never touch existing owner content.
      if (!languages) await ctx.db.insert("languages", sampleLanguages);
      if (!interests) await ctx.db.insert("interests", sampleInterests);
      return;
    }

    // Content tables only — these are safe to reset publicly: on a brand-new
    // database they are empty, and the portfolio must always render fully.
    const contentTables = [
      "site",
      "settings",
      "about",
      "skills",
      "services",
      "resume",
      "portfolio",
      "blog",
      "languages",
      "interests",
    ] as const;
    for (const table of contentTables) {
      const stale = await ctx.db.query(table).collect();
      for (const doc of stale) {
        await ctx.db.delete(doc._id);
      }
    }
    // Messages and visitors are business data — a public caller (the landing
    // page) must never be able to wipe them. They are only reset (and
    // re-seeded with the demo rows) when the owner runs the seed.
    const owner = await getCurrentAdmin(ctx);
    if (owner) {
      for (const table of ["messages", "visitors"] as const) {
        const stale = await ctx.db.query(table).collect();
        for (const doc of stale) {
          await ctx.db.delete(doc._id);
        }
      }
    }

    await ctx.db.insert("site", sampleSite);
    await ctx.db.insert("settings", sampleSettings);
    await ctx.db.insert("about", sampleAbout);
    await ctx.db.insert("skills", sampleSkills);
    await ctx.db.insert("services", sampleServices);
    await ctx.db.insert("resume", sampleResume);
    await ctx.db.insert("portfolio", samplePortfolio);
    await ctx.db.insert("blog", sampleBlog);
    await ctx.db.insert("languages", sampleLanguages);
    await ctx.db.insert("interests", sampleInterests);
    if (owner) {
      for (const message of sampleMessages) {
        await ctx.db.insert("messages", message);
      }
      for (const visitor of sampleVisitors) {
        await ctx.db.insert("visitors", visitor);
      }
    }
  },
});
