# Carte du code — Mfolio

> Où est quoi, qui appelle quoi, et ce qu'il ne faut PAS casser.
> Complète [ARCHITECTURE.md](./ARCHITECTURE.md). État au 2026-08-14.

## Frontend

### Entrée
- **`src/main.tsx`** — bootstrap : `ConvexAuthProvider` + `SiteLangProvider` +
  `BrowserRouter`. Routes lazy (`Landing`, `AuthPage`, `Dashboard`,
  `NotFound`). `RouteSyncer` (postMessage iframe Freebuff), `VlyToolbar`
  (fichier plateforme, gardé par `ToolbarErrorBoundary`), `RootErrorBoundary`
  (anti-page-blanche). **Ne pas retirer** les error boundaries ni les imports
  globaux (`./index.css`).

### Pages
- **`src/pages/Landing.tsx`** — site public. Un seul `useQuery(getSiteData)`.
  Effects : seed (une fois), thème/favicon, meta SEO runtime, JSON-LD
  (Schema.org Person), GA (gardé `gaInjected`), scripts perso
  (ré-injectés à chaque changement de `settings` — voir AUDIT), tracking
  visite. `sectionVisible` + `order` pilote le rendu des sections.
- **`src/pages/Auth.tsx`** — connexion **mot de passe uniquement** (OTP
  supprimé). `ensureAdmin` une fois par chargement. `redirectAfterAuth`
  par défaut `/dashboard` + `returnTo`.
- **`src/pages/Dashboard.tsx`** — layout sidebar + contenu par onglet.
  Bannière « identifiants par défaut » (tant que `credentialsChanged !== true`),
  auto-translate au 1er lancement si clé DeepL sans miroirs, `ensureSeed`.
- **`src/pages/NotFound.tsx`** — 404.

### Composants site (public)
- **`Chrome.tsx`** — `SiteHeader` (nav ancres, switch langue, thème sombre/clair
  manuel via classe `.dark` + localStorage `mfolio_theme`, menu mobile Sheet),
  `SiteFooter` (réseaux en monogrammes).
- **`Hero.tsx`** — en-tête : portrait, nom, taglines avec **machine à écrire**
  (caret `.typewriter-caret`, rotation des taglines, stop si une seule).
- **`Section.tsx`** — `Container`, `SectionHeading`, `Reveal`
  (framer-motion, respecte `prefers-reduced-motion`).
- **`Skills/Resume/Portfolio/Blog/Languages/Interests/Services/Contact.tsx`** —
  rendu d'une section ; toutes passent par `pick()` pour FR/EN, gèrent les
  états vides, layouts `list|cards` (rendu via `LevelDots` pour les niveaux).

### Composants admin (dashboard)
- **`SectionEditor.tsx`** — squelette d'éditeur : titre, toggle visibilité,
  zone d'édition, barre sticky « Enregistrer ».
- **`fields.tsx`** — champ génériques (`TextField`, `TextAreaField`,
  `ToggleField`, `FieldGroup`), `ImageField` (upload storage ou URL),
  `SocialLinksEditor`, `useSectionDraft` (copie locale, `dirty` par
  `JSON.stringify`, `commit` après save).
- **`sortable-list.tsx`** — `SortableList` + `DragHandle` (poignée ⋮⋮) : glisser-déposer souris/tactile/clavier (@dnd-kit) pour toutes les listes réordonnables, en complément des flèches ↑/↓.
- **`manage-list.tsx`** — `ManageList` générique : modale édition (copie
  locale), modale aperçu, ↑/↓, suppression avec confirmation, `onSaved`
  (publication immédiate). Utilisé par toutes les listes.
- **`editors-basic.tsx`** (~1 260 lignes) — `SiteEditor` (Paramètres :
  identité, logo/favicon, **SEO**, **scripts perso**), `ConfigEditor` (Config :
  thème, visibilités, ordre, maintenance, layouts), `IntegrationsEditor`
  (clés GA/DeepL, email de notification, interrupteurs email) et
  `SecurityEditor` (email + mot de passe du propriétaire) — partagent la
  constante `EMPTY_SETTINGS` pour leurs brouillons.
- **`editors-lists.tsx`** (~2 000 lignes) — éditeurs de listes (Compétences,
  Langues, Intérêts, Services, Parcours, Projets, Journal) + `MessagesView`
  (boîte de réception, **export CSV**, popup, marquer répondu) +
  `VisitorsView`.

### UI (shadcn) — `src/components/ui/`
`button, card, input, textarea, label, select, switch, dialog, alert-dialog,
sheet, tooltip, badge, separator, alert, sonner`. **`input-otp.tsx` supprimé**
(2026-08-14). `sonner.tsx` dérive le thème du Toaster de la classe `.dark` du
document (dépendance `next-themes` retirée le même jour).

### Libs — `src/lib/`
- **`site.tsx`** — `APP_NAME`, monogrammes, `detectBrowser/detectPlatform`,
  `getOrCreateVisitorId` (localStorage `mfolio_visitor`), `applyFavicon`,
  `applyThemeColor` (override `--primary`/`--studio-accent`). Le **registre de
  ~140 icônes** (`SERVICE_ICON_GROUPS` + `ServiceIcon`) vit dans
  `src/lib/service-icons.tsx` (chunk dédié, extrait le 2026-08-14).
- **`i18n.tsx`** — `SiteLangProvider` + `useSiteLang` : `t(key)` (UI),
  `pick(fr, en)` (contenu), localStorage `mfolio_lang`, `document.lang` synchro.
- **`sections.ts`** — `SECTION_IDS` (8 sections ordonnables), labels FR.
  Partagé frontend + backend (seed).
- **`levels.ts`** — échelle unifiée 1–5 (langues), conversion
  proficiency 0–100 → 1–5 (compétences), labels FR/EN. **Testé**.
- **`stats.ts`** — fenêtres UTC + agrégations pures. **Testé**. Aucun import
  (partagé backend + vitest).
- **`utils.ts`** — `cn()` (clsx + tailwind-merge).

## Backend Convex — `src/convex/`

| Fichier | Rôle | Garde |
|---|---|---|
| `schema.ts` | Tables + validators + `ROLES` (`admin`/`user`/`member`), index `messages.by_visitorId`, `visitors.by_createdAt` | — |
| `auth.ts` | `convexAuth({ providers: [Password] })` — **OTP retiré** | — |
| `auth.config.ts` | Providers OIDC : `convex` (CONVEX_SITE_URL) + `customJwt` Freebuff (VLY_CONVEX_AUTH_ISSUER) | — |
| `http.ts` | Routes HTTP d'auth (OIDC discovery) | — |
| `users.ts` | `currentUser` (query publique du user connecté), `getCurrentUser`, **`getCurrentAdmin`** (rôle admin) | — |
| `ensureAdmin.ts` | `hasPasswordAccount`, `ensureAdmin` (crée le compte par défaut si aucun) | Publique/idempotente |
| `credentials.ts` | `getPasswordAccount` (email + `isDefault`), `updateAdminEmail` (merge si email déjà pris), `updateAdminPassword` (≥ 8 car.), `markCredentialsChanged` | Admin |
| `site.ts` | `getSiteData` (public, clés masquées), `getIntegrations`, `getSettingsForBackend` (clé DeepL brute), `getStats`, `getMessages` (paginé 50/page) + `getMessagesCount`, `getVisitors` (500) | Admin sauf `getSiteData` |
| `siteMutations.ts` | `persistSection` (écriture par l'action de traduction), `updateIntegrations`, `setCvUrl`, `addMessage` (public + anti-spam), `markMessageReplied`, `deleteMessage`, `trackVisit` (public, borné), `deleteVisitor`, `purgeOldVisitors` (internal, cron) | Admin sauf public |
| `translate.ts` | `updateXxx` (10 actions), `translateAllContent` ; `translateOne` avec **diff** ; `getDeepLApiKey` | Admin |
| `files.ts` | `generateUploadUrl`, `getUrl`, `deleteFile` | **Admin** (2026-08-14) |
| `notify.ts` | `sendContactEmail` ("use node") via `emailRelay` | Internal (scheduler) |
| `emailRelay.ts` | `sendViaEmailRelay` — relais Freebuff (seul canal email restant) | Backend |
| `scheduler.ts` | Cron quotidien : purge visiteurs > 90 j | Internal |
| `seed.ts` | `ensureSeed` (public) : migrations additives + **réinitialisation complète si le site de base manque** | Publique/idempotente |

### Invariants à ne pas casser
1. **Toute fonction sensible vérifie le rôle admin** (via `getCurrentAdmin` ou
   `runQuery(api.users.currentUser)` + `ROLES.ADMIN`). Ne pas retirer ces
   gardes : elles ferment la porte aux comptes fédérés Freebuff.
2. **La clé DeepL ne doit jamais atteindre le navigateur** :
   `sanitizeSettings` (getSiteData) + `getSettingsForBackend` admin-only.
3. **`schemaValidation: false`** : les docs ne sont validés qu'aux frontières
   (args). Les migrations de schéma se font dans `seed.ts` (patches
   additifs). Ne jamais écrire de doc hors validators sans prévoir la migration.
4. **Miroir `en` par position** : `translateOne` compare FR stocké vs entrant.
   Un champ FR inchangé garde son EN (diff). Ne pas casser ce diff sans
   conséquence quota.
5. **`vite.config.ts`** : `hmr: false` imposé par Freebuff ; `manualChunks`
   ne doit référencer que des packages installés (build cassé sinon).
6. **`vly-toolbar-readonly.tsx`** et les error boundaries de `main.tsx` sont
   des exigences plateforme — ne pas supprimer.
