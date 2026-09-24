import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './en/common.json';
import arCommon from './ar/common.json';
import enDashboard from './en/dashboard.json';
import arDashboard from './ar/dashboard.json';
import enPatients from './en/patients.json';
import arPatients from './ar/patients.json';
import enPatientDetail from './en/patientDetail.json';
import arPatientDetail from './ar/patientDetail.json';
import enCarePlan from './en/carePlan.json';
import arCarePlan from './ar/carePlan.json';
import enPrograms from './en/programs.json';
import arPrograms from './ar/programs.json';
import enReferrals from './en/referrals.json';
import arReferrals from './ar/referrals.json';
import enKpis from './en/kpis.json';
import arKpis from './ar/kpis.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    patients: enPatients,
    patientDetail: enPatientDetail,
    carePlan: enCarePlan,
    programs: enPrograms,
    referrals: enReferrals,
    kpis: enKpis,
  },
  ar: {
    common: arCommon,
    dashboard: arDashboard,
    patients: arPatients,
    patientDetail: arPatientDetail,
    carePlan: arCarePlan,
    programs: arPrograms,
    referrals: arReferrals,
    kpis: arKpis,
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
