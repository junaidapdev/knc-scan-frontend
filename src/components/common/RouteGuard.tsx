import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

export type GuardRequirement =
  | 'session'
  | 'scan-token'
  | 'registration-token';

export interface RouteGuardProps {
  require: GuardRequirement;
  children: ReactNode;
  redirectTo?: string;
}

/** Redirects to /phone (default) if the required credential is missing. */
export default function RouteGuard({
  require,
  children,
  redirectTo = ROUTES.CUSTOMER.PHONE,
}: RouteGuardProps): JSX.Element {
  const auth = useCustomerAuth();

  let ok = false;
  if (require === 'session') ok = Boolean(auth.session);
  else if (require === 'scan-token') ok = Boolean(auth.scanToken);
  else if (require === 'registration-token') ok = Boolean(auth.registrationToken);

  if (!ok) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}
