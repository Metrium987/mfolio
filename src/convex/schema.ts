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
// Shared shape validators
// ---------------------------------------------------------------------------

export const socialValidator = v.object({
  name: v.string(),
  url: v.string(),
});

export const heroButtonValidator = v.object({
  label: v.string(),
  url: v.string(),
  style: v.union(v.literal("primary"), v.literal("outline")),
});

export const skillItemValidator = v.object({
  name: v.string(),
  level: v.number(),
});

export const serviceItemValidator = v.object({
  name: v.string(),
  description: v.string(),
  icon: v.string(),
});

export const resumeEntryValidator = v.object({
  title: v.string(),
  company: v.string(),
  date: v.string(),
  description: v.string(),
});

export const educationEntryValidator = v.object({
  title: v.string(),
  institution: v.string(),
  date: v.string(),
  description: v.string(),
});

export const projectValidator = v.object({
  name: v.string(),
  description: v.string(),
  category: v.string(),
  imageUrl: v.string(),
  sourceUrl: v.string(),
  demoUrl: v.string(),
});

export const postValidator = v.object({
  title: v.string(),
  date: v.string(),
  excerpt: v.string(),
  content: v.string(),
  imageUrl: v.string(),
});

// ---------------------------------------------------------------------------
// Section document validators (single document per section, like Ezfolio)
// ---------------------------------------------------------------------------

export const settingsValidator = v.object({
  siteName: v.string(),
  tagline: v.string(),
  footerText: v.string(),
  themeColor: v.string(),
});

export const heroValidator = v.object({
  name: v.string(),
  title: v.string(),
  subtitle: v.string(),
  intro: v.string(),
  avatarUrl: v.string(),
  socials: v.array(socialValidator),
  buttons: v.array(heroButtonValidator),
  visibility: v.boolean(),
});

export const aboutValidator = v.object({
  title: v.string(),
  description: v.string(),
  imageUrl: v.string(),
  resumeUrl: v.string(),
  visibility: v.boolean(),
});

export const skillsValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(skillItemValidator),
  visibility: v.boolean(),
});

export const servicesValidator = v.object({
  title: v.string(),
  description: v.string(),
  items: v.array(serviceItemValidator),
  visibility: v.boolean(),
});

export const resumeValidator = v.object({
  title: v.string(),
  description: v.string(),
  experiences: v.array(resumeEntryValidator),
  educations: v.array(educationEntryValidator),
  visibility: v.boolean(),
});

export const portfolioValidator = v.object({
  title: v.string(),
  description: v.string(),
  projects: v.array(projectValidator),
  visibility: v.boolean(),
});

export const blogValidator = v.object({
  title: v.string(),
  description: v.string(),
  posts: v.array(postValidator),
  visibility: v.boolean(),
});

export const contactValidator = v.object({
  title: v.string(),
  description: v.string(),
  email: v.string(),
  phone: v.string(),
  address: v.string(),
  socials: v.array(socialValidator),
  visibility: v.boolean(),
});

export const messageValidator = v.object({
  name: v.string(),
  email: v.string(),
  message: v.string(),
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
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Portfolio CMS — single document per section (Ezfolio data model)
    settings: defineTable(settingsValidator),
    hero: defineTable(heroValidator),
    about: defineTable(aboutValidator),
    skills: defineTable(skillsValidator),
    services: defineTable(servicesValidator),
    resume: defineTable(resumeValidator),
    portfolio: defineTable(portfolioValidator),
    blog: defineTable(blogValidator),
    contact: defineTable(contactValidator),
    messages: defineTable(messageValidator),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
