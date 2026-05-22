import { createContext, useContext, useEffect, useState } from 'react';
import de from '../locales/de.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const DICTS = { de, en, ar };
const RTL_LANGS = ['ar'];
const STORAGE_KEY = 'phd-match-lang';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'de';
    return localStorage.getItem(STORAGE_KEY) || 'de';
  });

  useEffect(() => {
    const isRtl = RTL_LANGS.includes(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = (next) => {
    if (DICTS[next]) setLangState(next);
  };

  /**
   * t('path.to.key', { var: 'value' })
   * Falls back to German if key missing in current lang
   */
  const t = (key, vars = {}) => {
    const lookup = (dict) => key.split('.').reduce((acc, k) => acc?.[k], dict);
    const val = lookup(DICTS[lang]) ?? lookup(DICTS.de) ?? key;

    // Return arrays/objects as-is so components can iterate
    if (typeof val !== 'string') return val;

    return val.replace(/\{\{(\w+)\}\}/g, (_, v) => vars[v] ?? `{{${v}}}`);
  };

  const isRtl = RTL_LANGS.includes(lang);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRtl, available: Object.keys(DICTS) }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
};

