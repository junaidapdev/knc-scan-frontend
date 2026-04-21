/**
 * Best-effort haptic feedback. No-ops on unsupported platforms (SSR, desktop,
 * iOS Safari) so callers never need to feature-detect.
 */
export function haptic(pattern: number | number[]): void {
  if (typeof navigator === 'undefined') return;
  const vibrate = navigator.vibrate?.bind(navigator);
  if (typeof vibrate !== 'function') return;
  try {
    vibrate(pattern);
  } catch {
    /* ignore — some browsers throw when the tab is backgrounded */
  }
}
