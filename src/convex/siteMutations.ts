import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";
import { getCurrentUser } from "./users";
import {
  aboutValidator,
  blogValidator,
  portfolioValidator,
  resumeValidator,
  servicesValidator,
  settingsValidator,
  siteValidator,
  skillsValidator,
} from "./schema";

type SectionTable =
  | "site"
  | "settings"
  | "about"
  | "skills"
  | "services"
  | "resume"
  | "portfolio"
  | "blog";

/**
 * Ezfolio keeps one document per section; updates patch it in place and the
 * first write creates it (defensive — the seed normally does this).
 */
async function upsertDoc(ctx: MutationCtx, table: SectionTable, data: unknown) {
  const db = ctx.db as unknown as {
    query: (t: string) => { first: () => Promise<{ _id: string } | null> };
    patch: (id: string, d: unknown) => Promise<unknown>;
    insert: (t: string, d: unknown) => Promise<unknown>;
  };
  const existing = await db.query(table).first();
  if (existing) {
    await db.patch(existing._id, data);
  } else {
    await db.insert(table, data);
  }
}

async function requireOwner(ctx: MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

// ---------------------------------------------------------------------------
// Section content updates (owner only)
// ---------------------------------------------------------------------------

export const updateSite = mutation({
  args: { data: siteValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "site", data);
  },
});

export const updateSettings = mutation({
  args: { data: settingsValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "settings", data);
  },
});

/**
 * Patch-only update for external service keys (Google Analytics, DeepL).
 * Kept separate from updateSettings so editing one integration never
 * overwrites the others with a stale draft.
 */
export const updateIntegrations = mutation({
  args: v.object({
    googleAnalyticsId: v.string(),
    deeplApiKey: v.string(),
  }),
  handler: async (ctx, { googleAnalyticsId, deeplApiKey }) => {
    await requireOwner(ctx);
    const settings = await ctx.db.query("settings").first();
    if (!settings) throw new Error("Settings not found");
    await ctx.db.patch(settings._id, {
      googleAnalyticsId: googleAnalyticsId.trim(),
      deeplApiKey: deeplApiKey.trim(),
    });
  },
});

export const updateAbout = mutation({
  args: { data: aboutValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "about", data);
  },
});

export const updateSkills = mutation({
  args: { data: skillsValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "skills", data);
  },
});

export const updateServices = mutation({
  args: { data: servicesValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "services", data);
  },
});

export const updateResume = mutation({
  args: { data: resumeValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "resume", data);
  },
});

export const updatePortfolio = mutation({
  args: { data: portfolioValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "portfolio", data);
  },
});

export const updateBlog = mutation({
  args: { data: blogValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "blog", data);
  },
});

// ---------------------------------------------------------------------------
// Contact form (public) + messages management (owner only)
// ---------------------------------------------------------------------------

export const addMessage = mutation({
  args: v.object({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  }),
  handler: async (ctx, { name, email, subject, message }) => {
    await ctx.db.insert("messages", {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      replied: false,
      createdAt: Date.now(),
    });
  },
});

export const markMessageReplied = mutation({
  args: { id: v.id("messages"), replied: v.boolean() },
  handler: async (ctx, { id, replied }) => {
    await requireOwner(ctx);
    await ctx.db.patch(id, { replied });
  },
});

export const deleteMessage = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, { id }) => {
    await requireOwner(ctx);
    await ctx.db.delete(id);
  },
});

// ---------------------------------------------------------------------------
// Visitor tracking (public) + management (owner only)
// ---------------------------------------------------------------------------

export const trackVisit = mutation({
  args: v.object({
    trackingId: v.string(),
    isNew: v.boolean(),
    browser: v.string(),
    platform: v.string(),
  }),
  handler: async (ctx, { trackingId, isNew, browser, platform }) => {
    await ctx.db.insert("visitors", {
      trackingId,
      isNew,
      browser,
      platform,
      createdAt: Date.now(),
    });
  },
});

export const deleteVisitor = mutation({
  args: { id: v.id("visitors") },
  handler: async (ctx, { id }) => {
    await requireOwner(ctx);
    await ctx.db.delete(id);
  },
});
