import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error
  logger.error('Error occurred', {
    message: err.message,
    stack: isProduction ? undefined : err.stack,
    url: req.url,
    method: req.method,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    error: isProduction && statusCode === 500 
      ? 'Ichki server xatosi' 
      : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Yo'l topilmadi: ${req.method} ${req.url}`,
  });
}

/**
 * Async handler wrapper
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}