import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  ADMIN_AUTH_TOKEN_STORAGE_KEY,
  ADMIN_PROFILE_STORAGE_KEY,
} from '@/constants/ui';
import { ADMIN_UNAUTHORIZED_EVENT } from '@/constants/admin';
import type { AdminUser } from '@/interfaces/admin';
import { adminLogin as apiAdminLogin } from '@/lib/adminApi';
import { logger } from '@/lib/logger';

export interface AdminAuthContextValue {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(
  null,
);

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
}

function loadPersisted(): AdminAuthState {
  try {
    const token = localStorage.getItem(ADMIN_AUTH_TOKEN_STORAGE_KEY);
    const raw = localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);
    if (!token || !raw) return { admin: null, token: null };
    const admin = JSON.parse(raw) as AdminUser;
    return { admin, token };
  } catch (err) {
    logger.warn('[admin-auth] failed to load persisted profile', { err });
    return { admin: null, token: null };
  }
}

export interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({
  children,
}: AdminAuthProviderProps): JSX.Element {
  const [state, setState] = useState<AdminAuthState>(() => loadPersisted());

  const logout = useCallback((): void => {
    try {
      localStorage.removeItem(ADMIN_AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_PROFILE_STORAGE_KEY);
    } catch (err) {
      logger.warn('[admin-auth] failed to clear storage', { err });
    }
    setState({ admin: null, token: null });
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const result = await apiAdminLogin({ email, password });
      try {
        localStorage.setItem(ADMIN_AUTH_TOKEN_STORAGE_KEY, result.token);
        localStorage.setItem(
          ADMIN_PROFILE_STORAGE_KEY,
          JSON.stringify(result.admin),
        );
      } catch (err) {
        logger.warn('[admin-auth] failed to persist session', { err });
      }
      setState({ admin: result.admin, token: result.token });
    },
    [],
  );

  // Subscribe to the admin-specific 401 broadcast from adminApi.
  useEffect(() => {
    const handler = (): void => logout();
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handler);
  }, [logout]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin: state.admin,
      token: state.token,
      isAuthenticated: Boolean(state.token && state.admin),
      login,
      logout,
    }),
    [state, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
