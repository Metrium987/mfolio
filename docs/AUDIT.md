# Audit profond — Mfolio (2026-08-14)

> Audit produit et technique, angle par angle, avec sévérité et références.
> Verdict global : **code de très bonne facture** — architecture claire,
> commentaires utiles, TypeScript strict, tests sur la logique pure, build
> réparé. Les trous de sécurité découverts le 2026-08-14 (contrôle d'accès,
> storage, build) sont **corrigés** ; ce document liste l'existant, les
> points restants et les optimisations. Plan d'action priorisé :
> [OPTIMIZATION-PLAN.md](./OPTIMIZATION-PLAN.md).

## A. Sécurité — ✅ durcie, points restants faibles

**Corrigé (2026-08-14, vérifié code + build + tests) :**
- Contrôle d'accès par rôle `admin` sur toutes les fonctions sensibles
  (site.ts, siteMutations.ts, credentials.ts, translate.ts, files.ts) + UI
  (`RequireAuth`).
- OTP supprimé entièrement (provider, UI, réglage, dépendance `input-otp`) —
  aucune création de compte public.
- Storage verrouillé (upload/URL/suppression propriétaire).
- CSP ajoutée ; bannière identifiants par défaut ; rate limits (messages
  indexé, visites borné).

**Reste (sévérité faible à moyenne) :**
1. ✅ **`ensureSeed`** : la branche destructive (vidage messages + visiteurs)
   est désormais réservée au propriétaire (garde role admin, seed.ts).
2. **`ensureAdmin`** (action publique) reste appelable par n'importe qui —
   idempotente et sans effet si un compte existe ; risque négligeable.
3. **Pas de limite de tentatives** sur `signIn("password")` explicite côté
   app (Convex Auth gère l'expiration des sessions ; le brute-force dépend du
   fournisseur). À surveiller si l'app est exposée publiquement longtemps.
4. **`getPasswordAccount`** expose l'email de connexion publiquement
   (`isDefault`) — voulu (indice de login) ; pas un secret.
5. **CSP partielle** : `'unsafe-inline'` (scripts perso) + `connect-src https:`
   large → protège surtout contre les scripts tiers injectés ; pas contre le
   XSS inline. Acceptable tant que `scriptHeader/scriptFooter` sont admin-only.

## B. Performance — correcte, 3 gains concrets

**Mesuré (build du 2026-08-14) :** ~540 Ko JS gzippé au total
(`index` 139 Ko gz, `framer-motion` 42 Ko gz, `radix-ui` 32 Ko gz,
`Dashboard` 23 Ko gz, `react-vendor` 17 Ko gz, `Auth` 7 Ko gz, `site` 15 Ko gz…).
Split par route en place ✅ (Auth/Dashboard/NotFound lazy).

1. ✅ **Registre d'icônes ~140 entrées** : extrait dans
   `src/lib/service-icons.tsx` (module dédié, chunk séparé) — le site public
   ne charge plus les icônes du dashboard avec ses helpers. Le lazy
   `import()` par groupe reste une évolution possible.
2. **`vly-toolbar-readonly.tsx`** (plateforme, DO NOT MODIFY) est importé en
   haut de `main.tsx` → **dans le bundle initial**. Ne s'active que sur
   `*.vly.sh` mais pèse en parsing. Option : l'isoler derrière un lazy import
   (à valider avec la plateforme).
3. ✅ **Scripts personnalisés** : ne ré-injectent plus que si le contenu a
   réellement changé (garde par `useRef` de la dernière paire injectée,
   Landing.tsx) — plus de double init d'analytics à chaque sauvegarde.

**Backend :** lectures plafonnées (stats 5 000, messages 200, visiteurs 500) ;
purge 90 j ; indexes pour les deux rate limits ; `runAfter(0)` pour l'email.
RAS à l'échelle d'un portfolio. Si trafic massif : stats agrégées (P3,
voir plan).

## C. Qualité / maintenabilité — bien, 3 nettoyages

1. ✅ **`src/lib/vly-integrations.ts` supprimé** (mort, aucun import) avec
   `integrations.md` ; `@oslojs/crypto` retiré (dépendance fantôme depuis la
   suppression de l'OTP).
2. ✅ **`sonner.tsx`** : thème du Toaster dérivé de la classe `.dark` du
   document ; dépendance `next-themes` retirée.
3. **Fichiers volumineux** : `editors-lists.tsx` (~2 000 l),
   `editors-basic.tsx` (~1 260 l), `seed.ts` (~700 l). Bien commentés et
   fonctionnels ; refactor à faire au fil des besoins (pas d'urgence).

**Points forts vérifiés :** 22 tests unitaires (levels, sections, stats),
lint propre, TypeScript strict, zéro dépendance inutilisée restante (hors
les deux dépendances plateforme `@zumer/snapdom` + `@vly-ai/integrations`),
commentaires explicatifs partout, gestion des états vides et des erreurs
cohérente.

## D. Produit / UX — complet, 3 améliorations utiles

**Existant solide :** thème Studio cohérent, responsive partout, bilingue
FR/EN, SEO complet (meta runtime + fallback statique + JSON-LD + sitemap),
anti-spam, stats, export CSV des messages, bannière de sécurité, modes
sombre/clair, maintenance, sections réordonnables, édition immédiate des
listes.

1. ✅ **Récupération de mot de passe documentée** : procédure dashboard Convex
   → `authAccounts` → suppression de la ligne → `/auth` recrée le compte par
   défaut (README FR/EN + docs/DEPLOYMENT.md).
2. ✅ **Boîte de réception paginée** : `getMessages` paginé (50/page,
   « Charger plus ») + badge du sidebar via `getMessagesCount` — fini le
   plafond de 200.
3. ✅ **A11y** : lien d'évitement « Aller au contenu » sur le Landing et le
   Dashboard (focus visible uniquement). Reste : `lang` sur les bouts de
   contenu EN (mineur).

## E. Dépendances & config

- **Installées et utilisées** : react, react-dom, react-router, convex,
  @convex-dev/auth, @radix-ui/* (8), framer-motion, lucide-react, sonner,
  tailwind-merge, clsx, class-variance-authority, tailwindcss,
  @tailwindcss/vite, @zumer/snapdom + @vly-ai/integrations (plateforme).
  **Retirées** : `input-otp` ✅, `next-themes` ✅, `@oslojs/crypto` ✅.
- **`input-otp` retiré** ✅ (avec le composant).
- `vite.config.ts` : `manualChunks` réparé ✅ (build 13 s), `optimizeDeps`
  cohérent, `hmr: false` imposé (ne pas toucher).
- `tsconfig` strict, eslint + prettier configurés.

## F. Robuste / cas limites — bons réflexes partout

- Erreurs serveur → toasts FR lisibles (jamais de stack exposée).
- États vides (sections, messages, réseaux) gérés.
- `getSiteData` masque les clés ; `sanitizeSettings` retire les champs legacy.
- Storage : URL résolue stockée en dur → pas de dépendance au runtime pour le
  public.
- `updateAdminEmail` gère la fusion si l'email appartient à un autre user
  (fédéré Freebuff) ✅.
- Le typewriter s'arrête proprement avec une seule tagline ✅.

## G. Ce qui reste à faire (résumé)

| Priorité | Action | Fichier | Effort |
|---|---|---|---|
| Priorité | Action | Fichier | État |
|---|---|---|---|
| P0 | Garde admin sur la branche destructive de `ensureSeed` | seed.ts | ✅ |
| P1 | Supprimer `vly-integrations.ts` + `integrations.md` ; retirer `@oslojs/crypto` | lib/, racine, package.json | ✅ |
| P1 | Sonner : thème depuis `.dark` (retirer `next-themes`) | ui/sonner.tsx, package.json | ✅ |
| P1 | Scripts perso : ne ré-injecter que si contenu changé | Landing.tsx | ✅ |
| P2 | Icônes : registre extrait dans `service-icons.tsx` (chunk séparé) | lib/service-icons.tsx | ✅ |
| P2 | Documenter la récupération de mot de passe (self-host) | README/DEPLOYMENT | ✅ |
| P2 | Pagination messages (au-delà de 200) | site.ts + editors-lists | ✅ |
| P3 | A11y skip-link | Landing.tsx + Dashboard.tsx | ✅ |
| P3 | Refactor `editors-lists`/`editors-basic` ; stats agrégées ; tests composants/Convex ; CSP stricte | divers | ⏳ au besoin |
