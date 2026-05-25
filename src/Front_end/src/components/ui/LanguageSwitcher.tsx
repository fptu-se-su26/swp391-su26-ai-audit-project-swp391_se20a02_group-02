import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useUIStore } from '@/store';
import type { Language } from '@/store';

// ====== LANGUAGE SWITCHER COMPONENT ======
// Beautiful dropdown language selector with flags

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'vi' as Language, name: 'Tiếng Việt', flag: '🇻🇳' },
];

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="text-2xl">{currentLang.flag}</span>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
          {currentLang.code.toUpperCase()}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="p-2">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    language === lang.code
                      ? 'bg-accent text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </div>
                  {language === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ====== LANGUAGE SWITCHER MINIMAL ======
export const LanguageSwitcherMinimal: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useUIStore();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <motion.button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        key={language}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-xl"
      >
        {currentLang.flag}
      </motion.span>
      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
        {currentLang.code}
      </span>
    </motion.button>
  );
};

// ====== LANGUAGE SWITCHER TOGGLE ======
export const LanguageSwitcherToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useUIStore();
  const isVietnamese = language === 'vi';

  const toggleLanguage = () => {
    setLanguage(isVietnamese ? 'en' : 'vi');
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 ${
        isVietnamese ? 'bg-red-500' : 'bg-blue-500'
      } ${className}`}
      whileTap={{ scale: 0.95 }}
    >
      {/* Sliding toggle */}
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center text-sm"
        initial={false}
        animate={{
          x: isVietnamese ? 32 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isVietnamese ? '🇻🇳' : '🇺🇸'}
      </motion.div>

      {/* Labels */}
      <div className="relative flex items-center justify-between h-full px-2 text-xs font-bold text-white">
        <span className={isVietnamese ? 'opacity-50' : 'opacity-100'}>EN</span>
        <span className={isVietnamese ? 'opacity-100' : 'opacity-50'}>VI</span>
      </div>
    </motion.button>
  );
};

export default LanguageSwitcher;
