import { createContext, useContext, useEffect, useState, useLayoutEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Resolved theme'ni olish funksiyasi
function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => 
    getResolvedTheme((localStorage.getItem(storageKey) as Theme) || defaultTheme)
  );

  // useLayoutEffect ishlatamiz - DOM o'zgarishlarini sinxron qiladi (flash'ni oldini oladi)
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    const newResolvedTheme = getResolvedTheme(theme);
    
    // Transition'ni vaqtincha o'chiramiz
    root.classList.add('theme-transition-disabled');
    
    // Theme classlarini almashtirish
    root.classList.remove('light', 'dark');
    root.classList.add(newResolvedTheme);
    setResolvedTheme(newResolvedTheme);
    
    // Keyingi frame'da transition'ni qaytaramiz
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-transition-disabled');
      });
    });
  }, [theme]);

  // System theme o'zgarganda kuzatish
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      setResolvedTheme(newTheme);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
