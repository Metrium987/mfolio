"use node";

import { v } from "convex/values";
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
 * Email the site owner when a visitor submits the contact form. Sent through
 * the project's built-in email gateway (VLY integrations) — the same one that
 * delivers the sign-in codes — so no SMTP credentials or third-party keys are
 * required.
 */
export const sendContactEmail = action({
  args: v.object({
    to: v.string(),
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  }),
  handler: async (_ctx, { to, name, email, subject, message }) => {
    const recipient = to.trim();
    if (!recipient) return; // no notification address — silently skip

    const senderName = name.trim();
    const senderEmail = email.trim();
    const safeName = escapeHtml(senderName);
    const safeEmail = escapeHtml(senderEmail);
    const safeSubject = escapeHtml(subject.trim() || "Nouveau message");
    const safeMessage = escapeHtml(message.trim());

    const subjectLine = subject.trim()
      ? `Nouveau message — ${subject.trim()}`
      : `Nouveau message — ${senderName}`;

    const text = [
      "Nouveau message reçu depuis le portfolio",
      "",
      `De : ${senderName} (${senderEmail})`,
      subject.trim() ? `Sujet : ${subject.trim()}` : null,
      "",
      "Message :",
      message.trim(),
      "",
      `Répondez directement à ${senderEmail}.`,
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
  <p style="margin: 24px 0 0; font-size: 12px; color: #9a9a9a;">Répondez directement à ${safeEmail}.</p>
</div>`;

    // Lazy-imported so a missing integration key never breaks the mutation —
    // the gateway already proved it works by delivering the sign-in codes.
    const { vly } = await import("../lib/vly-integrations");
    const result = await vly.email.send({
      to: recipient,
      subject: subjectLine,
      text,
      html,
    });
    if (!result?.success) {
      console.error("[notify] Email gateway:", result?.error ?? "failed");
    }
  },
});
