import type { OtpVerifyCustomer } from './OtpVerifyCustomer';

/**
 * Response from POST /auth/otp/verify. The verify step is login-or-signup:
 * - Existing customer → `scope: 'session'` with a long-lived session JWT and a
 *   customer summary. The client persists it and the customer is logged in.
 * - New phone → `scope: 'registration'` with a short-lived JWT that only
 *   authorizes POST /customers/register.
 */
export type OtpVerifyResponse =
  | {
      token: string;
      scope: 'registration';
      customer?: never;
    }
  | {
      token: string;
      scope: 'session';
      customer: OtpVerifyCustomer;
    };
