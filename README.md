# Mfolio — Studio Portfolio & CV

**A turnkey, self-hostable portfolio & CV web app with a full admin dashboard.** Everything — content, layout, SEO, statistics — is managed visually from the dashboard. No code required after setup.

**🇫🇷 Version française : [README.fr.md](README.fr.md)**

> **Origins:** Mfolio was originally built on **Freebuff Web** (formerly vly.ai), which provides the hosted environment, the Convex integration and a platform email relay. The app is fully portable: only **two optional email features** depend on the platform, and both can be switched off or re-pointed to your own provider. See [Deploying](#deploying).

---

## Features

- 🎨 **Studio theme** — gallery-clean, warm off-whites, thin framing, muted neutrals, editorial typography. Light/dark mode + configurable accent color.
- 🗂️ **Full admin dashboard** — edit every section inline (À propos, Parcours, Compétences, Langues, Centres d'intérêt, Services, Portfolio, Journal), reorder items with ↑/↓, preview and delete from popups.
- 🌍 **FR ↔ EN** — automatic translation via DeepL (optional key, free tier).
- ✉️ **Contact form → inbox + email notification** — messages are stored in the dashboard inbox; an email notification (short notice, no message body) is sent to the owner.
- 🔐 **Auth** — password login + email OTP recovery codes. Both channels are **toggleable** (portability).
- 🛡️ **Anti-spam** — honeypot + per-visitor rate limit + input length caps.
- 📊 **Statistics** — visitors (day/week/month), unique visitors, return rate, contact conversion, devices, top browsers, peak hours. Automatic 90-day purge (scheduled daily).
- 🔎 **SEO** — meta tags, Open Graph/Twitter cards, canonical URLs, hreflang FR/EN, sitemap.xml, robots.txt, custom header/footer scripts.
- 📱 **Fully responsive** — desktop sidebar dashboard, mobile navigation, mobile-first public pages.
- 🧪 **Tested** — 20+ unit tests (levels, sections order, statistics), TypeScript strict, ESLint clean.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router 7 |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide icons |
| Backend & DB | [Convex](https://convex.dev) (serverless backend + database), Convex Auth |
| Quality | Vitest, ESLint, Prettier, TypeScript strict |
| Package manager | [Bun](https://bun.sh) |

## Prerequisites

- **Bun ≥ 1.x** (recommended) or Node.js ≥ 20
- **A free [Convex](https://convex.dev) account** — the app's backend and database
- **Git**
- *Optional:* a [DeepL](https://www.deepl.com) API key (FR→EN auto-translation), a Google Analytics ID
- *Only if deploying outside Freebuff:* your own email provider (e.g. [Resend](https://resend.com)) — or disable the two email features in the dashboard (see [Email channels](#email-channels))

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

| | |
|---|---|
| Email | `admin@admin.com` |
| Password | `admin123` |

> ⚠️ **Change these immediately** from **Paramètres → Sécurité du compte** (email + password). The login page shows a hint until you do.

## Environment variables

| Variable | Where | Required |
|---|---|---|
| `VITE_CONVEX_URL` | `.env.local` (frontend) | ✅ |
| `CONVEX_DEPLOYMENT` | `.env.local` (Convex CLI) | optional |
| `CONVEX_SITE_URL` | `.env.local` (local auth redirect) | dev only |
| `SITE_URL` | Convex dashboard → Settings → Env Variables | ✅ production |
| `JWKS`, `JWT_PRIVATE_KEY` | Convex dashboard (auth keys, provisioned by Convex Auth) | ✅ |

**Not env vars:** the DeepL key and Google Analytics ID are entered in the app (**Config → Référencement**), and the notification email address in **Paramètres → Intégrations** — they are stored in the database, not in the repo.

See [.env.example](.env.example) for the full annotated template.

## Admin dashboard

| Section | What you manage |
|---|---|
| **À propos** | Name, contact info, portrait/cover images, taglines, CV link, socials, description |
| **Parcours / Portfolio / Journal** | Experiences, education, projects, posts — reorder, preview, edit in popups |
| **Compétences / Langues / Centres d'intérêt / Services** | Items with levels (1–5), icons, reorder, preview |
| **Messages** | Inbox: preview messages in a popup, mark as replied, delete |
| **Config** | Accent color, section visibility & order, display layouts, resume order, SEO, custom scripts, maintenance mode |
| **Paramètres** | Site name/tagline/footer, logo & favicon, DeepL + GA + notification email, **email channel toggles**, account security (email/password) |
| **Statistiques** | Visitors, uniques, conversion, devices, browsers, peak hours |

## Email channels

Two features send email, both through a single helper:

1. **Contact notifications** — when a visitor submits the form
2. **Sign-in codes (OTP)** — the password-recovery code emails

On Freebuff Web, both use the **platform email relay** (`src/convex/emailRelay.ts`) — no SMTP, no key to configure.

**Deploying elsewhere, two options:**

- **Simplest:** in **Paramètres → Intégrations**, switch **“Notifications de contact”** and **“Connexion par code email (OTP)”** off. Password login and the in-app inbox keep working 100%. ✅
- **Keep email:** edit `src/convex/emailRelay.ts` to call your own provider (e.g. Resend). Only **two call sites** exist: `src/convex/notify.ts` (notification) and `src/convex/auth/emailOtp.ts` (OTP codes).

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full walkthrough.

## Deploying

### On Freebuff Web
Nothing to do — this is the platform Mfolio was built for. The environment, Convex deployment, and email relay are all provisioned automatically.

### Anywhere else (Vercel, Netlify, Cloudflare Pages, …)
Mfolio is a standard Vite + Convex app:

1. Clone, `bun install`, `bunx convex dev` (creates your Convex project).
2. Set `SITE_URL`, `JWKS`, `JWT_PRIVATE_KEY` in the Convex dashboard (auth keys are provisioned by Convex Auth).
3. Set `VITE_CONVEX_URL` in your host's env, build with `bun run build` (output: `dist/`).
4. Decide your email strategy (see above). Optional: remove the Freebuff-specific bits (`vlyPlugin()` in `vite.config.ts`, the `@vly-ai/integrations` dependency, `src/lib/vly-integrations.ts`, `integrations.md`) — they are inert but no longer needed.
5. First login with `admin@admin.com` / `admin123`, change the credentials, enter your DeepL key / GA ID.

> 💡 **Keep your data:** all portfolio content lives in Convex. If you reuse the same Convex deployment, your content and settings follow automatically.

## Project structure

```
src/
├── components/
│   ├── admin/        # Dashboard editors (sections, lists, popups, fields)
│   ├── site/         # Public site sections (Hero, Resume, Skills, Contact…)
│   └── ui/           # shadcn/ui primitives
├── convex/
│   ├── auth/         # emailOtp provider (platform relay)
│   ├── _generated/   # Auto-generated (do not edit)
│   ├── schema.ts     # Database schema
│   ├── site.ts       # Public queries (getSiteData, getStats…)
│   ├── siteMutations.ts # Content CRUD + addMessage (contact form)
│   ├── notify.ts     # Contact notification action
│   ├── emailRelay.ts # ⚙️ Platform email relay — the file to replace off-Freebuff
│   ├── seed.ts       # Sample content (seeded once)
│   └── scheduler.ts  # Daily purge of old visitors
├── lib/              # i18n, sections order, levels, stats helpers (+ tests)
└── pages/            # Landing, Auth, Dashboard, NotFound
```

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Typecheck + production build (`tsc -b && vite build`) |
| `bun run preview` | Preview the production build |
| `bun test` | Run unit tests (Vitest) |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |
| `bunx convex dev --once` | Push Convex functions + regenerate types |

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Found a vulnerability or want to report one? See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Ludovic LOU
