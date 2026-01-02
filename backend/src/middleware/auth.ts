import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
    userType: 'worker' | 'employer' | 'admin';
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'works_jwt_secret_key_2024_very_secure';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Token topilmadi' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      phone: string;
      userType: string;
    };

    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      userType: decoded.userType as 'worker' | 'employer' | 'admin'
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token muddati tugagan' });
      return;
    }
    res.status(401).json({ success: false, error: 'Yaroqsiz token' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.id,
        phone: decoded.phone,
        userType: decoded.userType
      };
    }
    
    next();
  } catch {
    next();
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Avtorizatsiya talab qilinadi' });
      return;
    }

    if (!roles.includes(req.user.userType)) {
      res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
      return;
    }

    next();
  };
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.userType !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin ruxsati talab qilinadi' });
    return;
  }
  next();
}

export async function checkUserBlocked(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    next();
    return;
  }

  try {
    const result = await query('SELECT is_blocked FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows[0]?.is_blocked) {
      res.status(403).json({ success: false, error: 'Akkauntingiz bloklangan' });
      return;
    }
    
    next();
  } catch {
    next();
  }
}
