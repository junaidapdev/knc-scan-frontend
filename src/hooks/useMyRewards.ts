import { useCallback, useEffect, useState } from 'react';

import type { IssuedReward } from '@/interfaces/reward';
import { listMyRewards } from '@/lib/services';

export type MyRewardsState =
  | { status: 'loading' }
  | { status: 'ready'; rewards: IssuedReward[] }
  | { status: 'error'; error: unknown };

export interface UseMyRewardsValue {
  state: MyRewardsState;
  reload: () => void;
}

/** Fetch the authenticated customer's issued rewards. */
export function useMyRewards(): UseMyRewardsValue {
  const [state, setState] = useState<MyRewardsState>({ status: 'loading' });
  const [nonce, setNonce] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    listMyRewards()
      .then((rewards) => {
        if (!cancelled) setState({ status: 'ready', rewards });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', error });
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const reload = useCallback((): void => {
    setNonce((n) => n + 1);
  }, []);

  return { state, reload };
}
