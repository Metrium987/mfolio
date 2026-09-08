# Mfolio — Portfolio & CV « Studio »

**Une application web de portfolio & CV clé en main, auto-hébergeable, avec un tableau de bord administrateur complet.** Tout — contenu, mise en page, SEO, statistiques — se gère visuellement depuis le tableau de bord. Aucun code requis après l'installation.

**🇬🇧 English version: [README.md](README.md)**

[![CI](https://github.com/Metrium987/mfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Metrium987/mfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🚀 **Cible de déploiement :** [Vercel](https://vercel.com) pour le frontend + [Convex](https://convex.dev) pour le backend — chemin en un clic via l'[intégration Convex Vercel](https://vercel.com/marketplace/convex). Voir [Déploiement](#déploiement).

---

## Fonctionnalités

- 🎨 **Design & thèmes** — 3 designs (Éditorial, Moderne, Minimal : typographies, formes, profondeur) × 10 thèmes complets clair/sombre (papier, surfaces, encre, accent), ambiance par défaut et couleur d'accent personnalisée. Chaque palette fonctionne avec chaque design.
- 🗂️ **Tableau de bord complet** — édition de chaque section (À propos, Parcours, Compétences, Langues, Centres d'intérêt, Services, Portfolio, Journal), réorganisation des éléments avec ↑/↓, aperçu et suppression en popup.
- 🌍 **FR ↔ EN** — traduction automatique via DeepL (clé optionnelle, offre gratuite).
- ✉️ **Formulaire de contact → boîte de réception + notification email** — les messages sont stockés dans la boîte de réception du tableau de bord ; une notification courte (avis, sans le texte du message) est envoyée au propriétaire.
- 🔐 **Authentification** — connexion par mot de passe, réservée au propriétaire (rôle admin) : toutes les fonctions sensibles (contenu, messages, stats, stockage, identifiants) exigent le rôle admin. Aucune création de compte public.
- 🛡️ **Anti-spam** — honeypot + limite de fréquence par visiteur + longueurs de saisie plafonnées.
- 📊 **Statistiques** — visiteurs (jour/semaine/mois), visiteurs uniques, taux de retour, conversion contact, appareils, navigateurs principaux, heures de pointe. Purge automatique à 90 jours (tâche planifiée quotidienne).
- 🔎 **SEO** — balises meta, Open Graph/Twitter cards, URLs canoniques, hreflang FR/EN, sitemap.xml, robots.txt, scripts personnalisés en-tête/pied de page.
- 🎓 **Wizard « Premiers pas »** — guide interactif à 5 étapes (Identité → Parcours → Compétences → Apparence → Publier) qui s'affiche à la première connexion. Relanclable depuis Sécurité du compte.
- ❓ **Aide contextuelle** — bouton `?` dans le header du dashboard, affichant des conseils spécifiques à chaque section. 16 sections couvertes.
- 📱 **Entièrement responsive** — sidebar de bureau pour le tableau de bord, navigation mobile, pages publiques pensées mobile d'abord.
- 🧪 **Testé** — 22 tests unitaires (niveaux, ordre des sections, statistiques), TypeScript strict, ESLint propre.

## Stack technique

| Couche                  | Technologie                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| Frontend                | React 19, TypeScript, Vite, React Router 7                                       |
| Style                   | Tailwind CSS v4, shadcn/ui, Framer Motion, icônes Lucide                         |
| Backend & BDD           | [Convex](https://convex.dev) (backend + base de données serverless), Convex Auth |
| Qualité                 | Vitest, ESLint, Prettier, TypeScript strict                                      |
| Gestionnaire de paquets | [Bun](https://bun.sh)                                                            |

## Prérequis

- **Bun ≥ 1.x** (recommandé) ou Node.js ≥ 20
- **Un compte [Convex](https://convex.dev) gratuit** — le backend et la base de données de l'application
- **Git**
- _Optionnel :_ une clé API [DeepL](https://www.deepl.com) (traduction FR→EN automatique), un ID Google Analytics
- _Pour les notifications email :_ une adresse Gmail + un [mot de passe d'application](https://myaccount.google.com/apppasswords) — ou coupez les notifications et utilisez uniquement la boîte de réception du tableau de bord (voir [Canaux email](#canaux-email))

## Démarrage rapide

```bash
# 1. Installer les dépendances
bun install

# 2. Créer votre projet Convex (déploiement + génération des types)
bunx convex dev

# 3. Copier le modèle d'environnement et renseigner VITE_CONVEX_URL
cp .env.example .env.local

# 4. Lancer le frontend (gardez `bunx convex dev` actif dans un autre terminal)
bun run dev
```

Ouvrez **http://localhost:5173** — un contenu d'exemple est généré automatiquement au premier chargement.

**Première connexion :** connectez-vous sur `/auth` avec le compte admin par défaut créé à la première visite :

|              |                   |
| ------------ | ----------------- |
| Email        | `admin@admin.com` |
| Mot de passe | `admin123`        |

> ⚠️ **Changez ces identifiants immédiatement** depuis **Sécurité du compte** dans le menu du tableau de bord (email + mot de passe). La page de connexion affiche un rappel tant que ce n'est pas fait.
>
> **Mot de passe oublié (self-host)** : il n'existe plus de porte de secours par email (OTP supprimé). La procédure : dashboard Convex → table `authAccounts` → supprimer la ligne du compte mot de passe → recharger `/auth` — `ensureAdmin` recrée le compte par défaut (voir `docs/DEPLOYMENT.md`).

## Variables d'environnement

| Variable                  | Où                                                                                     | Requise       |
| ------------------------- | -------------------------------------------------------------------------------------- | ------------- |
| `VITE_CONVEX_URL`         | `.env.local` (frontend) ; injectée automatiquement sur Vercel par `convex deploy`      | ✅            |
| `CONVEX_DEPLOYMENT`       | `.env.local` (CLI Convex)                                                              | optionnelle   |
| `CONVEX_SITE_URL`         | `.env.local` en local ; `convex env set` en production (origine de redirection d'auth) | ✅            |
| `CONVEX_DEPLOY_KEY`       | Vercel → Variables d'environnement (Production)                                        | ✅ sur Vercel |
| `JWKS`, `JWT_PRIVATE_KEY` | Déploiement Convex (clés d'auth, provisionnées par Convex Auth)                        | ✅            |

**Ne sont pas des variables d'environnement :** la clé DeepL et l'ID Google Analytics se saisissent dans le menu **Intégrations**, et les balises SEO dans **Paramètres → Référencement (SEO)** — elles sont stockées en base de données, pas dans le dépôt.

Voir [.env.example](.env.example) pour le modèle annoté complet.

## Tableau de bord administrateur

| Section                                                  | Ce que vous gérez                                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **À propos**                                             | Nom, coordonnées, images portrait/couverture, slogans, lien CV, réseaux sociaux, description                                                                                                                                                                                 |
| **Parcours / Portfolio / Journal**                       | Expériences, formations, projets, articles — réorganisation, aperçu, édition en popup                                                                                                                                                                                        |
| **Compétences / Langues / Centres d'intérêt / Services** | Éléments avec niveaux (1–5), icônes, réorganisation, aperçu                                                                                                                                                                                                                  |
| **Messages**                                             | Boîte de réception : prévisualisation en popup, marquer comme répondu, supprimer                                                                                                                                                                                             |
| **Config**                                               | Visibilité et ordre des sections, styles d'affichage, ordre du Parcours                                                                                                                                                                                                      |
| **Paramètres**                                           | Nom/slogan/pied de page du site, logo & favicon, **référencement (SEO)**, scripts personnalisés                                                                                                                                                                              |
| **Intégrations**                                         | Clés DeepL + Google Analytics, email de notification, **interrupteurs des canaux email**                                                                                                                                                                                     |
| **Sécurité du compte**                                   | Mode maintenance, email et mot de passe de connexion du propriétaire, **restauration usine** (un clic vide tout le contenu — le compte admin est conservé, confirmation par saisie de `RESTAURER`), **recharger la démo** (re-peuple le portfolio avec le contenu d'exemple) |
| **Statistiques**                                         | Visiteurs, uniques, conversion, appareils, navigateurs, heures de pointe                                                                                                                                                                                                     |

## Canaux email

Une seule fonctionnalité envoie des emails, via un unique helper :

1. **Notifications de contact** — quand un visiteur envoie le formulaire (le message reste toujours dans la boîte de réception du tableau de bord)

Les **codes de connexion par email (OTP)** ont été **supprimés entièrement** : la seule connexion est le mot de passe du propriétaire, donc aucun visiteur ne peut créer de compte.

La notification part via **SMTP** (nodemailer, `src/convex/notify.ts`) — un vrai expéditeur, une bonne délivrabilité, aucune dépendance de plateforme. Fonctionne à l'identique en local, sur Vercel ou sur n'importe quel hébergeur.

**Configuration :** dans **Intégrations**, activez **« Envoyer via SMTP (Gmail) »** et renseignez votre adresse Gmail + un [mot de passe d'application](https://myaccount.google.com/apppasswords). Les valeurs Gmail sont pré-remplies (smtp.gmail.com, 465/SSL) ; un bouton **email de test** valide la configuration.

Sans SMTP configuré (ou notification désactivée), aucun email n'est envoyé — le message reste dans la boîte de réception du tableau de bord. Pour un autre fournisseur (Resend, SendGrid…), modifiez `src/convex/notify.ts` — il n'existe qu'**un seul point d'appel**.

Voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) pour le guide complet.

## Déploiement

### Sur Vercel (recommandé)

Le dépôt embarque un [`vercel.json`](vercel.json) qui branche tout : la commande de build pousse les fonctions Convex puis construit la SPA, et une règle de rewrite sert `index.html` sur les liens profonds (`/auth`, `/dashboard`).

1. Poussez ce dépôt sur GitHub, puis créez un projet Vercel à partir du repo.
2. Provisionnez le backend Convex :
   - **Le plus simple :** installez [Convex depuis le Marketplace Vercel](https://vercel.com/marketplace/convex) — il crée le déploiement et branche les variables d'environnement pour vous.
   - **Ou manuellement :** créez le déploiement sur [dashboard.convex.dev](https://dashboard.convex.dev), générez une **clé de déploiement production** (Deployment Settings → General), et ajoutez-la dans Vercel comme `CONVEX_DEPLOY_KEY` (environnement Production uniquement).
3. Pointez l'auth vers votre URL finale sur le déploiement Convex : `bunx convex env set CONVEX_SITE_URL https://votre-domaine.vercel.app` (ou votre domaine personnalisé définitif — le changer plus tard implique de mettre à jour cette variable).
4. Déployez. Le premier chargement génère le contenu d'exemple.
5. Connectez-vous sur `/auth` avec `admin@admin.com` / `admin123` — **changez ces identifiants immédiatement**, puis configurez l'email (voir ci-dessus) et votre clé DeepL / ID GA.

Chaque push sur le dépôt redéploie automatiquement les fonctions Convex et le frontend.

> 💡 Les previews Vercel peuvent avoir leur propre déploiement Convex neuf via une **clé de déploiement preview** (`CONVEX_DEPLOY_KEY`, environnement Preview) — voir [Convex preview deployments](https://docs.convex.dev/production/hosting/preview-deployments) (en anglais).

### Ailleurs (Netlify, Cloudflare Pages, un hébergeur statique…)

Mfolio est une application Vite + Convex standard : build avec `bun run build` (sortie : `dist/`), servez les fichiers avec un fallback SPA (tous les chemins → `/index.html`), et poussez les fonctions Convex avec `bunx convex deploy` (qui injecte `VITE_CONVEX_URL` au build). L'email ne demande aucun support particulier de l'hébergeur.

## Structure du projet

```
src/
├── components/
│   ├── admin/        # Éditeurs du tableau de bord (sections, listes, popups, champs)
│   ├── site/         # Sections du site public (Hero, Resume, Skills, Contact…)
│   └── ui/           # Primitives shadcn/ui
├── convex/
│   ├── _generated/   # Généré automatiquement (ne pas modifier)
│   ├── schema.ts     # Schéma de la base de données
│   ├── site.ts       # Requêtes publiques (getSiteData, getStats…)
│   ├── siteMutations.ts # CRUD du contenu + addMessage (formulaire de contact)
│   ├── notify.ts     # Action de notification de contact (SMTP via nodemailer)
│   ├── seed.ts       # Contenu d'exemple (généré une seule fois)
│   └── scheduler.ts  # Purge quotidienne des anciens visiteurs
├── lib/              # i18n, ordre des sections, niveaux, helpers de stats (+ tests)
└── pages/            # Landing, Auth, Dashboard, NotFound
```

## Scripts

| Commande                 | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `bun run dev`            | Lancer le serveur de dev Vite                            |
| `bun run build`          | Typecheck + build de production (`tsc -b && vite build`) |
| `bun run preview`        | Prévisualiser le build de production                     |
| `bun test`               | Lancer les tests unitaires (Vitest)                      |
| `bun run lint`           | ESLint                                                   |
| `bun run format`         | Prettier                                                 |
| `bunx convex dev --once` | Pousser les fonctions Convex + régénérer les types       |

## Contribuer

Les contributions sont bienvenues — voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Sécurité

Vous avez trouvé une vulnérabilité ou souhaitez en signaler une ? Voir [SECURITY.md](SECURITY.md).

## Licence

[MIT](LICENSE) © 2026 Ludovic LOU
