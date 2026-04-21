import {
  INSTALL_PROMPT_DISMISSED_KEY,
  INSTALL_PROMPT_STAMP_COUNT_KEY,
  INSTALL_PROMPT_THRESHOLD,
} from '@/constants/ui';
import { logger } from './logger';

/**
 * Tracks successful-stamp count for the "Add to Home Screen" prompt.
 * The UI component that actually renders the prompt lands in Chunk 5b; this
 * lib is usable today so /stamp-success can call `recordSuccessfulStamp`.
 */
export function recordSuccessfulStamp(): number {
  const raw = localStorage.getItem(INSTALL_PROMPT_STAMP_COUNT_KEY);
  const prev = raw ? Number.parseInt(raw, 10) : 0;
  const next = Number.isFinite(prev) ? prev + 1 : 1;
  localStorage.setItem(INSTALL_PROMPT_STAMP_COUNT_KEY, next.toString());
  return next;
}

export function shouldShowInstallPrompt(): boolean {
  if (localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === '1') return false;
  const raw = localStorage.getItem(INSTALL_PROMPT_STAMP_COUNT_KEY);
  const count = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(count) && count >= INSTALL_PROMPT_THRESHOLD;
}

export function dismissInstallPrompt(): void {
  localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, '1');
  logger.debug('[pwa] install prompt dismissed');
}
