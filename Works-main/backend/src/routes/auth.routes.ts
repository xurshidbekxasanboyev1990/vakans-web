import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authRateLimiter, loginRateLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema } from '../utils/validation';
import { 
  generateTokens, 
  saveRefreshToken, 
  revokeRefreshToken, 
  verifyRefreshToken, 
  isRefreshTokenValid,
  COOKIE_OPTIONS,
  ACCESS_COOKIE_OPTIONS,
  COOKIE_NAMES
} from '../utils/tokens';
import { deleteSession } from '../config/redis';

const router = Router();

// Helper function to set auth cookies
function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS);
}

// Helper function to clear auth cookies
function clearAuthCookies(res: Response) {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' });
}

// ============================================
// POST /auth/register - Ro'yxatdan o'tish
// ============================================
router.post('/register', authRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        success: false, 
        error: 'Validatsiya xatosi', 
        details: validation.error.errors 
      });
      return;
    }

    const { phone, password, firstName, lastName, userType, email, region } = validation.data;

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ success: false, error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await query(
      `INSERT INTO users (phone, password_hash, first_name, last_name, user_type, email, region)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, phone, first_name, last_name, user_type, email, region, created_at`,
      [phone, passwordHash, firstName, lastName || '', userType, email || null, region || null]
    );

    const user = result.rows[0];

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      phone: user.phone,
      userType: user.user_type
    });

    // Save refresh token
    await saveRefreshToken(user.id, tokens.refreshToken);

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Set cookies for cookie-based auth
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          email: user.email,
          region: user.region,
          createdAt: user.created_at
        }
        // Tokens are now sent via HttpOnly cookies, not in response body
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// POST /auth/login - Kirish (Brute-force himoyasi bilan)
// ============================================
router.post('/login', loginRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        success: false, 
        error: 'Telefon yoki parol noto\'g\'ri' 
      });
      return;
    }

    const { phone, password } = validation.data;

    // Find user
    const result = await query(
      `SELECT id, phone, password_hash, first_name, last_name, user_type, email, 
              region, avatar_url, bio, skills, is_blocked, is_verified
       FROM users WHERE phone = $1`,
      [phone]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ success: false, error: 'Telefon yoki parol noto\'g\'ri' });
      return;
    }

    const user = result.rows[0];

    // Check if blocked
    if (user.is_blocked) {
      res.status(403).json({ success: false, error: 'Akkauntingiz bloklangan' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, error: 'Telefon yoki parol noto\'g\'ri' });
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      phone: user.phone,
      userType: user.user_type
    });

    // Save refresh token
    await saveRefreshToken(user.id, tokens.refreshToken);

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Set cookies for cookie-based auth
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          email: user.email,
          region: user.region,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          skills: user.skills,
          isVerified: user.is_verified
        }
        // Tokens are now sent via HttpOnly cookies, not in response body
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// POST /auth/refresh - Token yangilash
// ============================================
router.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    // Get refresh token from cookie first, then fallback to body
    const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] || req.body?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ success: false, error: 'Refresh token topilmadi' });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      clearAuthCookies(res);
      res.status(401).json({ success: false, error: 'Yaroqsiz refresh token' });
      return;
    }

    // Check if token is valid in database
    const isValid = await isRefreshTokenValid(decoded.id, refreshToken);
    if (!isValid) {
      clearAuthCookies(res);
      res.status(401).json({ success: false, error: 'Refresh token bekor qilingan' });
      return;
    }

    // Get user
    const result = await query(
      'SELECT id, phone, user_type, is_blocked FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || result.rows[0].is_blocked) {
      clearAuthCookies(res);
      res.status(401).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    const user = result.rows[0];

    // Revoke old tokens and generate new ones
    await revokeRefreshToken(user.id);

    const tokens = generateTokens({
      id: user.id,
      phone: user.phone,
      userType: user.user_type
    });

    await saveRefreshToken(user.id, tokens.refreshToken);

    // Set new cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      message: 'Token yangilandi'
      // Tokens are now in HttpOnly cookies
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// POST /auth/logout - Chiqish
// ============================================
// authenticate o'rniga optionalAuth ishlatamiz - token eskirgan bo'lsa ham logout qilish mumkin
router.post('/logout', async (req: AuthRequest, res: Response) => {
  try {
    // Cookie'dan token olishga harakat qilamiz
    const token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
    
    if (token) {
      try {
        // Token hali yaroqli bo'lsa, user ma'lumotlarini olamiz
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET!) as { id: string };
        
        if (decoded?.id) {
          await revokeRefreshToken(decoded.id);
          await deleteSession(decoded.id);
        }
      } catch {
        // Token eskirgan yoki yaroqsiz - bu normal, davom etamiz
      }
    }

    // Har qanday holatda cookie'larni tozalaymiz
    clearAuthCookies(res);

    res.json({ success: true, message: 'Muvaffaqiyatli chiqildi' });
  } catch (error) {
    console.error('Logout error:', error);
    // Xatolik bo'lsa ham cookie'larni tozalaymiz
    clearAuthCookies(res);
    res.json({ success: true, message: 'Chiqildi' });
  }
});

// ============================================
// GET /auth/me - Joriy foydalanuvchi
// ============================================
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, phone, first_name, last_name, user_type, email, region, avatar_url, 
              bio, skills, experience_years, education, languages, company_name, 
              company_description, website, is_verified, created_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        email: user.email,
        region: user.region,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        skills: user.skills,
        experienceYears: user.experience_years,
        education: user.education,
        languages: user.languages,
        companyName: user.company_name,
        companyDescription: user.company_description,
        website: user.website,
        isVerified: user.is_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

export default router;
