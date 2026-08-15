import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// ---------------------------------------------------------------------------
// Shared shape validators (Ezfolio data model)
// ---------------------------------------------------------------------------

export const socialValidator = v.object({
  title: v.string(),
  link: v.string(),
});

export const skillItemValidator = v.object({
  name: v.string(),
  proficiency: v.number(),
});

export const serviceItemValidator = v.object({
  title: v.string(),
  icon: v.string(),
  details: v.string(),
});

export const experienceValidator = v.object({
  position: v.string(),
  company: v.string(),
  period: v.string(),
  location: v.string(),
  contractType: v.string(),
  details: v.string(),
  achievements: v.array(v.string()),
});

export const educationValidator = v.object({
  degree: v.string(),
  institution: v.string(),
  period: v.string(),
  cgpa: v.string(),
  department: v.string(),
  thesis: v.string(),
});

export const projectValidator = v.object({
  title: v.string(),
  categories: v.array(v.string()),
  link: v.string(),
  details: v.string(),
  thumbnail: v.string(),
  images: v.array(v.string()),
  role: v.string(),
  result: v.string(),
});

export const postValidator = v.object({
  title: v.string(),
  date: v.string(),
  excerpt: v.string(),
  content: v.string(),
  imageUrl: v.string(),
});

export const languageItemValidator = v.object({
  name: v.string(),
  // Unified 1–5 proficiency scale (see src/lib/levels.ts) — the admin editor
  // offers a dropdown and stores the number; the site renders 5 bars from it.
  level: v.number(),
});

export const interestItemValidator = v.object({
  name: v.string(),
  details: v.string(),
  icon: v.string(),
});

// ---------------------------------------------------------------------------
// English variants (auto-generated via DeepL — stored per section)
// ---------------------------------------------------------------------------

export const siteEnValidator = v.object({
  tagline: v.string(),
  footerText: v.string(),
});

export const settingsEnValidator = v.object({
  metaTitle: v.string(),
  metaDescription: v.string(),
});

export const aboutEnValidator = v.object({
  description: v.string(),
  taglines: v.array(v.string()),
});

export const skillsEnValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(v.object({ name: v.string() })),
});

export const servicesEnValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(
    v.object({
      title: v.string(),
      details: v.string(),
    }),
  ),
});

export const resumeEnValidator = v.object({
  title: v.string(),
  description: v.string(),
  experiences: v.array(
    v.object({
      position: v.string(),
      details: v.string(),
      location: v.string(),
      contractType: v.string(),
      achievements: v.array(v.string()),
    }),
  ),
  educations: v.array(
    v.object({
      degree: v.string(),
      department: v.string(),
      thesis: v.string(),
    }),
  ),
});

export const portfolioEnValidator = v.object({
  title: v.string(),
  description: v.string(),
  projects: v.array(
    v.object({
      title: v.string(),
      categories: v.array(v.string()),
      details: v.string(),
      role: v.string(),
      result: v.string(),
    }),
  ),
});

export const blogEnValidator = v.object({
  title: v.string(),
  description: v.string(),
  posts: v.array(
    v.object({
      title: v.string(),
      excerpt: v.string(),
      content: v.string(),
    }),
  ),
});

export const languagesEnValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(
    v.object({
      name: v.string(),
      level: v.string(),
    }),
  ),
});

export const interestsEnValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(
    v.object({
      name: v.string(),
      details: v.string(),
    }),
  ),
});

// ---------------------------------------------------------------------------
// Document validators (single document per section, like Ezfolio)
// ---------------------------------------------------------------------------

/** Site identity + dashboard appearance (Ezfolio "Settings"). */
export const siteValidator = v.object({
  siteName: v.string(),
  tagline: v.string(),
  footerText: v.string(),
  logoUrl: v.string(),
  faviconUrl: v.string(),
  en: v.optional(siteEnValidator),
});

/** Portfolio rendering configuration (Ezfolio "Config" / portfolio_config). */
export const settingsValidator = v.object({
  themeColor: v.string(),
  // Owner-chosen ambiance of the public site: "auto" follows each visitor's
  // preference, "light"/"dark" set the default for first-time visitors.
  themeMode: v.optional(
    v.union(v.literal("auto"), v.literal("light"), v.literal("dark")),
  ),
  // Complete coordinated color theme (paper, ink, surfaces, accent) chosen
  // in the dashboard's Apparence section. Absent or unknown = the default
  // Studio look, so existing installs are unchanged. Values live in
  // src/lib/themes.ts.
  themePreset: v.optional(v.string()),
  googleAnalyticsId: v.string(),
  deeplApiKey: v.string(),
  // Destination of the contact-form notification email.
  notificationEmail: v.optional(v.string()),
  // Email channels the owner can toggle off (portability: the built-in email
  // relay is platform-specific, so these can be switched off when the app is
  // deployed elsewhere). Absent = enabled, for backward compatibility.
  contactNotifications: v.optional(v.boolean()),
  maintenanceMode: v.boolean(),
  metaTitle: v.string(),
  metaDescription: v.string(),
  metaAuthor: v.string(),
  metaImage: v.string(),
  scriptHeader: v.string(),
  scriptFooter: v.string(),
  // Display order of the site sections — any permutation of SECTION_IDS.
  sectionOrder: v.array(v.string()),
  // Rendering style for the Services / Interests / Languages sections.
  // "list" = editorial rows, "cards" = grid of vignettes, "pills" = compact badges.
  servicesLayout: v.optional(v.union(v.literal("list"), v.literal("cards"))),
  interestsLayout: v.optional(v.union(v.literal("list"), v.literal("cards"))),
  languagesLayout: v.optional(v.union(v.literal("list"), v.literal("cards"))),
  skillsLayout: v.optional(v.union(v.literal("list"), v.literal("cards"))),
  // Order of the two Parcours sub-sections. The French CV norm puts
  // experience first, but juniors often prefer education first.
  resumeOrder: v.optional(
    v.union(v.literal("experience-first"), v.literal("education-first")),
  ),
  visibilityAbout: v.boolean(),
  visibilitySkill: v.boolean(),
  visibilityEducation: v.boolean(),
  visibilityExperience: v.boolean(),
  visibilityProject: v.boolean(),
  visibilityService: v.boolean(),
  visibilityContact: v.boolean(),
  visibilityFooter: v.boolean(),
  visibilityCv: v.boolean(),
  visibilitySkillProficiency: v.boolean(),
  visibilityBlog: v.boolean(),
  visibilityLanguages: v.boolean(),
  visibilityInterests: v.boolean(),
  en: v.optional(settingsEnValidator),
});

/** Persona + hero + contact info (Ezfolio "About"). */
export const aboutValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  address: v.string(),
  avatar: v.string(),
  cover: v.string(),
  description: v.string(),
  taglines: v.array(v.string()),
  socials: v.array(socialValidator),
  cvUrl: v.string(),
  en: v.optional(aboutEnValidator),
});

export const skillsValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(skillItemValidator),
  en: v.optional(skillsEnValidator),
});

export const servicesValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(serviceItemValidator),
  en: v.optional(servicesEnValidator),
});

export const resumeValidator = v.object({
  title: v.string(),
  description: v.string(),
  experiences: v.array(experienceValidator),
  educations: v.array(educationValidator),
  en: v.optional(resumeEnValidator),
});

export const portfolioValidator = v.object({
  title: v.string(),
  description: v.string(),
  projects: v.array(projectValidator),
  en: v.optional(portfolioEnValidator),
});

export const blogValidator = v.object({
  title: v.string(),
  description: v.string(),
  posts: v.array(postValidator),
  en: v.optional(blogEnValidator),
});

/** Languages spoken, with proficiency levels (standard French CV rubric). */
export const languagesValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(languageItemValidator),
  en: v.optional(languagesEnValidator),
});

/** Hobbies / centers of interest (standard French CV rubric). */
export const interestsValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(interestItemValidator),
  en: v.optional(interestsEnValidator),
});

export const messageValidator = v.object({
  name: v.string(),
  email: v.string(),
  subject: v.string(),
  message: v.string(),
  replied: v.boolean(),
  createdAt: v.number(),
  // Anti-spam: visitor fingerprint used by the per-visitor rate limit.
  // Lengths are capped in the addMessage mutation handler (this Convex
  // version's v.string() does not accept maxLength options).
  visitorId: v.optional(v.string()),
});

export const visitorValidator = v.object({
  trackingId: v.string(),
  isNew: v.boolean(),
  browser: v.string(),
  platform: v.string(),
  createdAt: v.number(),
});

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      credentialsChanged: v.optional(v.boolean()), // true once the owner changed the default login email/password
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Portfolio CMS — Ezfolio data model
    site: defineTable(siteValidator),
    settings: defineTable(settingsValidator),
    about: defineTable(aboutValidator),
    skills: defineTable(skillsValidator),
    services: defineTable(servicesValidator),
    resume: defineTable(resumeValidator),
    portfolio: defineTable(portfolioValidator),
    blog: defineTable(blogValidator),
    languages: defineTable(languagesValidator),
    interests: defineTable(interestsValidator),
    messages: defineTable(messageValidator).index("by_visitorId", [
      "visitorId",
      "createdAt",
    ]),
    visitors: defineTable(visitorValidator).index("by_createdAt", ["createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
