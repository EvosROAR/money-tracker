import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import id from './locales/id.json';
import { SupportedLanguage } from '@/lib/constants';

const resources = {
  en: { translation: en },
  id: { translation: id },
} as const;

const getDeviceLanguage = (): SupportedLanguage => {
  try {
    const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'id';
    return deviceLocale === 'en' ? 'en' : 'id';
  } catch {
    return 'id';
  }
};

export const initI18n = (language?: SupportedLanguage): typeof i18n => {
  const lng = language ?? getDeviceLanguage();

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng,
      fallbackLng: 'id',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    });
  } else if (language) {
    void i18n.changeLanguage(language);
  }

  return i18n;
};

initI18n();

export { i18n };
