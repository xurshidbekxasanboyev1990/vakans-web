import { Languages, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useLanguage } from './LanguageContext';
import { LANGUAGES } from './translations';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (langCode: typeof language) => {
    // Save to localStorage BEFORE setLanguage to ensure it persists before reload
    localStorage.setItem('app-language', langCode);
    setLanguage(langCode);
    // Force page reload to apply translations everywhere
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none border border-gray-200 dark:border-gray-700">
        <Languages className="h-4 w-4 text-primary" />
        <span className="text-lg">{LANGUAGES.find(l => l.code === language)?.flag}</span>
        <span className="hidden sm:inline text-gray-700 dark:text-gray-300 font-medium">
          {LANGUAGES.find(l => l.code === language)?.name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer flex items-center justify-between ${language === lang.code ? 'bg-primary/10 text-primary font-medium' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
            {language === lang.code && <Check className="w-4 h-4 text-green-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
