# Kayan Sweets Frontend — Project Log

Every Claude Code session appends an entry here. Read the most recent entry before
starting any task.

## Entry Template

### [YYYY-MM-DD] Chunk N: <Chunk Name>
- **Built:** <what was delivered>
- **Files changed:** <list>
- **Decisions:** <any non-obvious choices made>
- **Open questions for human:** <anything needing input>
- **Next:** <what the next chunk should tackle>

---

### [2026-04-18] Chunk 0: Frontend foundation scaffold
- **Built:**
  - Vite + React 18 + TypeScript (strict) project with `@/*` → `src/*` alias
    via Vite `resolve.alias` + tsconfig `paths`.
  - `src/config/env.ts` — zod-validated Vite env loader. ONLY place
    `import.meta.env` is read. Throws on startup if required vars are missing.
  - Constants: `errors.ts` (codes + bilingual en/ar messages), `routes.ts`
    (grouped customer/admin path constants), `ui.ts` (OTP_LENGTH, toast
    duration, storage keys, supported languages), `api.ts` (endpoint paths,
    including path-builder helpers), plus a barrel.
  - `src/lib/logger.ts` — dev-only console wrapper, prod-side no-op with a
    Sentry hook comment. ESLint override permits `console.*` only in this file.
  - `src/lib/api.ts` — axios instance with base URL from env, auth-token
    request interceptor (localStorage), and a response interceptor that
    **unwraps** the backend's `{ success, data }` envelope or throws
    `ApiCallError` with bilingual message on `{ success: false }` / network
    failures. Exposes a thin `http.{get,post,put,patch,delete}<T>` helper so
    callers receive the unwrapped `T` directly.
  - `src/lib/i18n.ts` — `i18next` + `react-i18next` + `LanguageDetector`.
    Loads `en/common.json` + `ar/common.json`. On language change, flips
    `<html dir>` between `rtl` and `ltr` and updates `<html lang>`.
  - Tailwind configured with `tailwindcss-rtl` plugin. Brand red palette
    (`brand.*`) and a font stack including Noto Sans Arabic.
  - PWA via `vite-plugin-pwa` — `autoUpdate`, manifest with red theme color,
    workbox precaches built assets. Matching `public/manifest.json` referenced
    by `index.html`.
  - Minimal `App.tsx` with three routes (`/` redirects to `/scan`, `/scan`,
    `/admin`) plus a 404. Each page uses `useTranslation` — no hardcoded copy.
  - `tsconfig.json` (strict, `noImplicitAny`, `noUnusedLocals/Parameters`,
    React-JSX), `tsconfig.node.json` for Vite config.
  - `.eslintrc.cjs` with `no-console:'error'`, `no-explicit-any:'error'`,
    React hooks + React Refresh rules. Override allows console in
    `src/lib/logger.ts`.
  - `.gitignore` (mirrors backend — excludes `node_modules`, `dist`, `.env*`,
    `.cursor/`, `*Fix.md`, `*Notes.md`, `SCRATCH.md`, OS files).
  - `.env.example` with every supported VITE_* var.
  - `CLAUDE.md` (verbatim standards), `README.md` (setup + scripts + layout),
    `PROJECT_LOG.md` (this file).
- **Files changed:**
  - `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`,
    `tailwind.config.ts`, `postcss.config.cjs`, `.eslintrc.cjs`, `.gitignore`,
    `.env.example`, `index.html`
  - `public/manifest.json`
  - `src/config/env.ts`
  - `src/constants/{errors,routes,ui,api,index}.ts`
  - `src/lib/{logger,api,i18n,index}.ts`
  - `src/locales/{en,ar}/common.json`
  - `src/pages/{ScanPage,AdminPage,NotFoundPage}.tsx`
  - `src/{App,main}.tsx`, `src/index.css`, `src/vite-env.d.ts`
  - `src/{interfaces,components}/index.ts` (placeholder barrels)
  - `CLAUDE.md`, `README.md`, `PROJECT_LOG.md`
- **Decisions:**
  - Chose `tailwindcss-rtl` plugin (per user confirmation) instead of pure
    logical properties. Gives access to `rtl:` / `ltr:` variants AND
    start/end utilities.
  - Default language is Arabic (`DEFAULT_LANGUAGE = 'ar'`) with RTL initially
    on `<html>`, since Kayan Sweets' primary audience is Saudi. Browser
    detection can still flip to English.
  - Axios interceptor throws `ApiCallError` (not a generic `Error`) so the UI
    can `instanceof`-check and display the right bilingual message from
    `error.bilingualMessage[lang]`. The `http` helper returns unwrapped `T`
    so components never see `AxiosResponse`.
  - PWA registration strategy: `autoUpdate`. Newer builds replace the SW
    automatically — fine for now; switch to `prompt` later if in-app UX is
    desired.
  - Path-builder helpers in `constants/api.ts` (e.g. `REWARDS.REDEEM(id)`)
    keep every URL template in one file, preserving the "no magic strings"
    rule without inventing a router-string DSL.
  - Icons at `/icons/icon-192.png` etc. are referenced but not yet generated.
    The PWA will 404 those until real artwork is added — this is expected for
    Chunk 0.
- **Open questions for human:**
  - Brand palette: `brand.*` uses placeholder reds derived from
    `#B11116`. Do we have the exact Kayan brand hex values / Pantone refs?
  - PWA icons: need final artwork at 192×192, 512×512, and a 512×512 maskable
    variant. Who provides these?
  - Sentry + PostHog: env vars are reserved but the logger / init code is
    stubbed. Should we wire Sentry next, or wait until the first real feature
    chunk?
  - Auth model on the client: the axios interceptor currently pulls a bearer
    token from localStorage under `kayan.auth.token`. Is that the chosen
    pattern, or will we use Supabase Auth sessions (cookies) via the
    `@supabase/supabase-js` client directly?
- **Next (Chunk 1 suggestion):**
  - Build the first end-to-end feature path: `POST /auth/otp/request` + OTP
    verification on `/scan`. Stand up an `AuthContext` + `RequireAuth` route
    guard, wire the Supabase client (if that's the direction), and add the
    first interface files under `src/interfaces/auth/`.

---

### [2026-04-19] Chunk 5a: Customer PWA — Entry + Registration

- **Built:**
  - **Design system pivot to Precision/Energy/Clarity palette** (black
    `#0D0D0D`, yellow `#FFD700`, canvas `#F7F7F5`). Retired the prior
    placeholder red. Typography stack: Bebas Neue (display), DM Sans
    (UI/body), Space Mono (numerics), Noto Sans Arabic (fallback). Google
    Fonts preconnect + `display=swap` in `index.html`. PWA theme_color
    updated to obsidian black.
  - **Tailwind v3 config rewrite** — added `yellow.{DEFAULT,hover,tint}`,
    `obsidian.{DEFAULT,surface,border}`, `canvas.{DEFAULT,bg}`, semantic
    `success/danger/warning/info`, `font-{display,sans,mono}`,
    `text-eyebrow`, `shadow-focus-yellow`, custom `borderRadius` +
    `borderWidth.hairline`. Kept `tailwindcss-rtl` plugin (with a
    `@ts-ignore` for the untyped module).
  - **Screens (all four):** `/scan?b=<qr>` (ScanLandingPage),
    `/phone` (PhonePage), `/register/otp` (RegisterOtpPage),
    `/register/details` (RegisterDetailsPage). Every screen uses the new
    `ScreenShell` layout (eyebrow + Bebas Neue display title + DM Sans
    body + language toggle + LTR/RTL-safe layout).
  - **Foundation upgrades:**
    - `CustomerAuthContext` managing three token lifetimes: in-memory
      `scanToken` (5-min JWT from /visits/scan/lookup), in-memory
      `registrationToken` (15-min JWT from /auth/otp/verify), persisted
      `session` (90-day JWT in localStorage under `kayan.auth.token`).
      Listens to a `kayan:auth:unauthorized` window event dispatched by
      the axios interceptor on 401 and clears session automatically.
    - `src/lib/api.ts` reworked: `http.get/post/put/patch/delete` now
      accept an `HttpOptions.token` that overrides the default
      Authorization header, so short-lived tokens don't have to touch
      localStorage. Response interceptor dispatches the 401 custom
      event. Added `pickErrorMessage(err, lang)` helper.
    - Service layer under `src/lib/services/` — thin typed wrappers
      around `http.*` for every backend call 5a needs
      (`listBranches`, `findBranchByQrIdentifier`, `requestOtp`,
      `verifyOtp`, `scanLookup`, `registerCustomer`).
    - `src/lib/analytics.ts` — no-op `track(event, props)` with a
      semantic `ANALYTICS_EVENTS` constant. Wired at scan-start and
      registration-completed (PostHog lands in Chunk 8).
    - `src/lib/pwaInstallPrompt.ts` — stamp-count + dismissed tracking,
      ready for the Chunk 5b UI.
    - `useBranches` hook + `useApiErrorToast` hook.
  - **Components:**
    - `components/common/` — `BrandedButton` (primary yellow / secondary
      outline / ghost tint / danger), `LanguageToggle` (obsidian pill,
      yellow active), `ScreenShell`, `LoadingSkeleton`, `ErrorFallback`,
      `RouteGuard` (session / scan-token / registration-token).
    - `components/customer/` — `PhoneInput` (+966 locked prefix, 9-digit
      monospace tail), `OtpInput` (single mono input, paste-strip, auto-
      fires onComplete at length 4), `BranchSelect`, `BirthdayPicker`
      (month + day, i18n months), `ConsentCheckbox` (required, yellow
      accent), `TextInput`, `LanguageRadioGroup`.
  - **Interfaces (one per file, per CLAUDE.md §4):**
    - `branch/{Branch,BranchListResponse}`
    - `customer/{Customer,RegisterPayload,RegisterResponse,CustomerProfileResponse,CustomerSession}`
    - `auth/{OtpRequestPayload,OtpRequestResponse,OtpVerifyPayload,OtpVerifyResponse}`
    - `visit/{ScanLookupPayload,ScanLookupProfile,ScanLookupResult}`
  - **Zod validation:** `phoneSchema` (9-digit tail starting with 5, matches
    backend `SAUDI_PHONE_REGEX`), `otpSchema` (4-digit numeric),
    `registerSchema` (mirrors backend `registerSchema` minus phone +
    branch_scan_id which come from context).
  - **Routing:** `App.tsx` fully wired — four 5a screens live, 5b screens
    reserved with placeholder components so deep links don't 404. Route
    guards: `/register/details` requires registration token;
    `/scan/amount` requires scan token; `/stamp-success`, `/rewards`,
    `/rewards/*`, `/profile` require session.
  - **i18next:** two namespaces (`common`, `customer`), full AR + EN.
    Reorganized `common` into `actions.*` / `status.*` / `language.*`.
    `customer.json` covers scan, phone, registerOtp, registerDetails,
    errors, and 1–12 month names in both languages.
  - **Toasts:** `sonner` mounted in `main.tsx` with DM Sans font family.
    `useApiErrorToast` shows bilingual API error messages based on
    current i18n language.
  - **Tests (Vitest + Testing Library):** 9 tests across 3 files:
    - `OtpInput.test.tsx` — label, typing, paste-strip, maxLength
    - `PhoneInput.test.tsx` — label + prefix, maxLength, error aria
    - `BranchSelect.test.tsx` — options render, onChange emission
    - Harness: `src/test/setup.ts` (jest-dom matchers + matchMedia
      polyfill) + `src/test/i18nTestHarness.tsx` (isolated i18n instance
      without LanguageDetector).
  - **Scripts:** added `npm test` (vitest run) and `npm run test:watch`.
- **Files changed:**
  - `tailwind.config.ts`, `index.html`, `vite.config.ts`,
    `src/index.css`, `package.json`, `src/main.tsx`, `src/App.tsx`
  - `src/config/env.ts` unchanged
  - `src/constants/{routes,api,ui}.ts`
  - `src/locales/{en,ar}/common.json`,
    `src/locales/{en,ar}/customer.json`, `src/lib/i18n.ts`
  - `src/lib/api.ts`, `src/lib/analytics.ts`,
    `src/lib/pwaInstallPrompt.ts`,
    `src/lib/services/{branchService,authService,visitService,customerService,index}.ts`,
    `src/lib/validation/{phoneSchema,otpSchema,registerSchema}.ts`
  - `src/hooks/{useBranches,useApiErrorToast}.ts`
  - `src/contexts/CustomerAuthContext.tsx`
  - `src/interfaces/{branch,customer,auth,visit}/*.ts`,
    `src/interfaces/index.ts`
  - `src/components/common/{BrandedButton,LanguageToggle,LoadingSkeleton,ErrorFallback,ScreenShell,RouteGuard,index}.{ts,tsx}`
  - `src/components/customer/{PhoneInput,OtpInput,BranchSelect,BirthdayPicker,ConsentCheckbox,TextInput,LanguageRadioGroup,index}.{ts,tsx}`
  - `src/components/customer/__tests__/{OtpInput,PhoneInput,BranchSelect}.test.tsx`
  - `src/pages/customer/{ScanLandingPage,PhonePage,RegisterOtpPage,RegisterDetailsPage,PlaceholderPage,index}.{ts,tsx}`
  - `src/pages/{AdminPage,NotFoundPage}.tsx` (updated to new i18n keys +
    design system); `src/pages/ScanPage.tsx` removed (superseded).
  - `src/test/{setup.ts,i18nTestHarness.tsx}`
- **Decisions:**
  - **No PostHog / Sentry wiring in 5a** — `analytics.track` is a logged
    no-op; real integration moves to Chunk 8 per spec note (i).
  - **Phone form captures only the 9-digit tail.** The backend expects
    full E.164 `+9665XXXXXXXX`; we prepend `SAUDI_PHONE_PREFIX` at
    submit. Keeps the UI faithful to the "prefix visually locked" spec.
  - **Branch lookup is client-side filtering.** Backend `/branches` has
    no `?qr=` query today; filtering across 11 branches is negligible.
    If the list grows, add a backend query in Chunk 7.
  - **Short-lived JWTs never persist.** Scan and registration tokens
    live only in React state so they can't survive a reload.
  - **401 broadcast.** The axios interceptor dispatches a
    `kayan:auth:unauthorized` CustomEvent; `CustomerAuthProvider`
    listens and clears state. Decoupling keeps the interceptor free of
    React imports.
  - **`sonner` over `react-hot-toast`.** Smaller, RTL-safe, honors
    `html[dir]` out of the box.
  - **Bebas Neue for display titles, uppercased** — matches the brand
    rule ("32–48px, letter-spacing 3px"). AR titles inherit Noto Sans
    Arabic via the sans stack because Bebas Neue has no AR glyphs.
  - **Registration form's default language** follows the current
    i18next language, so an Arabic-detected visitor defaults to
    `language:'ar'`. They can still flip via `LanguageRadioGroup`.
  - **5b routes reserved with placeholders** so deep links don't 404
    mid-development. Each placeholder uses `RouteGuard` with the
    correct requirement to exercise the guard logic today.
- **Open questions for human:**
  - **Chunk 4 backend migration still un-applied** to live Supabase.
    5b will need those RPCs before manual end-to-end testing. Plan:
    `psql` CLI against the Supabase connection string (per our last
    chat). Do you want me to walk you through that before starting 5b,
    or defer until the 5b screens themselves need the RPC?
  - **PWA icons still missing** at `/icons/icon-192.png` etc. (noted
    since Chunk 0). Unchanged in 5a; the manifest still references
    them. Needs final artwork.
  - **Backend `/branches` has no `?qr=` query** — happy to add it in
    Chunk 7 if you'd rather not ship client-side filtering.
  - **ESLint warning** (1, not an error) in
    `CustomerAuthContext.tsx`: react-refresh complains about the
    provider + hook export coexisting. Harmless in prod; can split the
    `useCustomerAuth` hook into its own file if we care about HMR
    purity.
- **Next (Chunk 5b):**
  - Build screens 5–12: `/scan/amount` (SAR entry + POST /visits/scan),
    `/stamp-success` (confetti + stamp card visual + Google Review CTA
    + install prompt UI), `/lockout`, `/rewards` (list),
    `/rewards/:code/claim` (cashier-targeted with live pulsing border
    + timestamp), `/rewards/:code/confirm`, `/rewards/:code/done`
    auto-dismiss, `/profile` (masked phone, language toggle, request
    deletion mailto).
  - Add StampCard component (10 circles) + RewardCard state variants +
    confetti lib (canvas-confetti) + full reward interfaces mirroring
    backend + footer nav.
  - Extend tests: StampCard render variants, RewardCard status pills,
    reward claim flow smoke test.
  - Verify end-to-end against a live backend with Chunk 4 migration
    applied.

---

## Chunk 5b — Customer PWA Core Screens (2026-04-19)

Completes the customer loyalty loop end-to-end: bill-amount entry,
stamp-success celebration, 24h lockout, rewards list, and the two-step
reward redemption flow. All placeholders from 5a replaced with real
screens; eight live customer routes.

### New screens (replacing placeholders in `App.tsx`)

1. **`/scan/amount` — `ScanAmountPage.tsx`** — scan-token guarded.
   Numeric bill input with locked `SAR` suffix + three quick-pick
   chips (50/100/200). Calls `POST /visits/scan` via `recordVisit()`.
   On `SCAN_LOCKOUT_ACTIVE` (422) unwraps `LockoutResult` from the
   error details and navigates to `/lockout` with `next_eligible_at`.
   On success clears the scan token and forwards the full `ScanResult`
   to `/stamp-success` via navigation state.
2. **`/stamp-success` — `StampSuccessPage.tsx`** — public. Renders
   from either a `scanResult` (existing customer) or a `firstStamp`
   payload (fresh registration — `RegisterDetailsPage` now forwards
   `res.stamp.current` + customer name). Auto-redirects to `/rewards`
   after 5s **only** when a long-lived session exists. Highlights the
   freshly-earned stamp on the 10-cell grid.
3. **`/lockout` — `LockoutPage.tsx`** — public. Formats the
   `next_eligible_at` ISO with `Intl.DateTimeFormat` in the current
   locale; "back to start" CTA routes to `/scan`.
4. **`/rewards` — `RewardsPage.tsx`** — session guarded. Loads
   `GET /customers/me/rewards` + `GET /customers/me` in parallel via
   two hooks. Sections: Progress (StampProgressBar w/ current
   stamps), Available (pending rewards, tappable), History (redeemed
   + expired). Localized status pills.
5. **`/rewards/:code/claim` — `RewardClaimPage.tsx`** — session
   guarded. Resolves the reward from route state (passed from the
   list) or refetches the full list. Shows reward name + expiry +
   `BranchSelect` so the customer declares which branch they're at.
   `POST /rewards/:code/confirm-redeem-step-1` with
   `{ branch_qr_identifier }`; forwards `RedemptionConfirmation` to
   the confirm screen.
6. **`/rewards/:code/confirm` — `RewardConfirmPage.tsx`** — session
   guarded. Displays the yellow "hand to staff" card with the unique
   code + expiry `CountdownPill`. The step-1 `redemption_token` rides
   in route state only (never persisted). Staff taps confirm →
   `POST step-2` with the token in the `x-redemption-token` header.
   Cancel routes back to `/rewards`.
7. **`/rewards/:code/done` — `RewardDonePage.tsx`** — session
   guarded. Celebratory copy + reward name echo + CTA back to
   `/rewards`.

### Foundation additions

- **`src/constants/errors.ts`** — added 8 new error codes and
  bilingual fallback messages: `SCAN_LOCKOUT_ACTIVE`,
  `BRANCH_NOT_FOUND`, `BRANCH_INACTIVE`, `CUSTOMER_NOT_FOUND`,
  `REWARD_NOT_FOUND`, `REWARD_NOT_OWNED`, `REWARD_NOT_PENDING`,
  `REWARD_EXPIRED`, `INVALID_REDEMPTION_TOKEN`.
- **Interfaces (7 new)** — per-file per CLAUDE.md §4:
  - `visit/ScanPayload.ts`, `ScanResult.ts`, `ScanIssuedReward.ts`,
    `LockoutResult.ts`.
  - `reward/IssuedReward.ts`, `RedemptionConfirmation.ts`,
    `RedemptionStep1Payload.ts`, `RedemptionStep2Payload.ts`, plus
    `reward/index.ts` barrel.
  - `src/interfaces/index.ts` now re-exports `./reward`.
- **Services**
  - `visitService.ts` — added `recordVisit(payload, scanToken)` which
    forwards the 5-min JWT via `HttpOptions.token`.
  - `customerService.ts` — added `getMyProfile()`.
  - New `rewardService.ts` — `listMyRewards`, `claimRewardStep1`,
    `claimRewardStep2`. Step 2 drops to raw `api.post` to set the
    `x-redemption-token` header (still honors the ApiResponse
    envelope via the response interceptor).
- **Validation** — `scanAmountSchema.ts` with min/max wired from
  `SCAN_MIN_BILL_AMOUNT_SAR` / `SCAN_MAX_BILL_AMOUNT_SAR`.
- **Hooks** — `useMyRewards` + `useMyProfile`; mirror the existing
  `useBranches` discriminated-union pattern (`loading`/`ready`/`error`).

### Components

- **`AmountInput`** — bordered bill-amount input with locked currency
  suffix, monospace numerics, `inputMode="decimal"`, focus ring.
- **`StampProgressBar`** — 10-cell grid (configurable `max`),
  `role="img"` with aria-label, `highlightIndex` flashes a
  `ring-yellow` on the freshly-earned stamp.
- **`RewardCard`** — picks AR/EN snapshot based on `language` prop,
  renders a right-aligned status pill (3 states), click handler
  active only for pending rewards, disabled-button-as-card otherwise.
- **`CountdownPill`** — 1-Hz `setInterval`, monospace mm:ss output,
  optional `onExpire` callback.

### Bilingual strings

Added six new sections to `locales/{en,ar}/customer.json`:
`scanAmount`, `stampSuccess`, `lockout`, `rewards`, `rewardClaim`,
`rewardConfirm`, `rewardDone`. Arabic strings include
Eastern-Arabic-numeric title for "+١ ختم".

### Route changes (`App.tsx`)

- `/scan/amount`, `/rewards`, `/rewards/:code/claim|confirm|done` are
  real screens; `/stamp-success` and `/lockout` are **public** (state
  provided via navigation). `/profile` remains placeholder for the
  admin chunk.

### Verification

- `npm run typecheck` — clean.
- `npm run lint` — 0 errors, 1 harmless react-refresh warning on the
  pre-existing `CustomerAuthContext.tsx` (unchanged from 5a).
- `npm test` — **17 tests pass across 6 files** (adds AmountInput,
  StampProgressBar, RewardCard suites on top of the 5a tests).
- `npm run build` — succeeds; 440.58 KB JS / 15.71 KB CSS gzipped
  138.34 KB / 3.75 KB.

### Known follow-ups (not blocking 5b)

- **Existing-customer re-entry to `/rewards`** — the scan-only flow
  doesn't mint a session JWT, so existing customers have no way to
  view their rewards without re-registering. Needs a dedicated phone
  + OTP sign-in flow; deferred.
- **Install prompt / PWA icons / confetti** — tracked separately; UI
  slot on `/stamp-success` is still a simple button set. Add
  `canvas-confetti` and the install prompt in a polish pass.
- **`/profile` page** — still a placeholder; lands with the admin
  chunk or as a standalone polish pass.
- **Branch selection on `/rewards/:code/claim`** — V1 asks the
  customer to pick their current branch from a dropdown. Future
  iteration: derive from a branch QR scan or from the most recent
  scan context persisted alongside the session.

---

## Chunk 7 — Admin Dashboard Frontend (2026-04-20)

Delivered the full admin console: login, dashboard, branches, customers,
customer detail, rewards catalog and redemption log. All seven pages live
behind `/admin/*` with a dedicated auth context, route guard, and a layout
shell (sidebar + topbar).

### Built
- **Auth:** `AdminAuthContext` + `useAdminAuth` hook. Persists token/profile
  to localStorage under `kayan.admin.token` / `kayan.admin.profile`.
  Subscribes to a `kayan:admin:unauthorized` window event that
  `adminApi.ts` dispatches whenever an admin endpoint returns 401.
- **Admin API client:** `src/lib/adminApi.ts` wraps the shared `http` helper
  — always forwards the persisted admin JWT, re-throws 401s after
  dispatching the unauthorized event. Covers every admin endpoint:
  login/logout/me, KPI summary/by-branch/timeseries, customers list/detail/
  soft-delete/CSV export, catalog CRUD + status toggles, issued rewards
  list/detail/void.
- **Shared components (`src/components/admin/`):** `AdminShell`,
  `AdminSidebar`, `AdminTopbar`, `AdminPageHeader`, `AdminKpiCard`,
  `AdminDataTable` (generic `<T>` with server-side pagination + client-
  side sorting via `@tanstack/react-table`), `AdminEmptyState`,
  `AdminConfirmDialog` (Radix Dialog), `AdminStatusBadge` (separate maps
  for catalog / issued / customer statuses), `AdminRouteGuard`.
- **Pages (`src/pages/admin/`):** `AdminLoginPage`,
  `AdminDashboardPage` (5 KPI cards + Recharts line chart + branch
  leaderboard; `useInterval(60_000)` refresh paused when tab is hidden),
  `AdminBranchesPage` + `AdminBranchDrilldownDialog`,
  `AdminCustomersPage` (debounced search, filter pills, CSV export,
  row-click to detail), `AdminCustomerDetailPage` (unmasked phone,
  visits timeline, rewards timeline, typed-DELETE confirmation),
  `AdminRewardsCatalogPage` + `AdminCatalogFormDialog` (zod-validated
  create/edit, per-row pause/resume/archive confirms),
  `AdminRewardsIssuedPage` + `AdminIssuedRewardDetailDialog` +
  `AdminVoidRewardDialog` (required reason, ≥3 chars, zod enforced).
- **Constants:** new `src/constants/admin.ts` with status enums, filter
  pill taxonomy, `DASHBOARD_REFRESH_MS = 60_000`,
  `ADMIN_PAGE_SIZE_DEFAULT = 20`, `ADMIN_UNAUTHORIZED_EVENT`. Extended
  `routes.ts`, `ui.ts` (admin token / profile storage keys), `api.ts`
  (full admin endpoint set).
- **Interfaces (one per file, `src/interfaces/admin/`):** `AdminUser`,
  `AdminLoginPayload`, `AdminLoginResult`, `AdminKpiSummary`,
  `AdminKpiByBranch`, `AdminKpiTimeseriesPoint`, `AdminCustomerListItem`,
  `AdminCustomerDetail` (+ visit/reward row types), `AdminIssuedRewardRow`,
  `AdminIssuedRewardDetail`, `AdminCatalogItem`, `AdminCatalogFormPayload`.
- **Hooks:** `useInterval`, `useDebouncedValue`, `useAdminAuth`.
- **App wiring:** `main.tsx` wraps the tree in `AdminAuthProvider`
  alongside the existing `CustomerAuthProvider`. `App.tsx` adds
  `/admin/login` as an unguarded route and a layout route
  `<Route element={<AdminShell />}>` wrapping every other `/admin/*`
  path in `<AdminRouteGuard>`. Customer routes untouched. Removed the
  placeholder `src/pages/AdminPage.tsx`.
- **Tests (`src/components/admin/__tests__/`):**
  - `AdminDataTable.test.tsx` — data render, empty state, pagination.
  - `AdminKpiCard.test.tsx` — title/value, skeleton on loading, up/down
    delta arrows.
  - `AdminCatalogFormDialog.test.tsx` — zod error on empty `name_en`,
    successful submit with parsed values, submit disabled while pending.

### Deps added
```
@tanstack/react-table recharts @radix-ui/react-dialog date-fns
```
(`date-fns` brought in for date formatting consistency — not yet heavily
used; admin pages use `Intl.DateTimeFormat` via `toLocaleString`. Kept
for upcoming timeline polish.)

### Decisions / exceptions (explicitly deviating from CLAUDE.md)
- **Admin UI is English-only.** Deliberate exception to CLAUDE.md §14 —
  hardcoded English strings in every admin component/page, no i18next
  plumbing for admin. Customer PWA remains fully bilingual and was not
  touched. Language toggle in `AdminTopbar` is disabled with a tooltip
  "English only in V1".
- **Separate token storage key.** Admin JWT persists under
  `kayan.admin.token` (NOT the customer `kayan.auth.token`) so the two
  sessions don't collide.
- **CSV export bypasses the envelope interceptor.** The backend streams
  `text/csv` directly, not `{ success, data }`. `exportCustomersCsv()`
  makes a one-off `axios.get` with `responseType: 'blob'` and a manual
  Authorization header — it does NOT go through the shared `http`
  helper, because the response interceptor would reject a non-envelope
  body.
- **Skipped `/admin/settings`** — no route, no sidebar link, per the
  approved plan.
- **Dashboard auto-refresh pauses on hidden tab.** The `useInterval`
  callback checks `document.visibilityState` before firing, so nothing
  refetches while the tab is backgrounded.
- **Fixed a pre-existing strict-null error** in `PhonePage.tsx`
  (`lookup.profile.name` is `string | null`, `Customer.name` is
  `string`). Added a `?? ''` fallback to unblock `npm run build`.

### Verification
- `npm run typecheck` — clean.
- `npm run lint` — 0 errors, 3 harmless `react-refresh/only-export-components`
  warnings (pre-existing `CustomerAuthContext`, new `AdminAuthContext`
  and `AdminCatalogFormDialog`, which co-export zod schemas / context
  object with components).
- `npm test` — **27 tests across 9 files pass** (17 prior customer tests
  + 10 new admin tests).
- `npm run build` — succeeds. Production bundle:
  925.38 kB JS gzipped 280.14 kB, 22.38 kB CSS gzipped 4.87 kB. Vite
  flags a single >500 kB chunk warning (recharts + react-table weight);
  code-splitting deferred to a polish pass.

### Open questions / follow-ups (manual smoke test needed)
- **Role enforcement not wired on the client.** The JWT carries
  `role: 'admin' | 'viewer'`, but the UI currently shows every action
  to every authenticated admin. Add role-gated rendering once the role
  copy is finalized.
- **No e2e automation in this chunk.** Unit tests cover the generic
  shared components + the catalog form. Full-page flows (login →
  dashboard → CSV export, void-reward round trip, soft-delete
  customer) need a manual smoke pass against a live backend.
- **Admin Arabic pass deferred.** When/if the console needs bilingual
  support, replumb via i18next with a new `admin` namespace — customer
  locales stay isolated.
- **Customer-filter pills are client-side only.** "active" /
  "inactive" / "reward_ready" are computed from the current page of
  results. A proper backend filter would make these server-side; easy
  follow-up once the product decides the exact definitions.
- **Branch drill-down chart** only renders `scans` and `stamps_awarded`
  — room to expand if the designers want lockouts or spend layered on.

---

## Chunk 7.1 — Admin polish pass (2026-04-21)

Quick polish on the admin frontend after manual smoke test.

### What changed
- **Branch drilldown dialog**: added a `<Legend>` and a third `lockouts`
  line (red) to match the subtitle copy "Scans, stamps and lockouts".
- **Redemption Log**: added a **Voided** filter pill; when selected it
  calls the list endpoint with `voided_only=true` and no status filter.
- **Redemption Log subtitle**: now pluralizes correctly
  ("1 issued reward" vs "N issued rewards").
- **Issued reward detail dialog**: when a reward is redeemed, the
  dialog now surfaces forensic fields — `Branch` (name), `IP`, and
  `Device` (fingerprint, monospace, wrappable).
- **Sidebar / Rewards-catalog Archive action**: code audit confirmed
  both were already correct (filled yellow active state; `text-red-600`
  destructive color on Archive). No code change — the polish list item
  resolved on inspection.

### Files changed (frontend)
- `src/pages/admin/components/AdminBranchDrilldownDialog.tsx` — Legend + lockouts line
- `src/pages/admin/AdminRewardsIssuedPage.tsx` — Voided pill, pluralization, list params
- `src/lib/adminApi.ts` — `voidedOnly` param on `listIssuedRewards`
- `src/interfaces/admin/AdminIssuedRewardDetail.ts` — `redeemed_at_branch_name`
- `src/pages/admin/components/AdminIssuedRewardDetailDialog.tsx` — Branch/IP/Device rows

### Verification
- `npm run typecheck` — clean
- `npm run lint` — 0 errors (3 pre-existing warnings)
- `npm test` — 27/27 pass
- `npm run build` — succeeds

---

## Chunk 8b — Frontend polish + launch prep (2026-04-21)

### What shipped
- **(1) Sentry wiring.** `@sentry/react` installed.
  `src/lib/sentry.ts` exposes `initSentry()` + `captureException()`;
  both are no-ops (with an info log) when `VITE_SENTRY_DSN` is unset.
  `initSentry()` runs before `ReactDOM.createRoot` in `src/main.tsx`.
  `reactRouterV6BrowserTracingIntegration` is wired for route-change
  spans. Env zod schema extended with `VITE_SENTRY_DSN`,
  `VITE_SENTRY_TRACES_SAMPLE_RATE` (default 0.1), and
  `VITE_APP_RELEASE` (default `'dev'`).
- **(3) PWA polish.**
  - Brand-aligned `theme_color: #0D0D0D` and `background_color: #FFFFFF`
    in both `public/manifest.json` and the `VitePWA` config.
  - SVG placeholder icons at 192, 512, and 512-maskable with the
    Kayan-yellow square + obsidian "K" glyph. `public/icons/README.md`
    flags the swap-for-PNG step before launch.
  - Workbox `navigateFallback: '/offline.html'` with
    `navigateFallbackDenylist: [/^\/api/]`; `runtimeCaching` rule
    `NetworkFirst` (5s timeout, cache name `api`) for `/api/*`.
  - Bilingual `public/offline.html` fallback (inline CSS, no external
    fonts).
  - `useInstallPrompt()` hook captures `beforeinstallprompt`.
  - `InstallPromptBanner` dismissible banner, mounted inside
    `StampSuccessPage` (no shared customer layout today). i18n keys
    `install.prompt.{title,cta,dismiss}` in ar + en.
  - `StampSuccessPage` now calls `recordSuccessfulStamp()` on mount —
    previously the counter existed but had no caller.
- **(4) Error boundary.** `AppErrorBoundary` wraps `<App />`; a nested
  boundary wraps the admin `<AdminShell />` subtree so admin crashes
  don't unmount customer state. Fallback auto-detects customer vs admin
  via `location.pathname.startsWith('/admin')` (overridable via `scope`
  prop). `componentDidCatch` forwards to `captureException`.
- **(5) Accessibility.** Global `*:focus-visible` yellow outline in
  `src/index.css`. Skip-links (`<a href="#main" class="sr-only …">`) in
  both `ScreenShell` and `AdminShell`, with `id="main"` on the content
  container. No yellow-on-white body text exists today
  (yellow is only a fill on primary buttons with obsidian foreground
  — contrast is fine). Radix dialogs were audited in 7.1.
- **(6) Lazy admin routes.** Every `Admin*Page` is now `React.lazy`;
  only customer pages remain eager. Admin subtree is wrapped in
  `<Suspense fallback={<AdminPageSpinner />}>`. Build confirms
  separation — see chunk sizes below.
- **(7) Copy pass.** English locale files reread; no typos or lorem
  ipsum found (they were tight already). Arabic strings are NOT
  rewritten — instead a full `COPY-REVIEW-AR.md` file enumerates every
  AR key with its EN source for a native reviewer.
- **(8) Visual polish.**
  - `canvas-confetti` burst on `StampSuccessPage` mount (yellow +
    obsidian, 80 particles, 160 ticks) guarded by
    `prefers-reduced-motion`.
  - Tailwind `animate-fade-in` keyframe (150ms) applied at the root of
    `ScreenShell` — covers every customer page via the shared shell.
  - `src/lib/haptics.ts` exports `haptic(pattern)` which feature-detects
    `navigator.vibrate`. Wired into the stamp-success and reward-done
    pages (30ms tap).
  - `src/components/common/Skeleton.tsx` — reusable primitive
    (`width`/`height`/`rounded`). The existing `RewardsPage` already
    uses the `LoadingSkeleton` sibling; left as-is to avoid churn.
- **(9) Deployment config.** `vercel.json` pins `fra1`, SPA rewrite,
  immutable cache for `/assets/*`, `must-revalidate` for shell files.
- **(10) Playwright smoke.** `@playwright/test` installed. Config reads
  `PREVIEW_URL` (throws if unset). `tests/smoke/customer-journey.spec.ts`
  drives the scan → phone → OTP request path and logs a bail at the
  OTP step per the plan. `tests/smoke/README.md` documents the fixture
  dependency. `npm run test:smoke` script added. Vitest `exclude`
  extended with `tests/**` so the two runners don't collide.
- **(11) README.** Full rewrite — overview, stack, scripts, env var
  table, project tree, Vercel deployment section (with
  `VERCEL_GIT_COMMIT_SHA` tip for Sentry releases), and a known-
  limitations block.

### New files
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/src/lib/sentry.ts`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/src/lib/haptics.ts`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/src/components/common/AppErrorBoundary.tsx`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/src/components/common/Skeleton.tsx`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/src/components/customer/InstallPromptBanner.tsx`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/src/components/admin/AdminPageSpinner.tsx`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/src/hooks/useInstallPrompt.ts`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/public/icons/icon-192.svg`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/public/icons/icon-512.svg`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/public/icons/icon-512-maskable.svg`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/public/icons/README.md`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/public/offline.html`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/vercel.json`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/playwright.config.ts`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/tests/smoke/customer-journey.spec.ts`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/tests/smoke/README.md`
- `/Users/mdjunaidap/Desktop/scratchtool/kayan-frontend/COPY-REVIEW-AR.md`

### Decisions / deviations
- **SVG icons, not PNG.** Generating rasters in this sandbox is
  infeasible (no imagemagick/sharp CLI guaranteed). Spec allowed SVG
  fallback; the swap path is documented in `public/icons/README.md`
  and also called out as a known limitation in the README.
- **`theme_color: #0D0D0D`** chosen per spec (obsidian — matches the
  brand anchor) over the legacy `#B11116` that was in `manifest.json`.
- **Sentry no-op when DSN unset.** Local dev and PR previews rarely
  have a DSN configured; silently disabling avoids a noisy
  initialization and lets `logger.info` record that Sentry is off.
- **Playwright smoke defers OTP** because no backend fixture issues a
  deterministic code yet. The test `skip()`s gracefully if
  `SMOKE_BRANCH_QR` is also unset.
- **Storage keys kept from Chunk 5b.** The spec listed
  `kayan.install.dismissed` / `kayan.stamps.earned` but the codebase
  already exposes constants `INSTALL_PROMPT_DISMISSED_KEY`
  (`kayan.pwa.installDismissed`) and `INSTALL_PROMPT_STAMP_COUNT_KEY`
  (`kayan.pwa.stampCount`). Kept the existing keys (with the existing
  helpers `recordSuccessfulStamp`/`shouldShowInstallPrompt`) so old
  users' dismissal state survives.
- **Skeleton coexists with LoadingSkeleton.** `LoadingSkeleton`
  already exists in `src/components/common` with a `className`/`rounded`
  surface. Added `Skeleton` as a newer primitive with width/height
  props per spec. Both export; consumers can pick. Didn't rewrite the
  Rewards page — it already uses `LoadingSkeleton` for its skeletons.
- **Admin chunk names still contain page names.** Vite's default
  chunk-splitting for lazy imports uses the page filename — that's
  what the build output shows (see chunk sizes below). No manual
  chunks config was needed.

### Verification
- `npm run typecheck` — clean.
- `npm run lint` — 0 errors, 3 pre-existing warnings
  (`react-refresh/only-export-components` on auth contexts + catalog
  dialog, all from prior chunks).
- `npm test` — **27/27 pass**.
- `npm run build` — succeeds. Key chunk sizes (gzipped):
  - Customer entry `index-*.js` — **612.28 kB / 196.76 kB gz**
    (down from 925.38 kB monolithic in Chunk 7)
  - `AdminDataTable-*.js` — 53.47 kB / 14.50 kB gz
  - `LineChart-*.js` (recharts) — 354.90 kB / 105.70 kB gz
  - `AdminBranchesPage-*.js` — 10.36 kB / 3.68 kB gz
  - `AdminRewardsCatalogPage-*.js` — 8.89 kB / 2.74 kB gz
  - `AdminRewardsIssuedPage-*.js` — 5.91 kB / 2.29 kB gz
  - `AdminCustomerDetailPage-*.js` — 5.27 kB / 1.70 kB gz
  - `AdminDashboardPage-*.js` — 3.78 kB / 1.57 kB gz
  - `AdminCustomersPage-*.js` — 3.14 kB / 1.54 kB gz
  - `AdminLoginPage-*.js` — 2.47 kB / 1.10 kB gz
  Admin-only traffic no longer fetched by customer sessions.
- `npm run test:smoke` — **not run** (needs `PREVIEW_URL` + deployed
  preview + installed browsers).

### Open questions for the human
1. **PNG icon assets** — when can design hand over the production 192
   / 512 / 512-maskable PNGs? Currently shipping SVG placeholders.
2. **Backend OTP fixture** — can we reserve a test phone
   (e.g. `+966500999001`) that always issues OTP `000000` so the
   Playwright smoke can run the full register → scan × 10 → redeem
   path?
3. **Arabic copy review** — who owns the native-speaker pass on
   `COPY-REVIEW-AR.md`, and by when? Blocks the launch-readiness
   sign-off.

---

### [2026-05-04] Chunk 9: PhonePage CTA copy fix + already-authenticated guard

- **Built:**
  - **Neutralised the phone-page CTA copy.** The button said "Send
    verification code" / "إرسال رمز التحقق" for every user, which
    was misleading for returning customers — the lookup-first branch
    in `PhonePage.onSubmit` already routes recognised customers
    straight to `SCAN_AMOUNT` (or `LOCKOUT`) without ever sending an
    SMS, so the button was promising something that didn't happen.
    Replaced the copy with `phone.cta = "Continue"` /
    `"متابعة"` — verb-neutral, accurate for both code paths.
  - **Aligned the description copy with the new button.**
    `phone.description` previously read "We'll text a 4-digit code.
    Your number is your loyalty card." Dropped the SMS-promise
    sentence so the screen no longer asserts an SMS is on the way
    when half the time it isn't. AR mirrors the change.
  - **Added a session-redirect guard inside `PhonePage`.** A user
    who already has a long-lived `session` JWT in localStorage was
    still being shown the phone entry screen if they navigated to
    `/phone` (or were bounced there from a stale link). Now those
    users early-return `<Navigate to={ROUTES.CUSTOMER.HOME} replace />`
    so they go straight to the home page without re-typing their
    number. The check runs after `useForm` so hook order stays
    consistent across renders.
- **Files changed:**
  - `src/pages/customer/PhonePage.tsx` — added `Navigate` import +
    early-return guard after the `useForm` call.
  - `src/locales/en/customer.json` — `phone.cta`, `phone.description`.
  - `src/locales/ar/customer.json` — `phone.cta`, `phone.description`.
- **Decisions:**
  - **Inline `<Navigate>` instead of extending `RouteGuard`.** The
    existing `RouteGuard` only supports the "require credential"
    direction. Adding a "forbid when present" mode to it would have
    been over-engineering for a single call-site; the inline check
    is three lines and lives next to the form it guards.
  - **Hook-order safety.** First draft placed the early return
    before `useForm`, which would conditionally skip a hook on
    session-truthy renders (Rules of Hooks violation). Moved the
    check below all hooks so the order is identical every render.
  - **Description trimmed, not rewritten.** Kept the second
    sentence ("Your number is your loyalty card.") because it's true
    for everyone and reinforces the loyalty-card framing. Dropped
    only the SMS-promise sentence.
  - **Did not touch `phone.eyebrow` ("Verify" / "التحقق").** It's
    one word, mildly misleading for returning users, but rewriting
    it bleeds into a broader copy pass that this chunk doesn't cover.
  - **Did not touch `registerOtp.cta`.** The OTP screen's "Verify"
    button is correct in context; only the phone-page CTA was wrong.
- **Verification:**
  - `npx tsc --noEmit` — clean.
  - `npx eslint src/pages/customer/PhonePage.tsx` — clean.
- **Open questions for the human:**
  - Should `phone.eyebrow` ("Verify") be softened to something
    code-path-neutral (e.g. "Loyalty" / "الولاء") in a follow-up
    copy pass?
- **Next:** consider a similar audit of any other screen whose copy
  was written assuming the OTP-every-time flow that the lookup
  endpoint now bypasses.
