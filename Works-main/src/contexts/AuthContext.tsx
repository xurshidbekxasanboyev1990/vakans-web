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
  signIn: (phone: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Avval sessionStorage'dan user'ni olishga harakat qilamiz (page refresh uchun)
    try {
      const savedUser = sessionStorage.getItem('current_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Cookie-based auth: check auth by fetching profile from server
  useEffect(() => {
    // Agar allaqachon tekshirilgan bo'lsa, qayta tekshirmaymiz
    if (authChecked) return;

    const initAuth = async () => {
      try {
        console.log('[AuthContext] Checking auth...');
        // With cookie-based auth, we check by making a request to the server
        const response = await apiService.getProfile();
        console.log('[AuthContext] getProfile response:', response);
        if (response.success && response.data?.profile) {
          console.log('[AuthContext] User logged in:', response.data.profile);
          setUser(response.data.profile);
          // SessionStorage'ga saqlaymiz (page refresh uchun)
          try {
            sessionStorage.setItem('current_user', JSON.stringify(response.data.profile));
          } catch (e) {
            // ignore
          }
        } else {
          // No valid session, user is not logged in
          // Lekin agar sessionStorage'da user bo'lsa, uni saqlaymiz (cookie muammosi bo'lishi mumkin)
          const savedUser = sessionStorage.getItem('current_user');
          if (!savedUser) {
            console.log('[AuthContext] No valid session');
            setUser(null);
          } else {
            console.log('[AuthContext] Using cached user from sessionStorage');
          }
        }
      } catch (error) {
        // Auth init failed - silent in production
        if (import.meta.env.DEV) {
          console.error('[AuthContext] Auth initialization error:', error);
        }
        // Xatolik bo'lsa ham sessionStorage'dagi user'ni saqlaymiz
      }
      setLoading(false);
      setAuthChecked(true);
    };

    initAuth();
  }, [authChecked]);

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
        // SessionStorage'ga saqlaymiz (page refresh va cookie muammolari uchun)
        try {
          sessionStorage.setItem('current_user', JSON.stringify(response.data.user));
        } catch (e) {
          // ignore
        }
        // Store deviceId for multi-device support
        if (response.data.deviceId) {
          sessionStorage.setItem('deviceId', response.data.deviceId);
        }
        toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
      }

      return { error: null };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Signup error:', error);
      }
      const errorMessage = error instanceof Error ? error.message : 'Xatolik yuz berdi';
      toast.error(errorMessage);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (phone: string, password: string) => {
    try {
      setLoading(true);

      // Validate input on client side
      const validationResult = loginSchema.safeParse({ phone, password });

      if (!validationResult.success) {
        const error = validationResult.error.issues[0].message;
        toast.error(error);
        return { error: new Error(error) };
      }

      const response = await apiService.login(phone, password);

      if (!response.success) {
        toast.error(response.error || 'Telefon yoki parol noto\'g\'ri');
        return { error: new Error(response.error || 'Login failed') };
      }

      if (response.data?.user) {
        setUser(response.data.user);
        // SessionStorage'ga saqlaymiz (page refresh va cookie muammolari uchun)
        try {
          sessionStorage.setItem('current_user', JSON.stringify(response.data.user));
        } catch (e) {
          // ignore
        }
        // Store deviceId for multi-device support
        if (response.data.deviceId) {
          sessionStorage.setItem('deviceId', response.data.deviceId);
        }
        toast.success('Xush kelibsiz!');
      }

      return { error: null };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Signin error:', error);
      }
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
      // Remove user and deviceId from storage
      sessionStorage.removeItem('current_user');
      sessionStorage.removeItem('deviceId');
      toast.info('Tizimdan chiqdingiz');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Signout error:', error);
      }
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
      if (import.meta.env.DEV) {
        console.error('Update profile error:', error);
      }
      const errorMessage = error instanceof Error ? error.message : 'Xatolik yuz berdi';
      toast.error(errorMessage);
      return { error: error as Error };
    }
  };

  // Cookie-based auth: user is authenticated if we have a user profile
  const isAuthenticated = () => {
    return user !== null;
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
