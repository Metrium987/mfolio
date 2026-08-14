# Sécurité — Mfolio

## 🔐 Bonnes pratiques dès l'installation

1. **Changez les identifiants par défaut immédiatement** après la première connexion (`admin@admin.com` / `admin123`) : **Paramètres → Sécurité du compte**.
2. **Ne committez jamais** `.env.local` ni aucune clé API (tout est dans `.gitignore`).
3. Les clés côté backend (auth Convex, Resend…) se configurent dans le **dashboard Convex → Settings → Environment Variables**, jamais dans le code ni le dépôt.
4. La clé du relais email Freebuff (`src/convex/emailRelay.ts`) ne doit **jamais** être exposée côté client — tous les appels passent par des actions backend.

## Ce qui est déjà en place

- **Auth** : sessions signées (JWKS/JWT_PRIVATE_KEY), mot de passe haché par Convex Auth, **connexion par mot de passe uniquement** — les codes OTP (connexion par email) ont été supprimés, aucune création de compte public n'est possible.
- **Contrôle d'accès par rôle** : toutes les fonctions sensibles (contenu, messages, stats, intégrations, clé DeepL, identifiants, stockage d'images) exigent le rôle `admin` ; un compte non-propriétaire n'a aucun accès.
- **Anti-spam du formulaire de contact** : honeypot invisible, limite de fréquence par visiteur (3 messages/heure sur fenêtre glissante indexée), longueurs plafonnées (nom 100, sujet 200, message 5000).
- **Aucune donnée sensible dans le bundle client** : clés backend lues uniquement côté serveur (`process.env` dans les actions `"use node"`).
- **Purge automatique** : les données de visite de plus de 90 jours sont supprimées quotidiennement.

## Signaler une vulnérabilité

Si vous découvrez un problème de sécurité :

- **Ne pas ouvrir d'issue publique** avec les détails exploitables.
- Écrivez à l'adresse de contact indiquée sur le portfolio, ou ouvrez une issue GitHub privée / utilisez le mécanisme de signalement privé de GitHub (« Report a vulnerability » dans l'onglet Security du dépôt).
- Incluez : version concernée, description du problème, étapes de reproduction, impact estimé.

Nous accuserons réception sous 5 jours ouvrés et nous nous efforcerons de publier un correctif dans les meilleurs délais.

## Portée

Ce document couvre le code de Mfolio (frontend + backend Convex). Les vulnérabilités des dépendances (React, Convex, Vite…) sont à signaler auprès de leurs projets respectifs.
