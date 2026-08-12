import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

/**
 * All public portfolio content in one reactive query — the landing page
 * subscribes to this and the admin dashboard reuses it for every editor.
 */
export const getSiteData = query({
  args: {},
  handler: async (ctx) => {
    const [site, settings, about, skills, services, resume, portfolio, blog] =
      await Promise.all([
        ctx.db.query("site").first(),
        ctx.db.query("settings").first(),
        ctx.db.query("about").first(),
        ctx.db.query("skills").first(),
        ctx.db.query("services").first(),
        ctx.db.query("resume").first(),
        ctx.db.query("portfolio").first(),
        ctx.db.query("blog").first(),
      ]);

    // The DeepL key is write-only: never send it to clients, even the owner
    // (the dashboard shows a masked "key set" state instead).
    return {
      site,
      settings: settings ? { ...settings, deeplApiKey: "" } : null,
      about,
      skills,
      services,
      resume,
      portfolio,
      blog,
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
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const settings = await ctx.db.query("settings").first();
    return {
      googleAnalyticsId: settings?.googleAnalyticsId ?? "",
      deeplKeySet: Boolean(settings?.deeplApiKey?.trim()),
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
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return ctx.db.query("settings").first();
  },
});

const DAY = 24 * 60 * 60 * 1000;

function startOfDayUTC(ts: number): number {
  const date = new Date(ts);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

function startOfWeekUTC(ts: number): number {
  const date = new Date(startOfDayUTC(ts));
  // Monday as first day of the week
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day);
  return date.getTime();
}

function startOfMonthUTC(ts: number): number {
  const date = new Date(ts);
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

function countByWindow(items: { createdAt: number }[], since: number): number {
  return items.filter((item) => item.createdAt >= since).length;
}

/**
 * Dashboard home stats — visitor + message counts and a 7-day visitor trend
 * (Ezfolio "Dashboard" page). Owner only.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const [visitors, messages] = await Promise.all([
      ctx.db.query("visitors").order("desc").take(5000),
      ctx.db.query("messages").order("desc").take(5000),
    ]);

    const now = Date.now();

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

    return {
      visitors: {
        total: visitors.length,
        today: countByWindow(visitors, startOfDayUTC(now)),
        thisWeek: countByWindow(visitors, startOfWeekUTC(now)),
        thisMonth: countByWindow(visitors, startOfMonthUTC(now)),
        trend,
      },
      messages: {
        total: messages.length,
        today: countByWindow(messages, startOfDayUTC(now)),
        thisWeek: countByWindow(messages, startOfWeekUTC(now)),
        thisMonth: countByWindow(messages, startOfMonthUTC(now)),
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
 * Contact form submissions — only the signed-in owner can read them.
 */
export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return ctx.db.query("messages").order("desc").take(200);
  },
});

/**
 * Visitor tracking list — owner only.
 */
export const getVisitors = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return ctx.db.query("visitors").order("desc").take(500);
  },
});
