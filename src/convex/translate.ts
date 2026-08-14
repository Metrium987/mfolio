"use node";

import { action, type ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { levelLabel, levelToNumber } from "../lib/levels";
import {
  aboutValidator,
  blogValidator,
  interestsValidator,
  languagesValidator,
  portfolioValidator,
  resumeValidator,
  servicesValidator,
  settingsValidator,
  siteValidator,
  skillsValidator,
  ROLES,
} from "./schema";

export type SectionName =
  | "site"
  | "settings"
  | "about"
  | "skills"
  | "services"
  | "resume"
  | "portfolio"
  | "blog"
  | "languages"
  | "interests";

export const CONTENT_SECTIONS = [
  "site",
  "settings",
  "about",
  "skills",
  "services",
  "resume",
  "portfolio",
  "blog",
  "languages",
  "interests",
] as const;

/**
 * Translatable text fields per section. "*" expands to every array index, so
 * the English mirror always matches the current French content by position.
 */
const SECTION_PATHS: Record<SectionName, string[][]> = {
  site: [["tagline"], ["footerText"]],
  settings: [["metaTitle"], ["metaDescription"]],
  about: [["description"], ["taglines", "*"]],
  skills: [["title"], ["description"], ["items", "*", "name"]],
  services: [
    ["title"],
    ["description"],
    ["items", "*", "title"],
    ["items", "*", "details"],
  ],
  resume: [
    ["title"],
    ["description"],
    ["experiences", "*", "position"],
    ["experiences", "*", "details"],
    ["experiences", "*", "location"],
    ["experiences", "*", "contractType"],
    ["experiences", "*", "achievements", "*"],
    ["educations", "*", "degree"],
    ["educations", "*", "department"],
    ["educations", "*", "thesis"],
  ],
  portfolio: [
    ["title"],
    ["description"],
    ["projects", "*", "title"],
    ["projects", "*", "categories", "*"],
    ["projects", "*", "details"],
    ["projects", "*", "role"],
    ["projects", "*", "result"],
  ],
  blog: [
    ["title"],
    ["description"],
    ["posts", "*", "title"],
    ["posts", "*", "excerpt"],
    ["posts", "*", "content"],
  ],
  languages: [
    ["title"],
    ["description"],
    ["items", "*", "name"],
    ["items", "*", "level"],
  ],
  interests: [
    ["title"],
    ["description"],
    ["items", "*", "name"],
    ["items", "*", "details"],
  ],
};

/** Expand a single path pattern ("*" = any array index) into concrete paths. */
function expandPaths(
  obj: unknown,
  pattern: string[],
): (string | number)[][] {
  const results: (string | number)[][] = [];
  const walk = (
    current: unknown,
    depth: number,
    prefix: (string | number)[],
  ) => {
    if (depth === pattern.length) {
      results.push(prefix);
      return;
    }
    const key = pattern[depth];
    if (key === "*") {
      if (Array.isArray(current)) {
        current.forEach((_, index) =>
          walk(current[index], depth + 1, [...prefix, index]),
        );
      }
      return;
    }
    if (current && typeof current === "object") {
      const value = (current as Record<string, unknown>)[key];
      if (value !== undefined) walk(value, depth + 1, [...prefix, key]);
    }
  };
  walk(obj, 0, []);
  return results;
}

function getAt(obj: unknown, path: (string | number)[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
}

function setAt(
  obj: Record<string, unknown>,
  path: (string | number)[],
  value: string,
) {
  let current: unknown = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const next = path[i + 1];
    let child = (current as Record<string | number, unknown>)[key];
    if (child === undefined || child === null) {
      child = typeof next === "number" ? [] : {};
      (current as Record<string | number, unknown>)[key] = child;
    }
    current = child;
  }
  (current as Record<string | number, unknown>)[path[path.length - 1]] =
    value;
}

const CHUNK_SIZE = 50;

/**
 * Translate a list of strings via the DeepL API. Free accounts (key ends with
 * ":fx") use the api-free host; pro accounts use the main host. Empty strings
 * are passed through untouched (DeepL rejects empty text).
 */
async function translateStrings(
  apiKey: string,
  strings: string[],
): Promise<string[]> {
  const host = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const out: string[] = strings.map(() => "");
  const nonEmpty = strings
    .map((text, index) => ({ index, text }))
    .filter(({ text }) => text.trim() !== "");

  for (let start = 0; start < nonEmpty.length; start += CHUNK_SIZE) {
    const chunk = nonEmpty.slice(start, start + CHUNK_SIZE);
    const response = await fetch(host, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: JSON.stringify({
        text: chunk.map(({ text }) => text),
        source_lang: "FR",
        target_lang: "EN-US",
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `DeepL error ${response.status}: ${detail.slice(0, 300)}`,
      );
    }
    const json = (await response.json()) as {
      translations: { text: string }[];
    };
    chunk.forEach(({ index }, offset) => {
      out[index] = json.translations[offset]?.text ?? "";
    });
  }
  return out;
}

type TranslateCtx = ActionCtx;

/** The stored DeepL key, or null when not configured / not the owner. */
async function getDeepLApiKey(ctx: TranslateCtx): Promise<string | null> {
  const settings = await ctx.runQuery(api.site.getSettingsForBackend);
  return settings?.deeplApiKey?.trim() || null;
}

/** Translate a section's content and build its English mirror. */
async function translateOne(
  ctx: TranslateCtx,
  section: SectionName,
  data: Record<string, unknown>,
): Promise<unknown | null> {
  const apiKey = await getDeepLApiKey(ctx);
  if (!apiKey) return null;

  const paths = SECTION_PATHS[section].flatMap((pattern) =>
    expandPaths(data, pattern),
  );
  if (paths.length === 0) return {};

  const source = paths.map((path) => {
    const raw = getAt(data, path);
    // Languages levels are stored as 1–5 numbers — translate the canonical
    // label ("Avancé") instead of the raw digit, so the English mirror shows
    // a readable level text that the site still maps back to the same dots.
    if (section === "languages" && path[path.length - 1] === "level") {
      return levelLabel(levelToNumber(raw as string | number));
    }
    return String(raw ?? "");
  });
  const translated = await translateStrings(apiKey, source);

  const en: Record<string, unknown> = {};
  paths.forEach((path, index) => setAt(en, path, translated[index]));
  return en;
}

/** Require the owner (admin role), translate, then persist both languages. */
async function translateAndPersist(
  ctx: TranslateCtx,
  section: SectionName,
  data: Record<string, unknown>,
) {
  const user = await ctx.runQuery(api.users.currentUser);
  if (!user || user.role !== ROLES.ADMIN) throw new Error("Not authorized");

  let en: unknown;
  try {
    const translated = await translateOne(ctx, section, data);
    if (translated) en = translated;
  } catch (error) {
    console.error(`[translate] ${section} failed, saving French only:`, error);
  }

  await ctx.runMutation(api.siteMutations.persistSection, {
    section,
    data,
    en: en ?? undefined,
  });
}

// ---------------------------------------------------------------------------
// Section updates (owner only) — French source + auto-generated English
// ---------------------------------------------------------------------------

export const updateSite = action({
  args: { data: siteValidator },
  handler: async (ctx, { data }) => {
    await translateAndPersist(ctx, "site", data);
  },
});

export const updateSettings = action({
  args: { data: settingsValidator },
  handler: async (ctx, { data }) => {
    // The client only ever sees sanitized secrets (""), so preserve the stored
    // values here — keys are managed exclusively via updateIntegrations.
    const raw = await ctx.runQuery(api.site.getSettingsForBackend);
    const deeplApiKey =
      data.deeplApiKey.trim() === "" && raw?.deeplApiKey
        ? raw.deeplApiKey
        : data.deeplApiKey;
    await translateAndPersist(ctx, "settings", {
      ...data,
      deeplApiKey,
    });
  },
});

export const updateAbout = action({
  args: { data: aboutValidator },
  handler: async (ctx, { data }) => {
    await translateAndPersist(ctx, "about", data);
  },
});

export const updateSkills = action({
  args: { data: skillsValidator },
  handler: async (ctx, { data }) => {
    await translateAndPersist(ctx, "skills", data);
  },
});

export const updateServices = action({
  args: { data: servicesValidator },
  handler: async (ctx, { data }) => {
    await translateAndPersist(ctx, "services", data);
  },
});

export const updateResume = action({
  args: { data: resumeValidator },
  handler: async (ctx, { data }) => {
    await translateAndPersist(ctx, "resume", data);
  },
});

export const updatePortfolio = action({
  args: { data: portfolioValidator },
  handler: async (ctx, { data }) => {
    await translateAndPersist(ctx, "portfolio", data);
  },
});

export const updateBlog = action({
  args: { data: blogValidator },
  handler: async (ctx, { data }) => {
    await translateAndPersist(ctx, "blog", data);
  },
});

export const updateLanguages = action({
  args: { data: languagesValidator },
  handler: async (ctx, { data }) => {
    await translateAndPersist(ctx, "languages", data);
  },
});

export const updateInterests = action({
  args: { data: interestsValidator },
  handler: async (ctx, { data }) => {
    await translateAndPersist(ctx, "interests", data);
  },
});

/**
 * Translate every section at once (used after a DeepL key is first entered,
 * so existing content gets an English version without re-saving each section).
 */
export const translateAllContent = action({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.users.currentUser);
    if (!user || user.role !== ROLES.ADMIN) throw new Error("Not authorized");

    const results: Record<string, "ok" | "skipped" | "failed"> = {};
    const apiKey = await getDeepLApiKey(ctx);
    if (!apiKey) {
      for (const section of CONTENT_SECTIONS) results[section] = "skipped";
      return results;
    }

    const data = await ctx.runQuery(api.site.getSiteData);
    const rawSettings = await ctx.runQuery(api.site.getSettingsForBackend);

    for (const section of CONTENT_SECTIONS) {
      const doc = section === "settings" ? rawSettings : data[section];
      if (!doc) {
        results[section] = "skipped";
        continue;
      }
      const { _id, _creationTime, en: _oldEn, ...content } = doc as Record<
        string,
        unknown
      > & {
        _id?: unknown;
        _creationTime?: unknown;
        en?: unknown;
      };
      void _id;
      void _creationTime;
      void _oldEn;
      try {
        const translated = await translateOne(ctx, section, content);
        if (!translated) {
          results[section] = "skipped";
          continue;
        }
        await ctx.runMutation(api.siteMutations.persistSection, {
          section,
          data: content,
          en: translated,
        });
        results[section] = "ok";
      } catch (error) {
        console.error(`[translate] ${section} failed:`, error);
        results[section] = "failed";
      }
    }
    return results;
  },
});
