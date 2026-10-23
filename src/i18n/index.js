import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './en.json'
import mlTranslations from './ml.json'
import hiTranslations from './hi.json'

const savedLanguage = localStorage.getItem('vocasight_language') || 'ml'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ml: { translation: mlTranslations },
      hi: { translation: hiTranslations },
      ta: { translation: enTranslations }, // Fallback to EN if missing
      te: { translation: enTranslations },
      kn: { translation: enTranslations },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
