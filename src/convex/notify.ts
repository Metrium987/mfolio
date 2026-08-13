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
  handler: async (ctx, { to, name, email, subject, message }) => {
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

    const content = [
      `Nouveau message reçu depuis le portfolio (${appName})`,
      "",
      `De : ${senderName}${senderEmail ? ` (${senderEmail})` : ""}`,
      `Sujet : ${senderSubject}`,
      "",
      "Message :",
      message.trim(),
      "",
      senderEmail ? `Répondez directement à ${senderEmail}.` : null,
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
