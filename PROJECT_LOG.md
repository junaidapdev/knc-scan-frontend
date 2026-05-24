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

---

### [2026-05-06] Chunk 10: Counter-friendly registration — single-step bill amount

- **Built:**
  - **Collapsed registration to a single post-OTP step.** Bill amount is
    now both collected AND submitted on `RegisterAmountPage`. The old
    `RegisterDetailsPage` (name + birthday + preferred branch + language
    + consent checkbox — five fields) is no longer reachable. New flow:
    `ScanLanding → Phone → OTP → Bill amount → Stamp success`.
  - **Hidden fields auto-filled at submit time** so the backend payload
    still satisfies its existing zod validators — no backend change, no
    new migration:
    - `preferred_branch_id` / `branch_scan_id` ← QR-scan branch in
      route state (the customer is literally standing at it)
    - `language` ← current `i18n.language` narrowed to `'ar' | 'en'`
    - `name` ← localised "Guest" / "زبون" placeholder (backend
      requires `min(2)` chars; null isn't an option without a backend
      change)
    - `birthday_month` / `birthday_day` ← `1` / `1` sentinel; backend
      requires non-null ints. Treat as "not collected" in analytics.
    - `consent_marketing` ← `true`, implied by tapping the CTA
  - **Implicit consent surfaced as inline fine-print** under the submit
    button: "By continuing, you agree to receive Kayan messages." /
    "بمتابعتك، فإنك توافق على استلام رسائل من كيان." Replaces the
    yellow-card consent checkbox.
  - **CTA copy promoted** from `"Continue"` / `"متابعة"` to
    `"Earn my stamp"` / `"احصل على ختمي"` — the bill-amount step is no
    longer a midway pause.
  - **`REGISTER_DETAILS` route deleted from `App.tsx`** so a direct URL
    visit can't strand a customer on the abandoned page. The
    `RegisterDetailsPage.tsx` file and its barrel export are retained
    as dead code so reverting is a one-commit affair if needed.

- **Files changed:**
  - `src/pages/customer/RegisterAmountPage.tsx` — rewrite. Adds
    `registerCustomer` submit, auto-filled defaults, consent inline
    text, and the registration-token + branchId guard (replacing the
    old "branchId-only" guard).
  - `src/App.tsx` — drops the `REGISTER_DETAILS` route and the
    `RegisterDetailsPage` import.
  - `src/locales/en/customer.json` — `registerAmount.cta` →
    "Earn my stamp"; new `registerAmount.consent`.
  - `src/locales/ar/customer.json` — `registerAmount.cta` →
    "احصل على ختمي"; new `registerAmount.consent`.

- **Decisions / deviations:**
  - **UI-only simplification, not a schema change.** The schema fields
    (`name`, `birthday_*`, `preferred_branch_id`, `language`,
    `consent_marketing`) are all still required at the backend. Making
    them genuinely nullable would require a new migration the day
    before the salary-week pilot — too risky. We default them to
    sensible placeholders frontend-side and clean up the schema
    post-pilot.
  - **`name` placeholder choice.** Considered:
    1. Phone last 4 digits (e.g. `"5556"`) — unique but weird as a
       greeting.
    2. Empty string — fails backend `min(2)`.
    3. Localised `"Guest"` / `"زبون"` — readable in greetings, clear
       in the DB that this is a synthetic value. **Picked this.**
       Post-pilot we may want to detect this sentinel in the home-page
       greeter and fall back to `"there"` / `"بك"` instead, but the
       greeting reads fine as-is for the trial.
  - **`RegisterDetailsPage.tsx` retained, not deleted.** Routing was
    the only thing wired up to it; removing the file felt like the
    riskier path. Dead-code now, deletable in a follow-up cleanup.
  - **`ROUTES.CUSTOMER.REGISTER_DETAILS` constant retained** for the
    same reason. No live caller, no harm.

- **Verification:**
  - `npx tsc --noEmit` — clean.
  - `npx eslint src/pages/customer/RegisterAmountPage.tsx src/App.tsx`
    — clean.
  - `npm test` — 27/27 pass.
  - `npm run build` — succeeds.

- **Open questions / follow-ups:**
  - Post-pilot, when we relax the backend validators to genuinely
    accept `null` for name/birthday/preferred_branch/language, the
    placeholder-default code in `RegisterAmountPage` should be removed
    in the same chunk so there's a single source of truth.
  - The `name === 'Guest' | 'زبون'` sentinel will look weird if the
    home-page greeter ever changes — worth a comment there or a
    helper function.
  - Should `RegisterDetailsPage.tsx` and its barrel export be deleted
    in a follow-up cleanup chunk once we're confident we won't
    revert?

---

### [2026-05-06] Chunk 10.1: Re-add optional name field on registration

- **Built:**
  - **Re-introduced a single optional name input** on
    `RegisterAmountPage` after Chunk 10's all-fields-hidden pass left
    the home page greeting every customer as "Hello, Guest". One
    input, clearly labelled "Your name (optional)" / "اسمك (اختياري)",
    with an example placeholder. If the customer skips it (or types
    fewer than 2 chars), we still send the localised `"Guest"` /
    `"زبون"` placeholder to the backend so the existing `name.min(2)`
    validator stays happy.
  - **New validation schema dedicated to the merged step:**
    `registerAmountSchema` lives next to the existing
    `scanAmountSchema` rather than extending it — the use cases
    diverged in Chunk 10, and a separate schema makes both intents
    explicit. Includes a small refinement so `''` and `length >= 2`
    are accepted but a single character isn't ("M" → error rather
    than persisted as a name).
  - **Bilingual copy added:** `registerAmount.nameLabel`,
    `registerAmount.namePlaceholder`, and an
    `registerAmount.errors.nameTooShort` for the 1-char rejection.

- **Files changed:**
  - `src/lib/validation/registerAmountSchema.ts` — **NEW.** Bill
    amount required + optional name with the empty-or-≥2 refinement.
  - `src/pages/customer/RegisterAmountPage.tsx` — switches to
    `registerAmountSchema` + `RegisterAmountValues`, renders a
    `TextInput` for the name above the amount block, falls back to
    `guestName` at submit time when the trimmed input is shorter than
    2 chars.
  - `src/locales/en/customer.json` + `src/locales/ar/customer.json` —
    new keys under `registerAmount` (`nameLabel`, `namePlaceholder`,
    `errors.nameTooShort`).

- **Decisions / deviations:**
  - **Optional, not required.** This is a counter flow under time
    pressure; making name mandatory undoes Chunk 10's friction win.
    Skip = guest. Type = personalised greeting on the home page.
  - **Empty-or-≥2 instead of `.min(2).optional()`.** Zod's `.optional()`
    only accepts `undefined`; react-hook-form sends `''` for an
    untouched controlled input. The refinement covers both cleanly.
  - **`autoComplete="given-name"`** on the input so iOS / Android can
    pre-fill from the user's contacts card if they've allowed it.
    One tap in the best case, zero behavioural change in the worst.
  - **Did NOT touch the backend `register_customer_and_visit` RPC or
    its zod validator.** Pre-pilot day; the placeholder fallback
    remains the safer path. Once we have post-pilot breathing room,
    making `name` genuinely nullable end-to-end should pair with
    removing the `guestName` fallback in the page.

- **Verification:**
  - `npx tsc --noEmit` — clean.
  - `npx eslint src/pages/customer/RegisterAmountPage.tsx
    src/lib/validation/registerAmountSchema.ts` — clean.
  - `npm test` — 27/27 pass.

- **Follow-ups (carry over from Chunk 10):**
  - When the backend gets a nullable-name migration, drop the
    `guestName` substitution and let `name === null` pass through.
    Update the home greeter at the same time.
  - `RegisterDetailsPage.tsx` is still dead code — delete in a
    cleanup chunk after pilot.

---

### [2026-05-21] Chunk 11: OTP-gate account access (drop phone-only session)

- **Built:** the frontend half of the P0 auth-model fix (backend half is
  backend Chunk 13). The lookup endpoint no longer returns a session, so:
  - **`PhonePage`** now only does the no-OTP counter shortcut when the user
    arrived via a branch QR scan (`branchId` in route state) AND is a
    recognised returning customer. In that case it sets the 5-min scan token
    and goes to the bill-amount step. **Recognition without a branch scan no
    longer shortcuts in** — it falls through to the OTP flow so a real session
    is issued. Removed the now-dead `auth.setSession(...)`-from-lookup block.
  - **`RegisterOtpPage`** branches on the verify response `scope`:
    - `'session'` (existing customer logging in) → `auth.setSession(...)` →
      navigate Home.
    - `'registration'` (new customer) → `auth.setRegistration(...)` →
      bill-amount step (unchanged).
  - Interface contracts updated to match the backend: removed `session_token`
    / `customer_id` from `ScanLookupResult`; `OtpVerifyResponse.scope` is now
    `'registration' | 'session'` with an optional `customer`.

- **Files changed:**
  - `src/pages/customer/PhonePage.tsx` — counter-vs-account branching;
    removed lookup-session handling.
  - `src/pages/customer/RegisterOtpPage.tsx` — scope branching on verify.
  - `src/interfaces/visit/ScanLookupResult.ts` — dropped session fields.
  - `src/interfaces/auth/OtpVerifyResponse.ts` — session scope + customer.

- **Decisions:**
  - **`branchId` presence is the counter-vs-account signal.** The QR flow
    always carries `branchId` into `/phone`; the session-guard redirect from
    rewards/profile/home carries none. Clean discriminator, no new state.
  - **Land on Home after OTP login**, not the originally-intended page.
    Preserving intent through the OTP flow is a nice-to-have, deferred.
  - First-time registration flow is unchanged (new phone → registration
    token → bill-amount → register).

- **Verification:**
  - `npx tsc --noEmit` — clean.
  - `npx eslint` (changed files) — clean.
  - `npm test` — 27/27 pass.
  - `npm run build` — succeeds.
  - **Deploy with backend Chunk 13** — the lookup + verify contracts changed
    on both sides; shipping one without the other breaks the auth flow.

- **Manual test checklist (do on a preview before prod):**
  1. Returning customer scans a branch QR → enters phone → earns a stamp, no
     OTP.
  2. Open Rewards with no stored session → bounced to phone → OTP → lands
     logged in.
  3. Knowing a phone number alone (no OTP) grants no rewards/profile access.
  4. First-time signup via QR still works end to end.

---

### [2026-05-21] Chunk 12: Fix returning-customer scan dead-end

- **Built:** a logged-in customer who scans a branch QR can now earn a stamp.
  Previously `ScanLandingPage` always routed "Continue" to `/phone`, and
  (since Chunk 9) `/phone` bounces a logged-in user to `/home` — so the QR
  scan dead-ended at Home with no stamp.
  - **`ScanLandingPage.handleContinue`** now checks `auth.session`: logged-in →
    go straight to the bill-amount step (`SCAN_AMOUNT`) for the scanned branch;
    not logged in → `/phone` as before.
  - **`RouteGuard`** now accepts an array of requirements meaning "any of".
    The scan-amount route uses `require={['scan-token', 'session']}`.
  - **`ScanAmountPage`** guard + submit accept a scan token OR a session;
    `recordVisit` is called with `auth.scanToken ?? undefined` so a logged-in
    user with no scan token uses their session.
  - **`recordVisit`** (visitService) — `scanToken` is now optional; when
    omitted, the api request interceptor falls back to the persisted session
    JWT (`/visits/scan` accepts `scan` OR `session` scope).

- **Files changed:**
  - `src/pages/customer/ScanLandingPage.tsx` — session-aware Continue.
  - `src/components/common/RouteGuard.tsx` — `require` accepts an array (any-of).
  - `src/App.tsx` — scan-amount route → `require={['scan-token', 'session']}`.
  - `src/pages/customer/ScanAmountPage.tsx` — guard/submit accept session;
    token-optional `recordVisit` call.
  - `src/lib/services/visitService.ts` — `recordVisit` `scanToken?` optional.

- **Decisions:**
  - **DID NOT bump `OTP_LENGTH` to 6.** The Chunk 6 prompt asked for it, but
    per the human's explicit decision OTP stays at 4 digits, and the backend
    (`business.ts`) is still 4 — bumping the frontend alone would make it demand
    6 digits while the SMS carries 4, breaking OTP entry. Left `OTP_LENGTH = 4`
    in `src/constants/ui.ts`.
  - **`recordVisit` token-optional + interceptor fallback** rather than
    threading the session token explicitly — matches the existing api-layer
    contract (explicit `token` wins, else localStorage session).
  - `StampSuccessPage` already falls back to `auth.session.customer.name` when
    no scan profile is present, so the logged-in path needs no extra plumbing.

- **Verification:**
  - `npx tsc --noEmit` — clean.
  - `npx eslint` (changed files) — clean.
  - `npm test` — 27/27 pass.
  - `npm run build` — succeeds.

- **Manual test checklist (preview before prod):**
  1. Logged-in customer scans QR → reaches bill-amount → earns a stamp (no
     phone/OTP).
  2. Not-logged-in returning customer scans QR → phone → scan token →
     bill-amount (counter flow unchanged).
  3. First-timer scans QR → phone → OTP → register (unchanged).
  4. 24h lockout still shows for a logged-in user who already stamped today.

---

### [2026-05-22] Chunk 13: Patch production dependency CVEs

- **Built:** the frontend half of backlog "Chunk 10 — Patch dependency
  CVEs" (backend half is backend Chunk 19). `npm audit --omit=dev` went from
  **1 high + 1 moderate → 0**:
  - **`axios` (high, 13 advisories)** — prototype-pollution / SSRF / CRLF
    family. Cleared by `npm audit fix` bumping axios **1.15.0 → 1.16.1**, which
    sits inside the existing `^1.7.2` range, so `package.json` was unchanged
    (lockfile only). No code change — `src/lib/api.ts` uses the stable axios 1.x
    instance/interceptor API.
  - **`ws` (moderate)** via `@supabase/realtime-js` — cleared by the same
    `npm audit fix` bumping `@supabase/supabase-js` within `^2`
    (ws 8.20.0 → 8.20.1).

- **Files changed:**
  - `package-lock.json` — axios 1.16.1; supabase-js/ws bump. (No `package.json`
    change — both fixes were within existing semver ranges.)
  - `PROJECT_LOG.md` — this entry.

- **Decisions:**
  - **`npm audit fix` only — no `--force`.** Force would have pulled
    `vite@8` (a breaking major) for the remaining dev-only advisories.
  - **Left the 3 remaining `moderate` advisories** (`vite` ≤6.4.1 /
    `vite-plugin-pwa`, dev-only). They are **not production advisories**
    (`npm audit --omit=dev` is already 0) and fixing them needs the breaking
    `vite@8` upgrade — out of scope for a CVE patch. Tracked as a follow-up:
    bump vite + vite-plugin-pwa together in a dedicated tooling chunk and
    re-run the build.

- **Verification:**
  - `npm audit --omit=dev` — **0 vulnerabilities**.
  - `npm run typecheck` — clean (axios 1.16.1 types OK).
  - `npm run lint` — 0 errors (3 pre-existing `react-refresh` warnings,
    unrelated).
  - `npm test` — 27/27 pass.
  - `npm run build` — succeeds (PWA service worker regenerated).

- **Follow-ups:**
  - Dev-only `vite`/`vite-plugin-pwa` moderates remain; clear them with a
    `vite@8` + `vite-plugin-pwa` upgrade in a separate tooling chunk.

---

### [2026-05-22] Chunk 14: Stop error-detail leakage

- **Built:** the frontend half of backlog "Chunk 11 - Stop error-detail
  leakage" (backend half is backend Chunk 20).
  - `AppErrorBoundary` now shows raw `error.message` only outside production.
    In production it renders a generic localized fallback message instead, so
    thrown SQL/internal text cannot be displayed to customers or admins.
  - The production "Report issue" mailto body is also generic now; raw error
    text is still included there in development for debugging.
  - Moved the boundary copy into `common.json` for English and Arabic, and moved
    the support email into `src/constants/ui.ts`.
  - Added component tests covering dev raw-message behavior and production
    sanitization.

- **Files changed:**
  - `src/components/common/AppErrorBoundary.tsx` - env-aware production
    fallback, localized copy, sanitized mailto body.
  - `src/components/common/__tests__/AppErrorBoundary.test.tsx` - new tests.
  - `src/constants/ui.ts` - `SUPPORT_EMAIL`.
  - `src/locales/en/common.json` and `src/locales/ar/common.json` - error
    boundary copy.
  - `PROJECT_LOG.md` - this entry.

- **Decisions:**
  - Customer scope keeps the existing bilingual on-screen style; admin scope
    keeps English fallback copy via the existing `scope="admin"` behavior.
  - Production hides raw messages everywhere in the boundary surface; development
    keeps them visible for local debugging.

- **Verification:**
  - `npm test -- AppErrorBoundary.test.tsx` - 2/2 pass.
  - `npm run typecheck` - clean.
  - `npm run lint` - 0 errors; the same 3 pre-existing Fast Refresh warnings
    remain.
  - `npm test` - 29/29 pass.
  - `npm run build` - succeeds; Vite still emits the existing large chunk
    warning.

- **Follow-ups:**
  - None.

---

### [2026-05-22] Chunk 15: Security headers / CSP

- **Built:** the frontend half of backlog "Chunk 12 - Security headers / CSP"
  [P2].
  - Added a global Vercel headers block for all routes with:
    `Content-Security-Policy`, `X-Frame-Options: DENY`,
    `X-Content-Type-Options: nosniff`,
    `Referrer-Policy: strict-origin-when-cross-origin`, and HSTS.
  - CSP now allows only self-hosted scripts (no inline script allowance), blocks
    framing via `frame-ancestors 'none'`, blocks objects/frames/children, and
    allows the required outbound surfaces: Kayan API origins
    (`api.kayansweets.com`, `api-staging.kayansweets.com`, current Fly backend),
    Sentry ingest, and Google Fonts.
  - Kept inline styles allowed because the current React/Framer UI uses many
    `style={...}` props; removing that would require a broad UI refactor.
  - Vercel CLI linked the local project for preview deploys and added `.vercel`
    to `.gitignore` so project link metadata stays out of git.

- **Files changed:**
  - `vercel.json` - global security headers + CSP.
  - `.gitignore` - ignore `.vercel/` link metadata.
  - `PROJECT_LOG.md` - this entry.

- **Decisions:**
  - Added `https://knc-scan-backend.fly.dev` after live preview verification
    showed `VITE_API_BASE_URL` points there; the first preview correctly exposed
    the missing API origin as a CSP violation.
  - Included both CSP `frame-ancestors 'none'` and legacy
    `X-Frame-Options: DENY` for frame defense-in-depth.
  - Did not add broad wildcards for app/API hosts; the policy stays explicit.

- **Verification:**
  - `node -e "JSON.parse(...vercel.json...)"` - valid JSON.
  - `npm run build` - succeeds locally (existing Vite large-chunk warning).
  - `npm run lint` - 0 errors; same 3 pre-existing Fast Refresh warnings.
  - Vercel preview deployed successfully:
    `https://knc-scan-frontend-h6rc8n458-junaidapdev-32e394a3.vercel.app`.
  - `vercel curl --head` on `/` and `/admin/login` confirmed live headers:
    CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
    `Referrer-Policy: strict-origin-when-cross-origin`, and HSTS.
  - Playwright/Chrome against the protected preview confirmed `/phone` and
    `/admin/login` render, Google Fonts load with 200s, and there are no CSP
    console violations or CSP-blocked requests.
  - `/scan` on the protected preview still shows an error because the backend
    CORS allowlist does not include the generated Vercel preview origin. This is
    not caused by CSP: production-origin CORS was checked with
    `Origin: https://scan.kayansweets.com` and the backend returns
    `access-control-allow-origin: https://scan.kayansweets.com`.

- **Follow-ups:**
  - If PR previews need full `/scan` smoke coverage, add the relevant Vercel
    preview host pattern or a controlled preview domain to backend
    `CORS_ALLOWED_ORIGINS`.

---

### [2026-05-23] Launch review follow-up: OTP verification contract

- **Built:** addressed the valid cubic review finding on the release PR by
  making `OtpVerifyResponse` a discriminated union: `scope: 'session'`
  requires customer data, while `scope: 'registration'` cannot carry it.
- **Files changed:** `src/interfaces/auth/OtpVerifyResponse.ts`,
  `src/interfaces/auth/OtpVerifyCustomer.ts`, `src/interfaces/auth/index.ts`,
  `src/pages/customer/RegisterOtpPage.tsx`, and `PROJECT_LOG.md`.
- **Verification:** `npm run lint` (0 errors; same 3 existing Fast Refresh
  warnings), `npm run typecheck`, `npm test` (29/29), and `npm run build`
  (existing chunk-size warning only) all pass.

---

### [2026-05-23] Chunk 16: Microsoft Clarity (session recordings)

- **Built:** Microsoft Clarity (session recordings + heatmaps) on the customer
  PWA, wired to mirror the existing Sentry telemetry pattern.
  - `@microsoft/clarity` (npm) initialised programmatically in `src/lib/clarity.ts`
    (`initClarity()`), called from `main.tsx` right after `initSentry()`.
  - **Env-gated:** new optional `VITE_CLARITY_PROJECT_ID` in `src/config/env.ts`.
    No-op (info log) when empty, so dev/preview/test never record. Set it ONLY in
    the Vercel **production** environment (same control model as `VITE_SENTRY_DSN`).
    Production project id: `ww0kmmh8t1` (a public client identifier, not a secret).
  - **Customer PWA only:** `initClarity()` skips when the boot path is under
    `ROUTES.ADMIN.ROOT` (`/admin`). The admin console exposes customer PII + the
    admin password screen, so it is never recorded. Admins land directly on
    `/admin/*`; customers can't reach it.
  - **CSP:** added Clarity's domains to the `vercel.json` Content-Security-Policy
    (Chunk 15) — without this, Clarity is silently blocked in production:
    `script-src`/`script-src-elem` += `https://www.clarity.ms https://*.clarity.ms`;
    `connect-src` & `img-src` += `https://*.clarity.ms https://c.bing.com`.

- **Privacy — sensitive inputs force-masked** (`data-clarity-mask="true"`), so
  masking does NOT depend on the dashboard mode:
  - `OtpInput` — masks the **digit-box container** (the typed code renders in the
    boxes, not in the transparent `<input>`, so masking the input alone would
    miss it).
  - `PhoneInput`, `AmountInput` — the `<input>` element.
  - Registration **name** field — wrapped in a masked `<div>` at the call site
    in `RegisterAmountPage` (the generic `TextInput` stays unmasked for reuse).
  - The admin password is never recorded (admin console excluded), and
    `<input type="password">` is masked by Clarity by default anyway.

- **Files changed:** `src/config/env.ts`, `src/lib/clarity.ts` (new),
  `src/main.tsx`, `src/components/customer/{OtpInput,PhoneInput,AmountInput}.tsx`,
  `src/pages/customer/RegisterAmountPage.tsx`, `vercel.json`, `.env.example`,
  `README.md`, `package.json` / `package-lock.json` (`@microsoft/clarity@1.0.2`),
  and `PROJECT_LOG.md`.

- **Verification:** `npm run typecheck`, `npm run lint` (0 errors; same 3
  pre-existing Fast Refresh warnings), `npm test` (29/29), `npm run build`
  (Clarity bundled; existing chunk-size warning only) all pass. `vercel.json`
  re-validated as JSON.

- **Human actions before recordings appear:**
  1. Set `VITE_CLARITY_PROJECT_ID=ww0kmmh8t1` in Vercel → Project → Settings →
     Environment Variables, **Production only**, then redeploy.
  2. In the Clarity dashboard, set masking to **Strict** (Settings → Masking) for
     defense in depth on top of the per-field masks.
  3. Privacy/PDPL: confirm session recording of customers is covered by the
     privacy policy / consent posture. Clarity exposes a `Clarity.consent()` API
     if we later want to gate recording on the existing `consent_marketing` flag.

- **Follow-ups:**
  - Optional: gate Clarity behind `consent_marketing` via `Clarity.consent()`.
  - Optional: wire `analytics.ts` `track()` events to Clarity custom tags
    (`Clarity.setTag`) so recordings are filterable by funnel step.

---

### [2026-05-23] Chunk 17: Privacy policy page (DRAFT)

- **Built:** a public, bilingual privacy policy page so Clarity (Chunk 16) and
  the app's general PII collection are disclosed — the app had no privacy policy
  at all, which Clarity surfaced. **Clarity stays parked** (uncommitted/undeployed)
  until the policy is reviewed and live.
  - New route `ROUTES.PRIVACY` (`/privacy`), public/no-auth, wired in `App.tsx`
    as a direct (non-lazy) import like `NotFoundPage`.
  - New `PrivacyPolicyPage` (`src/pages/PrivacyPolicyPage.tsx`) built on
    `ScreenShell` (inherits the Kayan logo, language toggle, RTL, page
    transition). Renders a prominent **DRAFT** banner plus sections rendered
    **data-driven** from the locale (`heading` / optional `body` / optional
    `items[]`).
  - New `privacy` i18n namespace (AR + EN) — `I18N_NAMESPACES` extended in
    `constants/ui.ts`, registered in `lib/i18n.ts`, content in
    `src/locales/{en,ar}/privacy.json`.
  - Linked from the registration CTA fine-print (`RegisterAmountPage`), the
    point where marketing consent is implied — new `registerAmount.privacyPrefix`
    + `privacyLink` keys (AR + EN).

- **Content (draft, PDPL-aware — needs legal review):** who we are; data
  collected (phone, optional name, bill amounts, branch, loyalty activity,
  device/IP/language, analytics); how it's used; cookies/analytics (Clarity with
  masked fields + Sentry); processors (Taqnyat, Supabase, Microsoft Clarity,
  Sentry, Vercel, Fly.io); international transfers; retention; PDPL rights
  (access/correct/delete/withdraw consent/SDAIA complaint); children; changes;
  contact (`support@kayansweets.com`).

- **Files changed:** `src/pages/PrivacyPolicyPage.tsx` (new), `src/App.tsx`,
  `src/constants/routes.ts`, `src/constants/ui.ts`, `src/lib/i18n.ts`,
  `src/locales/{en,ar}/privacy.json` (new), `src/locales/{en,ar}/customer.json`,
  `src/pages/customer/RegisterAmountPage.tsx`, and `PROJECT_LOG.md`.

- **Verification:** all four new/edited JSON locale files parse; `npm run
  typecheck`, `npm run lint` (0 errors; same 3 pre-existing Fast Refresh
  warnings), `npm test` (29/29), and `npm run build` (PWA regenerated) all pass.

- **Human actions / follow-ups:**
  - **Legal review of the draft copy** (both languages) before relying on it;
    then remove the DRAFT banner (`privacy.draftBadge` / `privacy.draftNotice`).
  - Confirm the listed processors/transfers match the actual production setup.
  - Consider linking `/privacy` from a persistent spot too (e.g. Profile) — for
    now it is on the registration step (the consent point).
  - Once the policy is live, give the green light to ship Clarity (Chunk 16):
    commit + redeploy.

---

### [2026-05-23] Chunk 18: Finalize privacy policy + Clarity go-live

- **Built:** owner reviewed and approved the Chunk 17 policy copy, so removed the
  DRAFT banner from `PrivacyPolicyPage` and the now-unused `draftBadge` /
  `draftNotice` locale keys (AR + EN). The policy is now presented as final.
- **Go-live:** committed Chunk 16 (Clarity) + Chunk 17 (privacy) + this change
  together and pushed to `main` → Vercel production deploy. Shipping the policy
  and Clarity in the SAME deploy means recording only ever begins once the
  privacy policy is live.
- **Files changed:** `src/pages/PrivacyPolicyPage.tsx`,
  `src/locales/{en,ar}/privacy.json`, `PROJECT_LOG.md`.
- **Verification:** locale JSON valid; no dangling `draft*` refs; `npm run
  typecheck`, `npm run lint` (0 errors), `npm test` (29/29), `npm run build` all
  pass.
- **Human actions remaining (Clarity):**
  - Set Clarity dashboard masking to **Strict** (the OTP/phone/name/amount inputs
    are already force-masked in code, so this is defense in depth).
  - Confirm `VITE_CLARITY_PROJECT_ID` is scoped to the **Production** environment
    in Vercel.
  - After the deploy finishes, open a recording in Clarity and confirm the
    sensitive fields render masked.

---

### [2026-05-23] Chunk 19: Hide bill-amount quick-pick buttons

- **Built:** removed the 50 / 100 / 200 quick-pick buttons from both bill-amount
  screens. Customers were tapping a preset instead of entering the real bill, so
  the recorded `bill_amount` (and the self-reported spend totals derived from it)
  were inaccurate. They now type the actual amount.
  - Removed the duplicated `QUICK_PICKS` const + the quick-pick button block from
    `ScanAmountPage` (returning-customer scan) and `RegisterAmountPage`
    (first-visit registration), plus the now-unused `setValue` from each form's
    `useForm` destructuring. The manual numeric input is unchanged.
- **Files changed:** `src/pages/customer/ScanAmountPage.tsx`,
  `src/pages/customer/RegisterAmountPage.tsx`, `PROJECT_LOG.md`.
- **Decisions:** removed outright (recoverable from git history) rather than
  commenting out, per the no-dead-code rule. If quick picks return later, prefer
  a single shared `src/constants/ui.ts` constant over re-duplicating the array.
- **Verification:** `npm run typecheck`, `npm run lint` (0 errors; same 3
  pre-existing Fast Refresh warnings), `npm test` (29/29), `npm run build` all
  pass.
