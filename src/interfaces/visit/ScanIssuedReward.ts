/** Inline-issued reward summary returned when a scan fills the card. */
export interface ScanIssuedReward {
  reward_id: string;
  unique_code: string;
  catalog_id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  estimated_value_sar: number;
  expires_at: string;
}
