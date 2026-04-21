import { useTranslation } from 'react-i18next';

import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/constants/ui';

export interface LanguageRadioGroupProps {
  label: string;
  value: SupportedLanguage;
  onChange: (next: SupportedLanguage) => void;
  className?: string;
}

/**
 * Two-option language picker used in the registration form (distinct from the
 * header LanguageToggle — this one is form-field-shaped and bound to RHF).
 */
export default function LanguageRadioGroup({
  label,
  value,
  onChange,
  className = '',
}: LanguageRadioGroupProps): JSX.Element {
  const { t } = useTranslation('common');

  return (
    <fieldset className={className}>
      <legend className="eyebrow text-obsidian/70">{label}</legend>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const selected = value === lang;
          const copy =
            lang === 'ar'
              ? t('language.switchToArabic')
              : t('language.switchToEnglish');
          return (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(lang)}
              className={[
                'h-12 rounded-md border-[1.5px] font-sans text-[14px]',
                'transition-colors focus:outline-none focus-visible:shadow-focus-yellow',
                selected
                  ? 'bg-obsidian text-yellow border-obsidian'
                  : 'bg-white text-obsidian border-obsidian/20 hover:border-obsidian',
              ].join(' ')}
            >
              {copy}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
