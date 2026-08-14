// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// Password only: the email-code (OTP) provider was removed entirely — it let
// anyone create an account, which is a door we don't want. Freebuff federated
// sign-in still works through the customJwt provider in auth.config.ts.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
