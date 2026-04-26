/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['offline.html'],
      // NOTE: keep this manifest in sync with public/manifest.json — both are
      // shipped (the static file is what <link rel="manifest"> points to in
      // index.html; the plugin uses this copy to drive precaching).
      manifest: {
        id: '/',
        name: 'Kayan Sweets',
        short_name: 'Kayan',
        description:
          'Your Kayan Sweets loyalty card. Earn a stamp on every visit, claim a free dessert at 10.',
        theme_color: '#0D0D0D',
        background_color: '#FFD700',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'ar',
        dir: 'rtl',
        categories: ['food', 'lifestyle', 'shopping'],
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        // SPA shell — deep links like /scan?b=... must fall back to the
        // app shell (index.html) so React Router can handle the route.
        // Using /offline.html here caused the "You're offline" page to
        // appear on every deep link, even when online.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Playwright smoke tests live under `tests/` and must not be picked
    // up by vitest — they use their own runner (see `npm run test:smoke`).
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/**'],
  },
});
