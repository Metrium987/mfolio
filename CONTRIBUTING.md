# Contribuer à Mfolio

Merci de vouloir contribuer ! 🙌 Ce guide est court et pratique.

## Setup de développement

```bash
bun install
bunx convex dev        # terminal 1 — backend Convex (déploiement + types)
bun run dev            # terminal 2 — frontend Vite
```

Le contenu d'exemple et le compte admin (`admin@admin.com` / `admin123`) sont créés automatiquement au premier chargement.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `bunx tsc -b --noEmit` | Typecheck strict (à faire passer avant de soumettre) |
| `bun test` | Tests unitaires (Vitest) — `src/lib/*.test.ts` |
| `bun run lint` | ESLint (0 erreur attendue) |
| `bun run format` | Prettier |

## Conventions

- **Gestionnaire de paquets :** Bun. Ne committez pas d'autre lockfile.
- **Imports :** chemins `@/…` (alias vers `src/`), `@/convex/_generated/…` pour les fonctions et types Convex.
- **Ne jamais modifier** `src/convex/_generated/` : c'est du code généré (régénérez avec `bunx convex dev --once`).
- **Backend Convex :** les fonctions touchant à l'externe (email, DeepL) sont des *actions* avec `"use node"`. Requêtes = `query`, écritures = `mutation`. Protégez chaque fonction au niveau base (auth, rôle admin).
- **Règles React :** hooks uniquement depuis `react`, jamais de hooks conditionnels, jamais de copie du bundle React.
- **Style :** Tailwind + tokens CSS existants (`src/index.css`). Pas d'ombres (bordures fines), pas de cartes imbriquées, `cursor-pointer` sur les éléments cliquables, tout doit rester **mobile responsive**.
- **Validation :** utilisez les validators Convex (`convex/values`) dans le schéma et les signatures de fonctions.

## Tests

Les helpers purs (niveaux 1–5, ordre des sections, statistiques) sont testés unitairement. Ajoutez un test dans `src/lib/*.test.ts` à chaque nouvelle logique pure :

```bash
bun test              # tout
bun test src/lib/stats.test.ts   # un fichier
```

## Workflow de pull request

1. Fork + branche (`feat/…`, `fix/…`).
2. Vérifiez : `bunx tsc -b --noEmit`, `bun test`, `bun run lint`.
3. PR concise, décrivez le *pourquoi* du changement.
4. Les changements d'API Convex doivent rester rétrocompatibles (le seed migre les données existantes — ne le cassez pas).

Merci ! 🚀
