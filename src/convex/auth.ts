import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// Password only: the email-code (OTP) provider was removed entirely — it let
// anyone create an account, which is a door we don't want. There is no
// federated sign-in: the owner password is the only way in.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
