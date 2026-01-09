import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Hozirgi amaliy theme'ni aniqlash
    const currentTheme = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    if (currentTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  // Hozirgi amaliy theme'ni ko'rsatish uchun
  const displayTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 px-0"
      aria-label="Toggle theme"
    >
      {displayTheme === 'dark' ? (
        <Sun className="h-4 w-4 text-yellow-500" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
      )}
    </Button>
  );
}
