import type { Branch } from '@/interfaces/branch';

/**
 * Pick the localised branch name. Falls back to English when no Arabic
 * value is set, so older rows or partially-translated branches never
 * render an empty string.
 */
export function branchName(b: Branch, lang: 'en' | 'ar'): string {
  if (lang === 'ar' && b.name_ar && b.name_ar.trim().length > 0) {
    return b.name_ar;
  }
  return b.name;
}

/** Same fallback semantics as {@link branchName}, for the city field. */
export function branchCity(b: Branch, lang: 'en' | 'ar'): string {
  if (lang === 'ar' && b.city_ar && b.city_ar.trim().length > 0) {
    return b.city_ar;
  }
  return b.city;
}

/** Same fallback semantics, for the (optional) address field. */
export function branchAddress(b: Branch, lang: 'en' | 'ar'): string | null {
  if (lang === 'ar' && b.address_ar && b.address_ar.trim().length > 0) {
    return b.address_ar;
  }
  return b.address;
}
