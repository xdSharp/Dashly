import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import en from '../locales/en';
import ru from '../locales/ru';

// Define supported locales
export type Locale = 'en' | 'ru';

// Type for translation function
export type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

// Interface for i18n context
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFunction;
}

// Available translations
const translations: Record<Locale, Record<string, string>> = {
  en,
  ru
};

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  // Get initial locale from localStorage or browser
  const getInitialLocale = (): Locale => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ru')) {
      return savedLocale;
    }
    
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ru' ? 'ru' : 'en';
  };

  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  // Translation function
  const t: TranslateFunction = (key, params = {}) => {
    const translation = translations[locale][key] || key;
    
    // Replace parameters in the translation
    return translation.replace(/{(\w+)}/g, (_, param) => {
      return params[param]?.toString() || '';
    });
  };

  // Set locale and save to localStorage
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.setAttribute('lang', newLocale);
  };
  
  // Set html lang attribute on mount
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook for using translations
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
