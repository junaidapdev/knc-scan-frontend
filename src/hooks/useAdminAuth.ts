import { useContext } from 'react';

import {
  AdminAuthContext,
  type AdminAuthContextValue,
} from '@/contexts/AdminAuthContext';

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return ctx;
}
