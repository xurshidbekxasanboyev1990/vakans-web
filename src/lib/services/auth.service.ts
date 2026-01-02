/**
 * Authentication Service
 * Clean Architecture - Service Layer
 * 
 * Handles all authentication-related business logic
 */

import { apiService } from '../api';
import { sanitizeObject } from '../sanitize';
import { loginSchema, registerSchema } from '../validation';
import type { UserProfile } from '../../contexts/AuthContext';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;
  region: string;
  password: string;
  userType: 'worker' | 'employer';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export class AuthService {
  /**
   * User login
   * @param credentials - Login credentials (phone and password)
   * @returns Authentication response with tokens
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate input
      const validation = loginSchema.safeParse(credentials);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message,
        };
      }

      // Sanitize input to prevent XSS
      const sanitized = sanitizeObject(credentials);

      // Call API - use phone as email for now (backend expects email)
      const response = await apiService.login(sanitized.phone, sanitized.password);

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'Login failed',
        };
      }

      return {
        success: true,
        data: {
          user: response.data.user,
          accessToken: response.data.access_token || response.data.accessToken,
          refreshToken: response.data.refresh_token || response.data.refreshToken,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * User registration
   * @param userData - Registration data
   * @returns Authentication response with tokens
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate input
      const validation = registerSchema.safeParse({
        ...userData,
        email: userData.phone, // Use phone as email
        confirmPassword: userData.password,
      });

      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message,
        };
      }

      // Sanitize input
      const sanitized = sanitizeObject(userData);

      // Call API - add email field (use phone)
      const response = await apiService.register({
        email: sanitized.phone,
        password: sanitized.password,
        firstName: sanitized.firstName,
        lastName: sanitized.lastName,
        region: sanitized.region,
        userType: sanitized.userType,
        phone: sanitized.phone,
      });

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'Registration failed',
        };
      }

      return {
        success: true,
        data: {
          user: response.data.user,
          accessToken: response.data.access_token || response.data.accessToken,
          refreshToken: response.data.refresh_token || response.data.refreshToken,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * User logout
   * Clears tokens and session
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if exists
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens
      apiService.clearTokens();
    }
  }

  /**
   * Get current user profile
   * @returns User profile or null
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      if (!apiService.isAuthenticated()) {
        return null;
      }

      const response = await apiService.getProfile();

      if (!response.success || !response.data?.profile) {
        return null;
      }

      return response.data.profile;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  }
}

// Export singleton instance
export const authService = new AuthService();

