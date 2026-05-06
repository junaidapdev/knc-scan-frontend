import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import {
  AdminPageSpinner,
  AdminRouteGuard,
  AdminShell,
} from '@/components/admin';
import { AppErrorBoundary, RouteGuard } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import NotFoundPage from '@/pages/NotFoundPage';
import {
  HomePage,
  LockoutPage,
  PhonePage,
  ProfilePage,
  RegisterAmountPage,
  RegisterOtpPage,
  RewardClaimPage,
  RewardConfirmPage,
  RewardDonePage,
  RewardsPage,
  ScanAmountPage,
  ScanLandingPage,
  StampSuccessPage,
} from '@/pages/customer';

// Admin chunks are lazy so customer-only traffic doesn't download them.
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(
  () => import('@/pages/admin/AdminDashboardPage'),
);
const AdminBranchesPage = lazy(
  () => import('@/pages/admin/AdminBranchesPage'),
);
const AdminCustomersPage = lazy(
  () => import('@/pages/admin/AdminCustomersPage'),
);
const AdminCustomerDetailPage = lazy(
  () => import('@/pages/admin/AdminCustomerDetailPage'),
);
const AdminRewardsCatalogPage = lazy(
  () => import('@/pages/admin/AdminRewardsCatalogPage'),
);
const AdminRewardsIssuedPage = lazy(
  () => import('@/pages/admin/AdminRewardsIssuedPage'),
);

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route
        path={ROUTES.ROOT}
        element={<Navigate to={ROUTES.CUSTOMER.SCAN} replace />}
      />

      {/* Public entry flow */}
      <Route path={ROUTES.CUSTOMER.SCAN} element={<ScanLandingPage />} />
      <Route path={ROUTES.CUSTOMER.PHONE} element={<PhonePage />} />
      <Route
        path={ROUTES.CUSTOMER.REGISTER_OTP}
        element={<RegisterOtpPage />}
      />

      <Route
        path={ROUTES.CUSTOMER.REGISTER_AMOUNT}
        element={
          <RouteGuard require="registration-token">
            <RegisterAmountPage />
          </RouteGuard>
        }
      />

      {/*
        REGISTER_DETAILS route removed in Chunk 10. Bill amount is now the
        last step of registration; name/birthday/branch/language fields were
        retired in favour of auto-filled defaults to cut counter friction.
        The page file is retained as dead code in case we need to revert.
      */}

      <Route
        path={ROUTES.CUSTOMER.SCAN_AMOUNT}
        element={
          <RouteGuard require="scan-token">
            <ScanAmountPage />
          </RouteGuard>
        }
      />

      <Route
        path={ROUTES.CUSTOMER.STAMP_SUCCESS}
        element={<StampSuccessPage />}
      />
      <Route path={ROUTES.CUSTOMER.LOCKOUT} element={<LockoutPage />} />

      <Route
        path={ROUTES.CUSTOMER.REWARDS}
        element={
          <RouteGuard require="session">
            <RewardsPage />
          </RouteGuard>
        }
      />
      <Route
        path={ROUTES.CUSTOMER.REWARD_CLAIM_PATTERN}
        element={
          <RouteGuard require="session">
            <RewardClaimPage />
          </RouteGuard>
        }
      />
      <Route
        path={ROUTES.CUSTOMER.REWARD_CONFIRM_PATTERN}
        element={
          <RouteGuard require="session">
            <RewardConfirmPage />
          </RouteGuard>
        }
      />
      <Route
        path={ROUTES.CUSTOMER.REWARD_DONE_PATTERN}
        element={
          <RouteGuard require="session">
            <RewardDonePage />
          </RouteGuard>
        }
      />

      <Route
        path={ROUTES.CUSTOMER.HOME}
        element={
          <RouteGuard require="session">
            <HomePage />
          </RouteGuard>
        }
      />
      <Route
        path={ROUTES.CUSTOMER.PROFILE}
        element={
          <RouteGuard require="session">
            <ProfilePage />
          </RouteGuard>
        }
      />

      {/* --- Admin console --- */}
      <Route
        path={ROUTES.ADMIN.LOGIN}
        element={
          <Suspense fallback={<AdminPageSpinner />}>
            <AdminLoginPage />
          </Suspense>
        }
      />

      <Route
        element={
          <AppErrorBoundary scope="admin">
            <Suspense fallback={<AdminPageSpinner />}>
              <AdminShell />
            </Suspense>
          </AppErrorBoundary>
        }
      >
        <Route
          path={ROUTES.ADMIN.ROOT}
          element={
            <AdminRouteGuard>
              <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />
            </AdminRouteGuard>
          }
        />
        <Route
          path={ROUTES.ADMIN.DASHBOARD}
          element={
            <AdminRouteGuard>
              <AdminDashboardPage />
            </AdminRouteGuard>
          }
        />
        <Route
          path={ROUTES.ADMIN.BRANCHES}
          element={
            <AdminRouteGuard>
              <AdminBranchesPage />
            </AdminRouteGuard>
          }
        />
        <Route
          path={ROUTES.ADMIN.CUSTOMERS}
          element={
            <AdminRouteGuard>
              <AdminCustomersPage />
            </AdminRouteGuard>
          }
        />
        <Route
          path={ROUTES.ADMIN.CUSTOMER_DETAIL_PATTERN}
          element={
            <AdminRouteGuard>
              <AdminCustomerDetailPage />
            </AdminRouteGuard>
          }
        />
        <Route
          path={ROUTES.ADMIN.REWARDS_CATALOG}
          element={
            <AdminRouteGuard>
              <AdminRewardsCatalogPage />
            </AdminRouteGuard>
          }
        />
        <Route
          path={ROUTES.ADMIN.REWARDS_ISSUED}
          element={
            <AdminRouteGuard>
              <AdminRewardsIssuedPage />
            </AdminRouteGuard>
          }
        />
      </Route>

      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
}
