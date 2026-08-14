import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  action,
  mutation,
  type ActionCtx,
  type MutationCtx,
} from "./_generated/server";
import { ROLES } from "./schema";
import { getCurrentAdmin } from "./users";

/**
 * Convex storage helpers for the admin dashboard image uploads.
 * The client uploads to the URL returned by generateUploadUrl, then resolves
 * the permanent public URL via getUrl and stores that string in the doc.
 *
 * All three helpers are owner-only: storage is not a public resource. The
 * public site only ever reads the resolved URL strings stored in the docs —
 * it never calls these functions. Without this gate, any signed-in account
 * (e.g. one created through the public email-code flow) could upload files,
 * read arbitrary storage IDs and delete the owner's images.
 */

/** Actions: require the current signed-in user to be the owner (admin role). */
async function requireAdminAction(ctx: ActionCtx) {
  const user = await ctx.runQuery(api.users.currentUser);
  if (!user || user.role !== ROLES.ADMIN) throw new Error("Not authorized");
}

/** Mutations: require the current signed-in user to be the owner (admin role). */
async function requireAdminMutation(ctx: MutationCtx) {
  const user = await getCurrentAdmin(ctx);
  if (!user) throw new Error("Not authorized");
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdminMutation(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await requireAdminAction(ctx);
    return await ctx.storage.getUrl(storageId);
  },
});

export const deleteFile = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await requireAdminAction(ctx);
    await ctx.storage.delete(storageId);
  },
});
