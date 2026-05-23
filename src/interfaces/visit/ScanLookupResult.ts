import type { ScanLookupProfile } from './ScanLookupProfile';

/**
 * Response body from POST /visits/scan/lookup.
 * exists=false is also returned in silent rate-limit mode; callers must not
 * treat the flag as a confirmation that the phone is unregistered.
 *
 * NOTE: lookup is unauthenticated and deliberately returns ONLY a 5-minute
 * `scan_token` (enough to record one stamp at the counter). It does not issue a
 * session — a phone number alone must not grant account access. A session is
 * obtained by verifying an OTP (see OtpVerifyResponse).
 */
export interface ScanLookupResult {
  exists: boolean;
  profile?: ScanLookupProfile;
  scan_token?: string;
  scan_token_expires_in_seconds?: number;
}
