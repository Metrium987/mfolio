import { v } from "convex/values";
import { action, mutation } from "./_generated/server";

/**
 * Convex storage helpers for the admin dashboard image uploads.
 * The client uploads to the URL returned by generateUploadUrl, then resolves
 * the permanent public URL via getUrl and stores that string in the doc.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const deleteFile = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await ctx.storage.delete(storageId);
  },
});
