import { defineConfig } from '@playwright/test';

const previewUrl = process.env.PREVIEW_URL;
if (!previewUrl) {
  throw new Error(
    'PREVIEW_URL env var is required for smoke tests (e.g. https://kayan-preview.vercel.app).',
  );
}

export default defineConfig({
  testDir: './tests/smoke',
  timeout: 60_000,
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: previewUrl,
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
