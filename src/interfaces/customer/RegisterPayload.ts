import type { SupportedLanguage } from '@/constants/ui';

/** Body of POST /customers/register. */
export interface RegisterPayload {
  phone: string;
  name: string;
  birthday_month: number;
  birthday_day: number;
  preferred_branch_id: string;
  language: SupportedLanguage;
  consent_marketing: true;
  branch_scan_id: string;
  bill_amount: number;
}
