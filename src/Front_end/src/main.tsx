import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import i18n from './i18n/config';
import './styles/globals.css';
import './styles/theme.scss';
import { useAuthStore } from './store';

// ====== INITIALIZE APP ======
// Initialize theme from localStorage (before React renders to avoid flash)
const initTheme = () => {
  try {
    // Check zustand persisted prefs first
    const stored = localStorage.getItem('luxeway_ui_prefs');
    if (stored) {
      const prefs = JSON.parse(stored);
      if (prefs.state?.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  } catch (error) {
    console.warn('Failed to parse theme preferences:', error);
  }
};

// Initialize language from localStorage (i18n key = 'language')
// Use the statically imported i18n instance — avoids mixed static/dynamic import warning
const initLanguage = () => {
  try {
    const lang = localStorage.getItem('language');
    if (lang && ['en', 'vi', 'ja'].includes(lang)) {
      i18n.changeLanguage(lang);
    }
  } catch (error) {
    console.warn('Failed to init language:', error);
  }
};

// Initialize authentication
const initAuth = async () => {
  const { initAuth } = useAuthStore.getState();
  await initAuth();
};

// Run initializations
initTheme();
initLanguage();
initAuth();


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
