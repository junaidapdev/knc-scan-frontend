import { API_ENDPOINTS } from '@/constants/api';
import type {
  IssuedReward,
  RedemptionConfirmation,
  RedemptionStep1Payload,
  RedemptionStep2Payload,
} from '@/interfaces/reward';
import { api, http } from '@/lib/api';

/** GET /customers/me/rewards — requires long-lived session JWT. */
export async function listMyRewards(): Promise<IssuedReward[]> {
  return http.get<IssuedReward[]>(API_ENDPOINTS.CUSTOMERS.MY_REWARDS);
}

/**
 * POST /rewards/:unique_code/confirm-redeem-step-1 — returns the
 * `redemption_token` that step 2 must replay via the `x-redemption-token`
 * header. Keep the token in-memory only.
 */
export async function claimRewardStep1(
  uniqueCode: string,
  payload: RedemptionStep1Payload,
): Promise<RedemptionConfirmation> {
  return http.post<RedemptionConfirmation>(
    API_ENDPOINTS.REWARDS.REDEEM_STEP_1(uniqueCode),
    payload,
  );
}

/**
 * POST /rewards/:unique_code/confirm-redeem-step-2 — finalizes the redemption.
 * The redemption token minted by step 1 is sent via the `x-redemption-token`
 * header. Returns the updated IssuedReward (status=redeemed).
 */
export async function claimRewardStep2(
  uniqueCode: string,
  payload: RedemptionStep2Payload,
  redemptionToken: string,
): Promise<IssuedReward> {
  // The http wrapper doesn't expose arbitrary headers, so we drop to axios for
  // this one call — still goes through the ApiResponse unwrap interceptor.
  const res = await api.post<IssuedReward>(
    API_ENDPOINTS.REWARDS.REDEEM_STEP_2(uniqueCode),
    payload,
    {
      headers: {
        'x-redemption-token': redemptionToken,
      },
    },
  );
  return res.data;
}
