import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";
import { ROLES } from "./schema";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

/**
 * Get the current signed-in user when they are the site owner (admin role).
 * Returns null when not signed in or when the user is not the owner. Every
 * owner-only query/mutation must go through this gate (actions use the
 * equivalent `ctx.runQuery(api.users.currentUser)` role check).
 */
export const getCurrentAdmin = async (ctx: QueryCtx) => {
  const user = await getCurrentUser(ctx);
  if (!user || user.role !== ROLES.ADMIN) return null;
  return user;
};
