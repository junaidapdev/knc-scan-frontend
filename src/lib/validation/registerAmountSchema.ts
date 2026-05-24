import { z } from 'zod';

import {
  SCAN_MAX_BILL_AMOUNT_SAR,
  SCAN_MIN_BILL_AMOUNT_SAR,
} from '@/constants/ui';

/**
 * Single-step registration form (Chunk 10; name made required in Chunk 20).
 *
 * Both fields are required. Bill amount mirrors the backend /visits/scan
 * validator; name requires at least 2 characters (the backend
 * `register_customer_and_visit` validator also demands `name.min(2)`).
 */
export const registerAmountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(60),
  bill_amount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .min(SCAN_MIN_BILL_AMOUNT_SAR)
    .max(SCAN_MAX_BILL_AMOUNT_SAR),
});

export type RegisterAmountValues = z.infer<typeof registerAmountSchema>;
