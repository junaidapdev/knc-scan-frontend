import { z } from 'zod';

import {
  SCAN_MAX_BILL_AMOUNT_SAR,
  SCAN_MIN_BILL_AMOUNT_SAR,
} from '@/constants/ui';

/**
 * Bill amount in SAR — mirrors backend /visits/scan zod validators.
 * Accepts decimals (react-hook-form gives a string; we coerce once here).
 */
export const scanAmountSchema = z.object({
  bill_amount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .min(SCAN_MIN_BILL_AMOUNT_SAR)
    .max(SCAN_MAX_BILL_AMOUNT_SAR),
});

export type ScanAmountValues = z.infer<typeof scanAmountSchema>;
