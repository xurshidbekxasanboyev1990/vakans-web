// Input Validation Schemas using Zod
// Barcha input validatsiyasi shu yerda

import { z } from 'zod';

// ============================================
// COMMON VALIDATORS
// ============================================

// O'zbekiston telefon raqami
export const phoneSchema = z
  .string()
  .regex(/^\+998[0-9]{9}$/, "Telefon raqami noto'g'ri formatda. +998XXXXXXXXX")
  .min(13)
  .max(13);

// Kuchli parol
export const passwordSchema = z
  .string()
  .min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak')
  .max(128, 'Parol 128 ta belgidan oshmasligi kerak')
  .regex(/[A-Z]/, 'Parol kamida bitta katta harf bo\'lishi kerak')
  .regex(/[a-z]/, 'Parol kamida bitta kichik harf bo\'lishi kerak')
  .regex(/[0-9]/, 'Parol kamida bitta raqam bo\'lishi kerak')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Parol kamida bitta maxsus belgi bo\'lishi kerak')
  .refine(
    (password) => !['password', '12345678', 'qwerty123', 'admin123'].includes(password.toLowerCase()),
    'Bu parol juda oddiy'
  );

// Email
export const emailSchema = z
  .string()
  .email('Email noto\'g\'ri formatda')
  .max(255)
  .optional()
  .or(z.literal(''));

// Ism
export const nameSchema = z
  .string()
  .min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak')
  .max(50, 'Ism 50 ta belgidan oshmasligi kerak')
  .regex(/^[a-zA-Zа-яА-ЯёЁ\u0400-\u04FF\s'-]+$/, 'Ism faqat harflardan iborat bo\'lishi kerak');

// Viloyat
export const regionSchema = z.enum([
  'Toshkent shahri',
  'Toshkent viloyati',
  'Andijon viloyati',
  'Buxoro viloyati',
  "Farg'ona viloyati",
  'Jizzax viloyati',
  'Xorazm viloyati',
  'Namangan viloyati',
  'Navoiy viloyati',
  'Qashqadaryo viloyati',
  'Qoraqalpog\'iston Respublikasi',
  'Samarqand viloyati',
  'Sirdaryo viloyati',
  'Surxondaryo viloyati',
]);

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Parol kiritilishi shart'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  region: regionSchema,
  userType: z.enum(['worker', 'employer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parollar mos kelmadi',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Joriy parol kiritilishi shart'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Yangi parollar mos kelmadi',
  path: ['confirmPassword'],
});

// ============================================
// JOB SCHEMAS
// ============================================

export const jobSchema = z.object({
  title: z
    .string()
    .min(5, 'Sarlavha kamida 5 ta belgidan iborat bo\'lishi kerak')
    .max(200, 'Sarlavha 200 ta belgidan oshmasligi kerak'),
  description: z
    .string()
    .min(20, 'Tavsif kamida 20 ta belgidan iborat bo\'lishi kerak')
    .max(5000, 'Tavsif 5000 ta belgidan oshmasligi kerak'),
  category: z.string().min(1, 'Kategoriya tanlanishi shart'),
  region: regionSchema,
  address: z.string().max(255).optional(),
  salaryMin: z
    .number()
    .min(0, 'Ish haqi manfiy bo\'lishi mumkin emas')
    .max(100000000, 'Ish haqi juda katta')
    .optional(),
  salaryMax: z
    .number()
    .min(0, 'Ish haqi manfiy bo\'lishi mumkin emas')
    .max(100000000, 'Ish haqi juda katta')
    .optional(),
  workType: z.enum(['full-time', 'part-time', 'remote', 'hybrid', 'freelance']).optional(),
  requirements: z.string().max(3000).optional(),
  benefits: z.string().max(2000).optional(),
  deadline: z
    .string()
    .refine((date) => {
      if (!date) return true;
      const d = new Date(date);
      return d > new Date();
    }, 'Muddat kelajakda bo\'lishi kerak')
    .optional(),
}).refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  },
  {
    message: 'Minimal ish haqi maksimaldan katta bo\'lishi mumkin emas',
    path: ['salaryMin'],
  }
);

// ============================================
// APPLICATION SCHEMAS
// ============================================

export const applicationSchema = z.object({
  jobId: z.string().uuid('Noto\'g\'ri ish ID'),
  coverLetter: z
    .string()
    .min(10, 'Ariza matni kamida 10 ta belgidan iborat bo\'lishi kerak')
    .max(2000, 'Ariza matni 2000 ta belgidan oshmasligi kerak')
    .optional(),
  resume: z.string().url().optional(),
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const profileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema,
  region: regionSchema.optional(),
  bio: z.string().max(500, 'Bio 500 ta belgidan oshmasligi kerak').optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  experience: z.string().max(2000).optional(),
  education: z.string().max(1000).optional(),
  avatar: z.string().url().optional(),
});

// ============================================
// SEARCH & FILTER SCHEMAS
// ============================================

export const searchSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().optional(),
  region: regionSchema.optional(),
  minSalary: z.number().min(0).optional(),
  maxSalary: z.number().min(0).max(100000000).optional(),
  workType: z.enum(['full-time', 'part-time', 'remote', 'hybrid', 'freelance']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'salary', 'title', 'views']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// SUPPORT SCHEMAS
// ============================================

export const supportMessageSchema = z.object({
  requestType: z.enum(['general', 'password_reset', 'complaint', 'suggestion']),
  subject: z.string().max(200).optional(),
  message: z
    .string()
    .min(10, 'Xabar kamida 10 ta belgidan iborat bo\'lishi kerak')
    .max(2000, 'Xabar 2000 ta belgidan oshmasligi kerak'),
});

// ============================================
// VALIDATION HELPERS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type SupportMessageInput = z.infer<typeof supportMessageSchema>;

// Safe parse helper
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.issues.map((issue: z.ZodIssue) => issue.message);
  return { success: false, errors };
}

// Validate or throw
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
