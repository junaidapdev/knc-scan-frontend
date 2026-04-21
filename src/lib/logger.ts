/* eslint-disable no-console */
// This file is the ONLY place in the codebase where console.* is permitted.
// Every other module must import and use this logger instead.

import { isDev } from '@/config/env';

type LogArgs = unknown[];

interface Logger {
  debug: (...args: LogArgs) => void;
  info: (...args: LogArgs) => void;
  warn: (...args: LogArgs) => void;
  error: (...args: LogArgs) => void;
}

const noop = (): void => {
  /* intentionally empty in production */
};

// In development we log to the console. In production these are no-ops.
// Hook Sentry / PostHog here later by replacing the prod branches.
export const logger: Logger = isDev
  ? {
      debug: (...args) => console.debug('[kayan]', ...args),
      info: (...args) => console.info('[kayan]', ...args),
      warn: (...args) => console.warn('[kayan]', ...args),
      error: (...args) => console.error('[kayan]', ...args),
    }
  : {
      debug: noop,
      info: noop,
      warn: noop,
      // TODO: route errors to Sentry once VITE_SENTRY_DSN is wired up.
      error: noop,
    };
