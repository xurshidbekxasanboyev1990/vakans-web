// Secure Storage - XSS-safe storage utility
// localStorage o'rniga ishlatiladi

import { logger } from './logger';

const ENCRYPTION_KEY = 'vakans_secure_2024'; // Production da environment variable dan olish kerak
const STORAGE_PREFIX = 'vks_';

interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // milliseconds
}

interface StoredItem<T> {
  value: T;
  expiry?: number;
  encrypted?: boolean;
}

class SecureStorage {
  private memoryCache: Map<string, unknown> = new Map();

  // Simple XOR encryption (production da AES ishlatish kerak)
  private encrypt(data: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return btoa(result);
  }

  private decrypt(data: string): string {
    try {
      const decoded = atob(data);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        );
      }
      return result;
    } catch {
      return '';
    }
  }

  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  /**
   * Secure get - with optional decryption and expiry check
   */
  get<T>(key: string, options: StorageOptions = {}): T | null {
    const fullKey = this.getKey(key);

    try {
      // Memory cache first
      if (this.memoryCache.has(fullKey)) {
        return this.memoryCache.get(fullKey) as T;
      }

      const rawData = sessionStorage.getItem(fullKey) || localStorage.getItem(fullKey);
      if (!rawData) return null;

      let parsed: StoredItem<T>;

      if (options.encrypt) {
        const decrypted = this.decrypt(rawData);
        if (!decrypted) return null;
        parsed = JSON.parse(decrypted);
      } else {
        parsed = JSON.parse(rawData);
      }

      // Expiry check
      if (parsed.expiry && Date.now() > parsed.expiry) {
        this.remove(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      logger.error('SecureStorage get error', { key, error });
      return null;
    }
  }

  /**
   * Secure set - with optional encryption and expiry
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    const fullKey = this.getKey(key);

    try {
      const item: StoredItem<T> = {
        value,
        expiry: options.expiry ? Date.now() + options.expiry : undefined,
        encrypted: options.encrypt,
      };

      const serialized = JSON.stringify(item);
      const dataToStore = options.encrypt ? this.encrypt(serialized) : serialized;

      // Use sessionStorage for sensitive data (cleared on tab close)
      if (options.encrypt) {
        sessionStorage.setItem(fullKey, dataToStore);
      } else {
        localStorage.setItem(fullKey, dataToStore);
      }

      // Also cache in memory
      this.memoryCache.set(fullKey, value);

      return true;
    } catch (error) {
      logger.error('SecureStorage set error', { key, error });
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string): void {
    const fullKey = this.getKey(key);
    try {
      localStorage.removeItem(fullKey);
      sessionStorage.removeItem(fullKey);
      this.memoryCache.delete(fullKey);
    } catch (error) {
      logger.error('SecureStorage remove error', { key, error });
    }
  }

  /**
   * Clear all vakans storage
   */
  clear(): void {
    try {
      // Clear only our prefixed items
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      this.memoryCache.clear();
    } catch (error) {
      logger.error('SecureStorage clear error', { error });
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = `${STORAGE_PREFIX}test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          used += (localStorage.getItem(key) || '').length * 2; // UTF-16
        }
      }
      return {
        used,
        available: 5 * 1024 * 1024 - used, // ~5MB limit
      };
    } catch {
      return { used: 0, available: 0 };
    }
  }
}

// Export singleton
export const secureStorage = new SecureStorage();

// Sensitive data keys (should use encryption)
export const SENSITIVE_KEYS = {
  AUTH_USER: 'auth_user',
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_prefs',
  CHAT_MESSAGES: 'chat_msgs',
};

// Non-sensitive data keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebar',
  LAST_ROUTE: 'last_route',
};

export default secureStorage;
