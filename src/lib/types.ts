// ===========================
// USER TYPES
// ===========================

export type UserRole = 'worker' | 'employer' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone: string;
  email: string;
  region: string;
  userType: UserRole;
  avatar?: string;
  blocked?: boolean;
  isAdmin?: boolean;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  createdAt?: string;
  updatedAt?: string;
  phoneVerified?: boolean;
  plainPassword?: string; // Admin uchun - faqat backendda saqlanadi
}

export interface UserProfile extends User {
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
}

// ===========================
// JOB TYPES
// ===========================

export type JobStatus = 'active' | 'paused' | 'closed' | 'draft' | 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'free' | 'pending' | 'paid';

export type EmploymentType = 
  | 'full-time' 
  | 'part-time' 
  | 'contract' 
  | 'freelance' 
  | 'internship'
  | 'temporary';

export type SalaryType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'negotiable';

export interface Job {
  id: string;
  title: string;
  description: string;
  salary?: number;
  salaryType?: SalaryType;
  paymentType?: SalaryType; // Alias for salaryType (used in filters)
  salaryMin?: number;
  salaryMax?: number;
  price?: string; // Formatted price display
  location: string;
  category: string;
  requirements?: string[];
  benefits?: string[];
  employmentType?: EmploymentType;
  status: JobStatus;
  employerId: string;
  employerName: string;
  employerPhone: string;
  employerRegion: string;
  imageUrl?: string;
  isVip?: boolean;
  featured?: boolean; // Alias for isVip (used in filters)
  isUrgent?: boolean; // Tezkor e'lon
  paymentStatus?: PaymentStatus; // To'lov holati
  paymentAmount?: number; // To'lov summasi
  viewCount?: number;
  applicationCount?: number;
  deadline?: string;
  startDate?: string;
  durationType?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface JobFormData {
  title: string;
  description: string;
  salary?: number;
  salaryType?: SalaryType;
  location: string;
  category: string;
  requirements?: string[];
  employmentType?: EmploymentType;
}

// ===========================
// APPLICATION TYPES
// ===========================

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  employerId: string;
  employerName: string;
  coverLetter?: string;
  resumeUrl?: string;
  message?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt?: string;
  reviewedAt?: string;
}

// ===========================
// CHAT/MESSAGE TYPES
// ===========================

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  jobId: string;
  jobTitle: string;
  participants: {
    id: string;
    name: string;
    userType: 'worker' | 'employer';
  }[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// API RESPONSE TYPES
// ===========================

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
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  deviceId?: string;
}

// ===========================
// FILTER TYPES
// ===========================

export interface JobFilters {
  search?: string;
  region?: string;
  category?: string;
  employmentType?: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  status?: JobStatus;
  sortBy?: 'createdAt' | 'salary' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

// ===========================
// FORM TYPES
// ===========================

export interface LoginFormData {
  phone: string;
  password: string;
}

export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  region: string;
  password: string;
  confirmPassword: string;
  userType: 'worker' | 'employer';
}

// ===========================
// NOTIFICATION TYPES
// ===========================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ===========================
// FAVORITES TYPES
// ===========================

export interface FavoriteJob {
  id: string;
  jobId: string;
  userId: string;
  job?: Job;
  createdAt: string;
}

// ===========================
// RATING TYPES
// ===========================

export interface Rating {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  toUserType: 'worker' | 'employer';
  jobId?: string;
  jobTitle?: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface UserRatingSummary {
  userId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ===========================
// JOB TEMPLATE TYPES
// ===========================

export interface JobTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  requirements?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: SalaryType;
  isDefault?: boolean;
  createdAt: string;
}

// ===========================
// JOB OFFER TYPES
// ===========================

export interface JobOffer {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  employerName: string;
  workerId: string;
  workerName: string;
  message: string;
  salary?: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

// ===========================
// CATEGORY TYPES
// ===========================

export interface JobCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  jobCount?: number;
  isActive: boolean;
  order: number;
  createdAt: string;
}
