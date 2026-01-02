/**
 * Performance Optimization Utilities
 * Saytni tez ishlashi uchun yordamchi funksiyalar
 */

// ============================================
// DEBOUNCE - Ko'p chaqirilishni oldini olish
// ============================================
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// ============================================
// THROTTLE - Chaqirishlarni cheklash
// ============================================
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ============================================
// LAZY IMAGE LOADING
// ============================================
export function lazyLoadImage(
  element: HTMLImageElement,
  src: string,
  placeholder?: string
): void {
  if (placeholder) {
    element.src = placeholder;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          element.src = src;
          element.classList.add('loaded');
          observer.unobserve(element);
        }
      });
    },
    { rootMargin: '50px' }
  );

  observer.observe(element);
}

// ============================================
// LOCAL STORAGE CACHE
// ============================================
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const cacheStorage = {
  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    };
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (e) {
      // Storage full, clear old items
      this.clearExpired();
    }
  },

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const parsed: CacheItem<T> = JSON.parse(item);
      const now = Date.now();

      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(`cache_${key}`);
  },

  clearExpired(): void {
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (now - item.timestamp > item.ttl) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key!);
        }
      }
    }
  },
};

// ============================================
// PRELOAD RESOURCES
// ============================================
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

// ============================================
// VIRTUAL LIST HELPER
// ============================================
export function getVisibleRange(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);
  return { start, end };
}

// ============================================
// PERFORMANCE METRICS
// ============================================
export const performanceMetrics = {
  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  },

  measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof performance !== 'undefined') {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
        const entries = performance.getEntriesByName(name);
        return entries[entries.length - 1]?.duration || null;
      } catch {
        return null;
      }
    }
    return null;
  },

  getLoadTime(): number {
    if (typeof performance !== 'undefined' && performance.timing) {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    }
    return 0;
  },

  logMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics:');
      console.log(`  Load Time: ${this.getLoadTime()}ms`);
      
      if (typeof performance !== 'undefined') {
        const entries = performance.getEntriesByType('measure');
        entries.forEach((entry) => {
          console.log(`  ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        });
      }
    }
  },
};

// ============================================
// NETWORK STATUS
// ============================================
export function isSlowConnection(): boolean {
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    return conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g';
  }
  return false;
}

// ============================================
// REQUEST IDLE CALLBACK POLYFILL
// ============================================
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback
  return setTimeout(() => callback({
    didTimeout: false,
    timeRemaining: () => 50,
  }), 1) as unknown as number;
}

export function cancelIdleCallback(id: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}
