/**
 * Freebuff Web platform email relay — the only working email channel on this
 * platform. The legacy VLY gateway (`VLY_INTEGRATION_KEY` + integrations.vly.ai)
 * rejects every token with 401 "Invalid token" since the vly.ai → Freebuff
 * acquisition; see docs/email-notification.md for the full investigation.
 *
 * This relay is also what delivers the sign-in codes (src/convex/auth/emailOtp.ts).
 * Note: it formats every email as a sign-in message ("Sign in to …", code in the
 * body), which is perfect for codes and acceptable as a stopgap for contact
 * notifications.
 *
 * ⚠️ Backend-only: the API key below must never be exposed to the client.
 */

const RELAY_URL = "https://auth.freebuff.app/send_otp";
const RELAY_API_KEY = "fb_email_2crN1hqIArZP2bEfvjp5Qik4";

export type RelayResult = { ok: true; id?: string } | { ok: false; error: string };

export async function sendViaEmailRelay(payload: {
  to: string;
  appName: string;
  otp: string;
}): Promise<RelayResult> {
  try {
    const response = await fetch(RELAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": RELAY_API_KEY,
      },
      body: JSON.stringify({
        to: payload.to,
        appName: payload.appName,
        otp: payload.otp,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
      data?: { id?: string };
    };

    if (!response.ok) {
      return {
        ok: false,
        error: body?.message ?? `Relay HTTP ${response.status}`,
      };
    }
    return { ok: true, id: body?.data?.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Relay request failed",
    };
  }
}
