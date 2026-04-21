import type { AdminCustomerListItem } from './AdminCustomerListItem';

export interface AdminCustomerVisitRow {
  id: string;
  scanned_at: string;
  branch_id: string | null;
  branch_name: string | null;
  stamp_awarded: boolean;
  lockout_applied: boolean;
  bill_amount: number | null;
}

export interface AdminCustomerIssuedRewardRow {
  id: string;
  unique_code: string;
  reward_name_snapshot: string;
  status: 'pending' | 'redeemed' | 'expired';
  issued_at: string;
  expires_at: string;
  redeemed_at: string | null;
  voided_at: string | null;
}

export interface AdminCustomerDetail extends AdminCustomerListItem {
  phone_full: string;
  birthday_month: number | null;
  birthday_day: number | null;
  preferred_branch_id: string | null;
  consent_marketing: boolean;
  lifetime_points: number;
  recent_visits: AdminCustomerVisitRow[];
  rewards: AdminCustomerIssuedRewardRow[];
}
