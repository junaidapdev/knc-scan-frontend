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
      className={`inline-flex items-center rounded-full border-hairline border-obsidian/10 bg-obsidian p-1 ${className}`}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = current === lang;
        const label =
          lang === 'ar'
            ? t('language.switchToArabic')
            : t('language.switchToEnglish');
        return (
          <button
            key={lang}
            type="button"
            onClick={() => handleChange(lang)}
            aria-pressed={active}
            className={[
              'px-3 h-7 rounded-full text-[11px] font-semibold uppercase tracking-[2px]',
              'transition-colors duration-150',
              active
                ? 'bg-yellow text-obsidian'
                : 'text-white/70 hover:text-white',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
