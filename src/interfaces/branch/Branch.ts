/**
 * Mirror of the backend Branch record (GET /branches).
 * See kayan-backend/src/interfaces/branch/Branch.ts.
 */
export interface Branch {
  id: string;
  name: string;
  /** Arabic display name. Use {@link branchName} to read with fallback. */
  name_ar: string | null;
  city: string;
  /** Arabic display city. Use {@link branchCity} to read with fallback. */
  city_ar: string | null;
  qr_identifier: string;
  google_review_url: string | null;
  carries_boxed_chocolates: boolean;
  address: string | null;
  /** Arabic address. Falls back to {@link Branch.address} when null. */
  address_ar: string | null;
  active: boolean;
  created_at: string;
}
