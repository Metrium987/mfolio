# Mfolio — Studio Portfolio & CV

**A turnkey, self-hostable portfolio & CV web app with a full admin dashboard.** Everything — content, layout, SEO, statistics — is managed visually from the dashboard. No code required after setup.

**🇫🇷 Version française : [README.fr.md](README.fr.md)**

[![CI](https://github.com/Metrium987/mfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Metrium987/mfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🚀 **Deployment target:** [Vercel](https://vercel.com) for the frontend + [Convex](https://convex.dev) for the backend — a one-click path via the [Convex Vercel integration](https://vercel.com/marketplace/convex). See [Deploying](#deploying).

---

## Features

- 🎨 **Studio theme** — gallery-clean, warm off-whites, thin framing, muted neutrals, editorial typography. Owner-chosen ambiance (clair / sombre / auto) + **10 complete theme presets** (coordinated paper, ink, surfaces & accent — light and dark) + custom accent color.
- 🗂️ **Full admin dashboard** — edit every section inline (À propos, Parcours, Compétences, Langues, Centres d'intérêt, Services, Portfolio, Journal), reorder items with ↑/↓, preview and delete from popups.
- 🌍 **FR ↔ EN** — automatic translation via DeepL (optional key, free tier).
- ✉️ **Contact form → inbox + email notification** — messages are stored in the dashboard inbox; an email notification (short notice, no message body) is sent to the owner.
- 🔐 **Auth** — password login, owner-only (role-gated): every sensitive function (content, messages, stats, storage, credentials) requires the admin role. No public account creation.
- 🛡️ **Anti-spam** — honeypot + per-visitor rate limit + input length caps.
- 📊 **Statistics** — visitors (day/week/month), unique visitors, return rate, contact conversion, devices, top browsers, peak hours. Automatic 90-day purge (scheduled daily).
- 🔎 **SEO** — meta tags, Open Graph/Twitter cards, canonical URLs, hreflang FR/EN, sitemap.xml, robots.txt, custom header/footer scripts.
- 🎓 **Setup wizard** — interactive 5-step onboarding guide (Identity → Resume → Skills → Appearance → Publish) shown on first login. Relaunchable from Account Security.
- ❓ **Contextual help** — `?` button in the dashboard header showing section-specific tips (buttons, variables, pitfalls). 16 sections covered.
- 📱 **Fully responsive** — desktop sidebar dashboard, mobile navigation, mobile-first public pages.
- 🧪 **Tested** — 22 unit tests (levels, sections order, statistics), TypeScript strict, ESLint clean.

## Tech stack

| Layer           | Technology                                                                |
| --------------- | ------------------------------------------------------------------------- |
| Frontend        | React 19, TypeScript, Vite, React Router 7                                |
| Styling         | Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide icons                   |
| Backend & DB    | [Convex](https://convex.dev) (serverless backend + database), Convex Auth |
| Quality         | Vitest, ESLint, Prettier, TypeScript strict                               |
| Package manager | [Bun](https://bun.sh)                                                     |

## Prerequisites

- **Bun ≥ 1.x** (recommended) or Node.js ≥ 20
- **A free [Convex](https://convex.dev) account** — the app's backend and database
- **Git**
- _Optional:_ a [DeepL](https://www.deepl.com) API key (FR→EN auto-translation), a Google Analytics ID
- _For email notifications:_ a Gmail address + an [app password](https://myaccount.google.com/apppasswords) — or turn notifications off and use the dashboard inbox only (see [Email channels](#email-channels))

## Quick start

```bash
# 1. Install dependencies
bun install

# 2. Create your Convex project (deploy + generate types)
bunx convex dev

# 3. Copy the env template and fill VITE_CONVEX_URL
cp .env.example .env.local

# 4. Start the frontend (keep `bunx convex dev` running in another terminal)
bun run dev
```

Open **http://localhost:5173** — sample content is seeded automatically on first load.

**First login:** sign in at `/auth` with the default admin account created on first visit:

|          |                   |
| -------- | ----------------- |
| Email    | `admin@admin.com` |
| Password | `admin123`        |

> ⚠️ **Change these immediately** from **Sécurité du compte** in the dashboard menu (email + password). The login page shows a hint until you do.
>
> **Lost password (self-host):** there is no email recovery anymore (OTP removed). Procedure: Convex dashboard → `authAccounts` table → delete the password account row → reload `/auth` — `ensureAdmin` recreates the default account (see `docs/DEPLOYMENT.md`).

## Environment variables

| Variable                  | Where                                                                       | Required     |
| ------------------------- | --------------------------------------------------------------------------- | ------------ |
| `VITE_CONVEX_URL`         | `.env.local` (frontend); auto-injected on Vercel by `convex deploy`         | ✅           |
| `CONVEX_DEPLOYMENT`       | `.env.local` (Convex CLI)                                                   | optional     |
| `CONVEX_SITE_URL`         | `.env.local` locally; `convex env set` in production (auth redirect origin) | ✅           |
| `CONVEX_DEPLOY_KEY`       | Vercel → Environment Variables (Production)                                 | ✅ on Vercel |
| `JWKS`, `JWT_PRIVATE_KEY` | Convex deployment (auth keys, provisioned by Convex Auth)                   | ✅           |

**Not env vars:** the DeepL key and Google Analytics ID are entered in the app under **Intégrations**, and the SEO tags under **Paramètres → Référencement (SEO)** — they are stored in the database, not in the repo.

See [.env.example](.env.example) for the full annotated template.

## Admin dashboard

| Section                                                  | What you manage                                                                                                                                                                                                                                           |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **À propos**                                             | Name, contact info, portrait/cover images, taglines, CV link, socials, description                                                                                                                                                                        |
| **Parcours / Portfolio / Journal**                       | Experiences, education, projects, posts — reorder, preview, edit in popups                                                                                                                                                                                |
| **Compétences / Langues / Centres d'intérêt / Services** | Items with levels (1–5), icons, reorder, preview                                                                                                                                                                                                          |
| **Messages**                                             | Inbox: preview messages in a popup, reply from your mail client (pre-filled), mark as replied, delete, CSV export                                                                                                                                         |
| **Config**                                               | Section visibility & order, display layouts (list/cards for Services, Interests, Languages, Skills, Projects, Blog), resume order                                                                                                                         |
| **Paramètres**                                           | Site name/tagline/footer, logo & favicon, SEO tags, custom scripts, full JSON backup/export                                                                                                                                                               |
| **Intégrations**                                         | DeepL + Google Analytics keys, notification email, **SMTP Gmail** (app password, values pre-filled, test email), **email channel toggles**                                                                                                                |
| **Apparence**                                            | Design (Éditorial / Moderne / Minimal), theme (10 complete light/dark presets), default ambiance (clair/sombre/auto), custom accent color                                                                                                                 |
| **Sécurité du compte**                                   | Maintenance mode, owner login email and password, **factory reset** (one click wipes all content/settings/inbox/stats — the admin account is kept, confirmation by typing `RESTAURER`), **reload demo** (re-populates the site with the sample portfolio) |
| **Statistiques**                                         | Visitors, uniques, conversion, devices, browsers, peak hours                                                                                                                                                                                              |

## Email channels

One feature sends email, through a single helper:

1. **Contact notifications** — when a visitor submits the form (the message itself always stays in the dashboard inbox)

The email-code (OTP) login was **removed entirely** — the only sign-in channel is the owner's password, so no visitor can ever create an account.

The notification is sent via **SMTP** (nodemailer, `src/convex/notify.ts`) — a real sender, good deliverability, no platform dependency. Works identically locally, on Vercel or on any other host.

**Setup:** in **Intégrations**, enable **“Envoyer via SMTP (Gmail)”** and add your Gmail address + an [app password](https://myaccount.google.com/apppasswords). Gmail values are pre-filled (smtp.gmail.com, 465/SSL); a **test email** button validates the setup.

If SMTP is not configured (or the notification toggle is off), no email is sent — the message still lands in the dashboard inbox. To use another provider (Resend, SendGrid…), edit `src/convex/notify.ts` — only **one call site** exists.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full walkthrough.

## Deploying

### Vercel (recommended)

The repo ships a [`vercel.json`](vercel.json) that wires everything: the build command pushes the Convex functions then builds the SPA, and a rewrite rule serves `index.html` on deep links (`/auth`, `/dashboard`).

1. Push this repo to GitHub, then create a Vercel project from it.
2. Provision the Convex backend:
   - **Easiest:** install [Convex from the Vercel Marketplace](https://vercel.com/marketplace/convex) — it creates the deployment and wires the environment for you.
   - **Or manually:** create the deployment on [dashboard.convex.dev](https://dashboard.convex.dev), generate a **Production Deploy Key** (Deployment Settings → General), and add it in Vercel as `CONVEX_DEPLOY_KEY` (Production environment only).
3. Point auth at your final URL on the Convex deployment: `bunx convex env set CONVEX_SITE_URL https://your-domain.vercel.app` (use your final custom domain if you have one — changing it later means updating this variable).
4. Deploy. The first page load seeds sample content.
5. Sign in at `/auth` with `admin@admin.com` / `admin123` — **change these immediately**, then set up email (see above) and your DeepL key / GA ID.

Every push to the repository redeploys both the Convex functions and the frontend automatically.

> 💡 Vercel preview deployments can get their own fresh Convex deployment via a **Preview Deploy Key** (`CONVEX_DEPLOY_KEY`, Preview environment) — see [Convex preview deployments](https://docs.convex.dev/production/hosting/preview-deployments).

### Anywhere else (Netlify, Cloudflare Pages, a static host…)

Mfolio is a standard Vite + Convex app: build with `bun run build` (output: `dist/`), serve the files with an SPA fallback rewrite (all paths → `/index.html`), and push the Convex functions with `bunx convex deploy` (which injects `VITE_CONVEX_URL` at build time). Email needs no special host support.

## Project structure

```
src/
├── components/
│   ├── admin/        # Dashboard editors (sections, lists, popups, fields)
│   ├── site/         # Public site sections (Hero, Resume, Skills, Contact…)
│   └── ui/           # shadcn/ui primitives
├── convex/
│   ├── _generated/   # Auto-generated (do not edit)
│   ├── schema.ts     # Database schema
│   ├── site.ts       # Public queries (getSiteData, getStats…)
│   ├── siteMutations.ts # Content CRUD + addMessage (contact form)
│   ├── notify.ts     # Contact notification action (SMTP via nodemailer)
│   ├── seed.ts       # Sample content (seeded once)
│   └── scheduler.ts  # Daily purge of old visitors
├── lib/              # i18n, sections order, levels, stats helpers (+ tests)
└── pages/            # Landing, Auth, Dashboard, NotFound
```

## Scripts

| Command                  | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `bun run dev`            | Start the Vite dev server                             |
| `bun run build`          | Typecheck + production build (`tsc -b && vite build`) |
| `bun run preview`        | Preview the production build                          |
| `bun test`               | Run unit tests (Vitest)                               |
| `bun run lint`           | ESLint                                                |
| `bun run format`         | Prettier                                              |
| `bunx convex dev --once` | Push Convex functions + regenerate types              |

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Found a vulnerability or want to report one? See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Ludovic LOU
