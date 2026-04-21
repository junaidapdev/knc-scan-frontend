import type { SupportedLanguage } from '@/constants/ui';

/** Customer summary returned by /visits/scan/lookup when exists=true. */
export interface ScanLookupProfile {
  name: string | null;
  current_stamps: number;
  language: SupportedLanguage;
  next_eligible_at: string | null;
}
