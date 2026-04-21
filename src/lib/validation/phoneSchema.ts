import { z } from 'zod';

import {
  SAUDI_PHONE_TAIL_LENGTH,
  SAUDI_PHONE_TAIL_REGEX,
} from '@/constants/ui';

/**
 * Validates the 9-digit tail typed into the phone input (no prefix).
 * Must start with "5" and be exactly 9 digits to match backend
 * SAUDI_PHONE_REGEX: ^\+9665\d{8}$.
 */
export const phoneTailSchema = z
  .string()
  .length(SAUDI_PHONE_TAIL_LENGTH)
  .regex(SAUDI_PHONE_TAIL_REGEX);

export const phoneFormSchema = z.object({
  phoneTail: phoneTailSchema,
});

export type PhoneFormValues = z.infer<typeof phoneFormSchema>;
