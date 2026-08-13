"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { sendViaEmailRelay } from "./emailRelay";

/**
 * Email the site owner when a visitor submits the contact form. Sent through
 * the Freebuff Web platform email relay — the same one that delivers the
 * sign-in codes — so no SMTP credentials or third-party keys are required.
 *
 * The relay only accepts { to, appName, otp } and formats emails as sign-in
 * messages, so the full contact details go into the "otp" field, which is what
 * appears in the email body.
 */
export const sendContactEmail = action({
  args: v.object({
    to: v.string(),
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  }),
  handler: async (ctx, { to, name, email, subject }) => {
    const recipient = to.trim();
    if (!recipient) return; // no notification address — silently skip

    const senderName = name.trim() || "Visiteur";
    const senderEmail = email.trim();
    const senderSubject = subject.trim() || "Sans objet";

    let appName = "Mfolio";
    try {
      const data = await ctx.runQuery(api.site.getSiteData, {});
      if (data?.site?.siteName) appName = data.site.siteName;
    } catch {
      // keep the brand fallback
    }

    // Simple notification only — the full message stays in the dashboard's
    // Messages section. The relay formats every email as a short sign-in style
    // message, so keeping the payload brief keeps the rendering clean.
    const content = [
      `Nouveau message reçu sur votre portfolio (${appName})`,
      "",
      `De : ${senderName}${senderEmail ? ` (${senderEmail})` : ""}`,
      `Sujet : ${senderSubject}`,
      "",
      "Connectez-vous au tableau de bord pour lire le message.",
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    const result = await sendViaEmailRelay({
      to: recipient,
      appName,
      otp: content,
    });

    if (!result.ok) {
      console.error("[notify] Email relay:", result.error);
    }
  },
});
