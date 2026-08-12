import { Email } from "@convex-dev/auth/providers/Email";
import axios from "axios";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

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
    // the portfolio's own name — never the platform project name
    // ("Sign in to Vercel Supabase Portfolio").
    let appName = "Mfolio";
    try {
      const site = await ctx?.db?.query("site").first();
      if (site?.siteName) appName = site.siteName;
    } catch {
      // keep the brand fallback
    }

    const subject = `Votre code de connexion — ${appName}`;
    const text = [
      "Bonjour,",
      "",
      `Voici votre code de connexion pour ${appName} :`,
      "",
      `${token}`,
      "",
      "Ce code est valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
    ].join("\n");
    const html = [
      "<p>Bonjour,</p>",
      `<p>Voici votre code de connexion pour <strong>${appName}</strong> :</p>`,
      `<p style="margin:24px 0;font-size:28px;font-weight:700;letter-spacing:6px">${token}</p>`,
      '<p style="color:#6b6b6b;font-size:13px">Ce code est valable 15 minutes. Si vous n\'êtes pas à l\'origine de cette demande, vous pouvez ignorer cet email.</p>',
    ].join("");

    // Preferred: the app's own email gateway (VLY integrations), with a fully
    // custom message. Lazy-imported so a missing integration key never breaks
    // sign-in — we simply fall back to the platform relay below.
    try {
      const { vly } = await import("../../lib/vly-integrations");
      const result = await vly.email.send({ to: email, subject, text, html });
      if (result?.success) return;
      console.error("[emailOtp] Email gateway:", result?.error ?? "failed");
    } catch (error) {
      console.error(
        "[emailOtp] Email gateway unavailable, using platform relay:",
        error,
      );
    }

    // Fallback: platform email relay, with the corrected app name.
    await axios.post(
      "https://auth.freebuff.app/send_otp",
      {
        to: email,
        otp: token,
        appName,
      },
      {
        headers: {
          "x-api-key": "fb_email_2crN1hqIArZP2bEfvjp5Qik4",
        },
      },
    );
  },
});
