import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';

const app = new Hono();

// CORS
app.use('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Mock data
const users = new Map();
const jobs = new Map();
const tokens = new Map();

// Helper functions
function generateToken() {
  return 'mock_token_' + Math.random().toString(36).substring(2);
}

// Health check
app.get('/make-server-5b47a45d/health', (c) => {
  return c.json({
    success: true,
    message: 'Mock server ishlayapti',
    timestamp: new Date().toISOString()
  });
});

// Register
app.post('/make-server-5b47a45d/register', async (c) => {
  const body = await c.req.json();
  
  const userId = 'user_' + Math.random().toString(36).substring(2);
  const user = {
    id: userId,
    email: body.email,
    firstName: body.firstName,
    lastName: body.lastName,
    region: body.region,
    userType: body.userType,
    phone: body.phone,
    createdAt: new Date().toISOString()
  };
  
  users.set(userId, user);
  
  const accessToken = generateToken();
  const refreshToken = generateToken();
  const deviceId = 'device_' + Math.random().toString(36).substring(2);
  
  tokens.set(accessToken, userId);
  
  return c.json({
    success: true,
    user,
    accessToken,
    refreshToken,
    deviceId
  }, 201);
});

// Login
app.post('/make-server-5b47a45d/login', async (c) => {
  const body = await c.req.json();
  
  // Mock: har qanday email/password qabul qilamiz
  const userId = 'user_' + Math.random().toString(36).substring(2);
  const user = {
    id: userId,
    email: body.email,
    firstName: 'Test',
    lastName: 'User',
    region: 'Toshkent',
    userType: 'worker',
    phone: '+998901234567',
    createdAt: new Date().toISOString()
  };
  
  users.set(userId, user);
  
  const accessToken = generateToken();
  const refreshToken = generateToken();
  const deviceId = 'device_' + Math.random().toString(36).substring(2);
  
  tokens.set(accessToken, userId);
  
  return c.json({
    success: true,
    user,
    accessToken,
    refreshToken,
    deviceId
  });
});

// Get profile
app.get('/make-server-5b47a45d/profile', (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  const userId = tokens.get(token);
  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  const user = users.get(userId) || {
    id: userId,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    region: 'Toshkent',
    userType: 'worker'
  };
  
  return c.json({ success: true, user });
});

// Update profile
app.put('/make-server-5b47a45d/profile', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  const userId = tokens.get(token);
  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  const body = await c.req.json();
  const user = users.get(userId);
  
  if (user) {
    Object.assign(user, body);
    users.set(userId, user);
  }
  
  return c.json({ success: true, user });
});

// Create job
app.post('/make-server-5b47a45d/jobs', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  const userId = tokens.get(token);
  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  const body = await c.req.json();
  const jobId = 'job_' + Math.random().toString(36).substring(2);
  
  const job = {
    id: jobId,
    ...body,
    employerId: userId,
    createdAt: new Date().toISOString()
  };
  
  jobs.set(jobId, job);
  
  return c.json({ success: true, job }, 201);
});

// Get all jobs
app.get('/make-server-5b47a45d/jobs', (c) => {
  const allJobs = Array.from(jobs.values());
  return c.json({ success: true, jobs: allJobs });
});

// Get job by ID
app.get('/make-server-5b47a45d/jobs/:id', (c) => {
  const jobId = c.req.param('id');
  const job = jobs.get(jobId);
  
  if (!job) {
    return c.json({ success: false, error: 'Job not found' }, 404);
  }
  
  return c.json({ success: true, job });
});

// Delete job
app.delete('/make-server-5b47a45d/jobs/:id', (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  const userId = tokens.get(token);
  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  const jobId = c.req.param('id');
  jobs.delete(jobId);
  
  return c.json({ success: true, message: 'Job deleted' });
});

// Logout
app.post('/make-server-5b47a45d/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token) {
    tokens.delete(token);
  }
  
  return c.json({ success: true, message: 'Logged out' });
});

// Refresh token
app.post('/make-server-5b47a45d/refresh', async (c) => {
  const newAccessToken = generateToken();
  const newRefreshToken = generateToken();
  const deviceId = 'device_' + Math.random().toString(36).substring(2);
  
  return c.json({
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    deviceId
  });
});

// Start server
console.log('🚀 Mock Backend Server ishga tushdi!');
console.log('📍 URL: http://localhost:54321');
console.log('✅ CORS: http://localhost:5173');
console.log('');
console.log('Endpoints:');
console.log('  GET  /make-server-5b47a45d/health');
console.log('  POST /make-server-5b47a45d/register');
console.log('  POST /make-server-5b47a45d/login');
console.log('  GET  /make-server-5b47a45d/profile');
console.log('  POST /make-server-5b47a45d/jobs');
console.log('  GET  /make-server-5b47a45d/jobs');

export default app;
