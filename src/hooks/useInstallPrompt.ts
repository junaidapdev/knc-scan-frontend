import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib/logger';

/**
 * Mirror of the Chrome/Edge BeforeInstallPromptEvent shape. Not standardized
 * yet; we treat it as an opaque object with a `prompt()` method and a
 * `userChoice` Promise.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

export interface UseInstallPromptResult {
  canInstall: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

/**
 * Captures the `beforeinstallprompt` event so we can trigger the native
 * install UI on demand (e.g. when the user taps our custom banner).
 * Returns `canInstall=false` on browsers that don't fire the event
 * (Safari/iOS, Firefox on some versions).
 */
export function useInstallPrompt(): UseInstallPromptResult {
  const [deferred, setDeferred] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event): void => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = useCallback(async (): Promise<
    'accepted' | 'dismissed' | 'unavailable'
  > => {
    if (!deferred) return 'unavailable';
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      return choice.outcome;
    } catch (err) {
      logger.warn('[pwa] install prompt failed', err);
      return 'unavailable';
    }
  }, [deferred]);

  return { canInstall: deferred !== null, promptInstall };
}
