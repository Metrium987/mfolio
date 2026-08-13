import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { sendViaEmailRelay } from "../emailRelay";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }, ctx?: any) {
    // Use the owner's site name when available so the email is branded with
    // the portfolio's own name — never the platform project name.
    let appName = "Mfolio";
    try {
      const site = await ctx?.db?.query("site").first();
      if (site?.siteName) appName = site.siteName;
    } catch {
      // keep the brand fallback
    }

    // Platform email relay — the only working email channel on Freebuff Web.
    // The legacy VLY gateway (VLY_INTEGRATION_KEY + integrations.vly.ai) rejects
    // every token with 401 "Invalid token" since the vly.ai → Freebuff
    // acquisition; see docs/email-notification.md.
    const result = await sendViaEmailRelay({ to: email, appName, otp: token });
    if (!result.ok) {
      console.error("[emailOtp] Email relay:", result.error);
    }
  },
});
