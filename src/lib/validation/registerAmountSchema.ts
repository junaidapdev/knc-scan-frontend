import { z } from 'zod';

import {
  SCAN_MAX_BILL_AMOUNT_SAR,
  SCAN_MIN_BILL_AMOUNT_SAR,
} from '@/constants/ui';

/**
 * Single-step registration form (Chunk 10).
 *
 * Bill amount is required (mirrors the backend /visits/scan validator).
 * Name is *optional* — the customer can skip it. When the field is empty
 * the page substitutes a localised "Guest" placeholder at submit time so
 * the backend zod validator (which still demands `name.min(2)`) is happy.
 *
 * The 1-char check (`val === '' || val.length >= 2`) catches the awkward
 * case of someone typing one initial and tapping submit — better to refuse
 * a single character than to ship "M" as the customer's display name.
 */
export const registerAmountSchema = z.object({
  name: z
    .string()
    .trim()
    .max(60)
    .refine((val) => val === '' || val.length >= 2, {
      message: 'Name must be at least 2 characters',
    }),
  bill_amount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .min(SCAN_MIN_BILL_AMOUNT_SAR)
    .max(SCAN_MAX_BILL_AMOUNT_SAR),
});

export type RegisterAmountValues = z.infer<typeof registerAmountSchema>;
