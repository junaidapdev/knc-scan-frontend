export interface AdminCustomerListItem {
  id: string;
  phone_masked: string;
  name: string | null;
  language: 'ar' | 'en';
  tier: string;
  current_stamps: number;
  cards_completed: number;
  total_visits: number;
  total_self_reported_spend_sar: number;
  rewards_issued_count: number;
  rewards_redeemed_count: number;
  last_scan_at: string | null;
  created_at: string;
}
