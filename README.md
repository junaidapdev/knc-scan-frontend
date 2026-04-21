# Kayan Sweets Frontend

## Overview

This repository houses **both** the bilingual customer PWA and the
English admin console for Kayan Sweets loyalty & rewards. They live in
the same Vite/React/TypeScript project because they share auth wiring,
API clients, theming tokens, and the `@/constants/*` surface — splitting
into two repos would have doubled the build+deploy footprint without
buying anything in V1. Admin pages are code-split at runtime so
customer-only traffic never downloads the admin bundle.

## Stack

- React 18 · TypeScript 5 (strict) · Vite 5
- Tailwind 3 + `tailwindcss-rtl`
- `react-router-dom` v6
- `@tanstack/react-table` (admin tables) · `recharts` (admin charts)
- `@radix-ui/react-dialog`
- `react-hook-form` + `zod`
- `i18next` / `react-i18next` (customer PWA — AR + EN)
- `sonner` (toasts)
- `vite-plugin-pwa` (service worker + manifest)
- `@sentry/react` (error + perf telemetry, no-op when DSN unset)
- `vitest` + Testing Library (unit) · `@playwright/test` (smoke)

## Local setup

```bash
npm install
cp .env.example .env.local  # fill in at minimum VITE_API_BASE_URL
npm run dev
```

Then open <http://localhost:5173>.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on `:5173` |
| `npm run build` | `tsc -b` then `vite build` → `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`.ts,.tsx`) |
| `npm test` | Vitest unit suite |
| `npm run test:smoke` | Playwright smoke against a deployed preview. Requires `PREVIEW_URL`. Browsers are not bundled — run `npx playwright install chromium` once per machine. |

## Environment variables

All variables are loaded via `src/config/env.ts` (zod-validated). Never
read `import.meta.env` elsewhere.

| Variable | Required? | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | **required** | Full URL of the backend API (e.g. `https://api.kayansweets.com`). |
| `VITE_APP_NAME` | optional | Display name, default `Kayan Sweets`. |
| `VITE_SENTRY_DSN` | optional | When unset, Sentry is disabled (one info log). |
| `VITE_SENTRY_TRACES_SAMPLE_RATE` | optional | Perf sample rate, default `0.1`. |
| `VITE_APP_RELEASE` | optional | Release tag sent to Sentry; default `dev`. On Vercel set `VITE_APP_RELEASE=$VERCEL_GIT_COMMIT_SHA` so Sentry issues are grouped per deploy. |
| `VITE_POSTHOG_KEY` | optional (deferred) | Reserved for post-V1 product analytics; not yet wired. |
| `VITE_SUPABASE_URL` | optional | Reserved; customer reads go through the backend. |
| `VITE_SUPABASE_ANON_KEY` | optional | Reserved as above. |

## Project structure

```
src/
  App.tsx              # route tree (admin pages lazy-loaded)
  main.tsx             # Sentry init + root render
  components/
    admin/             # admin-only shared UI
    common/            # shared across customer + admin
    customer/          # customer-only UI primitives
  config/env.ts        # the ONLY place that reads import.meta.env
  constants/           # routes, storage keys, UI tokens, error codes
  contexts/            # auth providers
  hooks/               # data hooks (profile, rewards, branches, install prompt)
  interfaces/<module>/ # one interface per file
  lib/                 # api, i18n, logger, sentry, haptics, analytics
  locales/{ar,en}/     # i18next resources (customer PWA only)
  pages/
    admin/
    customer/
tests/smoke/           # Playwright specs (separate from vitest)
public/
  icons/               # PWA icons (SVG placeholders — see icons/README.md)
  manifest.json
  offline.html
```

## Deployment

Deploys to **Vercel**. `vercel.json` pins the Frankfurt (`fra1`) region,
sets an SPA-fallback rewrite, and long-caches hashed `/assets/*` while
keeping the shell (`/`, `/index.html`, `/sw.js`, `/manifest.webmanifest`)
revalidated on every request.

### Preview deployments

Vercel creates a preview deployment for every pull request automatically
— no extra config needed. Point `PREVIEW_URL` at the preview URL to run
`npm run test:smoke` against it.

### Env vars on Vercel

Set in Project → Settings → Environment Variables:

- `VITE_API_BASE_URL` (required, per-environment)
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_TRACES_SAMPLE_RATE` (default `0.1`)
- `VITE_APP_RELEASE=$VERCEL_GIT_COMMIT_SHA` — enables per-deploy Sentry
  release tagging.
- `VITE_APP_NAME`
- `VITE_POSTHOG_KEY` (optional, deferred)

## Known limitations

- **No WhatsApp integration in V1.** All customer comms go via OTP /
  in-app only.
- **Admin UI is English-only by design.** The Arabic plumbing isn't
  wired for admin pages. See `PROJECT_LOG.md` Chunk 7 for rationale.
- **PWA install banner on iOS Safari.** Safari does not fire
  `beforeinstallprompt`, so `useInstallPrompt` returns
  `canInstall=false`. iOS users follow the manual Share → Add to Home
  Screen path; we may add an OS-sniffing "tap share then add" helper
  panel later.
- **Sentry perf sample at `0.1`.** Tune after observing the first week
  of traffic.
- **Arabic customer copy is first-pass.** Awaiting a native-speaker
  review — see `COPY-REVIEW-AR.md`.
- **PWA icons are SVG placeholders.** Replace with production PNGs
  before public launch; see `public/icons/README.md`.
- **Playwright smoke bails at the OTP step** because no backend fixture
  returns a deterministic OTP yet. See `tests/smoke/README.md`.
