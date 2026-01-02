import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

// Backend API URL - only use if explicitly set
const API_URL = import.meta.env.VITE_API_URL;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'uz';
  });
  const [backendTranslations, setBackendTranslations] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);

  // Use local translations only - no backend API needed
  useEffect(() => {
    // Always use local translations
    setBackendTranslations(null);
    setLoading(false);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    // First try backend translations (flat key)
    if (backendTranslations && backendTranslations[key]) {
      return backendTranslations[key];
    }

    // Fallback to local translations
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[language];
    
    // Debug log
    if (!value) {
      console.error('[i18n] No translations found for language:', language, 'Available:', Object.keys(translations));
    }
    
    // Fallback to 'uz' if current language not found
    if (!value) {
      value = translations['uz'];
    }
    
    // If single key (no dots), try direct access first
    if (keys.length === 1 && value && typeof value === 'object' && key in value) {
      const result = value[key];
      return typeof result === 'string' ? result : key;
    }
    
    // Handle nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found, return the key itself
        console.warn(`[i18n] Translation key not found: ${key}, language: ${language}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
