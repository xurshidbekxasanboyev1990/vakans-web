import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

// Backend API URL - only use if explicitly set and is absolute URL
// Relative '/api' paths will fail if backend is not running, so skip them
const API_URL = import.meta.env.VITE_API_URL;
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Only use API for translations if it's an absolute URL and not in demo mode
const shouldUseBackendTranslations = () => {
  // Skip in demo mode - use local translations
  if (DEMO_MODE) return false;
  
  // Skip if no API URL configured
  if (!API_URL) return false;
  
  // Skip if relative URL (backend may not be running)
  if (API_URL.startsWith('/')) return false;
  
  // Use API for absolute URLs (production)
  return API_URL.startsWith('http');
};

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

  // Fetch translations from backend only in production with absolute API URL
  useEffect(() => {
    // Skip API call if conditions not met
    if (!shouldUseBackendTranslations()) {
      setBackendTranslations(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const fetchTranslations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/i18n/${language}`, {
          signal: controller.signal
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setBackendTranslations(data.data);
          }
        } else if (response.status === 404) {
          // Route not found, use local translations silently
          console.warn(`i18n route not found for language: ${language}, using local translations`);
          setBackendTranslations(null);
        }
      } catch (error) {
        // Backend unavailable, silently use local translations
        if (error instanceof Error && error.name !== 'AbortError') {
          console.warn('i18n backend unavailable, using local translations');
        }
        setBackendTranslations(null);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchTranslations();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
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
