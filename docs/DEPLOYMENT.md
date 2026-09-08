# Guide de déploiement — Mfolio

Mfolio est une application **Vite + Convex** standard : le backend (données,
auth, email, stats) tourne sur Convex Cloud ; le frontend (site public +
tableau de bord) est un build statique `dist/` hébergé sur **Vercel** (ou tout
autre hébergeur statique). Ce guide couvre :

1. [Déployer sur Vercel](#1-déployer-sur-vercel) — voie recommandée
2. [Développement local](#2-développement-local)
3. [L'email de notification en détail](#3-lemail-de-notification-en-détail)
4. [Migration depuis un ancien déploiement](#4-migration-depuis-un-ancien-déploiement)
5. [FAQ](#5-faq)

---

## 1. Déployer sur Vercel

Le dépôt embarque un [`vercel.json`](../vercel.json) qui configure tout :

- **Commande de build** : `bunx convex deploy --cmd 'bun run build'` — pousse
  les fonctions Convex sur le déploiement de production **puis** construit le
  frontend avec `VITE_CONVEX_URL` correctement injectée.
- **Répertoire de sortie** : `dist/`.
- **Rewrite SPA** : tous les chemins servent `index.html` (les fichiers
  statiques comme `robots.txt` et `sitemap.xml` restent servis en priorité) —
  les liens profonds `/auth` et `/dashboard` fonctionnent donc au rafraîchissement.

### Étapes

1. **Poussez le dépôt sur GitHub** (ou GitLab/Bitbucket).

2. **Créez le projet Vercel** — [vercel.com/new](https://vercel.com/new),
   importez le repo. Le `vercel.json` est détecté automatiquement.

3. **Provisionnez le backend Convex**, au choix :
   - **Marketplace Vercel (le plus simple)** : installez
     [Convex depuis le Marketplace](https://vercel.com/marketplace/convex)
     depuis la page du projet — il crée le déploiement Convex, le rattache à
     votre équipe et branche les variables d'environnement.
   - **Manuel** : créez le déploiement sur
     [dashboard.convex.dev](https://dashboard.convex.dev) (bouton _Create
     app_ → déployez les fonctions une première fois en local avec
     `bunx convex dev`, ou via le dashboard). Puis dans _Deployment Settings →
     General_, cliquez **Generate Production Deploy Key** (avec la permission
     `deployment:deploy`) et ajoutez la clé dans Vercel → _Settings →
     Environment Variables_ :

     | Variable            | Environnements                                      |
     | ------------------- | --------------------------------------------------- |
     | `CONVEX_DEPLOY_KEY` | Production (et Preview si vous voulez des previews) |

4. **Pointez l'auth vers votre URL finale** — Convex Auth valide l'émetteur
   des JWT de session contre `CONVEX_SITE_URL` :

   ```bash
   bunx convex env set CONVEX_SITE_URL https://votre-projet.vercel.app
   ```

   Utilisez directement votre **domaine personnalisé définitif** si vous en
   avez un (le changer plus tard implique de relancer cette commande).
   Les clés `JWKS` / `JWT_PRIVATE_KEY` sont provisionnées automatiquement par
   Convex Auth à la première utilisation.

5. **Déployez** (premier push, ou bouton _Deploy_). `bunx convex deploy`
   lit `CONVEX_DEPLOY_KEY`, pousse les fonctions, puis `bun run build`
   construit le site. Le premier chargement de la page génère le contenu
   d'exemple.

6. **Première connexion** : `/auth` avec `admin@admin.com` / `admin123` —
   **changez immédiatement** email + mot de passe (**Sécurité du compte**),
   puis configurez l'email et les intégrations (DeepL, Google Analytics).

Chaque push sur le repo redéploie automatiquement les fonctions Convex et le
frontend.

### Previews Vercel (optionnel)

Pour que chaque pull request obtienne son propre backend Convex jetable :
générez une **Preview Deploy Key** sur le dashboard Convex (même page que la
clé de production) et ajoutez-la comme `CONVEX_DEPLOY_KEY` dans l'environnement
**Preview** de Vercel. Voir
[Convex preview deployments](https://docs.convex.dev/production/hosting/preview-deployments).

---

## 2. Développement local

```bash
git clone <votre-repo> && cd mfolio
bun install
bunx convex dev        # crée/relie le déploiement Convex de dev, génère les types
cp .env.example .env.local   # VITE_CONVEX_URL est remplie par `convex dev`
bun run dev
```

Ouvrez http://localhost:5173 — contenu d'exemple généré au premier chargement.
Connexion `/auth` : `admin@admin.com` / `admin123` (compte de démo, à changer).

En local, `CONVEX_SITE_URL` vaut `http://localhost:5173` (cf. `.env.example`) ;
sur le déploiement de dev Convex, laissez Convex Auth la provisionner ou
faites `bunx convex env set CONVEX_SITE_URL http://localhost:5173`.

> **Mot de passe oublié :** pas de porte de secours par email (OTP supprimé).
> Procédure : dashboard Convex → table `authAccounts` → supprimer la ligne du
> compte mot de passe → recharger `/auth` — `ensureAdmin` recrée le compte
> par défaut.

---

## 3. L'email de notification en détail

Une seule fonctionnalité envoie des emails : la **notification de contact**
(un avis court, sans le texte du message). Le message complet reste toujours
dans la boîte de réception du tableau de bord.

> L'ancien canal **OTP** (codes de connexion par email) a été **supprimé
> entièrement** : la seule connexion est le mot de passe du propriétaire.

### Le canal unique : SMTP (Gmail par défaut)

L'envoi passe par **nodemailer** (`src/convex/notify.ts`, action backend
`sendContactEmail`) — un vrai expéditeur, une bonne délivrabilité, aucun
fournisseur tiers à créer. Fonctionne à l'identique en local, sur Vercel ou
ailleurs.

**Configuration** (tout se passe dans l'app, aucune variable d'environnement) :

1. **Intégrations** (menu du tableau de bord) → activez
   **« Envoyer via SMTP (Gmail) »**.
2. Renseignez votre **adresse Gmail** (expéditeur) et un
   [mot de passe d'application](https://myaccount.google.com/apppasswords)
   (nécessite la validation en deux étapes sur le compte Google). Les valeurs
   serveur sont pré-remplies : `smtp.gmail.com`, port 465 SSL.
3. Choisissez le destinataire : **« Email de notification »** (à défaut,
   l'email de contact de la section À propos est utilisé).
4. Validez avec le bouton **« Envoyer un email de test »**.

Le mot de passe d'application est stocké côté backend Convex et n'est jamais
renvoyé au client (`smtpPass` write-only, comme la clé DeepL).

**Sans SMTP configuré** (ou interrupteur « Notifications de contact » coupé) :
aucun email n'est envoyé, mais le message est bien stocké dans **Messages** —
l'application reste 100 % fonctionnelle.

**Autre fournisseur** (Resend, SendGrid, Brevo…) : modifiez
`src/convex/notify.ts` — il n'existe qu'**un seul point d'appel**.

---

## 4. Migration depuis un ancien déploiement

Tout le contenu (portfolio, réglages, messages, stats) vit dans la base
Convex. Un déploiement Convex neuf démarre avec la base vide : le contenu
d'exemple est régénéré au premier chargement, puis vous ressaisissez vos
données depuis le tableau de bord (ou réimportez le **JSON de sauvegarde**
disponible dans **Paramètres**).

Si votre ancien déploiement Convex est encore accessible, vous pouvez en
exporter un instantané complet :

```bash
# liaisons vers l'ancien déploiement, puis :
npx convex export --include-storage <dossier-export>
```

L'import ciblé de tables vers un nouveau déploiement est un processus manuel
(les formats d'export ne sont pas directement réimportables) : l'utilitaire
`npx convex import` accepte des fichiers CSV/JSONL par table. En pratique,
pour un portfolio monopropriétaire, la ressaisie (ou le JSON de sauvegarde
réimporté via le dashboard) est plus rapide.

---

## 5. FAQ

**Puis-je héberger le frontend ailleurs que sur Vercel ?**
Oui — n'importe quel hébergeur statique avec un fallback SPA (tous les chemins
→ `index.html`). Poussez les fonctions avec `bunx convex deploy` et définissez
`VITE_CONVEX_URL` au build.

**Pourquoi la connexion échoue après le déploiement ?**
`CONVEX_SITE_URL` sur le déploiement Convex ne correspond pas à l'origine
exacte du site (protocole + domaine + port). Vérifiez avec
`bunx convex env list` et corrigez : `bunx convex env set CONVEX_SITE_URL
https://votre-domaine`.

**Puis-je conserver mon contenu en changeant d'hébergement ?**
Oui. Tout le contenu vit dans Convex : en réutilisant le même déploiement
Convex (`CONVEX_DEPLOY_KEY` de ce déploiement + `VITE_CONVEX_URL` au build),
contenu, réglages, messages et statistiques suivent automatiquement.

**Que se passe-t-il si je ne renseigne pas de clé DeepL ?**
La traduction FR→EN est désactivée : le site s'affiche en français uniquement
(la langue reste commutable via le sélecteur).

**Comment réinitialiser les statistiques ?**
Elles se purgent automatiquement au-delà de 90 jours (tâche planifiée
quotidienne dans `src/convex/scheduler.ts`). Pour tout vider manuellement,
utilisez le dashboard Convex → table `visitors`.
