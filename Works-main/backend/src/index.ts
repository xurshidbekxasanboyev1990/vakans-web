import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import config
import { connectDatabase, closeDatabase, query } from './config/database';
import { connectRedis, closeRedis, getRedisClient } from './config/redis';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Import Socket.io
import { setupSocketServer } from './socket/index';

// Import routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import jobsRoutes from './routes/jobs.routes';
import applicationsRoutes from './routes/applications.routes';
import categoriesRoutes from './routes/categories.routes';
import adminRoutes from './routes/admin.routes';
import notificationsRoutes from './routes/notifications.routes';
import smsRoutes from './routes/sms.routes';
import chatRoutes from './routes/chat.routes';
import i18nRoutes from './routes/i18n.routes';
import { getCsrfToken } from './middleware/csrf';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// 🔐 Kuchaytirilgan Security headers
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ["http://localhost:5173"];

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"].concat(allowedOrigins),
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 yil
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
}));

// CORS - Configure allowed origins from environment
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : (process.env.NODE_ENV === 'production' 
      ? ['https://vakans.uz', 'https://www.vakans.uz'] // Production default origins
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:5000']);

if (process.env.NODE_ENV === 'production' && corsOrigins.length === 0) {
  logger.warn('CORS_ORIGIN not set in production mode!');
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.length === 0 || corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Development'da barcha localhost portlarini ruxsat beramiz
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true, // Cookie yuborish uchun muhim!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200, // IE11 va eski browserlar uchun
  preflightContinue: false,
}));

// Cookie Parser - for cookie-based auth
if (!process.env.COOKIE_SECRET) {
  logger.warn('COOKIE_SECRET not set, using default (not secure for production!)');
}
app.use(cookieParser(process.env.COOKIE_SECRET));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', apiRateLimiter);

// ============================================
// ROUTES
// ============================================

// 🔧 Health check - database va redis tekshiradi
app.get('/health', async (req, res) => {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {}
  };

  // Database health
  try {
    await query('SELECT 1');
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  // Redis health
  try {
    const redisClient = getRedisClient();
    await redisClient.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/i18n', i18nRoutes);

// CSRF token endpoint
app.get('/api/csrf-token', getCsrfToken);

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Vakans.uz API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      applications: '/api/applications',
      categories: '/api/categories',
      admin: '/api/admin',
      sms: '/api/sms'
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    logger.info('Starting Vakans.uz Backend...');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Connect to PostgreSQL
    logger.info('Connecting to PostgreSQL...');
    await connectDatabase();

    // Connect to Redis
    logger.info('Connecting to Redis...');
    await connectRedis();

    // Setup Socket.io
    logger.info('Setting up Socket.io...');
    const io = setupSocketServer(httpServer);
    logger.info('✅ Socket.io ready for real-time connections');

    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
      logger.info(`📡 WebSocket ready on ws://localhost:${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);
      
      // Close Socket.io connections
      io.close(() => {
        logger.info('Socket.io connections closed');
      });
      
      httpServer.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await closeDatabase();
          await closeRedis();
          logger.info('All connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
