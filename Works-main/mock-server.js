// Simple Mock Backend - Node.js ES Modules
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Mock data storage
const users = new Map();
const jobs = new Map();
const tokens = new Map();

function generateToken() {
  return 'mock_token_' + Math.random().toString(36).substring(2);
}

// Health check
app.get('/make-server-5b47a45d/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mock server ishlayapti',
    timestamp: new Date().toISOString()
  });
});

// Register
app.post('/make-server-5b47a45d/register', (req, res) => {
  const body = req.body;
  
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
  
  res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
      refreshToken,
      deviceId
    }
  });
});

// Login
app.post('/make-server-5b47a45d/login', (req, res) => {
  const userId = 'user_' + Math.random().toString(36).substring(2);
  const user = {
    id: userId,
    email: req.body.email,
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
  
  res.json({
    success: true,
    data: {
      user,
      accessToken,
      refreshToken,
      deviceId
    }
  });
});

// Get profile
app.get('/make-server-5b47a45d/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = tokens.get(token);
  
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const user = users.get(userId) || {
    id: userId,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    region: 'Toshkent',
    userType: 'worker'
  };
  
  res.json({ success: true, data: { user } });
});

// Update profile
app.put('/make-server-5b47a45d/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = tokens.get(token);
  
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  let user = users.get(userId);
  if (user) {
    Object.assign(user, req.body);
    users.set(userId, user);
  }
  
  res.json({ success: true, data: { user } });
});

// Create job
app.post('/make-server-5b47a45d/jobs', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = tokens.get(token);
  
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const jobId = 'job_' + Math.random().toString(36).substring(2);
  const job = {
    id: jobId,
    ...req.body,
    employerId: userId,
    createdAt: new Date().toISOString()
  };
  
  jobs.set(jobId, job);
  
  res.status(201).json({ success: true, data: { job } });
});

// Get all jobs
app.get('/make-server-5b47a45d/jobs', (req, res) => {
  const allJobs = Array.from(jobs.values());
  res.json({ success: true, data: { jobs: allJobs } });
});

// Get job by ID
app.get('/make-server-5b47a45d/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  
  res.json({ success: true, data: { job } });
});

// Delete job
app.delete('/make-server-5b47a45d/jobs/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = tokens.get(token);
  
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  jobs.delete(req.params.id);
  res.json({ success: true, message: 'Job deleted' });
});

// Logout
app.post('/make-server-5b47a45d/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) tokens.delete(token);
  res.json({ success: true, message: 'Logged out' });
});

// Refresh token
app.post('/make-server-5b47a45d/refresh', (req, res) => {
  const newAccessToken = generateToken();
  const newRefreshToken = generateToken();
  const deviceId = 'device_' + Math.random().toString(36).substring(2);
  
  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      deviceId
    }
  });
});

const PORT = 54321;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Mock Backend Server ishga tushdi!');
  console.log('📍 URL: http://localhost:' + PORT);
  console.log('✅ CORS: http://localhost:5173');
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /make-server-5b47a45d/health');
  console.log('  POST /make-server-5b47a45d/register');
  console.log('  POST /make-server-5b47a45d/login');
  console.log('  GET  /make-server-5b47a45d/profile');
  console.log('  POST /make-server-5b47a45d/jobs');
  console.log('  GET  /make-server-5b47a45d/jobs');
  console.log('');
});
