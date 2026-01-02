import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import config
import { connectDatabase, closeDatabase } from './config/database';
import { connectRedis, closeRedis } from './config/redis';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import jobsRoutes from './routes/jobs.routes';
import applicationsRoutes from './routes/applications.routes';
import categoriesRoutes from './routes/categories.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
const corsOriginRaw = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:3000';
const allowedOrigins = corsOriginRaw.split(',').map(o => o.trim());

console.log('🌐 CORS_ORIGIN env:', process.env.CORS_ORIGIN);
console.log('🌐 CORS allowed origins:', JSON.stringify(allowedOrigins));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Health check - support both /health and /api/health
app.get(['/health', '/api/health'], (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes (without /api prefix - Nginx adds it)
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/jobs', jobsRoutes);
app.use('/applications', applicationsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/admin', adminRoutes);

// API info
app.get('/', (req, res) => {
  res.json({
    name: 'Vakans.uz API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      applications: '/api/applications',
      categories: '/api/categories',
      admin: '/api/admin'
    }
  });
});
      categories: '/api/categories',
      admin: '/api/admin'
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
    console.log('🚀 Starting Vakans.uz Backend...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Connect to PostgreSQL
    console.log('📦 Connecting to PostgreSQL...');
    await connectDatabase();

    // Connect to Redis
    console.log('🔴 Connecting to Redis...');
    await connectRedis();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`\n✅ Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️ ${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await closeDatabase();
          await closeRedis();
          console.log('✅ All connections closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
