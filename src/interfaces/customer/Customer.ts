import type { SupportedLanguage } from '@/constants/ui';

/** Customer profile returned by GET /customers/me. */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  current_stamps: number;
  last_scan_at: string | null;
  total_visits: number;
  language?: SupportedLanguage;
  next_eligible_at?: string | null;
}
