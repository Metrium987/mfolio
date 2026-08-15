"use node";

import { v } from "convex/values";
import nodemailer from "nodemailer";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { sendViaEmailRelay } from "./emailRelay";

/**
 * Email the site owner when a visitor submits the contact form.
 *
 * Two channels, chosen by the settings (Intégrations):
 *  - **SMTP (Gmail app password)** — when `smtp` is passed (enabled + user +
 *    app password set): a real sender, better deliverability, and fully
 *    portable (works outside Freebuff). Sent with nodemailer from the `to`
 *    address configured by the owner.
 *  - **Platform email relay** — the fallback: no credentials required. The
 *    relay only accepts { to, appName, otp } and formats emails as sign-in
 *    messages, so the contact details go into the "otp" field, which is what
 *    appears in the email body.
 *
 * The SMTP config is passed as an argument (not read from the DB) because
 * this action is triggered by a visitor via ctx.scheduler.runAfter — it runs
 * unauthenticated and cannot read owner-only data.
 */
export const sendContactEmail = action({
  args: v.object({
    to: v.string(),
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    smtp: v.optional(
      v.object({
        host: v.string(),
        port: v.number(),
        secure: v.boolean(),
        user: v.string(),
        pass: v.string(),
      }),
    ),
  }),
  handler: async (ctx, { to, name, email, subject, message, smtp }) => {
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
    // Messages section.
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

    // SMTP channel (Gmail by default) — proper sender, better deliverability.
    if (smtp && smtp.host && smtp.user && smtp.pass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          auth: { user: smtp.user, pass: smtp.pass },
        });
        await transporter.sendMail({
          from: `"${appName}" <${smtp.user}>`,
          to: recipient,
          subject: `Nouveau message sur votre portfolio (${senderName})`,
          text: content,
        });
      } catch (error) {
        console.error("[notify] SMTP:", error);
      }
      return;
    }

    // Fallback: the Freebuff Web platform email relay.
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

/**
 * Owner-only test of the SMTP configuration (Intégrations → « Envoyer un
 * email de test »). Verifies the credentials against the server and sends a
 * confirmation email to the notification address (falling back to the SMTP
 * sender itself). The owner check is the `getSettingsForBackend` query below,
 * which returns null for anyone who is not the admin — and the raw settings
 * (including the write-only app password) never leave the backend.
 */
export const sendTestEmail = action({
  args: {},
  // The explicit return type breaks TypeScript's circular inference (the
  // handler's return references `api` for the owner-gated settings query).
  handler: async (
    ctx,
  ): Promise<{ ok: true; to: string } | { ok: false; error: string }> => {
    const settings = await ctx.runQuery(api.site.getSettingsForBackend);
    if (!settings) throw new Error("Réservé au propriétaire");

    const host = settings.smtpHost?.trim() || "smtp.gmail.com";
    const port = settings.smtpPort ?? 465;
    const secure = settings.smtpSecure !== false;
    const smtpUser = settings.smtpUser?.trim() || "";
    const smtpPass = settings.smtpPass ?? "";

    if (!smtpUser || !smtpPass) {
      return {
        ok: false,
        error:
          "Configuration SMTP incomplète — renseignez l'adresse Gmail et le mot de passe d'application.",
      } as const;
    }

    const to = settings.notificationEmail?.trim() || smtpUser;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    try {
      await transporter.verify(); // validates credentials + server
      await transporter.sendMail({
        from: `"Mfolio" <${smtpUser}>`,
        to,
        subject: "Mfolio — test SMTP",
        text: "Si vous lisez cet email, votre SMTP Gmail est correctement configuré. ✅",
      });
      return { ok: true, to } as const;
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Échec de la connexion SMTP",
      } as const;
    }
  },
});
