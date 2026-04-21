/**
 * Response body of POST /rewards/:unique_code/confirm-redeem-step-1.
 * The frontend keeps the `redemption_token` in memory only and sends it via
 * the `x-redemption-token` header on step 2.
 */
export interface RedemptionConfirmation {
  redemption_token: string;
  summary: {
    customer_name: string | null;
    reward_name: { en: string; ar: string | null };
    unique_code: string;
    expires_at: string;
  };
}
