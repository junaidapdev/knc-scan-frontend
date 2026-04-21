import { z } from 'zod';

import { OTP_LENGTH } from '@/constants/ui';

export const otpSchema = z
  .string()
  .length(OTP_LENGTH)
  .regex(/^\d+$/);

export const otpFormSchema = z.object({
  otp: otpSchema,
});

export type OtpFormValues = z.infer<typeof otpFormSchema>;
