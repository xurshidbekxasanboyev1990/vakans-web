import { sanitizeObject } from './sanitize';

// Backend API URL - production yoki development
// Use relative path by default so the frontend is not tied to localhost
const BACKEND_URL = import.meta.env.VITE_API_URL || '/api';

// Demo mode - backend bo'lmasa local storage ishlatish
// Default is false for production deployments. Override with VITE_DEMO_MODE=true for local demo.
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' ? true : false;
const DEMO_USERS_KEY = 'demo_users';
const DEMO_CURRENT_USER_KEY = 'demo_current_user';

// Token storage keys (using sessionStorage for better security)
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface DemoUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  region: string;
  userType: 'worker' | 'employer' | 'admin';
  phone: string;
  isAdmin?: boolean;
  createdAt: string;
}

// Demo helper functions
function getDemoUsers(): DemoUser[] {
  const stored = localStorage.getItem(DEMO_USERS_KEY);
  
  // Versiya tekshiruvi - yangi admin qo'shilgan bo'lsa yangilash
  const DEMO_VERSION = '5.0'; // Demo users yangilandi
  const storedVersion = localStorage.getItem('demo_version');
  
  if (stored && storedVersion === DEMO_VERSION) {
    return JSON.parse(stored);
  }
  
  // ⚠️ XAVFSIZLIK: Demo parollar - production da bcrypt hash ishlatish kerak!
  // Bu faqat demo rejim uchun, production da o'chirish shart
  // Production da VITE_DEMO_MODE=false bo'ladi va bu kod ishlamaydi!
  const defaultUsers: DemoUser[] = [
    {
      id: 'admin-001',
      email: 'admin@vakans.uz',
      password: btoa('Admin@13.13'), // Base64 encoded (production da bcrypt!)
      firstName: 'Admin',
      lastName: 'XOJISAID',
      region: 'Toshkent shahri',
      userType: 'admin',
      isAdmin: true,
      phone: '+998996983806',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'worker-001',
      email: 'worker@demo.uz',
      password: btoa('Worker@123!'), // Kuchli parol talab qilinadi
      firstName: 'Aziz',
      lastName: 'Toshmatov',
      region: 'Samarqand viloyati',
      userType: 'worker',
      phone: '+998907654321',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'employer-001',
      email: 'employer@demo.uz',
      password: btoa('Employer@123!'), // Kuchli parol talab qilinadi
      firstName: 'Sardor',
      lastName: 'Karimov',
      region: 'Toshkent shahri',
      userType: 'employer',
      phone: '+998901234567',
      createdAt: new Date().toISOString(),
    },
  ];
  
  localStorage.setItem('demo_version', DEMO_VERSION);
  saveDemoUsers(defaultUsers);
  return defaultUsers;
}

function saveDemoUsers(users: DemoUser[]): void {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // By default we don't persist tokens in client storage for production.
    // The recommended approach is to use Secure, HttpOnly cookies set by the backend.
    // If you need local token storage for development, set VITE_USE_LOCAL_TOKENS=true.
    const useLocalTokens = import.meta.env.VITE_USE_LOCAL_TOKENS === 'true';
    if (useLocalTokens) {
      this.accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      this.refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    }

    // If demo mode is disabled, remove any demo data left in localStorage so nothing remains tied to localhost/dev machine.
    if (!DEMO_MODE) {
      try {
        localStorage.removeItem(DEMO_USERS_KEY);
        localStorage.removeItem(DEMO_CURRENT_USER_KEY);
        localStorage.removeItem('demo_version');
      } catch (e) {
        // ignore (localStorage might be unavailable in some contexts)
      }
    }
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    // Store tokens in sessionStorage only when explicitly enabled for local development.
    if (import.meta.env.VITE_USE_LOCAL_TOKENS === 'true') {
      try {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } catch (e) {
        // ignore storage errors
      }
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (import.meta.env.VITE_USE_LOCAL_TOKENS === 'true') {
      try {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Refresh the access token using refresh token (now cookie-based)
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      // Cookie-based auth - no need to send refreshToken in body
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Cookie bilan yuborish
      });

      const data = await response.json();

      if (data.success) {
        // Tokens are now set in cookies by backend
        return true;
      }

      return false;
    } catch (error) {
      // Token refresh failed - silent in production
      if (import.meta.env.DEV) {
        console.error('Token refresh error:', error);
      }
      return false;
    }
  }

  /**
   * Make an authenticated API request with automatic token refresh
   * Cookie-based auth - credentials: 'include' barcha so'rovlarda
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${BACKEND_URL}${endpoint}`;
    
    // Headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Legacy: agar local token bo'lsa, header ga qo'shamiz
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Cookie-based auth uchun muhim!
      });

      // If token expired, try to refresh (cookie-based)
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          // Retry the request - cookies are automatically updated
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        } else {
          // Refresh failed, user needs to login again
          this.clearTokens();
          return {
            success: false,
            error: 'Sessiya muddati tugagan. Iltimos, qayta kiring.',
          };
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Xatolik yuz berdi',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      // Network/API errors - silent in production
      if (import.meta.env.DEV) {
        console.error('API request error:', error);
      }
      return {
        success: false,
        error: 'Tarmoq xatosi. Iltimos, internetga ulanganingizni tekshiring.',
      };
    }
  }

  // ===========================
  // AUTH ENDPOINTS
  // ===========================

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    region: string;
    userType: 'worker' | 'employer' | 'admin';
    phone: string;
  }): Promise<ApiResponse> {
    // Demo mode - local storage da saqlash
    if (DEMO_MODE) {
      const users = getDemoUsers();
      
      // Telefon raqam mavjudligini tekshirish
      if (users.find(u => u.phone === userData.phone)) {
        return {
          success: false,
          error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan',
        };
      }

      const newUser: DemoUser = {
        id: generateId(),
        email: userData.email,
        password: userData.password, // Real loyihada hash qilish kerak!
        firstName: userData.firstName,
        lastName: userData.lastName,
        region: userData.region,
        userType: userData.userType,
        phone: userData.phone,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveDemoUsers(users);

      // Token yaratish
      const token = generateId();
      this.setTokens(token, token);

      // Current user saqlash
      const { password: _, ...userProfile } = newUser;
      localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(userProfile));

      return {
        success: true,
        data: {
          user: userProfile,
          accessToken: token,
          refreshToken: token,
        },
      };
    }

    // Real API - cookie-based auth
    const sanitizedData = sanitizeObject(userData);

    // To'g'ri endpoint: /auth/register
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone: sanitizedData.phone,
        password: sanitizedData.password,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        userType: sanitizedData.userType,
        email: sanitizedData.email,
        region: sanitizedData.region,
      }),
    });

    // Tokens are now set in cookies by backend, no need to store locally

    return response;
  }

  /**
   * Login user
   */
  async login(phone: string, password: string): Promise<ApiResponse> {
    // Demo mode
    if (DEMO_MODE) {
      const users = getDemoUsers();
      
      // Email yoki telefon bilan qidirish, parolni base64 decode qilib tekshirish
      const user = users.find(u => {
        const matchesCredentials = u.email === phone || u.phone === phone;
        // Demo parollar base64 encoded, decode qilib tekshirish
        let storedPassword: string;
        try {
          storedPassword = atob(u.password);
        } catch {
          storedPassword = u.password; // Eski format (plain text)
        }
        return matchesCredentials && storedPassword === password;
      });

      if (!user) {
        return {
          success: false,
          error: 'Telefon raqam yoki parol noto\'g\'ri',
        };
      }

      const token = generateId();
      this.setTokens(token, token);

      const { password: _, ...userProfile } = user;
      localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(userProfile));

      return {
        success: true,
        data: {
          user: userProfile,
          accessToken: token,
          refreshToken: token,
        },
      };
    }

    // Real API - cookie-based auth - To'g'ri endpoint: /auth/login
    // Backend phone field kutadi
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });

    // Tokens are now set in cookies by backend, no need to store locally

    return response;
  }

  /**
   * Logout user
   */
  async logout(deviceId?: string): Promise<ApiResponse> {
    // Demo mode
    if (DEMO_MODE) {
      this.clearTokens();
      localStorage.removeItem(DEMO_CURRENT_USER_KEY);
      return { success: true };
    }

    // To'g'ri endpoint: /auth/logout
    const response = await this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });

    // Clear tokens regardless of response
    this.clearTokens();

    return response;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse> {
    // Demo mode
    if (DEMO_MODE) {
      const stored = localStorage.getItem(DEMO_CURRENT_USER_KEY);
      if (stored) {
        return {
          success: true,
          data: { profile: JSON.parse(stored) },
        };
      }
      return { success: false, error: 'Foydalanuvchi topilmadi' };
    }

    // To'g'ri endpoint: /users/profile
    return await this.request('/users/profile', {
      method: 'GET',
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    region?: string;
    phone?: string;
  }): Promise<ApiResponse> {
    const sanitizedUpdates = sanitizeObject(updates);

    // Demo mode
    if (DEMO_MODE) {
      const users = getDemoUsers();
      const currentUser = localStorage.getItem(DEMO_CURRENT_USER_KEY);
      if (!currentUser) return { success: false, error: 'Foydalanuvchi topilmadi' };
      
      const userData = JSON.parse(currentUser);
      const updatedUser = { ...userData, ...sanitizedUpdates };
      
      // Update in users array
      const updatedUsers = users.map(u => u.id === userData.id ? { ...u, ...sanitizedUpdates } : u);
      saveDemoUsers(updatedUsers);
      
      // Update current user
      localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      return { success: true, data: { profile: updatedUser } };
    }

    // To'g'ri endpoint: /users/profile
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(sanitizedUpdates),
    });
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<ApiResponse> {
    if (DEMO_MODE) {
      const currentUser = localStorage.getItem(DEMO_CURRENT_USER_KEY);
      if (!currentUser) return { success: false, error: 'Foydalanuvchi topilmadi' };
      
      const userData = JSON.parse(currentUser);
      const users = getDemoUsers();
      const updatedUsers = users.filter(u => u.id !== userData.id);
      saveDemoUsers(updatedUsers);
      
      this.clearTokens();
      localStorage.removeItem(DEMO_CURRENT_USER_KEY);
      
      return { success: true };
    }

    // To'g'ri endpoint: /users/profile
    return await this.request('/users/profile', {
      method: 'DELETE',
    });
  }

  // ===========================
  // JOB ENDPOINTS
  // ===========================

  /**
   * Get all jobs
   */
  async getJobs(): Promise<ApiResponse> {
    return await this.request('/jobs', {
      method: 'GET',
    });
  }

  /**
   * Get single job by ID
   */
  async getJob(jobId: string): Promise<ApiResponse> {
    return await this.request(`/jobs/${jobId}`, {
      method: 'GET',
    });
  }

  /**
   * Post a new job (employer only)
   */
  async postJob(jobData: {
    title: string;
    description: string;
    salary?: number;
    location: string;
    category: string;
    requirements?: string[];
  }): Promise<ApiResponse> {
    const sanitizedData = sanitizeObject(jobData);

    return await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  }

  /**
   * Update a job
   */
  async updateJob(jobId: string, updates: {
    title?: string;
    description?: string;
    salary?: number;
    status?: string;
  }): Promise<ApiResponse> {
    const sanitizedUpdates = sanitizeObject(updates);

    return await this.request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(sanitizedUpdates),
    });
  }

  /**
   * Delete a job (employer only)
   */
  async deleteJob(jobId: string): Promise<ApiResponse> {
    return await this.request(`/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  // ===========================
  // APPLICATION ENDPOINTS
  // ===========================

  /**
   * Get all applications
   */
  async getApplications(): Promise<ApiResponse> {
    return await this.request('/applications', {
      method: 'GET',
    });
  }

  /**
   * Create application (apply to job)
   */
  async applyToJob(jobId: string, message?: string): Promise<ApiResponse> {
    return await this.request('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, message }),
    });
  }

  /**
   * Update application status
   */
  async updateApplication(applicationId: string, status: 'accepted' | 'rejected'): Promise<ApiResponse> {
    return await this.request(`/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Delete application
   */
  async deleteApplication(applicationId: string): Promise<ApiResponse> {
    return await this.request(`/applications/${applicationId}`, {
      method: 'DELETE',
    });
  }

  // ===========================
  // ADMIN ENDPOINTS
  // ===========================

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<ApiResponse> {
    if (DEMO_MODE) {
      const users = getDemoUsers();
      return { success: true, data: { users: users.map(({ password, ...u }) => u) } };
    }
    return await this.request('/admin/users', { method: 'GET' });
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    if (DEMO_MODE) {
      const users = getDemoUsers();
      const updatedUsers = users.filter(u => u.id !== userId);
      saveDemoUsers(updatedUsers);
      return { success: true };
    }
    return await this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  /**
   * Update user (admin only)
   */
  async updateUser(userId: string, updates: any): Promise<ApiResponse> {
    if (DEMO_MODE) {
      const users = getDemoUsers();
      const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
      saveDemoUsers(updatedUsers);
      return { success: true };
    }
    return await this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // ===========================
  // JOB INTERACTIONS
  // ===========================

  /**
   * Track job view
   */
  async trackJobView(jobId: string): Promise<ApiResponse> {
    if (DEMO_MODE) {
      // Local storage tracking for demo mode
      const viewedJobs = JSON.parse(sessionStorage.getItem('viewedJobs') || '[]');
      if (!viewedJobs.includes(jobId)) {
        viewedJobs.push(jobId);
        sessionStorage.setItem('viewedJobs', JSON.stringify(viewedJobs));
      }
      return { success: true };
    }
    return await this.request(`/jobs/${jobId}/view`, { method: 'POST' });
  }

  /**
   * React to a job (like/dislike)
   */
  async reactToJob(jobId: string, type: 'like' | 'dislike'): Promise<ApiResponse> {
    if (DEMO_MODE) {
      // Local storage for demo mode
      return { success: true, data: { action: 'added', type } };
    }
    return await this.request(`/jobs/${jobId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  /**
   * Get user's reaction to a job
   */
  async getJobReaction(jobId: string): Promise<ApiResponse> {
    if (DEMO_MODE) {
      return { success: true, data: { userReaction: null } };
    }
    return await this.request(`/jobs/${jobId}/reaction`, { method: 'GET' });
  }

  /**
   * Save/unsave a job
   */
  async toggleSaveJob(jobId: string): Promise<ApiResponse> {
    return await this.request(`/jobs/${jobId}/save`, { method: 'POST' });
  }

  /**
   * Get saved jobs
   */
  async getSavedJobs(): Promise<ApiResponse> {
    return await this.request('/jobs/saved', { method: 'GET' });
  }

  // ===========================
  // NOTIFICATIONS
  // ===========================

  /**
   * Get user notifications
   */
  async getNotifications(): Promise<ApiResponse> {
    return await this.request('/notifications', { method: 'GET' });
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<ApiResponse> {
    return await this.request(`/notifications/${notificationId}/read`, { method: 'PUT' });
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<ApiResponse> {
    return await this.request('/notifications/read-all', { method: 'PUT' });
  }
}

// Export singleton instance
export const apiService = new ApiService();
