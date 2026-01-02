import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { setCache, getCache, deleteCache } from '../config/redis';

const JWT_SECRET = process.env.JWT_SECRET || 'works_jwt_secret_key_2024_very_secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'works_jwt_refresh_secret_key_2024';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

interface TokenPayload {
  id: string;
  phone: string;
  userType: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign({ ...payload, tokenId: uuidv4() }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload & { tokenId: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload & { tokenId: string };
}

export async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
  
  // Also cache in Redis
  await setCache(`refresh:${userId}`, token, 7 * 24 * 60 * 60);
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
