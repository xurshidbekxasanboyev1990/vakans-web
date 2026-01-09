import { z } from 'zod';

// Phone validation for Uzbekistan
export const phoneSchema = z.string()
  .regex(/^\+998[0-9]{9}$/, 'Telefon raqam formati: +998XXXXXXXXX');

// User schemas
export const registerSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
  firstName: z.string().min(2, 'Ism kamida 2 ta belgi').max(100),
  lastName: z.string().max(100).optional(),
  userType: z.enum(['worker', 'employer']),
  email: z.string().email('Email formati noto\'g\'ri').optional(),
  region: z.string().max(100).optional()
});

export const loginSchema = z.object({
  phone: z.string().min(1, 'Telefon raqam yoki email kiritilmagan'), // Can be phone or email
  password: z.string().min(1, 'Parol kiritilmagan')
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(1000).optional(),
  region: z.string().max(100).optional(),
  skills: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  education: z.string().max(500).optional(),
  languages: z.array(z.string()).optional(),
  companyName: z.string().max(255).optional(),
  companyDescription: z.string().max(2000).optional(),
  website: z.string().url().optional()
});

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(2, 'Sarlavha kamida 2 ta belgi').max(255),
  description: z.string().min(2, 'Tavsif kamida 2 ta belgi').max(5000),
  // Accept either UUID or a category name/value; route resolves to category_id.
  categoryId: z.string().max(255).optional(),
  requirements: z.array(z.string()).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryType: z.enum(['hourly', 'daily', 'monthly', 'fixed']).default('monthly'),
  currency: z.string().default('UZS'),
  location: z.string().max(255).optional(),
  region: z.string().max(100).default('Toshkent shahri'),
  address: z.string().max(500).optional(),
  workType: z.enum(['full-time', 'part-time', 'remote', 'contract', 'temporary']).default('full-time'),
  experienceRequired: z.string().max(50).optional(),
  educationRequired: z.string().max(100).optional(),
  languagesRequired: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  // For job posts, don't hard-fail on phone formatting.
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.string().email().optional(),
  isUrgent: z.boolean().default(false),
  deadline: z.string().optional()
});

// Allow updating job fields (partial) + status (moderation/visibility)
// Note: createJobSchema intentionally omits status (set by backend moderation flow)
export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['pending', 'active', 'paused', 'rejected', 'closed', 'expired']).optional()
});

// Application schemas
export const createApplicationSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().max(2000).optional()
});

export const updateApplicationSchema = z.object({
  status: z.enum(['viewed', 'accepted', 'rejected', 'withdrawn']),
  employerNotes: z.string().max(1000).optional(),
  rejectionReason: z.string().max(500).optional()
});

// Admin schemas
export const adminLoginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1),
  pin: z.string().length(4).optional()
});

export const blockUserSchema = z.object({
  reason: z.string().max(500).optional()
});

export const approveJobSchema = z.object({
  featured: z.boolean().default(false)
});

export const rejectJobSchema = z.object({
  reason: z.string().min(10, 'Sabab kamida 10 ta belgi').max(500)
});

// Support schemas
export const supportMessageSchema = z.object({
  subject: z.string().max(255).optional(),
  message: z.string().min(10, 'Xabar kamida 10 ta belgi').max(2000)
});

export const supportReplySchema = z.object({
  reply: z.string().min(1).max(2000)
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

// Search schema
export const searchJobsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  workType: z.enum(['full-time', 'part-time', 'remote', 'contract', 'temporary']).optional(),
  sortBy: z.enum(['created_at', 'salary_min', 'views_count']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type SearchJobsInput = z.infer<typeof searchJobsSchema>;
