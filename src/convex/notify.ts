"use node";

import { v } from "convex/values";
import { createTransport } from "nodemailer";
import { action } from "./_generated/server";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Email the site owner when a visitor submits the contact form. Sends through
 * the Gmail SMTP server using credentials from environment variables — never
 * stored in the database, so the app password stays server-side only.
 *
 * Credentials come from the owner's dashboard settings (smtpUser / smtpPass,
 * passed in by the `addMessage` mutation) with the SMTP_USER / SMTP_PASS
 * environment variables as a fallback. Optional: SMTP_HOST (default
 * smtp.gmail.com), SMTP_PORT (default 465).
 */
export const sendContactEmail = action({
  args: v.object({
    to: v.string(),
    fromName: v.string(),
    smtpUser: v.optional(v.string()),
    smtpPass: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  }),
  handler: async (
    _ctx,
    { to, fromName, smtpUser, smtpPass, name, email, subject, message },
  ) => {
    const user = (smtpUser?.trim() || process.env.SMTP_USER?.trim() || "").trim();
    const pass = (smtpPass?.trim() || process.env.SMTP_PASS?.trim() || "").trim();
    if (!user || !pass || !to) return; // SMTP not configured — silently skip

    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);

    const transporter = createTransport({
      host,
      port,
      secure: port === 465, // implicit TLS on the standard Gmail port
      auth: { user, pass },
    });

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeSubject = escapeHtml(subject.trim() || "Nouveau message");
    const safeMessage = escapeHtml(message.trim());

    const subjectLine = subject.trim()
      ? `Nouveau message — ${subject.trim()}`
      : `Nouveau message — ${name.trim()}`;

    const text = [
      "Nouveau message reçu depuis le portfolio",
      "",
      `De : ${name.trim()} (${email.trim()})`,
      subject.trim() ? `Sujet : ${subject.trim()}` : null,
      "",
      "Message :",
      message.trim(),
      "",
      `Répondez directement à cet email pour répondre à ${name.trim()}.`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const html = `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; line-height: 1.6;">
  <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #9a9a9a;">Nouveau message — portfolio</p>
  <h1 style="margin: 0 0 24px; font-size: 22px; font-weight: 500;">Nouveau message reçu</h1>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr>
      <td style="padding: 6px 0; color: #9a9a9a; width: 96px; vertical-align: top;">De</td>
      <td style="padding: 6px 0;"><strong>${safeName}</strong> · ${safeEmail}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; color: #9a9a9a; vertical-align: top;">Sujet</td>
      <td style="padding: 6px 0;">${safeSubject}</td>
    </tr>
  </table>
  <div style="margin-top: 16px; padding: 16px 18px; background: #f6f5f2; border-radius: 6px; white-space: pre-wrap;">${safeMessage}</div>
  <p style="margin: 24px 0 0; font-size: 12px; color: #9a9a9a;">Répondez directement à cet email pour répondre à ${safeName}.</p>
</div>`;

    // Gmail only sends from the authenticated account, so the envelope
    // address is SMTP_USER while the display name stays the portfolio owner.
    await transporter.sendMail({
      from: { name: fromName.trim() || "Portfolio", address: user },
      to,
      replyTo: email.trim(),
      subject: subjectLine,
      text,
      html,
    });
  },
});
