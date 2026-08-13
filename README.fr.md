# Mfolio — Portfolio & CV « Studio »

**Une application web de portfolio & CV clé en main, auto-hébergeable, avec un tableau de bord administrateur complet.** Tout — contenu, mise en page, SEO, statistiques — se gère visuellement depuis le tableau de bord. Aucun code requis après l'installation.

**🇬🇧 English version: [README.md](README.md)**

[![CI](https://github.com/Metrium987/mfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Metrium987/mfolio/actions/workflows/ci.yml)

> **Origines :** Mfolio a été conçu à l'origine sur **Freebuff Web** (ex-vly.ai), qui fournit l'environnement hébergé, l'intégration Convex et un relais email de plateforme. L'application est entièrement portable : seules **deux fonctionnalités email optionnelles** dépendent de la plateforme, et les deux peuvent être désactivées ou rebranchées sur votre propre fournisseur. Voir [Déploiement](#déploiement).

---

## Fonctionnalités

- 🎨 **Thème Studio** — galerie épurée, blancs cassés chaleureux, cadres fins, neutres feutrés, typographie éditoriale. Mode clair/sombre + couleur d'accent configurable.
- 🗂️ **Tableau de bord complet** — édition de chaque section (À propos, Parcours, Compétences, Langues, Centres d'intérêt, Services, Portfolio, Journal), réorganisation des éléments avec ↑/↓, aperçu et suppression en popup.
- 🌍 **FR ↔ EN** — traduction automatique via DeepL (clé optionnelle, offre gratuite).
- ✉️ **Formulaire de contact → boîte de réception + notification email** — les messages sont stockés dans la boîte de réception du tableau de bord ; une notification courte (avis, sans le texte du message) est envoyée au propriétaire.
- 🔐 **Authentification** — connexion par mot de passe + codes de récupération par email (OTP). Les deux canaux sont **désactivables** (portabilité).
- 🛡️ **Anti-spam** — honeypot + limite de fréquence par visiteur + longueurs de saisie plafonnées.
- 📊 **Statistiques** — visiteurs (jour/semaine/mois), visiteurs uniques, taux de retour, conversion contact, appareils, navigateurs principaux, heures de pointe. Purge automatique à 90 jours (tâche planifiée quotidienne).
- 🔎 **SEO** — balises meta, Open Graph/Twitter cards, URLs canoniques, hreflang FR/EN, sitemap.xml, robots.txt, scripts personnalisés en-tête/pied de page.
- 📱 **Entièrement responsive** — sidebar de bureau pour le tableau de bord, navigation mobile, pages publiques pensées mobile d'abord.
- 🧪 **Testé** — 20+ tests unitaires (niveaux, ordre des sections, statistiques), TypeScript strict, ESLint propre.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router 7 |
| Style | Tailwind CSS v4, shadcn/ui, Framer Motion, icônes Lucide |
| Backend & BDD | [Convex](https://convex.dev) (backend + base de données serverless), Convex Auth |
| Qualité | Vitest, ESLint, Prettier, TypeScript strict |
| Gestionnaire de paquets | [Bun](https://bun.sh) |

## Prérequis

- **Bun ≥ 1.x** (recommandé) ou Node.js ≥ 20
- **Un compte [Convex](https://convex.dev) gratuit** — le backend et la base de données de l'application
- **Git**
- *Optionnel :* une clé API [DeepL](https://www.deepl.com) (traduction FR→EN automatique), un ID Google Analytics
- *Uniquement hors Freebuff :* votre propre fournisseur d'email (ex. [Resend](https://resend.com)) — ou désactivez les deux fonctionnalités email dans le tableau de bord (voir [Canaux email](#canaux-email))

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

| | |
|---|---|
| Email | `admin@admin.com` |
| Mot de passe | `admin123` |

> ⚠️ **Changez ces identifiants immédiatement** depuis **Paramètres → Sécurité du compte** (email + mot de passe). La page de connexion affiche un rappel tant que ce n'est pas fait.

## Variables d'environnement

| Variable | Où | Requise |
|---|---|---|
| `VITE_CONVEX_URL` | `.env.local` (frontend) | ✅ |
| `CONVEX_DEPLOYMENT` | `.env.local` (CLI Convex) | optionnelle |
| `CONVEX_SITE_URL` | `.env.local` (redirection d'auth en local) | dev uniquement |
| `SITE_URL` | Dashboard Convex → Settings → Env Variables | ✅ production |
| `JWKS`, `JWT_PRIVATE_KEY` | Dashboard Convex (clés d'auth, provisionnées par Convex Auth) | ✅ |

**Ne sont pas des variables d'environnement :** la clé DeepL et l'ID Google Analytics se saisissent dans l'application (**Config → Référencement**), et l'adresse email de notification dans **Paramètres → Intégrations** — elles sont stockées en base de données, pas dans le dépôt.

Voir [.env.example](.env.example) pour le modèle annoté complet.

## Tableau de bord administrateur

| Section | Ce que vous gérez |
|---|---|
| **À propos** | Nom, coordonnées, images portrait/couverture, slogans, lien CV, réseaux sociaux, description |
| **Parcours / Portfolio / Journal** | Expériences, formations, projets, articles — réorganisation, aperçu, édition en popup |
| **Compétences / Langues / Centres d'intérêt / Services** | Éléments avec niveaux (1–5), icônes, réorganisation, aperçu |
| **Messages** | Boîte de réception : prévisualisation en popup, marquer comme répondu, supprimer |
| **Config** | Couleur d'accent, visibilité et ordre des sections, styles d'affichage, ordre du Parcours, SEO, scripts personnalisés, mode maintenance |
| **Paramètres** | Nom/slogan/pied de page du site, logo & favicon, DeepL + GA + email de notification, **interrupteurs des canaux email**, sécurité du compte (email/mot de passe) |
| **Statistiques** | Visiteurs, uniques, conversion, appareils, navigateurs, heures de pointe |

## Canaux email

Deux fonctionnalités envoient des emails, via un unique helper :

1. **Notifications de contact** — quand un visiteur envoie le formulaire
2. **Codes de connexion (OTP)** — les emails de codes de récupération de mot de passe

Sur Freebuff Web, les deux passent par le **relais email de la plateforme** (`src/convex/emailRelay.ts`) — pas de SMTP, aucune clé à configurer.

**Déployer ailleurs, deux options :**

- **Le plus simple :** dans **Paramètres → Intégrations**, désactivez **« Notifications de contact »** et **« Connexion par code email (OTP) »**. La connexion par mot de passe et la boîte de réception continuent de fonctionner à 100 %. ✅
- **Garder l'email :** modifiez `src/convex/emailRelay.ts` pour appeler votre propre fournisseur (ex. Resend). Il n'existe que **deux points d'appel** : `src/convex/notify.ts` (notification) et `src/convex/auth/emailOtp.ts` (codes OTP).

Voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) pour le guide complet.

## Déploiement

### Sur Freebuff Web
Rien à faire — c'est la plateforme pour laquelle Mfolio a été conçu. L'environnement, le déploiement Convex et le relais email sont provisionnés automatiquement.

### Ailleurs (Vercel, Netlify, Cloudflare Pages, …)
Mfolio est une application Vite + Convex standard :

1. Clonez, `bun install`, `bunx convex dev` (crée votre projet Convex).
2. Renseignez `SITE_URL`, `JWKS`, `JWT_PRIVATE_KEY` dans le dashboard Convex (les clés d'auth sont provisionnées par Convex Auth).
3. Renseignez `VITE_CONVEX_URL` dans les variables d'environnement de votre hébergeur, build avec `bun run build` (sortie : `dist/`).
4. Choisissez votre stratégie email (voir ci-dessus). Optionnel : supprimez les éléments spécifiques Freebuff (`vlyPlugin()` dans `vite.config.ts`, la dépendance `@vly-ai/integrations`, `src/lib/vly-integrations.ts`, `integrations.md`) — ils sont inertes mais inutiles hors plateforme.
5. Première connexion avec `admin@admin.com` / `admin123`, changez les identifiants, saisissez votre clé DeepL / ID GA.

> 💡 **Conserver vos données :** tout le contenu du portfolio vit dans Convex. En réutilisant le même déploiement Convex, votre contenu et vos réglages suivent automatiquement.

## Structure du projet

```
src/
├── components/
│   ├── admin/        # Éditeurs du tableau de bord (sections, listes, popups, champs)
│   ├── site/         # Sections du site public (Hero, Resume, Skills, Contact…)
│   └── ui/           # Primitives shadcn/ui
├── convex/
│   ├── auth/         # Provider emailOtp (relais de plateforme)
│   ├── _generated/   # Généré automatiquement (ne pas modifier)
│   ├── schema.ts     # Schéma de la base de données
│   ├── site.ts       # Requêtes publiques (getSiteData, getStats…)
│   ├── siteMutations.ts # CRUD du contenu + addMessage (formulaire de contact)
│   ├── notify.ts     # Action de notification de contact
│   ├── emailRelay.ts # ⚙️ Relais email de la plateforme — le fichier à remplacer hors Freebuff
│   ├── seed.ts       # Contenu d'exemple (généré une seule fois)
│   └── scheduler.ts  # Purge quotidienne des anciens visiteurs
├── lib/              # i18n, ordre des sections, niveaux, helpers de stats (+ tests)
└── pages/            # Landing, Auth, Dashboard, NotFound
```

## Scripts

| Commande | Description |
|---|---|
| `bun run dev` | Lancer le serveur de dev Vite |
| `bun run build` | Typecheck + build de production (`tsc -b && vite build`) |
| `bun run preview` | Prévisualiser le build de production |
| `bun test` | Lancer les tests unitaires (Vitest) |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |
| `bunx convex dev --once` | Pousser les fonctions Convex + régénérer les types |

## Contribuer

Les contributions sont bienvenues — voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Sécurité

Vous avez trouvé une vulnérabilité ou souhaitez en signaler une ? Voir [SECURITY.md](SECURITY.md).

## Licence

[MIT](LICENSE) © 2026 Ludovic LOU
