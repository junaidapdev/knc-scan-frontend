/**
 * All application routes. No magic route strings in components —
 * always import from here (see CLAUDE.md §8).
 */
export const ROUTES = {
  ROOT: '/',
  CUSTOMER: {
    SCAN: '/scan',
    PHONE: '/phone',
    REGISTER_OTP: '/register/otp',
    REGISTER_DETAILS: '/register/details',
    SCAN_AMOUNT: '/scan/amount',
    STAMP_SUCCESS: '/stamp-success',
    LOCKOUT: '/lockout',
    REWARDS: '/rewards',
    REWARD_CLAIM: (code: string): string => `/rewards/${code}/claim`,
    REWARD_CONFIRM: (code: string): string => `/rewards/${code}/confirm`,
    REWARD_DONE: (code: string): string => `/rewards/${code}/done`,
    REWARD_CLAIM_PATTERN: '/rewards/:code/claim',
    REWARD_CONFIRM_PATTERN: '/rewards/:code/confirm',
    REWARD_DONE_PATTERN: '/rewards/:code/done',
    HOME: '/home',
    PROFILE: '/profile',
  },
  ADMIN: {
    ROOT: '/admin',
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    CUSTOMERS: '/admin/customers',
    REWARDS: '/admin/rewards',
    BRANCHES: '/admin/branches',
    REWARDS_CATALOG: '/admin/rewards/catalog',
    REWARDS_ISSUED: '/admin/rewards/issued',
    CUSTOMER_DETAIL: (id: string): string => `/admin/customers/${id}`,
    CUSTOMER_DETAIL_PATTERN: '/admin/customers/:id',
  },
  NOT_FOUND: '*',
} as const;
