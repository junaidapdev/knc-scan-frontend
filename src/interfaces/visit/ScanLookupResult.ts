import type { ScanLookupProfile } from './ScanLookupProfile';

/**
 * Response body from POST /visits/scan/lookup.
 * exists=false is also returned in silent rate-limit mode; callers must not
 * treat the flag as a confirmation that the phone is unregistered.
 */
export interface ScanLookupResult {
  exists: boolean;
  profile?: ScanLookupProfile;
  scan_token?: string;
  scan_token_expires_in_seconds?: number;
  /**
   * Long-lived (90d) session JWT for returning customers. Present whenever
   * `exists=true` so the UI can persist it and let the user reach /rewards
   * without re-doing OTP. Paired with `customer_id` so the client can build
   * its CustomerSession without decoding the JWT.
   */
  session_token?: string;
  customer_id?: string;
}
