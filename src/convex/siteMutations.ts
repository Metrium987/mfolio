import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";
import { getCurrentUser } from "./users";
import {
  aboutValidator,
  blogValidator,
  contactValidator,
  heroValidator,
  portfolioValidator,
  resumeValidator,
  servicesValidator,
  settingsValidator,
  skillsValidator,
} from "./schema";

type SectionTable =
  | "settings"
  | "hero"
  | "about"
  | "skills"
  | "services"
  | "resume"
  | "portfolio"
  | "blog"
  | "contact";

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
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

// ---------------------------------------------------------------------------
// Section content updates (owner only)
// ---------------------------------------------------------------------------

export const updateSettings = mutation({
  args: { data: settingsValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "settings", data);
  },
});

export const updateHero = mutation({
  args: { data: heroValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "hero", data);
  },
});

export const updateAbout = mutation({
  args: { data: aboutValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "about", data);
  },
});

export const updateSkills = mutation({
  args: { data: skillsValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "skills", data);
  },
});

export const updateServices = mutation({
  args: { data: servicesValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "services", data);
  },
});

export const updateResume = mutation({
  args: { data: resumeValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "resume", data);
  },
});

export const updatePortfolio = mutation({
  args: { data: portfolioValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "portfolio", data);
  },
});

export const updateBlog = mutation({
  args: { data: blogValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "blog", data);
  },
});

export const updateContact = mutation({
  args: { data: contactValidator },
  handler: async (ctx, { data }) => {
    await requireOwner(ctx);
    await upsertDoc(ctx, "contact", data);
  },
});

// ---------------------------------------------------------------------------
// Contact form (public) + messages management (owner only)
// ---------------------------------------------------------------------------

export const addMessage = mutation({
  args: v.object({
    name: v.string(),
    email: v.string(),
    message: v.string(),
  }),
  handler: async (ctx, { name, email, message }) => {
    await ctx.db.insert("messages", {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: Date.now(),
    });
  },
});

export const deleteMessage = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, { id }) => {
    await requireOwner(ctx);
    await ctx.db.delete(id);
  },
});
