import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/constants/ui';

export interface LanguageToggleProps {
  className?: string;
}

/**
 * Minimal pill toggle between EN / AR. Uses the design system: obsidian
 * background with the active language rendered in yellow.
 */
export default function LanguageToggle({
  className = '',
}: LanguageToggleProps): JSX.Element {
  const { i18n, t } = useTranslation('common');
  const current = (i18n.language.split('-')[0] as SupportedLanguage) ?? 'ar';

  const handleChange = (lang: SupportedLanguage): void => {
    if (lang !== current) void i18n.changeLanguage(lang);
  };

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={`inline-flex items-center rounded-full bg-obsidian p-0.5 ${className}`}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = current === lang;
        // Short script-codes — universal and language-agnostic.
        const shortLabel = lang === 'ar' ? 'ع' : 'EN';
        const ariaLabel =
          lang === 'ar'
            ? t('language.switchToArabic')
            : t('language.switchToEnglish');
        return (
          <button
            key={lang}
            type="button"
            onClick={() => handleChange(lang)}
            aria-pressed={active}
            aria-label={ariaLabel}
            className={[
              'inline-flex items-center justify-center rounded-full font-bold leading-none',
              'transition-colors duration-150 focus:outline-none focus-visible:shadow-focus-yellow',
              active
                ? 'bg-yellow text-obsidian'
                : 'text-white/65 hover:text-white',
              lang === 'ar' ? 'font-arabic' : 'font-sans',
            ].join(' ')}
            style={{
              minWidth: 28,
              height: 28,
              padding: '0 10px',
              fontSize: lang === 'ar' ? 15 : 11,
              letterSpacing: lang === 'ar' ? 0 : 1.5,
            }}
          >
            {shortLabel}
          </button>
        );
      })}
    </div>
  );
}
