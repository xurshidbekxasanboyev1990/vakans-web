// Secure Logger - Production-safe logging utility
// console.log o'rniga ishlatiladi

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

class SecureLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private shouldLog(level: LogLevel): boolean {
    // Production da faqat error log qilinadi
    if (!isDevelopment && !isDebugEnabled) {
      return level === 'error';
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Development da console ga chiqarish
    if (isDevelopment || isDebugEnabled) {
      const prefix = `[${level.toUpperCase()}] ${entry.timestamp}:`;
      switch (level) {
        case 'debug':
          console.debug(prefix, message, data || '');
          break;
        case 'info':
          console.info(prefix, message, data || '');
          break;
        case 'warn':
          console.warn(prefix, message, data || '');
          break;
        case 'error':
          console.error(prefix, message, data || '');
          break;
      }
    }
  }

  // Sensitive data sanitization
  private sanitizeData(data: unknown): unknown {
    if (!data) return data;
    
    if (typeof data === 'string') {
      // Mask potential sensitive patterns
      return data
        .replace(/password['":\s]*['"]?[^'"}\s]+['"]?/gi, 'password: "[REDACTED]"')
        .replace(/token['":\s]*['"]?[A-Za-z0-9._-]+['"]?/gi, 'token: "[REDACTED]"')
        .replace(/\+998\d{9}/g, '+998*****')
        .replace(/secret['":\s]*['"]?[^'"}\s]+['"]?/gi, 'secret: "[REDACTED]"');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key') ||
          lowerKey.includes('auth')
        ) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeData(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    
    return data;
  }

  debug(message: string, data?: unknown): void {
    this.formatMessage('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.formatMessage('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.formatMessage('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.formatMessage('error', message, data);
  }

  // Get recent logs for debugging
  getRecentLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new SecureLogger();

// Export for compatibility
export default logger;
