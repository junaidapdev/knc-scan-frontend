export const TOAST_DURATION_MS = 4000;
export const OTP_LENGTH = 4;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

export const DEBOUNCE_INPUT_MS = 300;
export const API_TIMEOUT_MS = 15000;

export const STAMPS_PER_CARD = 10;

// Scan flow constants mirror backend /visits/scan validators.
export const SCAN_MIN_BILL_AMOUNT_SAR = 1;
export const SCAN_MAX_BILL_AMOUNT_SAR = 9999;

// Phone prefix is +966 (visually locked in the UI). 9-digit tail that must
// begin with 5 — mirrors backend SAUDI_PHONE_REGEX: ^\+9665\d{8}$.
export const SAUDI_PHONE_PREFIX = '+966';
export const SAUDI_PHONE_TAIL_LENGTH = 9;
export const SAUDI_PHONE_TAIL_REGEX = /^5\d{8}$/;
export const SAUDI_PHONE_FULL_REGEX = /^\+9665\d{8}$/;

export const AUTH_TOKEN_STORAGE_KEY = 'kayan.auth.token';
export const ADMIN_AUTH_TOKEN_STORAGE_KEY = 'kayan.admin.token';
export const ADMIN_PROFILE_STORAGE_KEY = 'kayan.admin.profile';
export const LANGUAGE_STORAGE_KEY = 'kayan.i18n.lang';
export const INSTALL_PROMPT_STAMP_COUNT_KEY = 'kayan.pwa.stampCount';
export const INSTALL_PROMPT_DISMISSED_KEY = 'kayan.pwa.installDismissed';
export const INSTALL_PROMPT_THRESHOLD = 2;

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'ar';

export const I18N_NAMESPACES = ['common', 'customer'] as const;
export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

// Shown in Profile footer. Kept here so it does not require a runtime
// package.json import (vite config stays simple).
export const APP_VERSION = '0.1.0';
