import * as Sentry from '@sentry/react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { useEffect } from 'react';

import { env, isProd } from '@/config/env';
import { logger } from './logger';

let initialized = false;

/**
 * Initialize Sentry. No-op (with an info log) when VITE_SENTRY_DSN is empty.
 * Safe to call once at app boot.
 */
export function initSentry(): void {
  if (initialized) return;

  const dsn = env.VITE_SENTRY_DSN;
  if (!dsn) {
    logger.info('[sentry] disabled (VITE_SENTRY_DSN unset)');
    initialized = true;
    return;
  }

  Sentry.init({
    dsn,
    release: env.VITE_APP_RELEASE,
    environment: isProd ? 'production' : 'development',
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
    tracesSampleRate: env.VITE_SENTRY_TRACES_SAMPLE_RATE,
  });

  initialized = true;
  logger.info('[sentry] initialized');
}

/**
 * Capture an exception with optional context. No-op when Sentry is disabled.
 */
export function captureException(
  err: unknown,
  ctx?: Record<string, unknown>,
): void {
  if (!env.VITE_SENTRY_DSN) {
    logger.error('[sentry:disabled] captureException', err, ctx);
    return;
  }
  Sentry.captureException(err, ctx ? { extra: ctx } : undefined);
}
