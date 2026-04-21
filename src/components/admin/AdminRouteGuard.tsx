import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({
  children,
}: AdminRouteGuardProps): JSX.Element {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN.LOGIN} replace />;
  }
  return <>{children}</>;
}
