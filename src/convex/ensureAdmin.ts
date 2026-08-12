import { createAccount } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { action, query } from "./_generated/server";

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

export const ensureAdmin = action({
  args: {},
  handler: async (ctx) => {
    const exists = await ctx.runQuery(api.ensureAdmin.hasPasswordAccount);
    if (exists) {
      return { created: false };
    }

    // createAccount expects the auth framework's action ctx; a plain action
    // ctx has the same runtime shape (runMutation + runQuery), so the cast is
    // safe — this is exactly how the Password provider provisions accounts.
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

    return { created: true };
  },
});
