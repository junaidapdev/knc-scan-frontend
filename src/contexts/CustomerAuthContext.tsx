import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/ui';
import type { CustomerSession } from '@/interfaces/customer';
import type { ScanLookupProfile } from '@/interfaces/visit';
import { logger } from '@/lib/logger';

/**
 * Short-lived tokens and volatile scan context live in memory only.
 * The long-lived session JWT persists to localStorage so returning customers
 * stay authenticated across tabs/reloads.
 */
interface CustomerAuthState {
  // Long-lived session (90d JWT + customer identity).
  session: CustomerSession | null;
  // 5-min scan JWT from /visits/scan/lookup. Never persisted.
  scanToken: string | null;
  scanProfile: ScanLookupProfile | null;
  // 15-min registration JWT from /auth/otp/verify. Never persisted.
  registrationToken: string | null;
  registrationPhone: string | null;
}

export interface CustomerAuthContextValue extends CustomerAuthState {
  setScan: (token: string, profile: ScanLookupProfile) => void;
  clearScan: () => void;
  setRegistration: (token: string, phone: string) => void;
  clearRegistration: () => void;
  setSession: (session: CustomerSession) => void;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

function loadPersistedSession(): CustomerSession | null {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const customerRaw = localStorage.getItem('kayan.auth.customer');
    if (!token || !customerRaw) return null;
    const customer = JSON.parse(customerRaw) as CustomerSession['customer'];
    return { token, customer };
  } catch (err) {
    logger.warn('[auth] failed to load persisted session', { err });
    return null;
  }
}

export interface CustomerAuthProviderProps {
  children: ReactNode;
}

export function CustomerAuthProvider({
  children,
}: CustomerAuthProviderProps): JSX.Element {
  const [state, setState] = useState<CustomerAuthState>(() => ({
    session: loadPersistedSession(),
    scanToken: null,
    scanProfile: null,
    registrationToken: null,
    registrationPhone: null,
  }));

  const setScan = useCallback(
    (token: string, profile: ScanLookupProfile): void => {
      setState((prev) => ({ ...prev, scanToken: token, scanProfile: profile }));
    },
    [],
  );

  const clearScan = useCallback((): void => {
    setState((prev) => ({ ...prev, scanToken: null, scanProfile: null }));
  }, []);

  const setRegistration = useCallback(
    (token: string, phone: string): void => {
      setState((prev) => ({
        ...prev,
        registrationToken: token,
        registrationPhone: phone,
      }));
    },
    [],
  );

  const clearRegistration = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      registrationToken: null,
      registrationPhone: null,
    }));
  }, []);

  const setSession = useCallback((session: CustomerSession): void => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.token);
    localStorage.setItem('kayan.auth.customer', JSON.stringify(session.customer));
    setState((prev) => ({ ...prev, session }));
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem('kayan.auth.customer');
    setState({
      session: null,
      scanToken: null,
      scanProfile: null,
      registrationToken: null,
      registrationPhone: null,
    });
  }, []);

  // Listen for 401 signals from the api interceptor.
  useEffect(() => {
    const handler = (): void => logout();
    window.addEventListener('kayan:auth:unauthorized', handler);
    return () => window.removeEventListener('kayan:auth:unauthorized', handler);
  }, [logout]);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      ...state,
      setScan,
      clearScan,
      setRegistration,
      clearRegistration,
      setSession,
      logout,
    }),
    [
      state,
      setScan,
      clearScan,
      setRegistration,
      clearRegistration,
      setSession,
      logout,
    ],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  }
  return ctx;
}
