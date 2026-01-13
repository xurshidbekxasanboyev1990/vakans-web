import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * 404 Not Found Page
 * Mavjud bo'lmagan sahifalar uchun ko'rsatiladi
 */
export function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Raqami */}
        <div className="relative">
          <h1 className="text-[150px] sm:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 text-[150px] sm:text-[200px] font-black text-blue-600/10 leading-none blur-xl select-none">
            404
          </div>
        </div>

        {/* Sarlavha */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mt-4 mb-2">
          {t('notFound') || 'Sahifa topilmadi'}
        </h2>

        {/* Tavsif */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
          {t('notFoundDescription') || 'Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki ko\'chirilgan.'}
        </p>

        {/* Tugmalar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              {t('backToHome') || 'Bosh sahifa'}
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('goBack') || 'Orqaga'}
          </Button>
        </div>

        {/* Qo'shimcha yordam */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('needHelp') || 'Yordam kerakmi?'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link 
              to="/" 
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              {t('searchJobs') || 'Ish qidirish'}
            </Link>
            <a 
              href="https://t.me/vakans_uz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Telegram: @vakans_uz
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
