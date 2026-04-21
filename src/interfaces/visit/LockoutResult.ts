/**
 * Details surfaced on the SCAN_LOCKOUT_ACTIVE apiError — returned when the
 * customer already earned a stamp within the 24h window.
 */
export interface LockoutResult {
  next_eligible_at: string;
  current_stamps: number;
  visit_id_for_record: string;
}
