/**
 * Endpoint paths for the backend. Path-builder helpers keep every URL
 * template in one file, honoring the "no magic strings" rule.
 */
export const API_ENDPOINTS = {
  HEALTH: '/health',

  AUTH: {
    REQUEST_OTP: '/auth/otp/request',
    VERIFY_OTP: '/auth/otp/verify',
    LOGOUT: '/auth/logout',
  },

  CUSTOMERS: {
    LIST: '/customers',
    DETAIL: (id: string): string => `/customers/${id}`,
    ME: '/customers/me',
    REGISTER: '/customers/register',
    MY_REWARDS: '/customers/me/rewards',
  },

  VISITS: {
    LIST: '/visits',
    SCAN: '/visits/scan',
    SCAN_LOOKUP: '/visits/scan/lookup',
  },

  REWARDS: {
    LIST: '/rewards',
    DETAIL: (code: string): string => `/rewards/${code}`,
    REDEEM_STEP_1: (code: string): string =>
      `/rewards/${code}/confirm-redeem-step-1`,
    REDEEM_STEP_2: (code: string): string =>
      `/rewards/${code}/confirm-redeem-step-2`,
  },

  BRANCHES: {
    LIST: '/branches',
    DETAIL: (id: string): string => `/branches/${id}`,
  },

  ADMIN: {
    LOGIN: '/admin/auth/login',
    LOGOUT: '/admin/auth/logout',
    ME: '/admin/auth/me',
    KPI_SUMMARY: '/admin/kpis/summary',
    KPI_BY_BRANCH: '/admin/kpis/by-branch',
    KPI_TIMESERIES: '/admin/kpis/timeseries',
    CUSTOMERS_LIST: '/admin/customers',
    CUSTOMERS_EXPORT: '/admin/customers/export',
    CUSTOMER_DETAIL: (id: string): string => `/admin/customers/${id}`,
    CATALOG_LIST: '/admin/rewards/catalog',
    CATALOG_DETAIL: (id: string): string => `/admin/rewards/catalog/${id}`,
    CATALOG_PAUSE: (id: string): string => `/admin/rewards/catalog/${id}/pause`,
    CATALOG_RESUME: (id: string): string => `/admin/rewards/catalog/${id}/resume`,
    CATALOG_ARCHIVE: (id: string): string => `/admin/rewards/catalog/${id}/archive`,
    ISSUED_LIST: '/admin/rewards/issued',
    ISSUED_DETAIL: (id: string): string => `/admin/rewards/issued/${id}`,
    ISSUED_VOID: (id: string): string => `/admin/rewards/issued/${id}/void`,
  },
} as const;
