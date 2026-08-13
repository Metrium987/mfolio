# Notification email — canal fiable et implémentation retenue (Freebuff Web)

> **Date :** août 2026 · **Contexte :** rachat de vly.ai par Freebuff
> Ce document consigne une information cruciale **vérifiée par des tests réels**, pour ne pas avoir à la redécouvrir — et pour aider d'autres projets Freebuff Web.

## TL;DR

- La clé `VLY_INTEGRATION_KEY` (`sk_…`) + la passerelle `integrations.vly.ai` **ne fonctionnent plus** (401 « Invalid token »). C'est un reliquat de l'ancienne plateforme vly.ai, encore injecté par Freebuff Web mais **rejeté** par la passerelle.
- Le **seul canal email qui fonctionne** sur Freebuff Web est le relais de la plateforme : `https://auth.freebuff.app/send_otp`, avec la clé `x-api-key` fournie par le template.
- **Implémentation retenue :** la notification de contact est un **simple avis** (sans le texte du message) envoyé via ce relais. Le message complet reste dans le tableau de bord.
- ⚠️ Le relais formate l'email comme un email de code (objet « Sign in to … ») : on ne contrôle ni l'objet ni le template. Parfait pour les codes, acceptable pour une notification courte.

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
  "appName": "Nom affiché dans l'objet de l'email",
  "otp": "contenu placé dans le corps de l'email"
}
```

**Réponse succès :**
```json
{ "message": "Email sent", "data": { "id": "…" } }
```

**Erreur connue :** envoyer vers `example.com` renvoie une erreur 422 de Resend (« Please use our testing email address »). Les adresses réelles (gmail.com, etc.) fonctionnent.

## Rendu de l'email (testé)

- **Avec `appName` = « Mfolio — Essai notification » et un code :** objet `Sign in to Mfolio — Essai notification`, corps « Enter this code on the sign-in page. … This code expires in 1 hour. »
- **Avec un très long contenu (~2 400 caractères) dans `otp` :** le texte est passé **intégralement** (pas de troncature constatée), accents et sauts de ligne conservés. Mais l'affichage est brut — c'est ce qui a motivé la décision de **ne pas** envoyer le message complet par email.

## Implémentation retenue (dans ce projet)

| Fichier | Rôle |
|---|---|
| `src/convex/emailRelay.ts` | **Helper partagé** : un seul endroit qui appelle le relais (`sendViaEmailRelay({ to, appName, otp })`). Backend uniquement, la clé n'est jamais exposée au client. |
| `src/convex/notify.ts` | Action `sendContactEmail` : **notification courte** (avis + nom + email + sujet), **sans le texte du message**. |
| `src/convex/auth/emailOtp.ts` | Codes de connexion : envoi **direct** via le relais (plus de tentative morte vers la passerelle). |
| `src/convex/siteMutations.ts` | `addMessage` enregistre le message complet en base puis planifie l'action de notification. |

**Contenu de l'email de notification (tel que reçu) :**
```
Nouveau message reçu sur votre portfolio (Ludovic LOU)
De : Test Message Long (visiteur-long@example.com)
Sujet : Test message tres long
Connectez-vous au tableau de bord pour lire le message.
```

## Ce qui a été supprimé (nettoyage)

- `src/lib/vly-integrations.ts` (module mort de la passerelle vly.ai).
- Dépendances `axios` et `@vly-ai/integrations` (package.json + lockfile).
- `import '@vly-ai/integrations'` dans `src/main.tsx` (import d'effet de bord du template — aurait cassé le build).
- `test-relay.ts` (script de test jetable).

## Tester soi-même

Le parcours complet se teste sans toucher au code :

```bash
bunx convex run siteMutations:addMessage '{"name":"Test","email":"visiteur@example.com","subject":"Sujet","message":"Contenu"}' 
```

Vérifier ensuite : le message apparaît dans **Portfolio → Messages** du tableau de bord, et l'email de notification arrive sur l'**« Email de notification »** (ou l'email de contact à défaut) défini dans les réglages.

## Sécurité

- La clé `x-api-key` du relais est **hardcodée dans le template**. Elle ne doit **jamais** être exposée côté client : tous les appels passent par du code backend (Convex actions / `"use node"`).
- `VLY_INTEGRATION_KEY` ne doit pas non plus sortir du backend (lue via `process.env`).

## Si la passerelle vly.ai revient en vie

Si Freebuff corrige un jour la provision de `VLY_INTEGRATION_KEY`, le relais restera le canal le plus simple et sans clé à gérer. Pour repartir sur la passerelle officielle, il faudrait réinstaller `@vly-ai/integrations` et adapter `emailRelay.ts` — rien d'autre.
