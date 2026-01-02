import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Import required dependencies
import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { rateLimiter } from "npm:hono-rate-limiter@0.4";
import { z } from "npm:zod@3";
// NOTE: bcrypt v0.4.1 is used. Newer versions (v0.4.x) may be available at https://deno.land/x/bcrypt
// Consider checking for updates periodically for security improvements
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import * as kv from "./kv_store.tsx";
import { eskizService, otpStorage } from "./sms_service.tsx";

const app = new Hono();

// Environment variables (in Supabase Functions, use Deno.env)
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key-min-32-characters-change-in-production";
const JWT_REFRESH_SECRET = Deno.env.get("JWT_REFRESH_SECRET") || "your-refresh-secret-min-32-characters-change";
const ALLOWED_ORIGINS = Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:5173";

// SMS Configuration
const ESKIZ_EMAIL = Deno.env.get("ESKIZ_EMAIL") || "";
const ESKIZ_PASSWORD = Deno.env.get("ESKIZ_PASSWORD") || "";
const ESKIZ_FROM = Deno.env.get("ESKIZ_FROM") || "4546";
const SMS_TEST_MODE = Deno.env.get("SMS_TEST_MODE") === "true";
const OTP_EXPIRY_MINUTES = parseInt(Deno.env.get("OTP_EXPIRY_MINUTES") || "5");
const OTP_LENGTH = parseInt(Deno.env.get("OTP_LENGTH") || "6");

// Convert secrets to CryptoKey for JWT
const encoder = new TextEncoder();
const secretKey = await crypto.subtle.importKey(
  "raw",
  encoder.encode(JWT_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

const refreshSecretKey = await crypto.subtle.importKey(
  "raw",
  encoder.encode(JWT_REFRESH_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

// ===========================
// ATOMIC LOCK FOR RACE CONDITIONS
// ===========================

// Simple in-memory lock for atomic operations
const locks = new Map<string, Promise<any>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // Wait for existing lock
  while (locks.has(key)) {
    await locks.get(key);
  }

  // Create new lock
  const promise = fn().finally(() => locks.delete(key));
  locks.set(key, promise);
  
  return promise;
}

// ===========================
// VALIDATION SCHEMAS (Zod)
// ===========================

const registerSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
    .regex(/[A-Z]/, "Parol kamida bitta katta harf bo'lishi kerak")
    .regex(/[a-z]/, "Parol kamida bitta kichik harf bo'lishi kerak")
    .regex(/[0-9]/, "Parol kamida bitta raqam bo'lishi kerak"),
  firstName: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(50, "Ism 50 ta belgidan oshmasligi kerak"),
  lastName: z.string().min(2, "Familiya kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(50, "Familiya 50 ta belgidan oshmasligi kerak"),
  region: z.string().min(2, "Region tanlanishi kerak"),
  userType: z.enum(["worker", "employer"], { 
    errorMap: () => ({ message: "Foydalanuvchi turi noto'g'ri" }) 
  }),
  phone: z.string().regex(/^\+998[0-9]{9}$/, "Telefon raqam noto'g'ri formatda (+998XXXXXXXXX)")
});

const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(1, "Parol kiritilishi kerak"),
});

const jobSchema = z.object({
  title: z.string().min(5, "Ish nomi kamida 5 ta belgidan iborat bo'lishi kerak")
    .max(100, "Ish nomi 100 ta belgidan oshmasligi kerak"),
  description: z.string().min(20, "Tavsif kamida 20 ta belgidan iborat bo'lishi kerak")
    .max(2000, "Tavsif 2000 ta belgidan oshmasligi kerak"),
  salary: z.number().positive("Maosh musbat son bo'lishi kerak").optional(),
  location: z.string().min(2, "Joylashuv ko'rsatilishi kerak"),
  employerId: z.string(),
  category: z.string().min(2, "Kategoriya tanlanishi kerak"),
  requirements: z.array(z.string()).optional(),
});

const profileUpdateSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  region: z.string().min(2).optional(),
  phone: z.string().regex(/^\+998[0-9]{9}$/).optional(),
});

// ===========================
// UTILITIES
// ===========================

// Sanitize HTML to prevent XSS (basic version for Deno)
function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")  // Must be first to avoid double-escaping
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Generate JWT token
async function generateToken(userId: string, email: string, type: "access" | "refresh") {
  const key = type === "access" ? secretKey : refreshSecretKey;
  const exp = type === "access" 
    ? Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    : Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

  return await create(
    { alg: "HS256", typ: "JWT" },
    { userId, email, type, exp },
    key
  );
}

// Verify JWT token
async function verifyToken(token: string, type: "access" | "refresh") {
  try {
    const key = type === "access" ? secretKey : refreshSecretKey;
    const payload = await verify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

// Hash password with bcrypt
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password);
}

// Verify password with bcrypt
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// ===========================
// MIDDLEWARE
// ===========================

// Enable logger
app.use('*', logger());

// HTTPS enforcement (X-Forwarded-Proto check) - PRODUCTION READY
app.use('*', async (c, next) => {
  const proto = c.req.header('x-forwarded-proto') || 'http';
  const host = c.req.header('host') || '';
  
  // Force HTTPS in production (Supabase automatically provides HTTPS)
  if (Deno.env.get('DENO_DEPLOYMENT_ID') && proto !== 'https') {
    return c.redirect(`https://${host}${c.req.url}`, 301);
  }
  
  await next();
});

// Security Headers - ENHANCED FOR PRODUCTION
app.use('*', async (c, next) => {
  await next();
  
  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  c.header('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  c.header('X-XSS-Protection', '1; mode=block');
  
  // HTTP Strict Transport Security (HSTS) - Force HTTPS for 1 year
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy - Strict
  c.header('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.supabase.co; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  
  // Referrer Policy - Don't leak URLs
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy - Disable unnecessary features
  c.header('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
});

// CORS Configuration with proper whitelist
const allowedOrigins = ALLOWED_ORIGINS.split(',').map(o => o.trim());
app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0]; // For same-origin requests
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
    maxAge: 600,
  }),
);

// Rate Limiting
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // max 100 requests per windowMs
  standardHeaders: "draft-6",
  keyGenerator: (c) => {
    // Try multiple headers for IP detection (Supabase Edge Functions compatible)
    return c.req.header("cf-connecting-ip") || 
           c.req.header("x-forwarded-for")?.split(',')[0].trim() || 
           c.req.header("x-real-ip") || 
           c.req.header("fly-client-ip") ||
           "unknown";
  },
});

app.use('/make-server-5b47a45d/*', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // max 5 auth attempts
  standardHeaders: "draft-6",
  keyGenerator: (c) => {
    // Same IP detection logic
    return c.req.header("cf-connecting-ip") || 
           c.req.header("x-forwarded-for")?.split(',')[0].trim() || 
           c.req.header("x-real-ip") || 
           c.req.header("fly-client-ip") ||
           "unknown";
  },
});

// Auth middleware
async function authMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Avtorizatsiya talab qilinadi' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token, 'access');

  if (!payload) {
    return c.json({ success: false, error: 'Token yaroqsiz yoki muddati tugagan' }, 401);
  }

  c.set('userId', payload.userId);
  c.set('email', payload.email);
  await next();
}

// ===========================
// ROUTES
// ===========================

// Health check
app.get("/make-server-5b47a45d/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register endpoint
app.post("/make-server-5b47a45d/register", authLimiter, async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input with Zod
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ 
        success: false, 
        error: validationResult.error.errors[0].message 
      }, 400);
    }

    const userData = validationResult.data;

    // Sanitize text inputs
    userData.firstName = sanitizeInput(userData.firstName);
    userData.lastName = sanitizeInput(userData.lastName);
    userData.region = sanitizeInput(userData.region);

    // Check if user already exists
    const existingUser = await kv.get(`user:email:${userData.email}`);
    if (existingUser) {
      return c.json({ success: false, error: 'Bu email allaqachon ro\'yxatdan o\'tgan' }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const userId = `user-${Date.now()}-${crypto.randomUUID()}`;
    const user = {
      id: userId,
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      region: userData.region,
      userType: userData.userType,
      phone: userData.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store user data
    await kv.set(`user:${userId}`, user);
    await kv.set(`user:email:${userData.email}`, userId);

    // Generate tokens
    const accessToken = await generateToken(userId, userData.email, 'access');
    const refreshToken = await generateToken(userId, userData.email, 'refresh');

    // Store refresh token with device info for multi-device support
    const deviceId = crypto.randomUUID();
    const refreshTokenData = {
      token: refreshToken,
      deviceId,
      createdAt: new Date().toISOString(),
      userAgent: c.req.header('user-agent') || 'unknown',
    };
    
    // Get existing refresh tokens
    const existingTokens = await kv.get(`refresh:${userId}`) || [];
    
    // Add new token and keep only last 5 devices
    existingTokens.push(refreshTokenData);
    if (existingTokens.length > 5) {
      existingTokens.shift(); // Remove oldest
    }
    
    await kv.set(`refresh:${userId}`, existingTokens);

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      deviceId, // Return deviceId to client
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// Login endpoint
app.post("/make-server-5b47a45d/login", authLimiter, async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ 
        success: false, 
        error: validationResult.error.errors[0].message 
      }, 400);
    }

    const { email, password } = validationResult.data;

    // Get user by email
    const userId = await kv.get(`user:email:${email}`);
    if (!userId) {
      return c.json({ success: false, error: 'Email yoki parol noto\'g\'ri' }, 401);
    }

    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ success: false, error: 'Email yoki parol noto\'g\'ri' }, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return c.json({ success: false, error: 'Email yoki parol noto\'g\'ri' }, 401);
    }

    // Generate tokens
    const accessToken = await generateToken(user.id, user.email, 'access');
    const refreshToken = await generateToken(user.id, user.email, 'refresh');

    // Store refresh token with device info for multi-device support
    const deviceId = crypto.randomUUID();
    const refreshTokenData = {
      token: refreshToken,
      deviceId,
      createdAt: new Date().toISOString(),
      userAgent: c.req.header('user-agent') || 'unknown',
    };
    
    // Get existing refresh tokens
    const existingTokens = await kv.get(`refresh:${user.id}`) || [];
    
    // Add new token and keep only last 5 devices
    existingTokens.push(refreshTokenData);
    if (existingTokens.length > 5) {
      existingTokens.shift(); // Remove oldest
    }
    
    await kv.set(`refresh:${user.id}`, existingTokens);

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      deviceId, // Return deviceId to client
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// Refresh token endpoint
app.post("/make-server-5b47a45d/refresh", async (c) => {
  try {
    const { refreshToken } = await c.req.json();

    if (!refreshToken) {
      return c.json({ success: false, error: 'Refresh token talab qilinadi' }, 400);
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken, 'refresh');
    if (!payload || payload.type !== 'refresh') {
      return c.json({ success: false, error: 'Refresh token yaroqsiz' }, 401);
    }

    // Check if token exists in storage (multi-device support)
    const storedTokens = await kv.get(`refresh:${payload.userId}`) || [];
    const tokenData = storedTokens.find((t: any) => t.token === refreshToken);
    
    if (!tokenData) {
      return c.json({ success: false, error: 'Refresh token yaroqsiz' }, 401);
    }

    // Generate new tokens
    const newAccessToken = await generateToken(payload.userId, payload.email, 'access');
    const newRefreshToken = await generateToken(payload.userId, payload.email, 'refresh');

    // Update stored refresh token for this device
    const updatedTokens = storedTokens.map((t: any) => 
      t.deviceId === tokenData.deviceId 
        ? { ...t, token: newRefreshToken, createdAt: new Date().toISOString() }
        : t
    );
    await kv.set(`refresh:${payload.userId}`, updatedTokens);

    return c.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      deviceId: tokenData.deviceId,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// Logout endpoint
app.post("/make-server-5b47a45d/logout", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { deviceId } = await c.req.json();
    
    // Remove refresh token for this device only (multi-device support)
    if (deviceId) {
      const storedTokens = await kv.get(`refresh:${userId}`) || [];
      const updatedTokens = storedTokens.filter((t: any) => t.deviceId !== deviceId);
      
      if (updatedTokens.length > 0) {
        await kv.set(`refresh:${userId}`, updatedTokens);
      } else {
        await kv.del(`refresh:${userId}`);
      }
    } else {
      // If no deviceId, logout from all devices
      await kv.del(`refresh:${userId}`);
    }

    return c.json({ success: true, message: 'Tizimdan muvaffaqiyatli chiqdingiz' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// Get user profile endpoint
app.get("/make-server-5b47a45d/profile", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const user = await kv.get(`user:${userId}`);

    if (!user) {
      return c.json({ success: false, error: 'Foydalanuvchi topilmadi' }, 404);
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return c.json({ success: true, profile: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// Update user profile endpoint
app.put("/make-server-5b47a45d/profile", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    // Validate input
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ 
        success: false, 
        error: validationResult.error.errors[0].message 
      }, 400);
    }

    const updates = validationResult.data;

    // Sanitize inputs
    if (updates.firstName) updates.firstName = sanitizeInput(updates.firstName);
    if (updates.lastName) updates.lastName = sanitizeInput(updates.lastName);
    if (updates.region) updates.region = sanitizeInput(updates.region);

    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ success: false, error: 'Foydalanuvchi topilmadi' }, 404);
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedUser);

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return c.json({ success: true, profile: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// Post a job endpoint (protected)
app.post("/make-server-5b47a45d/jobs", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    // Validate input
    const validationResult = jobSchema.safeParse({ ...body, employerId: userId });
    if (!validationResult.success) {
      return c.json({ 
        success: false, 
        error: validationResult.error.errors[0].message 
      }, 400);
    }

    const jobData = validationResult.data;

    // Sanitize inputs
    jobData.title = sanitizeInput(jobData.title);
    jobData.description = sanitizeInput(jobData.description);
    jobData.location = sanitizeInput(jobData.location);
    jobData.category = sanitizeInput(jobData.category);

    // Verify user is employer
    const user = await kv.get(`user:${userId}`);
    if (!user || user.userType !== 'employer') {
      return c.json({ success: false, error: 'Faqat ish beruvchilar e\'lon qo\'ya oladi' }, 403);
    }

    const jobId = `job-${Date.now()}-${crypto.randomUUID()}`;
    const job = {
      id: jobId,
      ...jobData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`job:${jobId}`, job);

    // Update jobs list with atomic lock to prevent race conditions
    await withLock('jobs:list', async () => {
      const jobsList = await kv.get('jobs:list') || [];
      jobsList.unshift(jobId);
      await kv.set('jobs:list', jobsList);
    });

    return c.json({ success: true, job }, 201);
  } catch (error) {
    console.error('Post job error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// Get all jobs endpoint (public)
app.get("/make-server-5b47a45d/jobs", async (c) => {
  try {
    const jobsList = await kv.get('jobs:list') || [];

    if (jobsList.length === 0) {
      return c.json({ success: true, jobs: [] });
    }

    // Get all jobs data
    const jobs = [];
    for (const jobId of jobsList) {
      const job = await kv.get(`job:${jobId}`);
      if (job) {
        jobs.push(job);
      }
    }

    return c.json({ success: true, jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// Get single job endpoint (public)
app.get("/make-server-5b47a45d/jobs/:id", async (c) => {
  try {
    const jobId = c.req.param('id');
    const job = await kv.get(`job:${jobId}`);

    if (!job) {
      return c.json({ success: false, error: 'Ish e\'loni topilmadi' }, 404);
    }

    return c.json({ success: true, job });
  } catch (error) {
    console.error('Get job error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// Delete job endpoint (protected)
app.delete("/make-server-5b47a45d/jobs/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const jobId = c.req.param('id');
    
    const job = await kv.get(`job:${jobId}`);
    if (!job) {
      return c.json({ success: false, error: 'Ish e\'loni topilmadi' }, 404);
    }

    // Verify user is the job owner
    if (job.employerId !== userId) {
      return c.json({ success: false, error: 'Sizda bu e\'lonni o\'chirish huquqi yo\'q' }, 403);
    }

    await kv.del(`job:${jobId}`);

    // Update jobs list
    const jobsList = await kv.get('jobs:list') || [];
    const updatedList = jobsList.filter((id: string) => id !== jobId);
    await kv.set('jobs:list', updatedList);

    return c.json({ success: true, message: 'Ish e\'loni o\'chirildi' });
  } catch (error) {
    console.error('Delete job error:', error);
    return c.json({ success: false, error: 'Server xatosi' }, 500);
  }
});

// ===========================
// SMS VERIFICATION ENDPOINTS
// ===========================

/**
 * Send OTP Code
 * POST /make-server-5b47a45d/sms/send-otp
 * Body: { phone: "+998901234567" }
 */
app.post("/make-server-5b47a45d/sms/send-otp", authLimiter, async (c) => {
  try {
    const { phone } = await c.req.json();

    // Validate phone number
    const phoneSchema = z.object({
      phone: z.string().regex(/^\+998[0-9]{9}$/, "Telefon raqam noto'g'ri formatda (+998XXXXXXXXX)")
    });

    const validationResult = phoneSchema.safeParse({ phone });
    if (!validationResult.success) {
      return c.json({ 
        success: false, 
        error: validationResult.error.errors[0].message 
      }, 400);
    }

    // Check if OTP already exists (prevent spam)
    if (otpStorage.exists(phone)) {
      return c.json({ 
        success: false, 
        error: 'OTP kod allaqachon yuborilgan. 5 daqiqa kuting.' 
      }, 429);
    }

    // Test mode - return test code
    if (SMS_TEST_MODE) {
      const testCode = "123456";
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);
      
      otpStorage.store(phone, testCode, expiresAt);
      
      return c.json({ 
        success: true, 
        message: 'Test rejimda. Kod: 123456',
        testMode: true,
        code: testCode, // Only in test mode
        expiresAt 
      });
    }

    // Production mode - send real SMS
    if (!ESKIZ_EMAIL || !ESKIZ_PASSWORD) {
      return c.json({ 
        success: false, 
        error: 'SMS xizmati sozlanmagan' 
      }, 500);
    }

    const { code, expiresAt } = await eskizService.sendOTP(
      phone,
      ESKIZ_EMAIL,
      ESKIZ_PASSWORD,
      ESKIZ_FROM,
      OTP_LENGTH
    );

    // Store OTP
    otpStorage.store(phone, code, expiresAt);

    return c.json({ 
      success: true, 
      message: 'Tasdiqlash kodi yuborildi',
      expiresAt 
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return c.json({ 
      success: false, 
      error: 'SMS yuborishda xatolik. Keyinroq urinib ko\'ring.' 
    }, 500);
  }
});

/**
 * Verify OTP Code
 * POST /make-server-5b47a45d/sms/verify-otp
 * Body: { phone: "+998901234567", code: "123456" }
 */
app.post("/make-server-5b47a45d/sms/verify-otp", authLimiter, async (c) => {
  try {
    const { phone, code } = await c.req.json();

    // Validate input
    const schema = z.object({
      phone: z.string().regex(/^\+998[0-9]{9}$/, "Telefon raqam noto'g'ri formatda"),
      code: z.string().length(OTP_LENGTH, `Kod ${OTP_LENGTH} ta raqamdan iborat bo'lishi kerak`)
    });

    const validationResult = schema.safeParse({ phone, code });
    if (!validationResult.success) {
      return c.json({ 
        success: false, 
        error: validationResult.error.errors[0].message 
      }, 400);
    }

    // Verify OTP
    const result = otpStorage.verify(phone, code);

    if (!result.success) {
      return c.json({ 
        success: false, 
        error: result.message 
      }, 400);
    }

    // Update user as verified in database
    // TODO: Update user.verified = true in database
    // For now, just return success

    return c.json({ 
      success: true, 
      message: result.message,
      verified: true 
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return c.json({ 
      success: false, 
      error: 'Tasdiqlashda xatolik' 
    }, 500);
  }
});

/**
 * Resend OTP Code
 * POST /make-server-5b47a45d/sms/resend-otp
 * Body: { phone: "+998901234567" }
 */
app.post("/make-server-5b47a45d/sms/resend-otp", authLimiter, async (c) => {
  try {
    const { phone } = await c.req.json();

    // Delete existing OTP
    otpStorage.delete(phone);

    // Send new OTP (reuse send-otp logic)
    return c.redirect('/make-server-5b47a45d/sms/send-otp');

  } catch (error) {
    console.error('Resend OTP error:', error);
    return c.json({ 
      success: false, 
      error: 'SMS qayta yuborishda xatolik' 
    }, 500);
  }
});


Deno.serve(app.fetch);