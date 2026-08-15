import { v } from "convex/values";
import { internalMutation, mutation, MutationCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { DAY } from "../lib/stats";
import { getCurrentAdmin } from "./users";

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
  // The owner is the password account created with the admin role. Checking
  // the role (not just authentication) closes the gap where any account
  // created through the public email-code flow could reach owner functions.
  const user = await getCurrentAdmin(ctx);
  if (!user) throw new Error("Not authorized");
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
 * Patch-only update for external service keys (Google Analytics, DeepL,
 * SMTP). The DeepL key and the SMTP app password are write-only: the client
 * sends a replacement only when the owner types one, and `clearDeeplKey` /
 * `clearSmtpPass` explicitly remove them. An empty string means "keep the
 * stored key".
 */
export const updateIntegrations = mutation({
  args: v.object({
    googleAnalyticsId: v.string(),
    deeplApiKey: v.optional(v.string()),
    clearDeeplKey: v.optional(v.boolean()),
    notificationEmail: v.optional(v.string()),
    contactNotifications: v.optional(v.boolean()),
    smtpEnabled: v.optional(v.boolean()),
    smtpHost: v.optional(v.string()),
    smtpPort: v.optional(v.number()),
    smtpSecure: v.optional(v.boolean()),
    smtpUser: v.optional(v.string()),
    smtpPass: v.optional(v.string()),
    clearSmtpPass: v.optional(v.boolean()),
  }),
  handler: async (
    ctx,
    {
      googleAnalyticsId,
      deeplApiKey,
      clearDeeplKey,
      notificationEmail,
      contactNotifications,
      smtpEnabled,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      clearSmtpPass,
    },
  ) => {
    await requireOwner(ctx);
    const settings = await ctx.db.query("settings").first();
    if (!settings) throw new Error("Settings not found");
    const patch: {
      googleAnalyticsId: string;
      deeplApiKey?: string;
      notificationEmail?: string;
      contactNotifications?: boolean;
      smtpEnabled?: boolean;
      smtpHost?: string;
      smtpPort?: number;
      smtpSecure?: boolean;
      smtpUser?: string;
      smtpPass?: string;
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
    if (contactNotifications !== undefined) {
      patch.contactNotifications = contactNotifications;
    }
    if (smtpEnabled !== undefined) {
      patch.smtpEnabled = smtpEnabled;
    }
    if (smtpHost !== undefined) {
      patch.smtpHost = smtpHost.trim() || "smtp.gmail.com";
    }
    if (smtpPort !== undefined) {
      patch.smtpPort = smtpPort;
    }
    if (smtpSecure !== undefined) {
      patch.smtpSecure = smtpSecure;
    }
    if (smtpUser !== undefined) {
      patch.smtpUser = smtpUser.trim();
    }
    if (clearSmtpPass) {
      patch.smtpPass = "";
    } else if (smtpPass && smtpPass.trim() !== "") {
      patch.smtpPass = smtpPass.trim();
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
    // Anti-spam: hidden honeypot field (bots fill it, humans never see it).
    honeypot: v.optional(v.string()),
    // Visitor fingerprint (localStorage id) for the per-visitor rate limit.
    visitorId: v.optional(v.string()),
  }),
  handler: async (ctx, { name, email, subject, message, honeypot, visitorId }) => {
    // Honeypot: silently drop bot submissions (no insert, no notification).
    if (honeypot && honeypot.trim() !== "") {
      return;
    }

    // Length caps (defense in depth — the client also limits input length).
    if (name.length > 100 || email.length > 200 || subject.length > 200) {
      throw new Error("Message trop long.");
    }
    if (message.length > 5000) {
      throw new Error("Message trop long.");
    }

    // Free per-visitor rate limit (in-database sliding window, 1 hour). The
    // by_visitorId index makes the window exact — no dependence on the "most
    // recent 50 messages" like before. visitorId is client-generated, so this
    // is a best-effort throttle, not a hard anti-abuse barrier.
    const now = Date.now();
    const vId = visitorId?.trim() || undefined;
    const recentFromVisitor = vId
      ? await ctx.db
          .query("messages")
          .withIndex("by_visitorId", (q) =>
            q.eq("visitorId", vId).gt("createdAt", now - 60 * 60 * 1000),
          )
          .take(4)
      : [];
    if (vId && recentFromVisitor.length >= 3) {
      throw new Error("Trop de messages envoyés. Réessayez plus tard.");
    }

    await ctx.db.insert("messages", {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      replied: false,
      createdAt: now,
      visitorId: vId,
    });

    // Email the owner in the background through the built-in gateway. The
    // destination is read from the settings doc (notificationEmail, falling
    // back to the contact email) and passed to the action, which runs
    // unauthenticated and therefore can't read the owner-only tables itself.
    // The owner can switch the email off entirely (contactNotifications=false)
    // for portability — the message is still stored in the inbox.
    const settings = await ctx.db.query("settings").first();
    const about = await ctx.db.query("about").first();
    const to = settings?.notificationEmail?.trim() || about?.email?.trim();
    if (settings?.contactNotifications !== false && to) {
      // SMTP (Gmail app password) when enabled and configured — passed as an
      // argument because the scheduled action runs unauthenticated.
      const smtp = settings?.smtpEnabled &&
        settings.smtpUser?.trim() &&
        settings.smtpPass
        ? {
            host: settings.smtpHost?.trim() || "smtp.gmail.com",
            port: settings.smtpPort ?? 465,
            secure: settings.smtpSecure !== false,
            user: settings.smtpUser.trim(),
            pass: settings.smtpPass,
          }
        : undefined;
      await ctx.scheduler.runAfter(0, api.notify.sendContactEmail, {
        to,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        smtp,
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
    // Validation caps — silently drop malformed events instead of writing
    // oversized rows (a script could otherwise bloat the table and skew the
    // dashboard stats). The client already limits these lengths.
    const tId = trackingId.trim();
    const ua = browser.trim();
    const os = platform.trim();
    if (!tId || tId.length > 64 || ua.length > 100 || os.length > 64) {
      return;
    }

    // Per-visitor throttle: at most 30 events per trackingId per minute. The
    // trackingId is client-generated (rotatable), so this is best-effort.
    const now = Date.now();
    const recent = await ctx.db.query("visitors").order("desc").take(200);
    const recentFromId = recent.filter(
      (v) => v.trackingId === tId && v.createdAt > now - 60 * 1000,
    );
    if (recentFromId.length >= 30) return;

    await ctx.db.insert("visitors", {
      trackingId: tId,
      isNew,
      browser: ua,
      platform: os,
      createdAt: now,
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

// ---------------------------------------------------------------------------
// Retention — automatic cleanup of old visitor rows
// ---------------------------------------------------------------------------

/**
 * Deletes visitor rows older than 90 days. Runs daily from
 * convex/scheduler.ts; defined as an internal mutation so it can never be
 * called directly from a client. Messages are business data and are never
 * auto-deleted.
 */
export const purgeOldVisitors = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 90 * DAY;
    let deleted = 0;
    // Delete in bounded batches so each read never exceeds 500 rows.
    for (;;) {
      const stale = await ctx.db
        .query("visitors")
        .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
        .take(500);
      if (stale.length === 0) break;
      for (const visitor of stale) {
        await ctx.db.delete(visitor._id);
      }
      deleted += stale.length;
    }
    return { deleted };
  },
});
