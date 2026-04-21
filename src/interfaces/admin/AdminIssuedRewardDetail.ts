import type { AdminIssuedRewardRow } from './AdminIssuedRewardRow';

export interface AdminIssuedRewardDetail extends AdminIssuedRewardRow {
  customer_phone_full: string;
  redemption_ip: string | null;
  redemption_device_fingerprint: string | null;
  redeemed_at_branch_name: string | null;
}
