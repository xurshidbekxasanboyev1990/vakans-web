import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { apiService } from '../lib/api';
import { sanitizeObject } from '../lib/sanitize';
import { registerSchema, loginSchema, profileUpdateSchema } from '../lib/validation';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  region: string;
  userType: 'worker' | 'employer' | 'admin';
  phone: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: Omit<UserProfile, 'id' | 'email'>
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const response = await apiService.getProfile();
          if (response.success && response.data?.profile) {
            setUser(response.data.profile);
          } else {
            // Token invalid, clear it
            apiService.clearTokens();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          apiService.clearTokens();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData: Omit<UserProfile, 'id' | 'email'>
  ) => {
    try {
      setLoading(true);

      // Validate input on client side
      const validationResult = registerSchema.safeParse({
        email,
        password,
        confirmPassword: password,
        ...userData,
      });

      if (!validationResult.success) {
        const error = validationResult.error.issues[0].message;
        toast.error(error);
        return { error: new Error(error) };
      }

      // Sanitize inputs before sending
      const sanitizedData = sanitizeObject({
        email,
        password,
        ...userData,
      });

      const response = await apiService.register(sanitizedData);

      if (!response.success) {
        toast.error(response.error || 'Ro\'yxatdan o\'tishda xatolik');
        return { error: new Error(response.error || 'Registration failed') };
      }

      if (response.data?.user) {
        setUser(response.data.user);
        // Store deviceId for multi-device support
        if (response.data.deviceId) {
          sessionStorage.setItem('deviceId', response.data.deviceId);
        }
        toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
      }

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Xatolik yuz berdi';
      toast.error(errorMessage);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('[AuthContext] signIn called with:', email);

      // Validate input on client side
      const validationResult = loginSchema.safeParse({ email, password });

      if (!validationResult.success) {
        const error = validationResult.error.issues[0].message;
        console.error('[AuthContext] Validation failed:', error);
        toast.error(error);
        return { error: new Error(error) };
      }

      console.log('[AuthContext] Calling apiService.login...');
      const response = await apiService.login(email, password);
      console.log('[AuthContext] API response:', response);

      if (!response.success) {
        console.error('[AuthContext] Login failed:', response.error);
        toast.error(response.error || 'Email yoki parol noto\'g\'ri');
        return { error: new Error(response.error || 'Login failed') };
      }

      if (response.data?.user) {
        console.log('[AuthContext] Setting user:', response.data.user);
        setUser(response.data.user);
        // Store deviceId for multi-device support
        if (response.data.deviceId) {
          sessionStorage.setItem('deviceId', response.data.deviceId);
        }
        toast.success('Xush kelibsiz!');
      } else {
        console.error('[AuthContext] No user in response:', response);
      }

      return { error: null };
    } catch (error) {
      console.error('Signin error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Xatolik yuz berdi';
      toast.error(errorMessage);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Get deviceId for multi-device support
      const deviceId = sessionStorage.getItem('deviceId');
      await apiService.logout(deviceId || undefined);
      setUser(null);
      // Remove deviceId from storage
      sessionStorage.removeItem('deviceId');
      toast.info('Tizimdan chiqdingiz');
    } catch (error) {
      console.error('Signout error:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return { error: new Error('No user found') };

      // Validate input
      const validationResult = profileUpdateSchema.safeParse(updates);

      if (!validationResult.success) {
        const error = validationResult.error.issues[0].message;
        toast.error(error);
        return { error: new Error(error) };
      }

      // Sanitize inputs
      const sanitizedUpdates = sanitizeObject(updates);

      const response = await apiService.updateProfile(sanitizedUpdates);

      if (!response.success) {
        toast.error(response.error || 'Profilni yangilashda xatolik');
        return { error: new Error(response.error || 'Update failed') };
      }

      if (response.data?.profile) {
        setUser(response.data.profile);
        toast.success('Profil yangilandi');
      }

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Xatolik yuz berdi';
      toast.error(errorMessage);
      return { error: error as Error };
    }
  };

  const isAuthenticated = () => {
    return apiService.isAuthenticated() && user !== null;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
