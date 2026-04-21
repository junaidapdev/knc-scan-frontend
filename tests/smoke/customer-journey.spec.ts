import { test, expect } from '@playwright/test';

/**
 * Customer journey smoke — opens the scan entry with a branch QR, enters a
 * phone number, requests OTP, then bails before OTP submission because we
 * have no backend fixture that returns a deterministic code yet. See
 * ./README.md for the full fixture dependency.
 */
const SMOKE_BRANCH_QR = process.env.SMOKE_BRANCH_QR;
const SMOKE_PHONE = '+966500999001';

test('customer can reach OTP step', async ({ page }) => {
  test.skip(
    !SMOKE_BRANCH_QR,
    'SMOKE_BRANCH_QR not set — skipping (see tests/smoke/README.md).',
  );

  await page.goto(`/scan?branch=${encodeURIComponent(SMOKE_BRANCH_QR ?? '')}`);

  // Continue to phone entry.
  await page.getByRole('button', { name: /continue|متابعة/i }).click();

  await page.getByLabel(/Saudi mobile|رقم الجوال/i).fill(SMOKE_PHONE.slice(4));
  await page.getByRole('button', { name: /continue|متابعة/i }).click();

  await expect(page).toHaveURL(/register-otp|otp/i);

  // OTP step requires a backend fixture that deterministically returns a
  // known code (e.g. 000000 for reserved test phones). That fixture doesn't
  // exist yet, so we stop here.
  // eslint-disable-next-line no-console
  console.log(
    'smoke test: OTP step requires backend fixture — see tests/smoke/README.md',
  );
});
