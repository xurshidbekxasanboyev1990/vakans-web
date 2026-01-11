import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { setCache, getCache, deleteCache } from '../config/redis';

// JWT secrets - must be set in environment
function getJwtSecrets(): { jwtSecret: string; jwtRefreshSecret: string } {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!jwtSecret || !jwtRefreshSecret) {
    console.error('❌ JWT_SECRET and JWT_REFRESH_SECRET environment variables are required');
    process.exit(1);
  }
  
  return { jwtSecret, jwtRefreshSecret };
}

const ACCESS_TOKEN_EXPIRY = '30d';
const REFRESH_TOKEN_EXPIRY = '30d';

interface TokenPayload {
  id: string;
  phone: string;
  userType: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const { jwtSecret } = getJwtSecrets();
  return jwt.sign(payload, jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: TokenPayload): string {
  const { jwtRefreshSecret } = getJwtSecrets();
  return jwt.sign({ ...payload, tokenId: uuidv4() }, jwtRefreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload {
  const { jwtSecret } = getJwtSecrets();
  return jwt.verify(token, jwtSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload & { tokenId: string } {
  const { jwtRefreshSecret } = getJwtSecrets();
  return jwt.verify(token, jwtRefreshSecret) as TokenPayload & { tokenId: string };
}

export async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
  
  // Also cache in Redis
  await setCache(`refresh:${userId}`, token, 30 * 24 * 60 * 60);
}

export async function revokeRefreshToken(userId: string): Promise<void> {
  await query(
    `UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1 AND is_revoked = false`,
    [userId]
  );
  
  await deleteCache(`refresh:${userId}`);
}

export async function isRefreshTokenValid(userId: string, token: string): Promise<boolean> {
  // Check Redis first
  const cachedToken = await getCache<string>(`refresh:${userId}`);
  if (cachedToken === token) return true;
  
  // Check database
  const result = await query(
    `SELECT id FROM refresh_tokens 
     WHERE user_id = $1 AND token = $2 AND is_revoked = false AND expires_at > NOW()`,
    [userId, token]
  );
  
  return result.rowCount !== null && result.rowCount > 0;
}

export async function cleanExpiredTokens(): Promise<void> {
  await query(`DELETE FROM refresh_tokens WHERE expires_at < NOW() OR is_revoked = true`);
}

// Generate tokens pair
export function generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
}

// Cookie configuration for secure token storage
// 🔐 Kuchaytirilgan xavfsizlik sozlamalari
export const COOKIE_OPTIONS = {
  httpOnly: true, // XSS himoyasi - JavaScript kirish mumkin emas
  secure: true, // HTTPS uchun majburiy
  sameSite: 'lax' as const, // Same-site requests uchun
  path: '/',
  maxAge: 365 * 24 * 60 * 60 * 1000, // 365 kun - 1 yil login saqlanadi
  // domain ni olib tashladik - browser avtomatik set qiladi
};

export const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'vakans_access_token',
  REFRESH_TOKEN: 'vakans_refresh_token',
};
