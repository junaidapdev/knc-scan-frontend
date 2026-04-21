import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

/**
 * Global test setup — extends expect with jest-dom matchers and silences
 * the PWA service worker lookups jsdom can't satisfy.
 */
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
