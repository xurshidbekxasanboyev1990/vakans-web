import { z } from 'zod';

// ===========================
// USER SCHEMAS
// ===========================

// 🔐 Kuchli parol talablari (backend bilan sinxron)
const passwordSchema = z.string()
  .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
  .max(128, "Parol juda uzun")
  .regex(/[A-Z]/, "Parol kamida bitta katta harf bo'lishi kerak")
  .regex(/[a-z]/, "Parol kamida bitta kichik harf bo'lishi kerak")
  .regex(/[0-9]/, "Parol kamida bitta raqam bo'lishi kerak")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Parol kamida bitta maxsus belgi bo'lishi kerak (!@#$%^&*)")
  .refine(
    (password) => !['password', '12345678', 'qwerty123', 'admin123'].includes(password.toLowerCase()),
    "Bu parol juda oddiy, boshqasini tanlang"
  );

export const registerSchema = z.object({
  // Email ixtiyoriy - telefon asosiy identifikator
  email: z.string().optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string()
    .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(50, "Ism 50 ta belgidan oshmasligi kerak")
    .regex(/^[a-zA-Zа-яА-ЯёЁ\s'-]+$/, "Ism faqat harflardan iborat bo'lishi kerak"),
  lastName: z.string()
    .min(2, "Familiya kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(50, "Familiya 50 ta belgidan oshmasligi kerak"),
  region: z.string().min(2, "Region tanlanishi kerak"),
  userType: z.enum(["worker", "employer", "admin"], {
    message: "Foydalanuvchi turi noto'g'ri"
  }),
  phone: z.string()
    .regex(/^\+998[0-9]{9}$/, "Telefon raqam noto'g'ri formatda (+998XXXXXXXXX)"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parollar mos kelmaydi",
  path: ["confirmPassword"],
});

// Login uchun telefon
export const loginSchema = z.object({
  phone: z.string()
    .regex(/^\+998[0-9]{9}$/, "Telefon raqam noto'g'ri formatda (+998XXXXXXXXX)"),
  password: z.string().min(1, "Parol kiritilishi kerak"),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  region: z.string().min(2).optional(),
  phone: z.string().regex(/^\+998[0-9]{9}$/).optional(),
});

// ===========================
// JOB SCHEMAS
// ===========================

export const jobSchema = z.object({
  title: z.string()
    .min(5, "Ish nomi kamida 5 ta belgidan iborat bo'lishi kerak")
    .max(100, "Ish nomi 100 ta belgidan oshmasligi kerak"),
  description: z.string()
    .min(20, "Tavsif kamida 20 ta belgidan iborat bo'lishi kerak")
    .max(2000, "Tavsif 2000 ta belgidan oshmasligi kerak"),
  salary: z.number()
    .positive("Maosh musbat son bo'lishi kerak")
    .optional(),
  location: z.string().min(2, "Joylashuv ko'rsatilishi kerak"),
  category: z.string().min(2, "Kategoriya tanlanishi kerak"),
  requirements: z.array(z.string()).optional(),
  employmentType: z.enum([
    "full-time",
    "part-time",
    "contract",
    "freelance",
    "internship"
  ]).optional(),
});

// ===========================
// APPLICATION SCHEMAS
// ===========================

export const applicationSchema = z.object({
  jobId: z.string(),
  coverLetter: z.string()
    .min(50, "Qo'shimcha ma'lumot kamida 50 ta belgidan iborat bo'lishi kerak")
    .max(1000, "Qo'shimcha ma'lumot 1000 ta belgidan oshmasligi kerak")
    .optional(),
  resumeUrl: z.string().url("Resume URL noto'g'ri formatda").optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
