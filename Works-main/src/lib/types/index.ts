// Type Definitions - TypeScript types for the application
// any tiplarni kamaytirish uchun

// ============================================
// USER TYPES
// ============================================

export type UserType = 'worker' | 'employer' | 'admin';

export interface User {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  phone: string;
  region: string;
  userType: UserType;
  isAdmin?: boolean;
  isBlocked?: boolean;
  avatar?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DemoUser extends User {
  password: string; // Base64 encoded
}

// ============================================
// JOB TYPES
// ============================================

export type JobStatus = 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type WorkType = 'full-time' | 'part-time' | 'remote' | 'hybrid' | 'freelance';

export interface Job {
  id: string;
  title: string;
  description: string;
  employerId: string;
  employerName: string;
  employerPhone?: string;
  categoryId?: string;
  category?: string;
  region: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  workType?: WorkType;
  requirements?: string;
  benefits?: string;
  deadline?: string;
  status: JobStatus;
  approvalStatus?: ApprovalStatus;
  isVip?: boolean;
  featured?: boolean;
  viewCount?: number;
  applicationsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface JobFilters {
  q?: string;
  category?: string;
  region?: string;
  minSalary?: number;
  maxSalary?: number;
  workType?: WorkType;
  status?: JobStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// APPLICATION TYPES
// ============================================

export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  workerId: string;
  workerName?: string;
  workerPhone?: string;
  employerId?: string;
  coverLetter?: string;
  resume?: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'application' | 'job' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// SUPPORT TYPES
// ============================================

export type SupportRequestType = 'general' | 'password_reset' | 'complaint' | 'suggestion';
export type SupportStatus = 'new' | 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface SupportMessage {
  id: string;
  userId?: string;
  userPhone?: string;
  userName?: string;
  requestType: SupportRequestType;
  subject?: string;
  message: string;
  status: SupportStatus;
  adminReply?: string;
  newPassword?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// CHAT TYPES
// ============================================

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  region: string;
  userType: UserType;
}

export interface JobFormData {
  title: string;
  description: string;
  category: string;
  region: string;
  address?: string;
  salaryMin?: number;
  salaryMax?: number;
  workType?: WorkType;
  requirements?: string;
  benefits?: string;
  deadline?: string;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  pendingJobs: number;
  pendingSupport: number;
  activeUsers: number;
  newUsersToday: number;
  newJobsToday: number;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Type guard helpers
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'firstName' in obj &&
    'lastName' in obj &&
    'userType' in obj
  );
}

export function isJob(obj: unknown): obj is Job {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'employerId' in obj
  );
}

export function isApplication(obj: unknown): obj is Application {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'jobId' in obj &&
    'workerId' in obj
  );
}
