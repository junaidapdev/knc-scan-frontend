import { type ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@/locales/en/common.json';
import enCustomer from '@/locales/en/customer.json';
import arCommon from '@/locales/ar/common.json';
import arCustomer from '@/locales/ar/customer.json';

/** Minimal i18n instance for component tests — no LanguageDetector. */
export const testI18n = i18n.createInstance();
void testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'customer'],
  defaultNS: 'common',
  resources: {
    en: { common: enCommon, customer: enCustomer },
    ar: { common: arCommon, customer: arCustomer },
  },
  interpolation: { escapeValue: false },
});

export function withI18n(node: ReactElement): ReactElement {
  return <I18nextProvider i18n={testI18n}>{node}</I18nextProvider>;
}
