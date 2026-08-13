import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { getCurrentUser } from "./users";

type SectionTable =
  | "site"
  | "settings"
  | "about"
  | "skills"
  | "services"
  | "resume"
  | "portfolio"
  | "blog"
  | "languages"
  | "interests";

const SECTION_NAMES = [
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

/**
 * Internal write used by the translate actions (owner only). The section data
 * is validated by the action's own args validator before it reaches here.
 */
export const persistSection = mutation({
  args: {
    section: v.union(...SECTION_NAMES.map((s) => v.literal(s))),
    data: v.any(),
    en: v.optional(v.any()),
  },
  handler: async (ctx, { section, data, en }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, section, en !== undefined ? { ...data, en } : data);
  },
});

/**
 * Patch-only update for external service keys (Google Analytics, DeepL).
 * The DeepL key is write-only: the client sends a replacement only when the
 * owner types one, and `clearDeeplKey` explicitly removes it. An empty string
 * means "keep the stored key".
 */
export const updateIntegrations = mutation({
  args: v.object({
    googleAnalyticsId: v.string(),
    deeplApiKey: v.optional(v.string()),
    clearDeeplKey: v.optional(v.boolean()),
    notificationEmail: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    { googleAnalyticsId, deeplApiKey, clearDeeplKey, notificationEmail },
  ) => {
    await requireOwner(ctx);
    const settings = await ctx.db.query("settings").first();
    if (!settings) throw new Error("Settings not found");
    const patch: {
      googleAnalyticsId: string;
      deeplApiKey?: string;
      notificationEmail?: string;
    } = {
      googleAnalyticsId: googleAnalyticsId.trim(),
    };
    if (clearDeeplKey) {
      patch.deeplApiKey = "";
    } else if (deeplApiKey && deeplApiKey.trim() !== "") {
      patch.deeplApiKey = deeplApiKey.trim();
    }
    if (notificationEmail !== undefined) {
      patch.notificationEmail = notificationEmail.trim();
    }
    await ctx.db.patch(settings._id, patch);
  },
});

/**
 * Instant CV save — the CV upload/removal in the admin persists immediately
 * (no need to also press the section's save button). Keeps the same owner
 * check as every other write.
 */
export const setCvUrl = mutation({
  args: { cvUrl: v.string() },
  handler: async (ctx, { cvUrl }) => {
    await requireOwner(ctx);
    const about = await ctx.db.query("about").first();
    if (!about) throw new Error("About section not found");
    await ctx.db.patch(about._id, { cvUrl });
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

    // Email the owner in the background. SMTP credentials are read from env
    // vars inside the action (it runs unauthenticated, so only the destination
    // + content are passed here; mutations can read the DB directly).
    const settings = await ctx.db.query("settings").first();
    const about = await ctx.db.query("about").first();
    const to = settings?.notificationEmail?.trim() || about?.email?.trim();
    if (to) {
      await ctx.scheduler.runAfter(0, api.notify.sendContactEmail, {
        to,
        fromName: about?.name?.trim() || "Portfolio",
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
    }
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
