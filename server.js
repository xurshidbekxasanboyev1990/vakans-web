import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 54321;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// In-memory storage
const storage = {
  users: new Map(),
  jobs: new Map(),
  tokens: new Map()
};

// Helper
const genId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
const genToken = () => 'token_' + Math.random().toString(36).substr(2);

// Health
app.get('/make-server-5b47a45d/health', (req, res) => {
  res.json({ success: true, message: 'Server OK', time: new Date().toISOString() });
});

// Register
app.post('/make-server-5b47a45d/register', (req, res) => {
  try {
    const userId = genId();
    const user = {
      id: userId,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      region: req.body.region,
      userType: req.body.userType,
      phone: req.body.phone
    };
    
    storage.users.set(userId, user);
    
    const accessToken = genToken();
    const refreshToken = genToken();
    const deviceId = genId();
    
    storage.tokens.set(accessToken, userId);
    
    res.status(201).json({
      success: true,
      data: { user, accessToken, refreshToken, deviceId }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login
app.post('/make-server-5b47a45d/login', (req, res) => {
  try {
    const userId = genId();
    const user = {
      id: userId,
      email: req.body.email,
      firstName: 'Mock',
      lastName: 'User',
      region: 'Toshkent',
      userType: 'worker',
      phone: '+998901234567'
    };
    
    storage.users.set(userId, user);
    
    const accessToken = genToken();
    const refreshToken = genToken();
    const deviceId = genId();
    
    storage.tokens.set(accessToken, userId);
    
    res.json({
      success: true,
      data: { user, accessToken, refreshToken, deviceId }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Profile GET
app.get('/make-server-5b47a45d/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = storage.tokens.get(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const user = storage.users.get(userId) || {
      id: userId,
      email: 'mock@test.com',
      firstName: 'Mock',
      lastName: 'User',
      region: 'Toshkent',
      userType: 'worker'
    };
    
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Profile PUT
app.put('/make-server-5b47a45d/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = storage.tokens.get(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    let user = storage.users.get(userId);
    if (user) {
      Object.assign(user, req.body);
      storage.users.set(userId, user);
    }
    
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Jobs POST
app.post('/make-server-5b47a45d/jobs', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = storage.tokens.get(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const jobId = genId();
    const job = {
      id: jobId,
      ...req.body,
      employerId: userId,
      createdAt: new Date().toISOString()
    };
    
    storage.jobs.set(jobId, job);
    res.status(201).json({ success: true, data: { job } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Jobs GET
app.get('/make-server-5b47a45d/jobs', (req, res) => {
  try {
    const jobs = Array.from(storage.jobs.values());
    res.json({ success: true, data: { jobs } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Job GET by ID
app.get('/make-server-5b47a45d/jobs/:id', (req, res) => {
  try {
    const job = storage.jobs.get(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, data: { job } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Job DELETE
app.delete('/make-server-5b47a45d/jobs/:id', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = storage.tokens.get(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    storage.jobs.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout
app.post('/make-server-5b47a45d/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) storage.tokens.delete(token);
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refresh
app.post('/make-server-5b47a45d/refresh', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        accessToken: genToken(),
        refreshToken: genToken(),
        deviceId: genId()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start
app.listen(PORT, () => {
  console.log('\n🚀 Mock Backend Server ishga tushdi!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('✅ CORS: http://localhost:5173\n');
  console.log('Ready to accept requests!\n');
});
