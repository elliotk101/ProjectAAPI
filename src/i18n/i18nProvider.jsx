import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from './en.json';
import bn from './bn.json';
import zh from './zh.json';
import ko from './ko.json';
import ur from './ur.json';

const I18nContext = createContext();

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', dir: 'ltr' },
  { code: 'zh', label: 'Chinese', native: '中文', dir: 'ltr' },
  { code: 'ko', label: 'Korean', native: '한국어', dir: 'ltr' },
  { code: 'ur', label: 'Urdu', native: 'اردو', dir: 'rtl' },
];

const bundles = { en, bn, zh, ko, ur };

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('aapi-lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const langConfig = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const dir = langConfig.dir;

  useEffect(() => {
    try {
      localStorage.setItem('aapi-lang', lang);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang, dir]);

  const t = useCallback(
    (key) => {
      const bundle = bundles[lang] || bundles.en;
      // Support nested keys like "nav.home"
      const value = key.split('.').reduce((obj, k) => obj?.[k], bundle);
      if (value !== undefined) return value;
      // Fallback to English
      const fallback = key.split('.').reduce((obj, k) => obj?.[k], bundles.en);
      return fallback !== undefined ? fallback : key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
