import { useEffect, useRef } from 'react';

/**
 * Fires `callback` every `delayMs` while mounted. Pass `null` to pause.
 * The callback is kept in a ref so consumers can pass inline arrow
 * functions without restarting the timer.
 */
export function useInterval(
  callback: () => void,
  delayMs: number | null,
): void {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const id = window.setInterval(() => saved.current(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs]);
}
