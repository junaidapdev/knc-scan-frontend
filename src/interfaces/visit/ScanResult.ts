import type { ScanIssuedReward } from './ScanIssuedReward';

/** Successful response from POST /visits/scan. */
export interface ScanResult {
  stamp_awarded: boolean;
  current_stamps: number;
  ready_for_reward: boolean;
  visit_id: string;
  issued_reward: ScanIssuedReward | null;
  catalog_empty: boolean;
}
