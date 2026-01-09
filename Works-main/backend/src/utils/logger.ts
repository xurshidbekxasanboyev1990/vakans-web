// Secure Logger for Backend - Production-safe logging
// console.log o'rniga ishlatiladi

const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const isProduction = NODE_ENV === 'production';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  requestId?: string;
}

class SecureBackendLogger {
  private currentLevel: number;

  constructor() {
    this.currentLevel = LOG_LEVELS[LOG_LEVEL as LogLevel] ?? LOG_LEVELS.info;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.currentLevel;
  }

  // Sensitive data sanitization
  private sanitizeData(data: unknown): unknown {
    if (!data) return data;

    if (typeof data === 'string') {
      return data
        .replace(/password['":\s]*['"]?[^'"}\s,]+['"]?/gi, 'password:"[REDACTED]"')
        .replace(/token['":\s]*['"]?[A-Za-z0-9._-]{20,}['"]?/gi, 'token:"[REDACTED]"')
        .replace(/secret['":\s]*['"]?[^'"}\s,]+['"]?/gi, 'secret:"[REDACTED]"')
        .replace(/\+998\d{9}/g, '+998*****')
        .replace(/bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
        .replace(/postgresql:\/\/[^@]+@/gi, 'postgresql://[REDACTED]@')
        .replace(/redis:\/\/:[^@]+@/gi, 'redis://:[REDACTED]@');
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item));
      }

      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key') ||
          lowerKey.includes('auth') ||
          lowerKey.includes('cookie') ||
          lowerKey.includes('session') ||
          lowerKey === 'authorization'
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

  private formatOutput(entry: LogEntry): string {
    const prefix = entry.requestId ? `[${entry.requestId}]` : '';
    
    if (isProduction) {
      // JSON format for production (easier to parse in log aggregators)
      return JSON.stringify({
        ...entry,
        data: this.sanitizeData(entry.data),
      });
    }

    // Human-readable format for development
    const dataStr = entry.data 
      ? ` ${JSON.stringify(this.sanitizeData(entry.data))}` 
      : '';
    return `${entry.timestamp} [${entry.level.toUpperCase()}]${prefix} ${entry.message}${dataStr}`;
  }

  private log(level: LogLevel, message: string, data?: unknown, requestId?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      requestId,
    };

    const output = this.formatOutput(entry);

    switch (level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }

  debug(message: string, data?: unknown, requestId?: string): void {
    this.log('debug', message, data, requestId);
  }

  info(message: string, data?: unknown, requestId?: string): void {
    this.log('info', message, data, requestId);
  }

  warn(message: string, data?: unknown, requestId?: string): void {
    this.log('warn', message, data, requestId);
  }

  error(message: string, data?: unknown, requestId?: string): void {
    this.log('error', message, data, requestId);
  }

  // Express middleware for request logging
  requestLogger() {
    return (req: { method: string; path: string; ip: string }, _res: unknown, next: () => void) => {
      const requestId = Math.random().toString(36).substring(2, 10);
      this.info(`${req.method} ${req.path}`, { ip: req.ip }, requestId);
      next();
    };
  }
}

// Export singleton
export const logger = new SecureBackendLogger();
export default logger;
