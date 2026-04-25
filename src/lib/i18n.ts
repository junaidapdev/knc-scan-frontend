import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import {
  DEFAULT_LANGUAGE,
  I18N_NAMESPACES,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/constants/ui';
import enCommon from '@/locales/en/common.json';
import enCustomer from '@/locales/en/customer.json';
import arCommon from '@/locales/ar/common.json';
import arCustomer from '@/locales/ar/customer.json';

const RTL_LANGUAGES: readonly SupportedLanguage[] = ['ar'];

function applyHtmlDir(lang: string): void {
  const normalized = (lang.split('-')[0] ?? DEFAULT_LANGUAGE) as SupportedLanguage;
  const dir = RTL_LANGUAGES.includes(normalized) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', normalized);
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, customer: enCustomer },
      ar: { common: arCommon, customer: arCustomer },
    },
    ns: I18N_NAMESPACES as unknown as string[],
    defaultNS: 'common',
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      // Arabic is the brand default. Only honour an explicit user choice
      // (saved to localStorage by LanguageToggle); ignore navigator.language
      // so a first-time visitor with an English browser still lands in AR.
      order: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

applyHtmlDir(i18n.language);
i18n.on('languageChanged', applyHtmlDir);

export { i18n };
export { useTranslation } from 'react-i18next';
