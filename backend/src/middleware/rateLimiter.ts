import { Request, Response, NextFunction } from 'express';
import { incrementRateLimit, getRateLimit } from '../config/redis';

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  keyPrefix?: string;
}

export function rateLimiter(options: RateLimitOptions = {}) {
  const {
    windowMs = 60000, // 1 minute
    max = 100,
    message = 'Juda ko\'p so\'rov. Iltimos, biroz kuting.',
    keyPrefix = 'rl'
  } = options;

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `${keyPrefix}:${ip}`;

      const count = await incrementRateLimit(key, windowSeconds);

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
      res.setHeader('X-RateLimit-Reset', Date.now() + windowMs);

      if (count > max) {
        res.status(429).json({
          success: false,
          error: message,
          retryAfter: windowSeconds
        });
        return;
      }

      next();
    } catch (error) {
      // If Redis fails, allow the request
      console.error('Rate limiter error:', error);
      next();
    }
  };
}

// Specific rate limiters
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for testing
  message: 'Ko\'p urinish. 15 daqiqadan keyin qayta urinib ko\'ring.',
  keyPrefix: 'auth'
});

export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'API limit oshib ketdi',
  keyPrefix: 'api'
});

export const uploadRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Upload limiti tugadi',
  keyPrefix: 'upload'
});
