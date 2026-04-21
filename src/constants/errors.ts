export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN: 'UNKNOWN',

  // Visit / scan
  SCAN_LOCKOUT_ACTIVE: 'SCAN_LOCKOUT_ACTIVE',
  BRANCH_NOT_FOUND: 'BRANCH_NOT_FOUND',
  BRANCH_INACTIVE: 'BRANCH_INACTIVE',
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',

  // Reward redemption
  REWARD_NOT_FOUND: 'REWARD_NOT_FOUND',
  REWARD_NOT_OWNED: 'REWARD_NOT_OWNED',
  REWARD_NOT_PENDING: 'REWARD_NOT_PENDING',
  REWARD_EXPIRED: 'REWARD_EXPIRED',
  INVALID_REDEMPTION_TOKEN: 'INVALID_REDEMPTION_TOKEN',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface BilingualMessage {
  en: string;
  ar: string;
}

export const ERROR_MESSAGES: Record<ErrorCode, BilingualMessage> = {
  [ERROR_CODES.NETWORK_ERROR]: {
    en: 'Network error. Please check your connection.',
    ar: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    en: 'Please sign in to continue.',
    ar: 'الرجاء تسجيل الدخول للمتابعة.',
  },
  [ERROR_CODES.FORBIDDEN]: {
    en: 'You do not have permission to perform this action.',
    ar: 'ليس لديك إذن لتنفيذ هذا الإجراء.',
  },
  [ERROR_CODES.NOT_FOUND]: {
    en: 'We could not find what you were looking for.',
    ar: 'لم نتمكن من العثور على ما تبحث عنه.',
  },
  [ERROR_CODES.VALIDATION_FAILED]: {
    en: 'Please check your input and try again.',
    ar: 'يرجى التحقق من المدخلات والمحاولة مرة أخرى.',
  },
  [ERROR_CODES.INVALID_OTP]: {
    en: 'The verification code is incorrect.',
    ar: 'رمز التحقق غير صحيح.',
  },
  [ERROR_CODES.OTP_EXPIRED]: {
    en: 'The verification code has expired.',
    ar: 'انتهت صلاحية رمز التحقق.',
  },
  [ERROR_CODES.RATE_LIMITED]: {
    en: 'Too many attempts. Please try again later.',
    ar: 'محاولات كثيرة. الرجاء المحاولة لاحقاً.',
  },
  [ERROR_CODES.INTERNAL_ERROR]: {
    en: 'Something went wrong. Please try again.',
    ar: 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.',
  },
  [ERROR_CODES.UNKNOWN]: {
    en: 'An unknown error occurred.',
    ar: 'حدث خطأ غير معروف.',
  },
  [ERROR_CODES.SCAN_LOCKOUT_ACTIVE]: {
    en: 'You already earned a stamp today. Come back tomorrow.',
    ar: 'حصلت على ختم اليوم بالفعل. عد مرة أخرى غدًا.',
  },
  [ERROR_CODES.BRANCH_NOT_FOUND]: {
    en: 'This branch QR code is not recognized.',
    ar: 'رمز الاستجابة السريعة لهذا الفرع غير معروف.',
  },
  [ERROR_CODES.BRANCH_INACTIVE]: {
    en: 'This branch is not currently active.',
    ar: 'هذا الفرع غير فعّال حالياً.',
  },
  [ERROR_CODES.CUSTOMER_NOT_FOUND]: {
    en: 'We could not find your rewards card.',
    ar: 'لم نتمكن من العثور على بطاقة مكافآتك.',
  },
  [ERROR_CODES.REWARD_NOT_FOUND]: {
    en: 'That reward could not be found.',
    ar: 'تعذر العثور على تلك المكافأة.',
  },
  [ERROR_CODES.REWARD_NOT_OWNED]: {
    en: 'This reward belongs to a different customer.',
    ar: 'هذه المكافأة تخص عميلًا آخر.',
  },
  [ERROR_CODES.REWARD_NOT_PENDING]: {
    en: 'This reward has already been used or is no longer valid.',
    ar: 'تم استخدام هذه المكافأة أو لم تعد صالحة.',
  },
  [ERROR_CODES.REWARD_EXPIRED]: {
    en: 'This reward has expired.',
    ar: 'انتهت صلاحية هذه المكافأة.',
  },
  [ERROR_CODES.INVALID_REDEMPTION_TOKEN]: {
    en: 'The redemption session is invalid. Please start again.',
    ar: 'جلسة الاستبدال غير صالحة. الرجاء البدء من جديد.',
  },
};
