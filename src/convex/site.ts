import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

/**
 * All public portfolio content in one reactive query — the landing page
 * subscribes to this and the admin dashboard reuses it for every editor.
 */
export const getSiteData = query({
  args: {},
  handler: async (ctx) => {
    const [settings, hero, about, skills, services, resume, portfolio, blog, contact] =
      await Promise.all([
        ctx.db.query("settings").first(),
        ctx.db.query("hero").first(),
        ctx.db.query("about").first(),
        ctx.db.query("skills").first(),
        ctx.db.query("services").first(),
        ctx.db.query("resume").first(),
        ctx.db.query("portfolio").first(),
        ctx.db.query("blog").first(),
        ctx.db.query("contact").first(),
      ]);

    return { settings, hero, about, skills, services, resume, portfolio, blog, contact };
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
