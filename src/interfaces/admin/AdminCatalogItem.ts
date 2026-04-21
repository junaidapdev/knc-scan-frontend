import type { AdminCatalogStatus } from '@/constants/admin';

export interface AdminCatalogItem {
  id: string;
  code_prefix: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  image_url: string | null;
  estimated_value_sar: number;
  default_expiry_days: number;
  status: AdminCatalogStatus;
  created_at: string;
  updated_at: string;
}
