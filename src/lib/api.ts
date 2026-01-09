import { sanitizeObject } from './sanitize';

// Backend API URL - production server
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://77.237.239.235/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
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

      const accessToken = data?.data?.accessToken ?? data?.accessToken;
      const refreshToken = data?.data?.refreshToken ?? data?.refreshToken;

      if (data?.success && accessToken && refreshToken) {
        this.setTokens(accessToken, refreshToken);
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

      let data: any;
      try {
        data = await response.json();
      } catch {
        const text = await response.text().catch(() => '');
        data = { success: false, error: text || 'Xatolik yuz berdi' };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || 'Xatolik yuz berdi',
          message: data?.message,
          details: data?.details,
        };
      }

      // Backend already returns {success, data} format
      // Just return it as-is
      return data;
    } catch (error) {
      console.error('API request error:', error);
      console.error('Request URL:', url);
      console.error('Request options:', options);
      return {
        success: false,
        error: `Tarmoq xatosi: ${error instanceof Error ? error.message : 'Noma\'lum xato'}. URL: ${url}`,
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
    const sanitizedData = sanitizeObject(userData);

    const response = await this.request('/auth/register', {
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
  async login(phone: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
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

    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(sanitizedUpdates),
    });
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<ApiResponse> {
    return await this.request('/users/account', {
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
    categoryId?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryType?: string;
    currency?: string;
    location?: string;
    region?: string;
    address?: string | null;
    workType?: string;
    experienceRequired?: string | null;
    educationRequired?: string | null;
    languagesRequired?: string[];
    requirements?: string[];
    benefits?: string[];
    contactPhone?: string;
    contactEmail?: string | null;
    isUrgent?: boolean;
    deadline?: string | null;
  }): Promise<ApiResponse> {
    const sanitizedData = sanitizeObject(jobData);

    return await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  }

  /**
   * Get current employer's posted jobs
   */
  async getMyPostedJobs(): Promise<ApiResponse> {
    return await this.request('/jobs/my/posted', {
      method: 'GET',
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

  /**
   * Get all categories
   */
  async getCategories(): Promise<ApiResponse> {
    return await this.request('/categories', {
      method: 'GET',
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
      // Backend expects `coverLetter`
      body: JSON.stringify({ jobId, coverLetter: message }),
    });
  }

  /**
   * Update application status
   */
  async updateApplication(
    applicationId: string,
    status: 'accepted' | 'rejected' | 'withdrawn' | 'viewed',
    options?: { employerNotes?: string; rejectionReason?: string }
  ): Promise<ApiResponse> {
    return await this.request(`/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...options }),
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
    return await this.request('/admin/users', { method: 'GET' });
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    return await this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  /**
   * Update user (admin only)
   */
  async updateUser(userId: string, updates: any): Promise<ApiResponse> {
    return await this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // ===========================
  // ADMIN EXTRA ENDPOINTS
  // ===========================

  async getAdminStats(): Promise<ApiResponse> {
    return await this.request('/admin/stats', { method: 'GET' });
  }

  async getAdminJobs(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return await this.request(`/admin/jobs${suffix}`, { method: 'GET' });
  }

  async approveAdminJob(jobId: string, featured?: boolean): Promise<ApiResponse> {
    return await this.request(`/admin/jobs/${jobId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ featured: !!featured }),
    });
  }

  async rejectAdminJob(jobId: string, reason: string): Promise<ApiResponse> {
    return await this.request(`/admin/jobs/${jobId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async toggleAdminJobFeatured(jobId: string): Promise<ApiResponse> {
    return await this.request(`/admin/jobs/${jobId}/feature`, {
      method: 'PUT',
    });
  }

  async toggleAdminUserBlock(userId: string): Promise<ApiResponse> {
    return await this.request(`/admin/users/${userId}/block`, {
      method: 'PUT',
    });
  }

  async getAdminApplications(params?: { page?: number; limit?: number }): Promise<ApiResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return await this.request(`/admin/applications${suffix}`, { method: 'GET' });
  }
}

// Export singleton instance
export const apiService = new ApiService();
