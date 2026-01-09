/**
 * VAKANS.UZ - Mobile App API Configuration
 * 
 * Bu faylni mobil ilovangizda (React Native, Flutter, etc.) ishlatishingiz mumkin
 */

// =============================================
// API CONFIGURATION
// =============================================

// Production serveringiz URL manzili
const API_CONFIG = {
  // Development (local)
  development: {
    baseUrl: 'http://localhost:54321/make-server-5b47a45d',
    timeout: 10000,
  },
  
  // Production (serverda)
  production: {
    baseUrl: 'https://api.vakans.uz',  // <-- Sizning domeningiz
    // Yoki: 'https://vakans.uz/api'
    timeout: 15000,
  }
};

// Hozirgi muhit
const ENV = 'production'; // 'development' yoki 'production'
const config = API_CONFIG[ENV];

// =============================================
// API SERVICE (React Native / JavaScript)
// =============================================

class VakansAPI {
  constructor() {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Token saqlash
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    // AsyncStorage ga saqlash (React Native)
    // await AsyncStorage.setItem('accessToken', accessToken);
    // await AsyncStorage.setItem('refreshToken', refreshToken);
  }

  // Asosiy request funksiyasi
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Auth token qo'shish
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // Token expired bo'lsa refresh qilish
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Qayta urinish
          return this.request(endpoint, options);
        }
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'So\'rov vaqti tugadi' };
      }
      return { success: false, error: 'Tarmoq xatosi' };
    }
  }

  // Token yangilash
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.accessToken) {
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // =============================================
  // AUTH METHODS
  // =============================================

  async login(phone, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async sendOTP(phone) {
    return this.request('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOTP(phone, code) {
    return this.request('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  }

  async logout() {
    const result = await this.request('/auth/logout', { method: 'POST' });
    this.accessToken = null;
    this.refreshToken = null;
    return result;
  }

  // =============================================
  // JOBS METHODS
  // =============================================

  async getJobs(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/jobs?${params}` : '/jobs';
    return this.request(endpoint);
  }

  async getJob(jobId) {
    return this.request(`/jobs/${jobId}`);
  }

  async createJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(jobId, jobData) {
    return this.request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(jobId) {
    return this.request(`/jobs/${jobId}`, { method: 'DELETE' });
  }

  // =============================================
  // APPLICATIONS METHODS
  // =============================================

  async applyForJob(jobId, coverLetter) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, coverLetter }),
    });
  }

  async getMyApplications() {
    return this.request('/applications/my');
  }

  async getJobApplications(jobId) {
    return this.request(`/jobs/${jobId}/applications`);
  }

  async updateApplicationStatus(applicationId, status) {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // =============================================
  // PROFILE METHODS
  // =============================================

  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(profileData) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // =============================================
  // SUPPORT METHODS
  // =============================================

  async sendSupportMessage(messageData) {
    return this.request('/support/message', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async requestPasswordRecovery(phone, email) {
    return this.request('/support/password-recovery', {
      method: 'POST',
      body: JSON.stringify({ phone, email }),
    });
  }
}

// Export
const api = new VakansAPI();
export default api;

// =============================================
// USAGE EXAMPLES
// =============================================

/*
// React Native da ishlatish:

import api from './MobileApiConfig';

// Login
const loginUser = async () => {
  const result = await api.login('+998901234567', 'password123');
  if (result.success) {
    api.setTokens(result.data.accessToken, result.data.refreshToken);
    // Navigate to home screen
  } else {
    Alert.alert('Xato', result.error);
  }
};

// Ishlarni olish
const fetchJobs = async () => {
  const result = await api.getJobs({ region: 'Toshkent' });
  if (result.success) {
    setJobs(result.data.jobs);
  }
};

// Ishga murojaat
const applyToJob = async (jobId) => {
  const result = await api.applyForJob(jobId, 'Men bu ishga murojaat qilmoqchiman');
  if (result.success) {
    Alert.alert('Muvaffaqiyat', 'Arizangiz yuborildi!');
  }
};
*/
