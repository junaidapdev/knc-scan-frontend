# Smoke tests

Playwright smoke tests that exercise a deployed preview URL.

## Prerequisites

- `PREVIEW_URL` — deployed Vercel preview, e.g.
  `https://kayan-preview.vercel.app`. Required; `playwright.config.ts`
  throws without it.
- `SMOKE_BRANCH_QR` — a valid branch QR payload. Without it the test
  `skip()`s gracefully.

## Install

Browsers aren't bundled with the `@playwright/test` package. Install them
once per machine:

```bash
npx playwright install chromium
```

The agent sandbox can't run that command — do it manually before the
first CI or local run.

## Run

```bash
PREVIEW_URL=https://<preview>.vercel.app \
SMOKE_BRANCH_QR=<branch-qr> \
npm run test:smoke
```

## OTP fixture — pending

The customer journey currently stops at the OTP step. To drive it all the
way through (register → scan × 10 → redeem) the backend must expose a
reserved test phone (e.g. `+966500999001`) that always issues OTP
`000000`. Once that fixture lands, extend `customer-journey.spec.ts` to
submit the OTP and continue.
