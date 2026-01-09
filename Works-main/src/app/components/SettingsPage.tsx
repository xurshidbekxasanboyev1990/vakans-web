import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ArrowLeft, Globe, Moon, Sun, MessageCircle, Phone, ExternalLink, Info, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

interface SettingsPageProps {
  userType: 'worker' | 'employer';
}

export function SettingsPage({ userType }: SettingsPageProps) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const handleLanguageChange = (langCode: typeof language) => {
    setLanguage(langCode);
    localStorage.setItem('app-language', langCode);
    window.location.reload();
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('vakans-theme', newTheme);
    setIsDark(!isDark);
  };

  const goBack = () => {
    navigate(userType === 'employer' ? '/employer' : '/worker');
  };

  const supportInfo = {
    telegram: '@vakans_support',
    phone: '+998 90 123 45 67',
    workHours: '9:00 - 18:00 (Dush-Jum)'
  };

  return (
    <div className="min-h-screen bg-[#dae1e7] dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goBack}
              className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('appSettings') || 'Ilova sozlamalari'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Language */}
        <Card className="border border-gray-300 dark:border-gray-700 shadow-md bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              <Globe className="w-5 h-5 text-purple-500" />
              {t('language')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">{t('selectLanguage') || 'Tilni tanlang'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${language === lang.code 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{lang.name}</p>
                    {language === lang.code && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t('selected') || 'Tanlangan'}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="border border-gray-300 dark:border-gray-700 shadow-md bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              {isDark ? <Moon className="w-5 h-5 text-amber-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
              {t('theme')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">{t('selectTheme') || 'Mavzuni tanlang'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => !isDark || toggleTheme()}
                className={`
                  flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                  ${!isDark 
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Sun className="w-6 h-6 text-amber-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{t('lightMode') || 'Yorug\''}</p>
                  {!isDark && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {t('active') || 'Faol'}
                    </p>
                  )}
                </div>
              </button>
              <button
                onClick={() => isDark || toggleTheme()}
                className={`
                  flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                  ${isDark 
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Moon className="w-6 h-6 text-indigo-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{t('darkMode') || 'Qorong\'u'}</p>
                  {isDark && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {t('active') || 'Faol'}
                    </p>
                  )}
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border border-gray-300 dark:border-gray-700 shadow-md bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageCircle className="w-5 h-5 text-pink-500" />
              {t('support')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">{t('supportDesc') || 'Yordam kerakmi?'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href={`https://t.me/${supportInfo.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all border border-blue-100 dark:border-blue-800"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Telegram</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">{supportInfo.telegram}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
            
            <a 
              href={`tel:${supportInfo.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all border border-green-100 dark:border-green-800"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-md">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{t('callUs') || 'Qo\'ng\'iroq qilish'}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{supportInfo.phone}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
              {t('workHours') || 'Ish vaqti'}: {supportInfo.workHours}
            </p>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border border-gray-300 dark:border-gray-700 shadow-md bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              <Info className="w-5 h-5 text-cyan-500" />
              {t('aboutUs') || 'Biz haqimizda'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Vakans.uz</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('aboutVakans') || 'Ish va ishchilar platformasi'}
                </p>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Versiya 1.0.0 • © 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
