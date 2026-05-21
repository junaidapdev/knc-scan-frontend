import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

export type GuardRequirement =
  | 'session'
  | 'scan-token'
  | 'registration-token';

export interface RouteGuardProps {
  /**
   * Credential(s) that allow access. A single requirement, or an array meaning
   * "any of these" — e.g. ['scan-token', 'session'] for the scan-amount step,
   * which a returning customer reaches via a 5-min scan token (counter flow)
   * OR a logged-in session (scanned the QR while signed in).
   */
  require: GuardRequirement | GuardRequirement[];
  children: ReactNode;
  redirectTo?: string;
}

/** Redirects to /phone (default) if NONE of the required credentials are present. */
export default function RouteGuard({
  require,
  children,
  redirectTo = ROUTES.CUSTOMER.PHONE,
}: RouteGuardProps): JSX.Element {
  const auth = useCustomerAuth();

  const has = (req: GuardRequirement): boolean => {
    if (req === 'session') return Boolean(auth.session);
    if (req === 'scan-token') return Boolean(auth.scanToken);
    return Boolean(auth.registrationToken);
  };

  const requirements = Array.isArray(require) ? require : [require];
  const ok = requirements.some(has);

  if (!ok) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}
