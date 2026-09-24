import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './en/common.json';
import arCommon from './ar/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  ar: {
    common: arCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    load: 'languageOnly',
    debug: import.meta.env.DEV,

    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'navigator'],
      lookupQuerystring: 'lng',
      caches: ['localStorage'],
    },

    defaultNS: 'common',

    interpolation: {
      escapeValue: false, 
    },
  });

// Handle RTL updates
const handleLanguageChange = (lng: string) => {
  const isRtl = i18n.dir(lng) === 'rtl';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};

// Initial setup
handleLanguageChange(i18n.language || 'en');

// On change
i18n.on('languageChanged', handleLanguageChange);

export default i18n;
