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
1. **`ensureSeed` est une mutation publique destructive par conception** —
   si les tables de base manquent, elle **vide** messages + visiteurs avant de
   re-seeder (seed.ts, ~ligne 660). En pratique inexploitable (le site de base
   existe toujours), mais un incident (doc `site` supprimé accidentellement)
   réinitialiserait la boîte de réception. → *envisager une garde role admin
   sur la branche destructive.*
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

1. **Registre d'icônes ~140 entrées** (`src/lib/site.tsx`) : toutes les icônes
   référencées sont **dans le bundle du site public** (le Landing le charge).
   Gain estimé : **30–50 Ko gz** en chargeant les groupes d'icônes en lazy
   (dynamic `import()`) ou en ne gardant que les icônes réellement utilisées
   côté public.
2. **`vly-toolbar-readonly.tsx`** (plateforme, DO NOT MODIFY) est importé en
   haut de `main.tsx` → **dans le bundle initial**. Ne s'active que sur
   `*.vly.sh` mais pèse en parsing. Option : l'isoler derrière un lazy import
   (à valider avec la plateforme).
3. **Scripts personnalisés ré-injectés à chaque changement de `settings`**
   (`Landing.tsx`, effect `[data?.settings]`) : une sauvegarde de n'importe
   quelle section (settings inclus) **ré-exécute** les scripts → double init
   d'analytics tiers. → *garder la version précédente et ne ré-injecter que si
   le contenu a changé* (coût : ~5 lignes).

**Backend :** lectures plafonnées (stats 5 000, messages 200, visiteurs 500) ;
purge 90 j ; indexes pour les deux rate limits ; `runAfter(0)` pour l'email.
RAS à l'échelle d'un portfolio. Si trafic massif : stats agrégées (P3,
voir plan).

## C. Qualité / maintenabilité — bien, 3 nettoyages

1. **`src/lib/vly-integrations.ts` est mort** (aucun import ; référence
   `process.env.VLY_INTEGRATION_KEY` inexistant → casserait au chargement).
   À supprimer avec `integrations.md` (reliquat vly.ai, passerelle 401).
2. **`sonner.tsx` utilise `next-themes`** sans ThemeProvider : les toasts
   suivent `"system"`, pas le toggle sombre/clair manuel de l'app → incohérent
   en mode sombre forcé. → retirer `next-themes` (dépendance) et passer le
   thème du Toaster depuis la classe `.dark` du document.
3. **Fichiers volumineux** : `editors-lists.tsx` (~2 000 l),
   `editors-basic.tsx` (~1 260 l), `seed.ts` (~700 l). Bien commentés et
   fonctionnels ; refactor à faire au fil des besoins (pas d'urgence).

**Points forts vérifiés :** 22 tests unitaires (levels, sections, stats),
lint propre, TypeScript strict, zéro dépendance inutilisée restante (hors
`next-themes` ci-dessus et les deux fichiers plateforme), commentaires
explicatifs partout, gestion des états vides et des erreurs cohérente.

## D. Produit / UX — complet, 3 améliorations utiles

**Existant solide :** thème Studio cohérent, responsive partout, bilingue
FR/EN, SEO complet (meta runtime + fallback statique + JSON-LD + sitemap),
anti-spam, stats, export CSV des messages, bannière de sécurité, modes
sombre/clair, maintenance, sections réordonnables, édition immédiate des
listes.

1. **Pas de récupération de mot de passe** (l'OTP servait à ça) : si le mot de
   passe est perdu, l'accès se récupère via le dashboard Convex (supprimer la
   ligne `authAccounts`) → le documenter dans le README (déjà partiellement :
   docs/DEPLOYMENT.md).
2. **Boîte de réception plafonnée à 200 messages** : l'UI le dit désormais et
   l'export CSV couvre les chargés ; une vraie pagination serait un plus si
   volume élevé.
3. **A11y** : focus-visible ✅, `prefers-reduced-motion` ✅, labels/aria ✅.
   Manque : lien d'évitement « Aller au contenu » et `lang` sur les bouts de
   contenu EN (le `<html lang>` suit la langue active ✅). Mineur.

## E. Dépendances & config

- **Installées et utilisées** : react, react-dom, react-router, convex,
  @convex-dev/auth, @radix-ui/* (8), framer-motion, lucide-react, sonner,
  tailwind-merge, clsx, class-variance-authority, tailwindcss,
  @tailwindcss/vite, next-themes (sonner), @zumer/snapdom + @vly-ai/integrations
  (plateforme), @oslojs/crypto (OTP… retiré ? **vérifier** — était importé par
  emailOtp.ts supprimé ; si plus d'imports, le retirer).
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
| P0 | Garde admin sur la branche destructive de `ensureSeed` | seed.ts | 5 min |
| P1 | Supprimer `vly-integrations.ts` + `integrations.md` ; retirer `@oslojs/crypto` si inutilisé | lib/, racine, package.json | 10 min |
| P1 | Sonner : thème depuis `.dark` (retirer `next-themes`) | ui/sonner.tsx, package.json | 15 min |
| P1 | Scripts perso : ne ré-injecter que si contenu changé | Landing.tsx | 15 min |
| P2 | Icônes en lazy (÷ bundle public de 30–50 Ko gz) | lib/site.tsx | ½ j |
| P2 | Documenter la récupération de mot de passe (self-host) | README/DEPLOYMENT | 10 min |
| P2 | Pagination messages (au-delà de 200) | site.ts + editors-lists | ½ j |
| P3 | Refactor `editors-lists`/`editors-basic` ; stats agrégées ; tests composants/Convex ; a11y skip-link | divers | 1–3 j |
