/**
 * Admin-domain constants. No magic strings/numbers — all status enums,
 * pagination defaults, and internal event names live here.
 */

export const ADMIN_CATALOG_STATUSES = ['active', 'paused', 'archived'] as const;
export type AdminCatalogStatus = (typeof ADMIN_CATALOG_STATUSES)[number];

export const ADMIN_ISSUED_REWARD_STATUSES = [
  'pending',
  'redeemed',
  'voided',
  'expired',
] as const;
export type AdminIssuedRewardStatus =
  (typeof ADMIN_ISSUED_REWARD_STATUSES)[number];

export const ADMIN_CUSTOMER_FILTERS = [
  'all',
  'active',
  'inactive',
  'reward_ready',
] as const;
export type AdminCustomerFilter = (typeof ADMIN_CUSTOMER_FILTERS)[number];

export const DASHBOARD_REFRESH_MS = 60_000;
export const ADMIN_PAGE_SIZE_DEFAULT = 20;
export const ADMIN_UNAUTHORIZED_EVENT = 'kayan:admin:unauthorized';
export const ADMIN_TIMESERIES_DEFAULT_DAYS = 30;

export const ADMIN_ERROR_CODES = {
  ADMIN_LOGIN_INVALID: 'ADMIN_LOGIN_INVALID',
  ADMIN_RATE_LIMIT: 'ADMIN_RATE_LIMIT',
  ADMIN_AUTH_REQUIRED: 'ADMIN_AUTH_REQUIRED',
} as const;

export type AdminErrorCode =
  (typeof ADMIN_ERROR_CODES)[keyof typeof ADMIN_ERROR_CODES];
