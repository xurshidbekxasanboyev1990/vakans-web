import type { Language } from '../app/i18n/translations';

// ===========================
// O'ZBEKISTON VILOYATLARI (ko'p tillik)
// ===========================

export const REGIONS_I18N = {
  'toshkent_shahri': {
    uz: 'Toshkent shahri',
    uzk: 'Тошкент шаҳри',
    ru: 'г. Ташкент',
    en: 'Tashkent city'
  },
  'toshkent_viloyati': {
    uz: 'Toshkent viloyati',
    uzk: 'Тошкент вилояти',
    ru: 'Ташкентская область',
    en: 'Tashkent region'
  },
  'andijon': {
    uz: 'Andijon viloyati',
    uzk: 'Андижон вилояти',
    ru: 'Андижанская область',
    en: 'Andijan region'
  },
  'buxoro': {
    uz: 'Buxoro viloyati',
    uzk: 'Бухоро вилояти',
    ru: 'Бухарская область',
    en: 'Bukhara region'
  },
  'fargona': {
    uz: 'Farg\'ona viloyati',
    uzk: 'Фарғона вилояти',
    ru: 'Ферганская область',
    en: 'Fergana region'
  },
  'jizzax': {
    uz: 'Jizzax viloyati',
    uzk: 'Жиззах вилояти',
    ru: 'Джизакская область',
    en: 'Jizzakh region'
  },
  'qashqadaryo': {
    uz: 'Qashqadaryo viloyati',
    uzk: 'Қашқадарё вилояти',
    ru: 'Кашкадарьинская область',
    en: 'Kashkadarya region'
  },
  'navoiy': {
    uz: 'Navoiy viloyati',
    uzk: 'Навоий вилояти',
    ru: 'Навоийская область',
    en: 'Navoi region'
  },
  'namangan': {
    uz: 'Namangan viloyati',
    uzk: 'Наманган вилояти',
    ru: 'Наманганская область',
    en: 'Namangan region'
  },
  'samarqand': {
    uz: 'Samarqand viloyati',
    uzk: 'Самарқанд вилояти',
    ru: 'Самаркандская область',
    en: 'Samarkand region'
  },
  'sirdaryo': {
    uz: 'Sirdaryo viloyati',
    uzk: 'Сирдарё вилояти',
    ru: 'Сырдарьинская область',
    en: 'Syrdarya region'
  },
  'surxondaryo': {
    uz: 'Surxondaryo viloyati',
    uzk: 'Сурхондарё вилояти',
    ru: 'Сурхандарьинская область',
    en: 'Surkhandarya region'
  },
  'xorazm': {
    uz: 'Xorazm viloyati',
    uzk: 'Хоразм вилояти',
    ru: 'Хорезмская область',
    en: 'Khorezm region'
  },
  'qoraqalpogiston': {
    uz: 'Qoraqalpog\'iston Respublikasi',
    uzk: 'Қорақалпоғистон Республикаси',
    ru: 'Республика Каракалпакстан',
    en: 'Republic of Karakalpakstan'
  },
} as const;

export type RegionKey = keyof typeof REGIONS_I18N;

// Legacy uchun
export const REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Andijon viloyati',
  'Buxoro viloyati',
  'Farg\'ona viloyati',
  'Jizzax viloyati',
  'Qashqadaryo viloyati',
  'Navoiy viloyati',
  'Namangan viloyati',
  'Samarqand viloyati',
  'Sirdaryo viloyati',
  'Surxondaryo viloyati',
  'Xorazm viloyati',
  'Qoraqalpog\'iston Respublikasi',
] as const;

export type Region = typeof REGIONS[number];

// Viloyatlarni tilga qarab olish
export function getRegions(lang: Language = 'uz'): { value: string; label: string }[] {
  return Object.entries(REGIONS_I18N).map(([key, labels]) => ({
    value: labels.uz, // Value sifatida o'zbekcha saqlanadi (DB da)
    label: labels[lang]
  }));
}

// ===========================
// ISH KATEGORIYALARI (ko'p tillik)
// ===========================

export const JOB_CATEGORIES_I18N = {
  'it': {
    uz: 'IT va Dasturlash',
    uzk: 'IT ва Дастурлаш',
    ru: 'IT и Программирование',
    en: 'IT & Programming'
  },
  'marketing': {
    uz: 'Marketing va Reklama',
    uzk: 'Маркетинг ва Реклама',
    ru: 'Маркетинг и Реклама',
    en: 'Marketing & Advertising'
  },
  'sales': {
    uz: 'Savdo',
    uzk: 'Савдо',
    ru: 'Продажи',
    en: 'Sales'
  },
  'finance': {
    uz: 'Moliya va Buxgalteriya',
    uzk: 'Молия ва Бухгалтерия',
    ru: 'Финансы и Бухгалтерия',
    en: 'Finance & Accounting'
  },
  'education': {
    uz: 'Ta\'lim',
    uzk: 'Таълим',
    ru: 'Образование',
    en: 'Education'
  },
  'healthcare': {
    uz: 'Sog\'liqni saqlash',
    uzk: 'Соғлиқни сақлаш',
    ru: 'Здравоохранение',
    en: 'Healthcare'
  },
  'construction': {
    uz: 'Qurilish',
    uzk: 'Қурилиш',
    ru: 'Строительство',
    en: 'Construction'
  },
  'transport': {
    uz: 'Transport va Logistika',
    uzk: 'Транспорт ва Логистика',
    ru: 'Транспорт и Логистика',
    en: 'Transport & Logistics'
  },
  'hospitality': {
    uz: 'Mehmonxona va Restoran',
    uzk: 'Меҳмонхона ва Ресторан',
    ru: 'Гостиничный бизнес и Рестораны',
    en: 'Hospitality & Restaurants'
  },
  'manufacturing': {
    uz: 'Ishlab chiqarish',
    uzk: 'Ишлаб чиқариш',
    ru: 'Производство',
    en: 'Manufacturing'
  },
  'agriculture': {
    uz: 'Qishloq xo\'jaligi',
    uzk: 'Қишлоқ хўжалиги',
    ru: 'Сельское хозяйство',
    en: 'Agriculture'
  },
  'retail': {
    uz: 'Chakana savdo',
    uzk: 'Чакана савдо',
    ru: 'Розничная торговля',
    en: 'Retail'
  },
  'services': {
    uz: 'Xizmatlar',
    uzk: 'Хизматлар',
    ru: 'Услуги',
    en: 'Services'
  },
  'other': {
    uz: 'Boshqa',
    uzk: 'Бошқа',
    ru: 'Другое',
    en: 'Other'
  },
} as const;

// Legacy uchun
export const JOB_CATEGORIES = [
  { value: 'it', label: 'IT va Dasturlash' },
  { value: 'marketing', label: 'Marketing va Reklama' },
  { value: 'sales', label: 'Savdo' },
  { value: 'finance', label: 'Moliya va Buxgalteriya' },
  { value: 'education', label: 'Ta\'lim' },
  { value: 'healthcare', label: 'Sog\'liqni saqlash' },
  { value: 'construction', label: 'Qurilish' },
  { value: 'transport', label: 'Transport va Logistika' },
  { value: 'hospitality', label: 'Mehmonxona va Restoran' },
  { value: 'manufacturing', label: 'Ishlab chiqarish' },
  { value: 'agriculture', label: 'Qishloq xo\'jaligi' },
  { value: 'retail', label: 'Chakana savdo' },
  { value: 'services', label: 'Xizmatlar' },
  { value: 'other', label: 'Boshqa' },
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number]['value'];

// Kategoriyalarni tilga qarab olish
export function getJobCategories(lang: Language = 'uz'): { value: string; label: string }[] {
  return Object.entries(JOB_CATEGORIES_I18N).map(([key, labels]) => ({
    value: key,
    label: labels[lang]
  }));
}

// ===========================
// ISH TURLARI (ko'p tillik)
// ===========================

export const EMPLOYMENT_TYPES_I18N = {
  'full-time': {
    uz: 'To\'liq ish kuni',
    uzk: 'Тўлиқ иш куни',
    ru: 'Полный рабочий день',
    en: 'Full-time'
  },
  'part-time': {
    uz: 'Yarim ish kuni',
    uzk: 'Ярим иш куни',
    ru: 'Неполный рабочий день',
    en: 'Part-time'
  },
  'contract': {
    uz: 'Shartnoma asosida',
    uzk: 'Шартнома асосида',
    ru: 'По контракту',
    en: 'Contract'
  },
  'freelance': {
    uz: 'Frilanser',
    uzk: 'Фрилансер',
    ru: 'Фриланс',
    en: 'Freelance'
  },
  'internship': {
    uz: 'Amaliyot',
    uzk: 'Амалиёт',
    ru: 'Стажировка',
    en: 'Internship'
  },
  'temporary': {
    uz: 'Vaqtinchalik',
    uzk: 'Вақтинчалик',
    ru: 'Временная работа',
    en: 'Temporary'
  },
} as const;

// Legacy uchun
export const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'To\'liq ish kuni' },
  { value: 'part-time', label: 'Yarim ish kuni' },
  { value: 'contract', label: 'Shartnoma asosida' },
  { value: 'freelance', label: 'Frilanser' },
  { value: 'internship', label: 'Amaliyot' },
  { value: 'temporary', label: 'Vaqtinchalik' },
] as const;

export type EmploymentTypeValue = typeof EMPLOYMENT_TYPES[number]['value'];

// Ish turlarini tilga qarab olish
export function getEmploymentTypes(lang: Language = 'uz'): { value: string; label: string }[] {
  return Object.entries(EMPLOYMENT_TYPES_I18N).map(([key, labels]) => ({
    value: key,
    label: labels[lang]
  }));
}

// ===========================
// MAOSH TURLARI
// ===========================

export const SALARY_TYPES = [
  { value: 'hourly', label: 'Soatlik' },
  { value: 'daily', label: 'Kunlik' },
  { value: 'weekly', label: 'Haftalik' },
  { value: 'monthly', label: 'Oylik' },
  { value: 'yearly', label: 'Yillik' },
  { value: 'negotiable', label: 'Kelishiladi' },
] as const;

// ===========================
// ARIZA HOLATLARI
// ===========================

export const APPLICATION_STATUSES = [
  { value: 'pending', label: 'Kutilmoqda', color: 'yellow' },
  { value: 'accepted', label: 'Qabul qilindi', color: 'green' },
  { value: 'rejected', label: 'Rad etildi', color: 'red' },
  { value: 'withdrawn', label: 'Bekor qilindi', color: 'gray' },
] as const;

// ===========================
// ISH E'LON HOLATLARI
// ===========================

export const JOB_STATUSES = [
  { value: 'active', label: 'Faol', color: 'green' },
  { value: 'paused', label: 'To\'xtatilgan', color: 'yellow' },
  { value: 'closed', label: 'Yopilgan', color: 'red' },
  { value: 'draft', label: 'Qoralama', color: 'gray' },
] as const;

// ===========================
// VALIDATSIYA KONSTANTALARI
// ===========================

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_REGEX: /^\+998[0-9]{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  JOB_TITLE_MIN: 5,
  JOB_TITLE_MAX: 100,
  JOB_DESCRIPTION_MIN: 20,
  JOB_DESCRIPTION_MAX: 5000,
  COVER_LETTER_MIN: 50,
  COVER_LETTER_MAX: 2000,
} as const;

// ===========================
// API KONSTANTALARI
// ===========================

export const API = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MS: 60000,
  TOKEN_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
} as const;

// ===========================
// UI KONSTANTALARI
// ===========================

export const UI = {
  TOAST_DURATION: 4000,
  DEBOUNCE_DELAY: 300,
  SKELETON_ITEMS: 6,
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_RESUME_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// ===========================
// ENVIRONMENT FLAGS
// ===========================

export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;
