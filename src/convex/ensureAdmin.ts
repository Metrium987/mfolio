import { createAccount } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

/**
 * Default owner credentials so the project works out of the box when it is
 * self-hosted / integrated into the owner's own GitHub repository. Idempotent:
 * it only creates the account the first time — and never again once the owner
 * changes the credentials from the dashboard settings.
 *
 * SECURITY: these are public, well-known credentials — change them from
 * Paramètres → Sécurité du compte after the first login.
 */
export const DEFAULT_ADMIN_EMAIL = "admin@admin.com";
export const DEFAULT_ADMIN_PASSWORD = "admin123";

/** True once ANY password account exists (i.e. the owner provisioned or changed theirs). */
export const hasPasswordAccount = query({
  args: {},
  handler: async (ctx) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) => q.eq("provider", "password"))
      .first();
    return account !== null;
  },
});

/** True when demo mode is on (settings.demoMode === true). */
export const demoModeEnabled = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings?.demoMode === true;
  },
});

/** True when the well-known generic account already exists. */
export const hasDemoAccount = query({
  args: {},
  handler: async (ctx) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", DEFAULT_ADMIN_EMAIL),
      )
      .first();
    return account !== null;
  },
});

/**
 * Provisions accounts:
 * 1. Fresh instance (no password account at all) → create the default owner
 *    account so the app works out of the box.
 * 2. Owner already changed their credentials → only create the generic
 *    admin@admin.com / admin123 account when **demo mode** is enabled
 *    (Paramètres → Intégrations). That flag is the owner's explicit choice to
 *    share a try-me account — without it, the well-known credentials are never
 *    recreated (security).
 */
export const ensureAdmin = action({
  args: {},
  handler: async (ctx) => {
    const anyPassword = await ctx.runQuery(api.ensureAdmin.hasPasswordAccount);

    if (!anyPassword) {
      await createAccount(ctx as never, {
        provider: "password",
        account: { id: DEFAULT_ADMIN_EMAIL, secret: DEFAULT_ADMIN_PASSWORD },
        profile: {
          email: DEFAULT_ADMIN_EMAIL,
          name: "Admin",
          role: "admin",
        },
        shouldLinkViaEmail: false,
        shouldLinkViaPhone: false,
      });
      return { created: true, demo: false };
    }

    // The owner provisioned their own account. The generic account is only
    // (re)created when demo mode is on — and never twice.
    const demo = await ctx.runQuery(api.ensureAdmin.demoModeEnabled);
    if (!demo) {
      return { created: false, demo: false };
    }
    const demoAccountExists = await ctx.runQuery(
      api.ensureAdmin.hasDemoAccount,
    );
    if (demoAccountExists) {
      return { created: false, demo: true };
    }

    await createAccount(ctx as never, {
      provider: "password",
      account: { id: DEFAULT_ADMIN_EMAIL, secret: DEFAULT_ADMIN_PASSWORD },
      profile: {
        email: DEFAULT_ADMIN_EMAIL,
        name: "Admin (démo)",
        role: "admin",
      },
      shouldLinkViaEmail: false,
      shouldLinkViaPhone: false,
    });
    return { created: true, demo: true };
  },
});

/**
 * Removes the generic demo account (admin@admin.com) — sessions, auth links
 * and the user row. Scheduled when the owner switches demo mode off, so the
 * well-known credentials never stay valid after the demo ends.
 *
 * Lockout guard: never removes it when it is the only password login left.
 */
export const removeDemoAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const demoAccount = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", DEFAULT_ADMIN_EMAIL),
      )
      .first();
    if (!demoAccount) return { removed: false };

    const passwordAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) => q.eq("provider", "password"))
      .collect();
    if (passwordAccounts.length <= 1) {
      return { removed: false };
    }

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", demoAccount.userId))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    await ctx.db.delete(demoAccount._id);
    const user = await ctx.db.get(demoAccount.userId);
    if (user) await ctx.db.delete(user._id);
    return { removed: true };
  },
});
