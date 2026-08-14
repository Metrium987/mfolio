import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { getCurrentAdmin } from "./users";
import type { Doc } from "./_generated/dataModel";
import {
  DAY,
  countByWindow,
  deviceBucket,
  distinctCount,
  distinctCountSince,
  groupCounts,
  hourHistogram,
  startOfDayUTC,
  startOfMonthUTC,
  startOfWeekUTC,
} from "../lib/stats";

/**
 * Strip legacy settings fields that are no longer in the schema (e.g. the
 * removed Resend key and Gmail SMTP credentials). Convex `v.object()`
 * validators reject unknown keys, so a stale field left in the document would
 * make the Config editor's save fail validation — and the keys must never
 * reach the browser.
 */
function sanitizeSettings(settings: Doc<"settings"> | null): Doc<"settings"> | null {
  if (!settings) return null;
  const legacy = settings as unknown as Record<string, unknown>;
  const {
    resendApiKey: _resend,
    smtpUser: _smtpUser,
    smtpPass: _smtpPass,
    ...clean
  } = legacy;
  void _resend;
  void _smtpUser;
  void _smtpPass;
  return {
    ...clean,
    deeplApiKey: "",
  } as unknown as Doc<"settings">;
}

/**
 * All public portfolio content in one reactive query — the landing page
 * subscribes to this and the admin dashboard reuses it for every editor.
 */
export const getSiteData = query({
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

    // The API keys are write-only: never send them to clients, even the owner
    // (the dashboard shows a masked "key set" state instead).
    return {
      site,
      settings: sanitizeSettings(settings),
      about,
      skills,
      services,
      resume,
      portfolio,
      blog,
      languages,
      interests,
    };
  },
});

/**
 * Integration key state for the dashboard (owner only). Returns the GA id
 * (public by design) and whether a DeepL key is set — never the key itself.
 */
export const getIntegrations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentAdmin(ctx);
    if (!user) return null;
    const settings = await ctx.db.query("settings").first();
    return {
      googleAnalyticsId: settings?.googleAnalyticsId ?? "",
      deeplKeySet: Boolean(settings?.deeplApiKey?.trim()),
      notificationEmail: settings?.notificationEmail ?? "",
      contactNotifications: settings?.contactNotifications !== false,
    };
  },
});

/**
 * Owner-only access to the raw settings doc (contains the DeepL key). Used
 * by the translate action; defined here because queries can't live in a
 * "use node" file.
 */
export const getSettingsForBackend = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentAdmin(ctx);
    if (!user) return null;
    return ctx.db.query("settings").first();
  },
});


/**
 * Dashboard home stats — visitor + message counts and a 7-day visitor trend
 * (Ezfolio "Dashboard" page). Owner only.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentAdmin(ctx);
    if (!user) return null;

    const [visitors, messages] = await Promise.all([
      ctx.db.query("visitors").order("desc").take(5000),
      ctx.db.query("messages").order("desc").take(5000),
    ]);

    const now = Date.now();
    const todayStart = startOfDayUTC(now);
    const weekStart = startOfWeekUTC(now);
    const monthStart = startOfMonthUTC(now);
    // Visitors are purged daily past this age (see scheduler.ts), so the
    // derived stats below are computed over the retained window.
    const retention = now - 90 * DAY;
    const retainedVisitors = visitors.filter(
      (visitor) => visitor.createdAt >= retention,
    );

    // Last 7 days trend (oldest → newest)
    const trend: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfDayUTC(now - i * DAY);
      const dayEnd = dayStart + DAY;
      const date = new Date(dayStart).toISOString().slice(5, 10);
      trend.push({
        date,
        count: visitors.filter(
          (visitor) => visitor.createdAt >= dayStart && visitor.createdAt < dayEnd,
        ).length,
      });
    }

    // Device breakdown (mobile / desktop / other)
    const devices = { mobile: 0, desktop: 0, other: 0 };
    for (const visitor of retainedVisitors) {
      devices[deviceBucket(visitor.platform)] += 1;
    }

    // Top browsers over the retained window
    const browsers = groupCounts(
      retainedVisitors,
      (visitor) => visitor.browser || "Inconnu",
      6,
    );

    // New vs returning (this month)
    const monthVisitors = visitors.filter((visitor) => visitor.createdAt >= monthStart);
    const newCount = monthVisitors.filter((visitor) => visitor.isNew).length;

    // Hourly distribution (UTC) over the retained window
    const hours = hourHistogram(retainedVisitors);

    // Contact conversion: messages vs unique visitors (same 90-day window)
    const uniqueVisitors90 = distinctCountSince(
      visitors,
      (visitor) => visitor.trackingId,
      retention,
    );
    const messages90 = countByWindow(messages, retention);

    return {
      visitors: {
        total: visitors.length,
        today: countByWindow(visitors, todayStart),
        thisWeek: countByWindow(visitors, weekStart),
        thisMonth: countByWindow(visitors, monthStart),
        trend,
        unique: {
          total: distinctCount(visitors.map((visitor) => visitor.trackingId)),
          today: distinctCountSince(visitors, (visitor) => visitor.trackingId, todayStart),
          thisWeek: distinctCountSince(visitors, (visitor) => visitor.trackingId, weekStart),
          thisMonth: distinctCountSince(visitors, (visitor) => visitor.trackingId, monthStart),
        },
        devices,
        browsers,
        returning: {
          new: newCount,
          returning: monthVisitors.length - newCount,
        },
        hours,
      },
      messages: {
        total: messages.length,
        today: countByWindow(messages, todayStart),
        thisWeek: countByWindow(messages, weekStart),
        thisMonth: countByWindow(messages, monthStart),
      },
      conversion: {
        visitors: uniqueVisitors90,
        messages: messages90,
        rate:
          uniqueVisitors90 > 0
            ? Math.round((messages90 / uniqueVisitors90) * 1000) / 10
            : 0,
      },
      content: {
        skills: (await ctx.db.query("skills").first())?.items.length ?? 0,
        educations:
          (await ctx.db.query("resume").first())?.educations.length ?? 0,
        experiences:
          (await ctx.db.query("resume").first())?.experiences.length ?? 0,
        projects: (await ctx.db.query("portfolio").first())?.projects.length ?? 0,
        services: (await ctx.db.query("services").first())?.items.length ?? 0,
      },
    };
  },
});

/**
 * Contact form submissions — owner only, paginated (the inbox can grow well
 * beyond 200 entries). The dashboard subscribes with usePaginatedQuery.
 */
export const getMessages = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const user = await getCurrentAdmin(ctx);
    if (!user) return { page: [], isDone: true, continueCursor: "" };
    return ctx.db.query("messages").order("desc").paginate(paginationOpts);
  },
});

/** Total message count (dashboard sidebar badge) — owner only. */
export const getMessagesCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentAdmin(ctx);
    if (!user) return null;
    // No native count() on the query initializer in this Convex version —
    // collect is fine at this scale (contact-form messages are small docs).
    return (await ctx.db.query("messages").collect()).length;
  },
});

/**
 * Visitor tracking list — owner only.
 */
export const getVisitors = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentAdmin(ctx);
    if (!user) return null;
    return ctx.db.query("visitors").order("desc").take(500);
  },
});
