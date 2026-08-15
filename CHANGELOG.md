# Changelog

Toutes les évolutions notables de Mfolio sont documentées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet suit le [Semantic Versioning](https://semver.org/lang/fr/).

## [1.2.0] — 2026-08-15

### Ajouté

- **Thèmes & palettes** — Sécurité du compte → Apparence repensé :
  - **10 thèmes complets** (inspirés des « UI Presets » de Freebuff Web) :
    Studio, Encre, Bleu nuit, Forêt, Prune, Braise, Or ancien, Cobalt,
    Rose poudré, Sauge — chaque thème est un ensemble coordonné (papier,
    surfaces, encre, neutres, bordures et accent) défini en **clair et en
    sombre**, choisi en un clic. Choisir un thème règle aussi l'accent.
  - **Rétro-compatible** : réglage absent, inconnu ou « Studio » = rendu
    d'origine inchangé ; la couleur personnalisée reste une surcharge
    d'accent sur le thème choisi.
  - **Ambiance par défaut** du site contrôlée par le propriétaire :
    Automatique (suit la préférence du visiteur), Clair ou Sombre — le
    visiteur garde son interrupteur clair/sombre dans l'en-tête.
  - **Accent adapté au mode sombre** : chaque thème et toute couleur
    personnalisée disposent d'une variante éclaircie automatique, lisible
    sur fond sombre (boutons, liens, accents).

## [1.1.0] — 2026-08-14

### Sécurité

- **Contrôle d'accès par rôle** : `requireOwner` et toutes les fonctions sensibles (messages, stats, visiteurs, intégrations, clé DeepL, identifiants, stockage) vérifient désormais le rôle `admin`. Un compte non-propriétaire ne peut plus lire la boîte de réception ni modifier quoi que ce soit.
- **Suppression complète des codes OTP** (connexion par email) : provider, UI, réglage et dépendance `input-otp` retirés. La seule connexion est le mot de passe du propriétaire — aucune création de compte public possible.
- **Stockage verrouillé** : `generateUploadUrl`, `getUrl` et `deleteFile` sont réservés au propriétaire.
- **Bannière « identifiants par défaut »** dans le tableau de bord tant que `admin@admin.com` n'est pas changé.

### Changements

- **Build de production réparé** : `manualChunks` de `vite.config.ts` nettoyés (packages inexistants retirés) → `bun run build` passe.
- **Traduction DeepL incrémentale** : seuls les champs modifiés sont retraduits (économie de quota, miroir EN conservé).
- **Export CSV** de la boîte de réception Messages.
- **Anti-spam renforcé** : limite de contact par fenêtre temporelle indexée (`by_visitorId`), bornes + throttle sur `trackVisit`.
- **CSP** ajoutée dans `index.html` (soupape pour scripts propriétaire + CDN connus).
- **Boîte de réception paginée** : `getMessages` paginé (50/page, « Charger plus »), badge du sidebar via un comptage dédié — plus de plafond à 200.
- **Glisser-déposer** : toutes les listes réordonnables (sections, compétences, langues, centres d'intérêt, services, parcours, projets, journal) se déplacent maintenant à la souris, au doigt et au clavier via un composant `SortableList` (@dnd-kit) — les flèches ↑/↓ restent disponibles.
- **Dashboard restructuré** : « Intégrations » et « Sécurité du compte » deviennent des sections du menu ; « Référencement (SEO) » et « Scripts personnalisés » rejoignent « Paramètres » — la répartition est désormais : Paramètres = identité du site, Config = rendu du portfolio, Intégrations = services externes, Sécurité = compte propriétaire.
- **Registre d'icônes extrait** dans `src/lib/service-icons.tsx` (chunk séparé, code plus lisible).
- **A11y** : lien d'évitement « Aller au contenu » sur le site public et le dashboard.
- Nettoyage : `isolate/` (vieux build committé) supprimé et gitignoré ; `vly-integrations.ts`/`integrations.md` supprimés ; `next-themes` et `@oslojs/crypto` retirés des dépendances.

## [1.0.0] — 2026-08-13

Première publication publique. Mfolio est un portfolio & CV clé en main, conçu à l'origine sur Freebuff Web (ex-vly.ai) et entièrement portable.

### Ajouté

- **Thème Studio** — galerie épurée (blancs cassés, cadres fins, typographie éditoriale), mode clair/sombre, couleur d'accent configurable.
- **Tableau de bord administrateur complet** :
  - Édition de toutes les sections : À propos, Parcours (expériences + formations), Compétences, Langues, Centres d'intérêt, Services, Portfolio, Journal.
  - Réorganisation des éléments (↑/↓), aperçu 👁 et édition ✏️ en popup, suppression 🗑 avec confirmation.
  - Boîte de réception **Messages** : prévisualisation en popup, marquer comme répondu, suppression.
  - Config : visibilité et ordre des sections, styles d'affichage, ordre du Parcours, SEO, scripts personnalisés, mode maintenance.
  - Paramètres : identité du site, logo & favicon, intégrations (DeepL, Google Analytics, email), sécurité du compte.
- **Traduction FR → EN** automatique via DeepL (clé optionnelle, offre gratuite), sélecteur de langue sur le site.
- **Formulaire de contact** : honeypot + limite anti-spam (3/heure/visiteur) + longueurs plafonnées ; message stocké en boîte de réception et notification email courte au propriétaire.
- **Statistiques** : visiteurs (jour/semaine/mois), visiteurs uniques, taux de retour, conversion contact, appareils, navigateurs, heures de pointe — avec **purge automatique à 90 jours** (tâche planifiée quotidienne).
- **SEO** : meta, Open Graph/Twitter cards, URLs canoniques, hreflang FR/EN, sitemap.xml, robots.txt.
- **Auth** : mot de passe + codes OTP par email, avec **interrupteurs de portabilité** (désactivables depuis Paramètres → Intégrations).
- **Portabilité** : relais email isolé dans `src/convex/emailRelay.ts` (2 points d'appel) — documenté dans [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
- **Tests** : 22 tests unitaires (niveaux 1–5, ordre des sections, statistiques).
- **Nettoyage** : suppression de ~40 fichiers morts (composants UI inutilisés, modules vly.ai obsolètes) et de 27 dépendances inutiles.

### Sécurité

- Compte admin par défaut (`admin@admin.com`) avec rappel de changement d'identifiants sur la page de connexion.
- Garde-fou : impossible de désactiver les codes OTP sans mot de passe actif (pas de verrouillage possible).
- Clés backend exclusivement côté serveur (`process.env` dans les actions `"use node"`).
