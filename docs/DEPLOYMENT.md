# Guide de déploiement — Mfolio

Mfolio a été conçu à l'origine sur **Freebuff Web** (ex-vly.ai) : l'environnement hébergé, le déploiement Convex et le relais email sont fournis par la plateforme. Ce guide couvre :

1. [Déployer sur Freebuff Web](#1-déployer-sur-freebuff-web) — rien à faire
2. [Déployer ailleurs (Vercel, Netlify, etc.)](#2-déployer-ailleurs) — étape par étape
3. [Les canaux email en détail](#3-les-canaux-email-en-détail) — désactiver ou rebrancher
4. [FAQ](#4-faq)

---

## 1. Déployer sur Freebuff Web

Rien à faire. Sur cette plateforme :

- L'environnement de développement et le build sont gérés automatiquement.
- Le déploiement Convex est provisionné et les types générés à chaque modification.
- Le **relais email** (`src/convex/emailRelay.ts`) fonctionne sans aucune clé : notification de contact et codes OTP partent via `auth.freebuff.app/send_otp`.

Seules choses à faire dans l'application après la première connexion (`admin@admin.com` / `admin123`) :

1. **Paramètres → Sécurité du compte** : changer email + mot de passe.
2. **Config → Référencement** : saisir votre clé DeepL (traduction FR→EN) et votre ID Google Analytics.
3. **Paramètres → Intégrations** : renseigner l'« Email de notification » (sinon l'email de contact de la section À propos est utilisé).

---

## 2. Déployer ailleurs

Mfolio est une application **Vite + Convex** standard. Le backend (données, auth, email, stats) tourne sur Convex ; le frontend (le site public + le tableau de bord) peut être hébergé n'importe où : Vercel, Netlify, Cloudflare Pages, un serveur…

### 2.1 Prérequis

- Bun ≥ 1.x (ou Node.js ≥ 20)
- Un compte [Convex](https://convex.dev) gratuit
- Un hébergeur frontend (Vercel, Netlify, …) — le build est statique (`dist/`)
- *Si vous gardez l'email :* un compte auprès d'un fournisseur d'email transactionnel (Resend, SendGrid, Brevo…)

### 2.2 Backend (Convex)

```bash
git clone <votre-repo> && cd mfolio
bun install
bunx convex dev        # crée le projet Convex, déploie les fonctions, génère les types
```

Le CLI affiche l'URL de votre déploiement (ex. `https://joyous-otter-123.convex.cloud`).

Dans le **dashboard Convex → Settings → Environment Variables**, renseignez :

| Variable | Valeur | Rôle |
|---|---|---|
| `SITE_URL` | `https://votre-domaine.com` (en dev : `http://localhost:5173`) | Origine de redirection de l'auth |
| `JWKS` | générée par Convex Auth | Signature des sessions |
| `JWT_PRIVATE_KEY` | générée par Convex Auth | Signature des sessions |

> Les clés `JWKS` / `JWT_PRIVATE_KEY` sont provisionnées automatiquement par Convex Auth au premier lancement. Si vous réutilisez un déploiement Convex existant (pour conserver votre contenu), elles sont déjà en place — il suffit de vérifier `SITE_URL`.

### 2.3 Frontend

Dans votre hébergeur :

| Réglage | Valeur |
|---|---|
| Build command | `bun run build` (ou `npm run build`) |
| Output directory | `dist` |
| Env variable | `VITE_CONVEX_URL` = URL de votre déploiement Convex |

Localement :

```bash
cp .env.example .env.local
# renseigner VITE_CONVEX_URL (et CONVEX_DEPLOYMENT si besoin)
bun run dev
```

### 2.4 Première connexion

1. Ouvrez le site → le contenu d'exemple est généré automatiquement.
2. `/auth` → connectez-vous avec `admin@admin.com` / `admin123`.
3. **Changez immédiatement** email + mot de passe (**Paramètres → Sécurité du compte**).
4. Saisissez votre clé DeepL et votre ID Google Analytics (**Config → Référencement**).

### 2.5 Email

Deux stratégies — voir la section 3 pour les détails :

- **Sans email (recommandé pour un départ rapide)** : désactivez les deux interrupteurs dans **Paramètres → Intégrations**. Tout le reste (mot de passe, boîte de réception) fonctionne.
- **Avec email** : remplacez le relais dans `src/convex/emailRelay.ts` par votre fournisseur (ex. Resend).

### 2.6 Nettoyage optionnel des fichiers Freebuff

Hors plateforme, ces éléments ne servent plus (ils sont inertes) et peuvent être supprimés :

- `vlyPlugin()` dans `vite.config.ts` (+ la dépendance `@vly-ai/integrations` dans `package.json`)
- `src/lib/vly-integrations.ts`
- `integrations.md`
- Les fichiers signalés « DO NOT MODIFY » / read-only du template (ex. `vly-toolbar-readonly.tsx` à la racine)

> Sur Freebuff Web, ces fichiers sont **gérés par la plateforme** : ne les modifiez pas là-bas, elle les recrée. Supprimez-les uniquement dans votre propre dépôt GitHub.

---

## 3. Les canaux email en détail

Deux fonctionnalités envoient des emails, toutes deux via le helper `sendViaEmailRelay` :

| Fonctionnalité | Fichier | Réglage dans l'app |
|---|---|---|
| Notification de contact (avis court, sans le texte) | `src/convex/notify.ts` (appelé par `siteMutations.ts` → `addMessage`) | **Paramètres → Intégrations → « Notifications de contact (email) »** |
| Codes de connexion OTP (récupération mot de passe) | `src/convex/auth/emailOtp.ts` | **Paramètres → Intégrations → « Connexion par code email (OTP) »** |

### Option A — Tout désactiver (aucun email)

1. **Paramètres → Intégrations**.
2. Coupez **« Notifications de contact (email) »** → plus d'email à la réception d'un message ; le message reste stocké dans **Messages**.
3. Coupez **« Connexion par code email (OTP) »** → l'onglet « Code par email » disparaît de la page de connexion ; seule la connexion par **mot de passe** reste.
   - *Garde-fou :* impossible de couper l'OTP s'il n'existe aucun mot de passe défini (vous ne pouvez pas vous enfermer dehors).
4. Résultat : l'application tourne sans aucune dépendance email. ✅

### Option B — Rebrancher sur votre propre fournisseur

Le principe : `sendViaEmailRelay({ to, appName, otp })` est appelé à **deux endroits seulement**. Remplacez son implémentation dans `src/convex/emailRelay.ts` par un appel à votre fournisseur, et rien d'autre ne change.

Exemple minimal avec Resend (à adapter) :

```ts
// src/convex/emailRelay.ts — implémentation Resend
const RESEND_API_KEY = process.env.RESEND_API_KEY; // dashboard Convex → Env Variables

export type RelayResult = { ok: true; id?: string } | { ok: false; error: string };

export async function sendViaEmailRelay(payload: {
  to: string;
  appName: string;
  otp: string;
}): Promise<RelayResult> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mfolio <onboarding@resend.dev>",
        to: payload.to,
        subject: `Sign in to ${payload.appName}`,
        text: `Enter this code on the sign-in page: ${payload.otp}`,
      }),
    });
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Email request failed",
    };
  }
}
```

Notes :

- La clé API se configure dans le **dashboard Convex → Settings → Env Variables** (jamais dans le dépôt), et se lit avec `process.env`.
- Le relais de la plateforme formate tous les emails comme un email de code (« Sign in to … »). Avec votre propre fournisseur, vous contrôlez le sujet et le corps : la notification de contact peut par exemple contenir le nom de l'expéditeur et le sujet du message.
- `src/convex/auth/emailOtp.ts` est marqué « DO NOT MODIFY » par le template Freebuff — **dans votre propre dépôt GitHub, cette contrainte n'existe plus** : vous pouvez l'adapter librement.

### Récapitulatif : ce qui dépend de Freebuff

| Élément | Dépend de Freebuff ? | Portable ? |
|---|---|---|
| Relais email (`emailRelay.ts`) | Oui (URL + clé codée en dur) | Oui — désactivable ou remplaçable |
| Codes OTP | Oui (même relais) | Oui — désactivable ou remplaçable |
| Base de données + backend Convex | Non | Oui — votre propre projet Convex |
| Auth (mot de passe) | Non | Oui |
| DeepL / Google Analytics | Non | Oui — clés personnelles |
| Images, stats, anti-spam, SEO | Non | Oui |

---

## 4. FAQ

**Est-il possible d'héberger Mfolio soi-même ?**
Oui. Le backend est un projet Convex standard (déploiement cloud gratuit ou self-hosted), le frontend un build Vite statique. Seuls les deux canaux email utilisent le relais Freebuff — désactivez-les (Option A) ou rebranchez-les (Option B).

**Puis-je conserver mon contenu en changeant d'hébergement ?**
Oui. Tout le contenu vit dans Convex. En réutilisant le même déploiement Convex (`CONVEX_DEPLOYMENT` + `VITE_CONVEX_URL`), contenu, réglages, messages et statistiques suivent automatiquement.

**Que se passe-t-il si je ne renseigne pas de clé DeepL ?**
La traduction FR→EN est désactivée : le site s'affiche en français uniquement (la langue reste commutable via le sélecteur).

**L'email de notification fonctionne-t-il sans clé sur Freebuff ?**
Oui — c'est l'intérêt du relais de plateforme. Hors Freebuff, il faut l'Option A ou B.

**Comment réinitialiser les statistiques ?**
Elles se purgent automatiquement au-delà de 90 jours (tâche planifiée quotidienne dans `src/convex/scheduler.ts`). Pour tout vider manuellement, utilisez le dashboard Convex → table `visitors`.
