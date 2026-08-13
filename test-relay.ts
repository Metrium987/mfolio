// Essai de notification via le relais email Freebuff Web (auth.freebuff.app/send_otp)
// Même appel que celui utilisé par les codes de connexion dans src/convex/auth/emailOtp.ts

const RELAY = "https://auth.freebuff.app/send_otp";
const API_KEY = "fb_email_2crN1hqIArZP2bEfvjp5Qik4";

const payload = {
  to: "ludovic.lou@gmail.com",
  appName: "Mfolio — Essai notification",
  otp: "ESSAI-TEST-123 (message de test via script, à ignorer)",
};

console.log("POST", RELAY);
console.log("Payload:", JSON.stringify(payload, null, 2));

try {
  const res = await fetch(RELAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  console.log("\nHTTP", res.status);
  console.log("Réponse:", body.slice(0, 2000));
} catch (err) {
  console.error("\nErreur réseau:", err);
  process.exit(1);
}
