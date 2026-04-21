import { z } from 'zod';

import { SUPPORTED_LANGUAGES } from '@/constants/ui';

/**
 * Mirror of backend customer register schema. We omit phone + branch_scan_id
 * here because the form never collects them — they're injected at submit time
 * from context (registration JWT phone + scan-landing branch id).
 */
export const registerFormSchema = z.object({
  name: z.string().trim().min(2),
  birthday_month: z.number().int().min(1).max(12),
  birthday_day: z.number().int().min(1).max(31),
  preferred_branch_id: z.string().uuid(),
  language: z.enum(SUPPORTED_LANGUAGES),
  consent_marketing: z.literal(true),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
