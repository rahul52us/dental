import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';
import taTranslations from '../locales/ta.json';
import mrTranslations from '../locales/mr.json';
import teTranslations from '../locales/te.json';

// Get default language from localStorage or default to 'en'
const getDefaultLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('setLanguage') || 'en';
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      hi: {
        translation: hiTranslations
      },
      ta: {
        translation: taTranslations
      },
      mr: {
        translation: mrTranslations
      },
      te: {
        translation: teTranslations
      }
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
