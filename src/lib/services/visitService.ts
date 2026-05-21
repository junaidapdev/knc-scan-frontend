import { API_ENDPOINTS } from '@/constants/api';
import type {
  ScanLookupPayload,
  ScanLookupResult,
  ScanPayload,
  ScanResult,
} from '@/interfaces/visit';
import { http } from '@/lib/api';

export async function scanLookup(
  payload: ScanLookupPayload,
): Promise<ScanLookupResult> {
  return http.post<ScanLookupResult>(
    API_ENDPOINTS.VISITS.SCAN_LOOKUP,
    payload,
  );
}

/**
 * Record a visit (stamp). Pass the short-lived scan JWT (counter flow) when you
 * have one; omit it for a logged-in customer, in which case the api layer falls
 * back to the persisted session JWT. /visits/scan accepts either scope.
 */
export async function recordVisit(
  payload: ScanPayload,
  scanToken?: string,
): Promise<ScanResult> {
  return http.post<ScanResult>(API_ENDPOINTS.VISITS.SCAN, payload, {
    token: scanToken,
  });
}
