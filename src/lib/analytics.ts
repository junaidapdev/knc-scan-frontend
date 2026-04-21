import { logger } from './logger';

/**
 * Analytics stub (Chunk 5). Real PostHog wiring lands in Chunk 8.
 * Call sites record semantic events; swapping the implementation later
 * doesn't require touching components.
 */
export const ANALYTICS_EVENTS = {
  SCAN_STARTED: 'scan_started',
  REGISTRATION_COMPLETED: 'registration_completed',
  STAMP_EARNED: 'stamp_earned',
  REWARD_CLAIMED: 'reward_claimed',
  GOOGLE_REVIEW_CLICKED: 'google_review_clicked',
  INSTALL_PROMPT_SHOWN: 'install_prompt_shown',
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export function track(
  event: AnalyticsEvent,
  props: Record<string, unknown> = {},
): void {
  // No-op in v1; logged in dev for visibility.
  logger.debug('[analytics]', { event, ...props });
}
