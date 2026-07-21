import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import i18n from './i18n/config';
import './styles/globals.css';
import './styles/theme.scss';
import { useAuthStore } from './store';

// ====== INITIALIZE APP ======

const initTheme = () => {
  try {
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
    console.warn('[LuxeWay] Failed to parse theme preferences:', error);
  }
};

const initLanguage = () => {
  try {
    // Primary: Zustand persist store (most reliable)
    const stored = localStorage.getItem('luxeway_ui_prefs');
    let lang: string | null = null;
    if (stored) {
      const prefs = JSON.parse(stored);
      lang = prefs.state?.language || null;
    }
    // Fallback: direct localStorage key
    if (!lang) {
      lang = localStorage.getItem('language');
    }
    if (lang && ['en', 'vi', 'ja', 'ko', 'zh', 'fr', 'de', 'es'].includes(lang)) {
      i18n.changeLanguage(lang);
      // Also keep direct key in sync for API headers
      localStorage.setItem('language', lang);
    }
  } catch (error) {
    console.warn('[LuxeWay] Failed to init language:', error);
  }
};

const initAuth = async () => {
  try {
    const { initAuth: storeInitAuth } = useAuthStore.getState();
    await storeInitAuth();
  } catch (err) {
    console.warn('[LuxeWay] initAuth failed silently:', err);
  }
};

// Run synchronous inits
initTheme();
initLanguage();

// Fire-and-forget auth init — do NOT await, render immediately
// The store's isInitialized flag controls any auth-gated UI
initAuth();

// Mount React — wrapped in try/catch to surface fatal render errors
try {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  console.error('[LuxeWay] FATAL: root.render() threw:', err);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#f59e0b;font-family:sans-serif;flex-direction:column;gap:16px;padding:32px;text-align:center">
      <div style="font-size:48px">⚠️</div>
      <h1 style="font-size:24px;font-weight:bold">LuxeWay failed to start</h1>
      <pre style="background:#1e293b;padding:16px;border-radius:8px;font-size:12px;color:#94a3b8;max-width:600px;overflow:auto;text-align:left">${err}</pre>
      <p style="color:#64748b;font-size:14px">Open DevTools (F12) for full error details.</p>
    </div>`;
  }
}
