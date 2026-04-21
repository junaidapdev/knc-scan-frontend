import { useCallback, useEffect, useState } from 'react';

import type { Branch } from '@/interfaces/branch';
import { listBranches } from '@/lib/services';
import { ApiCallError } from '@/lib/api';

export type BranchesState =
  | { status: 'loading' }
  | { status: 'ready'; branches: Branch[] }
  | { status: 'error'; error: ApiCallError | Error };

export interface UseBranchesResult {
  state: BranchesState;
  reload: () => void;
}

/**
 * Loads the list of active branches once on mount.
 * Exposes a `reload` callback for retry UX in ErrorFallback.
 */
export function useBranches(): UseBranchesResult {
  const [state, setState] = useState<BranchesState>({ status: 'loading' });

  const load = useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    try {
      const branches = await listBranches();
      setState({ status: 'ready', branches });
    } catch (err) {
      setState({
        status: 'error',
        error: err instanceof Error ? err : new Error('Unknown'),
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state,
    reload: () => {
      void load();
    },
  };
}
