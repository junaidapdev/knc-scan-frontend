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
 * Record a visit (stamp) using the short-lived scan JWT minted by
 * /visits/scan/lookup. The `scanToken` is never persisted.
 */
export async function recordVisit(
  payload: ScanPayload,
  scanToken: string,
): Promise<ScanResult> {
  return http.post<ScanResult>(API_ENDPOINTS.VISITS.SCAN, payload, {
    token: scanToken,
  });
}
