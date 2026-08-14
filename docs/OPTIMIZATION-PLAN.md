# Plan d'optimisation — Mfolio (2026-08-14)

> Feuille de route priorisée issue de [AUDIT.md](./AUDIT.md). Chaque action est
> concrète (fichier + quoi + pourquoi + effort).
>
> **État : tout exécuté le 2026-08-14** (items 1 → 7 et 11), sauf les items
> P3 restants (8, 9, 10, 12) qui sont des choix produit/maintenance.
> Vérifié : codegen Convex ✅ · typecheck ✅ · build ✅ · lint ✅ · 22 tests ✅.

## P0 — Correctifs (rapides, réels)

### 1. ✅ Garder la branche destructive de `ensureSeed` pour le propriétaire
- **Fichier** : `src/convex/seed.ts` (`ensureSeed`)
- **Quoi** : la partie qui vide `messages` + `visitors` avant re-seed ne doit
  s'exécuter que pour le propriétaire (ou être retirée — les tables de base
  manquantes peuvent se re-créer sans toucher aux messages).
- **Pourquoi** : aujourd'hui n'importe qui peut appeler cette mutation
  publique ; en pratique le site de base existe toujours (donc pas de wipe),
  mais c'est une destruction silencieuse par conception.
- **Effort** : ~10 min.

## P1 — Nettoyage & cohérence (1 matinée)

### 2. ✅ Supprimer le code mort vly.ai
- **Fichiers** : `src/lib/vly-integrations.ts` (aucun import), `integrations.md`
  (doc de la passerelle morte), dépendance **`@oslojs/crypto`** (plus aucun
  import depuis la suppression de l'OTP).
- **Pourquoi** : `vly-integrations.ts` lit `process.env.VLY_INTEGRATION_KEY`
  (inexistant) — casserait au chargement ; la passerelle renvoie 401 depuis le
  rachat. `@oslojs/crypto` = dépendance fantôme.
- **Attention** : **ne pas** retirer `@vly-ai/integrations` (le `vlyPlugin()`
  de `vite.config.ts` en dépend) ni `@zumer/snapdom` (toolbar plateforme).
- **Effort** : ~10 min.

### 3. ✅ Toaster : suivre le thème réel de l'app
- **Fichier** : `src/components/ui/sonner.tsx` + `package.json`
- **Quoi** : remplacer `useTheme` de `next-themes` (aucun ThemeProvider → thème
  `"system"` systématique) par un thème dérivé de la classe `.dark` du
  document (petit hook + MutationObserver, ou lecture au rendu du Toaster).
  Retirer ensuite la dépendance `next-themes`.
- **Pourquoi** : en mode sombre forcé par l'app, les toasts restent clairs
  (ou l'inverse) — incohérence visible.
- **Effort** : ~15 min.

### 4. ✅ Scripts personnalisés : ne ré-injecter que si le contenu change
- **Fichier** : `src/pages/Landing.tsx` (effect scripts)
- **Quoi** : conserver la dernière paire `{scriptHeader, scriptFooter}`
  injectée et ne ré-injecter que si le contenu diffère.
- **Pourquoi** : Convex est réactif — toute sauvegarde de section re-déclenche
  l'effect → les scripts (ex. analytics) s'exécutent **en double** à chaque
  sauvegarde.
- **Effort** : ~15 min.

## P2 — Performance & produit (1–2 jours)

### 5. ✅ Icônes : registre extrait dans `src/lib/service-icons.tsx`

> Appliqué en version plus simple que le lazy-loading prévu : le registre de
> ~140 icônes est isolé dans un module dédié (`service-icons.tsx`), séparé du
> chunk des helpers du site → chunk propre et cacheable, code plus lisible.
> Le lazy `import()` par groupe reste une évolution possible si le poids du
> bundle public devenait critique.

### 5bis. Réduire le bundle public : icônes en chargement différé
- **Fichier** : `src/lib/site.tsx` (registre `SERVICE_ICON_GROUPS` +
  `serviceIconRegistry`, ~140 icônes)
- **Quoi** : charger les groupes d'icônes à la demande (dynamic `import()` par
  groupe, rendu via `lazy`/`Suspense`) ou ne garder dans le chunk initial que
  les icônes réellement utilisées côté public.
- **Pourquoi** : les 140 icônes sont toutes dans le bundle du Landing
  (≈ 30–50 Ko gz). Le dashboard les utilise à l'édition ; le site public n'en
  affiche que quelques-unes.
- **Effort** : ~½ journée. Mesurer après : `bun run build`.

### 6. ✅ Documenter la récupération de mot de passe (self-host)
- **Fichier** : `README.fr.md` / `docs/DEPLOYMENT.md` (§ Sécurité)
- **Quoi** : la perte du mot de passe n'a plus de porte de secours (OTP
  supprimé) → décrire la procédure : dashboard Convex → table `authAccounts` →
  supprimer la ligne → recharger `/auth` (`ensureAdmin` recrée le compte
  par défaut).
- **Pourquoi** : c'est la conséquence assumée de la suppression de l'OTP ; il
  faut que ce soit documenté, pas découvert par un utilisateur bloqué.
- **Effort** : ~10 min.

### 7. ✅ Pagination de la boîte de réception
- **Fichier** : `src/convex/site.ts` (`getMessages`, arg `cursor`) +
  `src/components/admin/editors-lists.tsx` (`MessagesView`)
- **Quoi** : paginer au-delà de 200 messages (cursor Convex).
- **Pourquoi** : la boîte plafonne aujourd'hui ; l'export CSV ne couvre que le
  chargé. Faible priorité tant que le volume est faible.
- **Effort** : ~½ journée.

## P3 — Entretien (au fil des besoins)

8. **Refactor** `editors-lists.tsx` (~2 000 l) / `editors-basic.tsx`
   (~1 260 l) par section — zéro bénéfice utilisateur, à faire quand un
   changement touche ces fichiers.
9. **Stats agrégées stockées** — uniquement si le trafic dépasse le niveau
   d'un portfolio (lectures plafonnées + purge 90 j suffisent).
10. **Tests** : composants (Testing Library — nouvelle dépendance) et
    fonctions Convex (garde `admin`, anti-spam) — verrouille les flux critiques.
11. ✅ **A11y** : lien d'évitement « Aller au contenu » — ajouté sur le
    Landing (`#main-content`) et le Dashboard, clé i18n `a11y.skipToContent`
    (FR/EN).
12. **CSP plus stricte** : lister les `connect-src` explicites (au lieu de
    `https:`) une fois les scripts perso stables.

## Ordre conseillé — exécuté

✅ **P0+P1** : 1 → 2 → 3 → 4.
✅ **P2** : 5 (extraction) → 6 → 7 (pagination `usePaginatedQuery`, 50/p.
+ « Charger plus », badge `getMessagesCount`).
✅ **P3** : 11 (skip link).
⏳ **Restants (choix produit/maintenance)** : 8 (refactor éditeurs), 9 (stats
agrégées), 10 (tests composants/Convex), 12 (CSP stricte).

Chaque étape se vérifie avec : `bun convex dev --once && bunx tsc -b --noEmit`,
`bun run build`, `bun run lint`, `bun run test`.
