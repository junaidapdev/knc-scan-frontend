import { useTranslation } from 'react-i18next';

export interface KayanLogoProps {
  /**
   * Force a specific locale's wordmark regardless of the i18n state. Used by
   * the admin portal, which is English-only in V1 and should always show the
   * English wordmark even if the user's browser is Arabic.
   */
  lang?: 'en' | 'ar';
  /** Rendered height in px. Width scales to preserve aspect. */
  height?: number;
  className?: string;
}

const LOGO_SRC: Record<'en' | 'ar', string> = {
  en: '/brand/kayan-logo-en.svg',
  ar: '/brand/kayan-logo-ar.svg',
};

/**
 * Kayan Sweets wordmark. Renders the English or Arabic SVG based on the
 * active i18n language (override with `lang`). Uses a plain <img> rather than
 * an inline <svg> so the browser can cache the asset across pages.
 */
export default function KayanLogo({
  lang,
  height = 28,
  className,
}: KayanLogoProps): JSX.Element {
  const { i18n } = useTranslation();
  const resolved: 'en' | 'ar' =
    lang ?? (i18n.language?.startsWith('ar') ? 'ar' : 'en');

  return (
    <img
      src={LOGO_SRC[resolved]}
      alt="Kayan Sweets"
      height={height}
      // width intentionally omitted — browser will scale to preserve aspect.
      style={{ height, width: 'auto' }}
      className={className}
      draggable={false}
    />
  );
}
