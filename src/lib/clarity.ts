import Clarity from '@microsoft/clarity';

import { env } from '@/config/env';
import { ROUTES } from '@/constants/routes';
import { logger } from './logger';

let initialized = false;

/**
 * Initialize Microsoft Clarity (session recordings + heatmaps). Mirrors the
 * Sentry init pattern: safe to call once at boot, guarded so it runs at most
 * once.
 *
 * - **No-op when `VITE_CLARITY_PROJECT_ID` is empty.** Set the var only in the
 *   Vercel *production* environment (like Sentry's DSN) so dev / preview / test
 *   never record real sessions.
 * - **Customer PWA only.** We never record the admin console — it exposes
 *   customer PII and the admin password screen. Admins land directly on
 *   `/admin/*`, so a boot-path check excludes their sessions. (Customers can't
 *   reach `/admin`.)
 *
 * Sensitive customer inputs (OTP, phone, name, bill amount) are additionally
 * force-masked in the DOM via `data-clarity-mask` so masking does not depend on
 * the dashboard masking mode. Set the Clarity dashboard to **Strict** masking
 * as well (Settings → Masking) for defense in depth.
 */
export function initClarity(): void {
  if (initialized) return;

  const projectId = env.VITE_CLARITY_PROJECT_ID;
  if (!projectId) {
    logger.info('[clarity] disabled (VITE_CLARITY_PROJECT_ID unset)');
    initialized = true;
    return;
  }

  // Never record the admin console (PII + password screen).
  if (window.location.pathname.startsWith(ROUTES.ADMIN.ROOT)) {
    logger.info('[clarity] skipped on admin route');
    initialized = true;
    return;
  }

  Clarity.init(projectId);
  initialized = true;
  logger.info('[clarity] initialized');
}
