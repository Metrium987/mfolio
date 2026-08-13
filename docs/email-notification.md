# Notification email — constat et canal fiable (Freebuff Web)

> **Date :** août 2026 · **Contexte :** rachat de vly.ai par Freebuff
> Ce document consigne une information cruciale vérifiée par des tests réels, pour ne pas avoir à la redécouvrir.

## TL;DR

- La clé `VLY_INTEGRATION_KEY` (`sk_…`) + la passerelle `integrations.vly.ai` **ne fonctionnent plus** (401 « Invalid token »). C'est un reliquat de l'ancienne plateforme vly.ai, encore injecté par Freebuff Web mais **rejeté** par la passerelle.
- Le **seul canal email qui fonctionne** sur Freebuff Web est le relais de la plateforme : `https://auth.freebuff.app/send_otp`, avec la clé `x-api-key` fournie par le template.
- Il est utilisé par les **codes de connexion** (`src/convex/auth/emailOtp.ts`) — preuve qu'il délivre réellement les emails.
- ⚠️ Il formate l'email comme un **email de code de connexion** (objet « Sign in to … », corps « Enter this code on the sign-in page … »). On ne contrôle pas l'objet ni le corps : seul le contenu du champ `otp` passe dans le corps.

## Les faits vérifiés (tests réels)

| Canal | Test | Résultat |
|---|---|---|
| `integrations.vly.ai/v1/email/send` (Bearer `sk_…`) | POST avec les headers exacts du SDK (`X-Vly-Version: 0.1.0`) | ❌ **401 `Invalid token`** |
| `integrations.vly.ai/v1/llm/chat/completions` | POST avec la même clé | ❌ **401 `Invalid token`** |
| `integrations.freebuff.com` | DNS | ❌ n'existe plus |
| `integrations.freebuff.dev` | toutes routes sondées | ❌ 404 « Not found » |
| **`auth.freebuff.app/send_otp`** | POST avec `x-api-key` | ✅ **200 `{"message":"Email sent","data":{"id":"…"}}`** |

La clé `VLY_INTEGRATION_KEY` a été contrôlée : identique dans l'interface Keys/API keys et dans l'environnement Convex (`convex env list`). Le 401 vient donc bien de la passerelle, pas d'une erreur de saisie.

## Le relais qui marche

**Endpoint :** `POST https://auth.freebuff.app/send_otp`

**En-têtes :**
```
Content-Type: application/json
x-api-key: fb_email_2crN1hqIArZP2bEfvjp5Qik4
```

**Corps (validation Zod, les 3 champs requis) :**
```json
{
  "to": "destinataire@exemple.com",
  "appName": "Nom affiché dans l'objet",
  "otp": "contenu placé dans le corps de l'email"
}
```

**Réponse succès :**
```json
{ "message": "Email sent", "data": { "id": "caccca5c-7312-4020-ae98-33872442df51" } }
```

**Erreur connue (domaines de test) :** envoyer vers `example.com` renvoie une erreur 422 de Resend (« Please use our testing email address »). Les adresses réelles (gmail.com, etc.) fonctionnent.

## À quoi ressemble l'email reçu (test réel du 13/08/2026)

Envoyé vers `ludovic.lou@gmail.com` avec `appName = "Mfolio — Essai notification"` et `otp = "ESSAI-TEST-123 (message de test via script, à ignorer)"` :

- **Objet :** `Sign in to Mfolio — Essai notification`
- **Corps :**
  > Enter this code on the sign-in page.
  >
  > ESSAI-TEST-123 (message de test via script, à ignorer)
  >
  > This code expires in 1 hour.
  > If you didn't request it, you can safely ignore this email.

**Conséquence :** le relais est parfait pour les codes de connexion, mais **inadapté tel quel pour une notification de contact professionnelle** — le message y apparaîtrait comme un « code de connexion » avec « expires in 1 hour ».

## Où c'est utilisé dans le projet

- `src/convex/auth/emailOtp.ts` — envoi des codes de connexion : tente d'abord la passerelle `vly.email.send` (échoue en silence, 401), puis bascule sur le relais `auth.freebuff.app/send_otp`. C'est pour ça que la connexion fonctionne malgré la clé morte.
- `src/convex/notify.ts` — notification de contact : utilise uniquement `vly.email.send` → **échoue actuellement** avec « Invalid token ».

## Options pour la notification de contact

1. **Re-brancher `notify.ts` sur le relais `auth.freebuff.app/send_otp`** (même appel que les codes) :
   - ✅ fonctionne dès maintenant, zéro configuration, clé déjà dans le repo ;
   - ⚠️ l'email reçu sera formaté comme un email de code (« Sign in to … », « expires in 1 hour ») — acceptable en dépannage, pas idéal pour un portfolio pro.
2. **Attendre que Freebuff corrige la provision de `VLY_INTEGRATION_KEY`** (point support plateforme, non réparable depuis le code) : dès que la clé est valide, `notify.ts` actuel fonctionnera sans modification.
3. **Service tiers (Resend/SendGrid…) avec sa propre clé** : rendu propre, mais nécessite une clé API personnelle et un domaine vérifié.

## Sécurité

- La clé `x-api-key` du relais est **hardcodée dans le template** (`src/convex/auth/emailOtp.ts`). Elle ne doit **jamais** être exposée côté client : tous les appels doivent passer par du code backend (Convex actions / `"use node"`).
- La clé `VLY_INTEGRATION_KEY` ne doit pas non plus sortir du backend (elle est lue via `process.env`).

## Script de test

Un script autonome `test-relay.ts` (racine du projet) permet de re-tester le relais à tout moment :
```bash
bun run test-relay.ts
```
(à supprimer une fois la décision prise, si besoin)
