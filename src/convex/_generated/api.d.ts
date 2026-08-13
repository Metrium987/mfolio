/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as credentials from "../credentials.js";
import type * as emailRelay from "../emailRelay.js";
import type * as ensureAdmin from "../ensureAdmin.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as notify from "../notify.js";
import type * as scheduler from "../scheduler.js";
import type * as seed from "../seed.js";
import type * as site from "../site.js";
import type * as siteMutations from "../siteMutations.js";
import type * as translate from "../translate.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  credentials: typeof credentials;
  emailRelay: typeof emailRelay;
  ensureAdmin: typeof ensureAdmin;
  files: typeof files;
  http: typeof http;
  notify: typeof notify;
  scheduler: typeof scheduler;
  seed: typeof seed;
  site: typeof site;
  siteMutations: typeof siteMutations;
  translate: typeof translate;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
