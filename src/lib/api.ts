import { sanitizeObject } from './sanitize';

// Backend API URL - production yoki development
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Demo mode - backend bo'lmasa local storage ishlatish
// Backend ishga tushganda false qiling
const DEMO_MODE = true;
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
  
  // Dastlabki demo foydalanuvchilarni yaratish
  const defaultUsers: DemoUser[] = [
    {
      id: 'admin-001',
      email: 'admin@vakans.uz',
      password: 'XOJISAID.13.13',
      firstName: 'XOJISAID',
      lastName: 'Admin',
      region: 'Toshkent shahri',
      userType: 'admin',
      isAdmin: true,
      phone: '+998996983806',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'worker-001',
      email: '998907654321@vakans.uz',
      password: 'worker123',
      firstName: 'Aziz',
      lastName: 'Toshmatov',
      region: 'Samarqand viloyati',
      userType: 'worker',
      phone: '+998907654321',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'employer-001',
      email: '998901234567@vakans.uz',
      password: 'employer123',
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
    // Load tokens from sessionStorage on initialization
    this.accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    this.refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
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
   * Refresh the access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.accessToken && data.refreshToken) {
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Make an authenticated API request with automatic token refresh
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${BACKEND_URL}${endpoint}`;
    
    // Add auth header if we have a token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // If token expired, try to refresh
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          // Retry the request with new token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        } else {
          // Refresh failed, clear tokens
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
      console.error('API request error:', error);
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

    // Real API
    const sanitizedData = sanitizeObject(userData);

    const response = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });

    // If registration successful, store tokens
    if (response.success && response.data?.accessToken) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<ApiResponse> {
    // Demo mode
    if (DEMO_MODE) {
      const users = getDemoUsers();
      
      // Email yoki telefon bilan qidirish
      const user = users.find(u => 
        (u.email === email || u.phone === email) && u.password === password
      );

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

    // Real API
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // If login successful, store tokens
    if (response.success && response.data?.accessToken) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

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

    const response = await this.request('/logout', {
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

    return await this.request('/profile', {
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

    return await this.request('/profile', {
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

    return await this.request('/profile', {
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
}

// Export singleton instance
export const apiService = new ApiService();
