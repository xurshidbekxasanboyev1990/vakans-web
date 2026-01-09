import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: RedisClientType;

export async function connectRedis(): Promise<RedisClientType> {
  if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL environment variable is required');
    process.exit(1);
  }
  
  const redisUrl = process.env.REDIS_URL;
  
  redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('❌ Redis max retries reached');
          return new Error('Redis max retries reached');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  });

  redisClient.on('connect', () => {
    console.log('🔴 Connecting to Redis...');
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis connected and ready');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  redisClient.on('reconnecting', () => {
    console.log('🔄 Reconnecting to Redis...');
  });

  await redisClient.connect();
  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

// Cache helpers
export async function setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
  await redisClient.setEx(key, ttl, JSON.stringify(value));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

export async function deleteCache(key: string): Promise<void> {
  await redisClient.del(key);
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

// Session helpers
export async function setSession(userId: string, sessionData: any, ttl: number = 86400): Promise<void> {
  await redisClient.setEx(`session:${userId}`, ttl, JSON.stringify(sessionData));
}

export async function getSession(userId: string): Promise<any | null> {
  const data = await redisClient.get(`session:${userId}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteSession(userId: string): Promise<void> {
  await redisClient.del(`session:${userId}`);
}

// Rate limiting helpers
export async function incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
  const result = await redisClient.incr(key);
  if (result === 1) {
    await redisClient.expire(key, windowSeconds);
  }
  return result;
}

export async function getRateLimit(key: string): Promise<number> {
  const count = await redisClient.get(key);
  return count ? parseInt(count, 10) : 0;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    console.log('🔌 Redis connection closed');
  }
}

export { redisClient };
