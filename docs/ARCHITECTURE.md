# Architecture — Mfolio

> Document de référence pour comprendre l'application sans relire tout le code.
> Date : 2026-08-14 · Complète [CODEBASE-MAP.md](./CODEBASE-MAP.md) et
> [AUDIT.md](./AUDIT.md). Rédigé à partir de l'état réel du dépôt.

## 1. Vue d'ensemble

Mfolio est un **portfolio & CV clé en main** : site public éditorial + tableau
de bord administrateur complet, monopropriétaire.

| Couche | Technologie | Rôle |
|---|---|---|
| Frontend | React 19 + Vite 7 + TypeScript strict | Site public + dashboard |
| Style | Tailwind CSS 4 + thème Studio (OKLCH, blancs cassés) | Design system |
| Backend / BDD | Convex Cloud (fonctions + tables + stockage + scheduler) | Toute la logique |
| Auth | Convex Auth (`@convex-dev/auth`) — **mot de passe uniquement** | Connexion propriétaire |
| Email | Relais de plateforme Freebuff (`src/convex/emailRelay.ts`) | Notification de contact |
| Traduction | DeepL API (clé optionnelle) | Miroir FR → EN |
| Analytics | Google Analytics 4 (ID optionnel) + stats internes | Audience |

**Principes structurants :**

- **Un document par section** (modèle Ezfolio) : `site`, `settings`, `about`,
  `skills`, `services`, `resume`, `portfolio`, `blog`, `languages`,
  `interests` — une ligne par table, éditée en place (`upsertDoc`).
- **Le hero EST la section « À propos »** (`about`) et n'est jamais
  réordonnable ; les 8 autres sections sont ordonnables (`settings.sectionOrder`).
- **Réactivité Convex** : le frontend ne duplique pas l'état serveur — il
  s'abonne à `getSiteData` (public) et aux queries propriétaire.
- **Miroir anglais par position** : chaque section a un objet `en`
  (auto-traduit via DeepL). `pick(fr, en)` du contexte `useSiteLang` choisit
  la langue active.

## 2. Modèle de données (`src/convex/schema.ts`)

Tables gérées (toutes `schemaValidation: false` — les validators sont
appliqués manuellement dans les args des fonctions) :

| Table | Contenu | Accès |
|---|---|---|
| `users` | Compte propriétaire (`role: "admin"`, `credentialsChanged`) | Auth |
| `authAccounts`, `authSessions`, … | Tables Convex Auth (ne pas modifier) | Auth |
| `site` | Nom, slogan, footer, logo, favicon | Public |
| `settings` | Config du rendu : design `design` (éditorial/moderne/minimal — structure, typo et formes, voir `src/lib/themes.ts`), thème complet `themePreset` (papier, surfaces, encre, bordures — clair + sombre), accent `themeColor` + ambiance clair/sombre/auto, layout `*Layout` (liste/cartes par section, dont `portfolioLayout`/`blogLayout`), GA, DeepL (write-only), visibilités, ordre, SEO, scripts perso, maintenance | Public (clés masquées) |
| `about` | Persona : nom, portrait, description, taglines, réseaux, CV | Public |
| `skills` | Compétences `{name, proficiency 1–5}` | Public |
| `services` | `{title, icon, details}` | Public |
| `resume` | Expériences + formations (rubrique complète) | Public |
| `portfolio` | Projets `{title, categories, thumbnail, images, role, result}` | Public |
| `blog` | Articles `{title, date, excerpt, content}` | Public |
| `languages` | `{name, level 1–5}` (échelle unifiée, voir `src/lib/levels.ts`) | Public |
| `interests` | `{name, details, icon}` | Public |
| `messages` | Messages du formulaire de contact — **index `by_visitorId`** (rate limit) | Propriétaire |
| `visitors` | Traçage visites — **index `by_createdAt`** (purge 90 j) | Propriétaire |

Champ `en` optionnel sur chaque section = miroir anglais (mêmes chemins que le
FR, index par position).

## 3. Flux principaux

### 3.1 Connexion propriétaire (Auth)
1. `/auth` charge → `ensureAdmin` (action publique, idempotente) crée le compte
   `admin@admin.com` / `admin123` **uniquement si aucun compte mot de passe
   n'existe** (`hasPasswordAccount`).
2. `signIn("password")` (Convex Auth) → session JWT signée.
3. `RequireAuth` (route `/dashboard`) vérifie `isAuthenticated` **et** le rôle
   `admin` (redirection `/` sinon).
4. **Aucune création de compte public** : le provider OTP a été supprimé
   (2026-08-14). Le provider `customJwt` Freebuff (auth.config.ts) permet la
   fédération freebuff.com mais n'a **aucun** accès aux fonctions sensibles
   (rôle exigé partout).

### 3.2 Édition du contenu (dashboard)
- Chaque éditeur = `useSectionDraft` (copie locale) → bouton Enregistrer →
  action `translate.updateXxx` → `translateAndPersist` → `persistSection`.
- `translateAndPersist` : exige le rôle `admin`, traduit **uniquement les
  champs FR modifiés** (diff, économie de quota DeepL), puis persiste `{data, en}`.
- Les listes (compétences, langues, services, parcours, projets, journal,
  intérêts) s'éditent via `ManageList` : édition en modale, réordonnancement
  ↑/↓, suppression confirmée — **sauvegarde immédiate** à chaque action
  (`onSaved`), pas de bouton Enregistrer global.
- Le portrait/logo/CV/images passent par le storage Convex
  (`files.ts`, propriétaire uniquement) : upload → URL permanente stockée dans
  le doc.

### 3.3 Traduction FR → EN (DeepL)
- Clé **write-only** : le client envoie une remplaçante, le serveur ne renvoie
  jamais la clé (`sanitizeSettings` + `deeplKeySet` booléen).
- `translate.ts` : `SECTION_PATHS` liste les chemins traduisibles par section ;
  `translateOne` compare le FR stocké au FR entrant → ne retraduit que les
  différences ; `translateAllContent` (déclenché à la première saisie de clé ou
  depuis Paramètres) rétro-traduit les sections sans miroir.
- Host DeepL : `api-free.deepl.com` si la clé finit par `:fx`, sinon
  `api.deepl.com`. Batches de 50 textes.

### 3.4 Formulaire de contact + anti-spam (`addMessage`)
- Honeypot (champ invisible, drop silencieux) → longueurs plafonnées
  (nom 100, email 200, sujet 200, message 5000) → **rate limit indexé** :
  `by_visitorId` sur `messages`, max 3/heure par `visitorId` (client, best
  effort) → insertion → notification email planifiée (`scheduler.runAfter(0)`
  → `notify.sendContactEmail`) si activée et si `notificationEmail` renseigné.

### 3.5 Statistiques (`site.getStats`)
- Lecture plafonnée (5 000 visiteurs + 5 000 messages) sur la fenêtre retenue
  (purge 90 j via `scheduler.ts` → `purgeOldVisitors` toutes les 24 h).
- Calculs purs dans `src/lib/stats.ts` (testés) : fenêtres UTC, uniques,
  appareils, navigateurs, heures de pointe, conversion contact.
- `trackVisit` (public) : bornes de longueur + throttle 30/min/id, drop
  silencieux des événements invalides.

## 4. Modèle de sécurité (état au 2026-08-14)

| Porte | Protection |
|---|---|
| Connexion | Mot de passe uniquement (OTP supprimé) ; compte par défaut documenté, bannière de changement dans le dashboard |
| Fonctions sensibles | Rôle `admin` exigé : `requireOwner` (écritures), `getStats`/`getMessages`/`getVisitors`/`getIntegrations`/`getSettingsForBackend`, `credentials.*`, `translate.*`, `files.*` |
| UI dashboard | `RequireAuth` redirige les non-admins vers `/` |
| Storage | `generateUploadUrl`, `getUrl`, `deleteFile` propriétaire uniquement |
| Clé DeepL | Jamais renvoyée au client ; `getSettingsForBackend` admin-only |
| XSS scripts perso | Réservé admin + CSP (`index.html`) avec soupape `unsafe-inline` + CDN connus |
| Anti-spam | Honeypot + longueurs + rate limits (messages indexé, visites borné) |
| Purge | Visiteurs > 90 j supprimés quotidiennement (cron interne) |

## 5. Dépendances de plateforme (Freebuff)

- `vite.config.ts` : `vlyPlugin()` (`@vly-ai/integrations`) + `hmr: false`
  imposé par la plateforme. Ne pas modifier sauf besoin de portabilité
  (voir `README.md` § Déploiement).
- `vly-toolbar-readonly.tsx` : toolbar d'édition Freebuff (DO NOT MODIFY),
  embarquée dans le bundle, active uniquement sur les hôtes `*.vly.sh`.
- `src/lib/vly-integrations.ts` : **fichier mort supprimé** (2026-08-14) avec
  `integrations.md` et la dépendance `@oslojs/crypto` (fantôme post-OTP).
- Relais email : `src/convex/emailRelay.ts` (clé x-api-key plateforme), seul
  canal email restant (OTP supprimé) — notification de contact uniquement.

## 6. Limites connues (assumées)

- Miroir EN **par position** : un réordonnancement massif peut désaligner les
  traductions (le diff DeepL retraduit automatiquement les champs déplacés).
- Boîte de réception **paginée** (`getMessages` paginé, 50/page, « Charger
  plus ») ; badge du sidebar via `getMessagesCount` ; export CSV des chargés.
- `visitorId` (anti-spam) est généré côté client → contournable par rotation ;
  aucune adresse IP n'est disponible côté Convex.
- Le site public charge les images telles quelles (pas de redimensionnement
  serveur ; consignes de ratio/taille dans l'UI d'import).
- Sur un déploiement hors Freebuff : le relais email est inactif → couper la
  notification dans le menu Intégrations.
