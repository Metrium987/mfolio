import { modifyAccountCredentials } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public state of the password account, used by the login page hint and the
 * dashboard security card. Only reveals the login email — never the password.
 */
export const getPasswordAccount = query({
  args: {},
  handler: async (ctx) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) => q.eq("provider", "password"))
      .first();
    if (!account) return null;
    const user = await ctx.db.get(account.userId);
    return {
      email: account.providerAccountId,
      isDefault: user?.credentialsChanged !== true,
    };
  },
});

/** Change the login email of the password account (owner only). */
export const updateAdminEmail = mutation({
  args: { newEmail: v.string() },
  handler: async (ctx, { newEmail }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const email = newEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw new Error("Adresse email invalide");

    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) => q.eq("provider", "password"))
      .first();
    if (!account) throw new Error("Compte mot de passe introuvable");

    if (account.providerAccountId === email) {
      return { changed: false };
    }

    // Refuse an email already used by another account.
    const otherUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
    if (otherUser && otherUser._id !== account.userId) {
      throw new Error("Cet email est déjà utilisé par un autre compte");
    }

    await ctx.db.patch(account._id, { providerAccountId: email });
    await ctx.db.patch(account.userId, { email, credentialsChanged: true });
    return { changed: true };
  },
});

/** Change the password of the password account (owner only). */
export const updateAdminPassword = action({
  args: { newPassword: v.string() },
  handler: async (ctx, { newPassword }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const password = newPassword;
    if (password.length < 8) {
      throw new Error("Le mot de passe doit contenir au moins 8 caractères");
    }

    const account = await ctx.runQuery(api.credentials.getPasswordAccount);
    if (!account) throw new Error("Compte mot de passe introuvable");

    await modifyAccountCredentials(ctx as never, {
      provider: "password",
      account: { id: account.email, secret: password },
    });
    await ctx.runMutation(api.credentials.markCredentialsChanged);
  },
});

/** Flag the password account's user as no longer using the default credentials. */
export const markCredentialsChanged = mutation({
  args: {},
  handler: async (ctx) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) => q.eq("provider", "password"))
      .first();
    if (!account) return;
    await ctx.db.patch(account.userId, { credentialsChanged: true });
  },
});
