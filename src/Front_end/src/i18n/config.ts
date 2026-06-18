import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import vi from './vi.json';
import ja from './ja.json';
import ko from './ko.json';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
] as const;

export type LangCode = 'en' | 'vi' | 'ja' | 'ko';

const LANGUAGE_KEY = 'language';

// Get persisted language from localStorage
const getStoredLanguage = (): LangCode => {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY) as LangCode;
    if (stored && ['en', 'vi', 'ja', 'ko'].includes(stored)) return stored;
  } catch {}
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi', 'ja', 'ko'],
    interpolation: {
      escapeValue: false,
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
