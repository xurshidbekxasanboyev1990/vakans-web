import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthRequest } from './auth';

// CSRF Token settings
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * CSRF Token middleware
 * Sets CSRF token in cookie and validates on state-changing requests
 */
export function csrfProtection(req: AuthRequest, res: Response, next: NextFunction): void {
  // Skip CSRF for non-browser requests (check for JSON content type)
  const contentType = req.headers['content-type'];
  const isApiRequest = contentType?.includes('application/json');
  
  // Skip for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    // Generate token for GET requests so client can use it
    if (!req.cookies[CSRF_COOKIE_NAME]) {
      const token = generateCsrfToken();
      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Needs to be readable by JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    return next();
  }

  // For state-changing requests, validate CSRF token
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_TOKEN_HEADER];

  // Skip CSRF validation in development if explicitly disabled
  if (process.env.CSRF_DISABLED === 'true' && process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Allow requests without cookies (API-only clients)
  // This is a trade-off: we rely on SameSite and CORS for protection
  if (!cookieToken && isApiRequest) {
    return next();
  }

  // Validate tokens match
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF token xatosi. Sahifani yangilang.',
      code: 'CSRF_ERROR'
    });
    return;
  }

  next();
}

/**
 * Middleware to set CSRF token endpoint
 */
export function getCsrfToken(req: Request, res: Response): void {
  let token = req.cookies[CSRF_COOKIE_NAME];
  
  if (!token) {
    token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
  }

  res.json({ 
    success: true, 
    data: { csrfToken: token } 
  });
}
