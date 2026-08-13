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
 * Email the site owner when a visitor submits the contact form. Triggered in
 * the background by the `addMessage` mutation (which passes the owner's Resend
 * key + destination email as arguments, since this action runs unauthenticated
 * and therefore can't read the owner-only settings itself).
 */
export const sendContactEmail = action({
  args: v.object({
    apiKey: v.string(),
    to: v.string(),
    fromName: v.string(),
    fromEmail: v.string(),
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  }),
  handler: async (
    ctx,
    { apiKey, to, fromName, fromEmail, name, email, subject, message },
  ) => {
    if (!apiKey || !to) return;

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject || "Nouveau message");
    const safeMessage = escapeHtml(message);
    const senderName = escapeHtml(fromName || "MFolio");

    const subjectLine = subject.trim()
      ? `Nouveau message — ${subject.trim()}`
      : `Nouveau message — ${name.trim()}`;

    const text = [
      "Nouveau message reçu depuis le portfolio",
      "",
      `De : ${name} (${email})`,
      subject.trim() ? `Sujet : ${subject.trim()}` : null,
      "",
      "Message :",
      message,
      "",
      `Répondez directement à cet email pour répondre à ${name}.`,
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

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `${senderName} <${fromEmail}>`,
        to: [to],
        reply_to: email.trim(),
        subject: subjectLine,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `Resend error ${response.status}: ${detail.slice(0, 300)}`,
      );
    }
  },
});
