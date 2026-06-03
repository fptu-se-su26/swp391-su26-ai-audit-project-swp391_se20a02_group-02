import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import vi from './vi.json';
import ja from './ja.json';
import ko from './ko.json';
import zh from './zh.json';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

export type LangCode = 'en' | 'vi' | 'ja' | 'ko' | 'zh';

const LANGUAGE_KEY = 'language';

// Get persisted language from localStorage
const getStoredLanguage = (): LangCode => {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY) as LangCode;
    if (stored && ['en', 'vi', 'ja', 'ko', 'zh'].includes(stored)) return stored;
  } catch {}
  return 'en';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      ja: { translation: ja },
      ko: { translation: ko },
      zh: { translation: zh },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi', 'ja', 'ko', 'zh'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_KEY,
      caches: ['localStorage'],
    },
  });

// Helper to change language and persist it
export const changeLanguage = (lang: LangCode) => {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {}
};

export default i18n;
