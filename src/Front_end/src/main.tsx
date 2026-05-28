import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/config';
import './styles/globals.css';
import './styles/theme.scss';
import { useAuthStore, useUIStore } from './store';

// ====== INITIALIZE APP ======
// Initialize theme from localStorage
const initTheme = () => {
  const stored = localStorage.getItem('luxeway_ui_prefs');
  if (stored) {
    try {
      const prefs = JSON.parse(stored);
      if (prefs.state?.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.warn('Failed to parse theme preferences:', error);
    }
  }
};

// Initialize authentication
const initAuth = async () => {
  const { initAuth } = useAuthStore.getState();
  await initAuth();
};

// Run initializations
initTheme();
initAuth();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
