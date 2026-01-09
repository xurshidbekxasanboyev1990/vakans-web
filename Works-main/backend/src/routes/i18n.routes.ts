import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Translations data (same as frontend)
const translations = {
  uz: {
    appName: 'Vakans.uz',
    welcome: 'Xush kelibsiz',
    loading: 'Yuklanmoqda...',
    login: 'Kirish',
    register: 'Ro\'yxatdan o\'tish',
    logout: 'Chiqish',
    email: 'Email',
    password: 'Parol',
    phone: 'Telefon',
    firstName: 'Ism',
    lastName: 'Familiya',
    region: 'Hudud',
    worker: 'Ishchi',
    employer: 'Ish beruvchi',
  },
  ru: {
    appName: 'Vakans.uz',
    welcome: 'Добро пожаловать',
    loading: 'Загрузка...',
    login: 'Войти',
    register: 'Регистрация',
    logout: 'Выйти',
    email: 'Email',
    password: 'Пароль',
    phone: 'Телефон',
    firstName: 'Имя',
    lastName: 'Фамилия',
    region: 'Регион',
    worker: 'Работник',
    employer: 'Работодатель',
  },
  en: {
    appName: 'Vakans.uz',
    welcome: 'Welcome',
    loading: 'Loading...',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    phone: 'Phone',
    firstName: 'First Name',
    lastName: 'Last Name',
    region: 'Region',
    worker: 'Worker',
    employer: 'Employer',
  }
};

/**
 * GET /api/i18n/:lang
 * Tarjimalar olish
 */
router.get('/:lang', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    
    // Supported languages
    const supportedLangs = ['uz', 'uzk', 'ru', 'en'];
    
    if (!supportedLangs.includes(lang)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }
    
    // For uzk, use uz translations
    const translationLang = lang === 'uzk' ? 'uz' : lang;
    const data = translations[translationLang as keyof typeof translations] || translations.uz;
    
    res.json({
      success: true,
      data,
      language: lang
    });
    
  } catch (error) {
    logger.error('i18n error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load translations'
    });
  }
});

export default router;
