import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import vi from './vi.json';
import ja from './ja.json';
import ko from './ko.json';
import zh from './zh.json';
import fr from './fr.json';
import de from './de.json';
import es from './es.json';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

export type LangCode = 'en' | 'vi' | 'ja' | 'zh';

const LANGUAGE_KEY = 'language';

// Get persisted language from localStorage
const getStoredLanguage = (): LangCode => {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY) as LangCode;
    if (stored && ['en', 'vi', 'ja', 'ko', 'zh', 'fr', 'de', 'es'].includes(stored)) return stored;
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
      zh: { translation: zh },
      fr: { translation: fr },
      de: { translation: de },
      es: { translation: es },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi', 'ja', 'ko', 'zh', 'fr', 'de', 'es'],
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
