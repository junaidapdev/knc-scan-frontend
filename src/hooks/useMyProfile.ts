import { useEffect, useState } from 'react';

import type { Customer } from '@/interfaces/customer';
import { getMyProfile } from '@/lib/services';

export type MyProfileState =
  | { status: 'loading' }
  | { status: 'ready'; profile: Customer }
  | { status: 'error'; error: unknown };

export interface UseMyProfileValue {
  state: MyProfileState;
}

/** Fetch GET /customers/me for the authenticated session. */
export function useMyProfile(): UseMyProfileValue {
  const [state, setState] = useState<MyProfileState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    getMyProfile()
      .then((res) => {
        if (!cancelled) setState({ status: 'ready', profile: res.profile });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { state };
}
