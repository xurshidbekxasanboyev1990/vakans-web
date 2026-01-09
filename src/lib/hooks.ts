import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from './api';
import { toast } from 'sonner';

// ===========================
// JOBS HOOKS
// ===========================

export interface Job {
  id: string;
  title: string;
  description: string;
  salary?: number;
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  category: string;
  employmentType: string;
  requirements?: string[];
  employerName: string;
  employerRegion: string;
  employerPhone: string;
  status: 'active' | 'paused' | 'closed';
  isVip?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface JobFilters {
  search?: string;
  region?: string;
  category?: string;
  employmentType?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Ishlar ro'yxatini olish
 */
export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('q', filters.search);
      if (filters?.region) params.append('region', filters.region);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.employmentType) params.append('workType', filters.employmentType);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const response = await apiService.request<{ jobs: Job[]; pagination: any }>(
        `/jobs?${params.toString()}`
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Ishlarni yuklashda xatolik');
      }
      
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Bitta ishni olish
 */
export function useJob(jobId: string) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await apiService.request<Job>(`/jobs/${jobId}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Ishni yuklashda xatolik');
      }
      
      return response.data;
    },
    enabled: !!jobId,
  });
}

/**
 * Yangi ish yaratish
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiService.request('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Ish yaratishda xatolik');
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Ish muvaffaqiyatli e\'lon qilindi!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Ishni yangilash
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Job> & { id: string }) => {
      const response = await apiService.request(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Ishni yangilashda xatolik');
      }
      
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
      toast.success('Ish muvaffaqiyatli yangilandi!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Ishni o'chirish
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiService.request(`/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Ishni o\'chirishda xatolik');
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Ish o\'chirildi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Ishga ariza yuborish
 */
export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, message }: { jobId: string; message?: string }) => {
      const response = await apiService.request('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId, coverLetter: message }),
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Ariza yuborishda xatolik');
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Ariza muvaffaqiyatli yuborildi!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ===========================
// APPLICATIONS HOOKS
// ===========================

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
}

/**
 * Arizalar ro'yxatini olish
 */
export function useApplications(jobId?: string) {
  return useQuery({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      const url = jobId ? `/applications/job/${jobId}` : '/applications';
      const response = await apiService.request<Application[]>(url);
      
      if (!response.success) {
        throw new Error(response.error || 'Arizalarni yuklashda xatolik');
      }
      
      return response.data || [];
    },
  });
}

/**
 * Ariza statusini yangilash (qabul qilish/rad etish)
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) => {
      const response = await apiService.request(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Ariza statusini yangilashda xatolik');
      }
      
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      const message = variables.status === 'accepted' ? 'Ariza qabul qilindi' : 'Ariza rad etildi';
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ===========================
// USER HOOKS
// ===========================

/**
 * User profilini olish
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiService.getProfile();
      
      if (!response.success) {
        throw new Error(response.error || 'Profilni yuklashda xatolik');
      }
      
      return response.data?.profile;
    },
    enabled: apiService.isAuthenticated(),
  });
}

// ===========================
// PERFORMANCE HOOKS
// ===========================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounce hook - input uchun
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * LocalStorage hook
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('useLocalStorage error:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Intersection Observer hook - lazy loading uchun
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Window size hook - responsive uchun
 */
export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return size;
}

/**
 * Online status hook
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Mobile detection hook
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const { width } = useWindowSize();
  return width > 0 && width < breakpoint;
}

/**
 * Previous value hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}
