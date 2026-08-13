# Changelog

Toutes les évolutions notables de Mfolio sont documentées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet suit le [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Ajouté

- **Mode démo** (Paramètres → Intégrations) : recrée le compte générique `admin@admin.com` / `admin123` **en plus** du compte propriétaire, pour partager une version d'essai. Les identifiants démo s'affichent sur la page de connexion quand le mode est actif. Sécurisé par défaut : une fois désactivé, le compte générique n'est jamais recréé dès que des identifiants personnels existent.

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
