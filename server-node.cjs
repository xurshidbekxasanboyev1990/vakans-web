// Simple Node.js server for development
const http = require('http');
const url = require('url');

const PORT = 54321;
const users = new Map();
const jobs = new Map();
const applications = new Map();
const avatars = new Map(); // Store base64 avatar data
let tokens = new Map();

// Helper
function generateToken() {
  return 'mock_token_' + Math.random().toString(36).substring(2);
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5174',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': 'http://localhost:5174',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Health check
  if (path === '/make-server-5b47a45d/health') {
    return sendJSON(res, 200, {
      success: true,
      message: 'Server ishlayapti',
      timestamp: new Date().toISOString()
    });
  }

  // Register
  if (path === '/make-server-5b47a45d/register' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const userId = 'user_' + Date.now();
        const user = {
          id: userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          userType: data.userType,
          region: data.region,
          createdAt: new Date().toISOString()
        };
        users.set(userId, user);
        
        const token = generateToken();
        const refreshToken = generateToken();
        tokens.set(token, userId);
        
        return sendJSON(res, 201, {
          success: true,
          user,
          token,
          refreshToken
        });
      } catch (e) {
        return sendJSON(res, 400, { success: false, error: 'Invalid data' });
      }
    });
    return;
  }

  // Login
  if (path === '/make-server-5b47a45d/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const user = Array.from(users.values()).find(u => u.email === data.email);
        
        if (!user) {
          return sendJSON(res, 401, { success: false, error: 'User not found' });
        }
        
        const token = generateToken();
        const refreshToken = generateToken();
        tokens.set(token, user.id);
        
        return sendJSON(res, 200, {
          success: true,
          user,
          token,
          refreshToken
        });
      } catch (e) {
        return sendJSON(res, 400, { success: false, error: 'Invalid data' });
      }
    });
    return;
  }

  // Get jobs
  if (path === '/make-server-5b47a45d/jobs' && method === 'GET') {
    const allJobs = Array.from(jobs.values());
    return sendJSON(res, 200, {
      success: true,
      jobs: allJobs
    });
  }

  // Create job
  if (path === '/make-server-5b47a45d/jobs' && method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { success: false, error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const userId = tokens.get(token);
    
    if (!userId) {
      return sendJSON(res, 401, { success: false, error: 'Invalid token' });
    }
    
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const jobId = 'job_' + Date.now();
        const user = users.get(userId);
        
        const job = {
          id: jobId,
          ...data,
          employerId: userId,
          employerName: user.firstName + ' ' + user.lastName,
          employerRegion: user.region,
          employerPhone: user.phone,
          createdAt: new Date().toISOString()
        };
        
        jobs.set(jobId, job);
        
        return sendJSON(res, 201, {
          success: true,
          job
        });
      } catch (e) {
        return sendJSON(res, 400, { success: false, error: 'Invalid data' });
      }
    });
    return;
  }

  // Profile
  if (path === '/make-server-5b47a45d/profile' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { success: false, error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const userId = tokens.get(token);
    
    if (!userId) {
      return sendJSON(res, 401, { success: false, error: 'Invalid token' });
    }
    
    const user = users.get(userId);
    return sendJSON(res, 200, {
      success: true,
      user
    });
  }

  // Get applications (for employer)
  if (path === '/make-server-5b47a45d/applications' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { success: false, error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const userId = tokens.get(token);
    
    if (!userId) {
      return sendJSON(res, 401, { success: false, error: 'Invalid token' });
    }
    
    // Get applications for employer's jobs
    const employerJobs = Array.from(jobs.values()).filter(j => j.employerId === userId);
    const jobIds = employerJobs.map(j => j.id);
    const employerApplications = Array.from(applications.values())
      .filter(app => jobIds.includes(app.jobId));
    
    return sendJSON(res, 200, {
      success: true,
      applications: employerApplications
    });
  }

  // Submit application (for worker)
  if (path === '/make-server-5b47a45d/applications' && method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { success: false, error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const userId = tokens.get(token);
    
    if (!userId) {
      return sendJSON(res, 401, { success: false, error: 'Invalid token' });
    }
    
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const user = users.get(userId);
        const job = jobs.get(data.jobId);
        
        if (!job) {
          return sendJSON(res, 404, { success: false, error: 'Job not found' });
        }
        
        // Check if already applied
        const existing = Array.from(applications.values())
          .find(app => app.jobId === data.jobId && app.workerId === userId);
        
        if (existing) {
          return sendJSON(res, 400, { success: false, error: 'Already applied' });
        }
        
        const appId = 'app_' + Date.now();
        const application = {
          id: appId,
          jobId: data.jobId,
          workerId: userId,
          workerName: user.firstName + ' ' + user.lastName,
          workerRegion: user.region,
          workerPhone: user.phone,
          message: data.message,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        applications.set(appId, application);
        
        return sendJSON(res, 201, {
          success: true,
          application
        });
      } catch (e) {
        return sendJSON(res, 400, { success: false, error: 'Invalid data' });
      }
    });
    return;
  }

  // Update application status
  if (path.startsWith('/make-server-5b47a45d/applications/') && method === 'PUT') {
    const appId = path.split('/').pop();
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { success: false, error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const userId = tokens.get(token);
    
    if (!userId) {
      return sendJSON(res, 401, { success: false, error: 'Invalid token' });
    }
    
    const application = applications.get(appId);
    if (!application) {
      return sendJSON(res, 404, { success: false, error: 'Application not found' });
    }
    
    // Verify employer owns the job
    const job = jobs.get(application.jobId);
    if (job.employerId !== userId) {
      return sendJSON(res, 403, { success: false, error: 'Forbidden' });
    }
    
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        application.status = data.status;
        applications.set(appId, application);
        
        return sendJSON(res, 200, {
          success: true,
          application
        });
      } catch (e) {
        return sendJSON(res, 400, { success: false, error: 'Invalid data' });
      }
    });
    return;
  }

  // Upload avatar
  if (path === '/make-server-5b47a45d/avatar/upload' && method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { success: false, error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const userId = tokens.get(token);
    
    if (!userId) {
      return sendJSON(res, 401, { success: false, error: 'Invalid token' });
    }
    
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Store avatar data (in real app, this would be Supabase Storage)
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`;
        avatars.set(userId, data.imageData || avatarUrl);
        
        const user = users.get(userId);
        if (user) {
          user.avatarUrl = avatarUrl;
          users.set(userId, user);
        }
        
        return sendJSON(res, 200, {
          success: true,
          avatarUrl
        });
      } catch (e) {
        return sendJSON(res, 400, { success: false, error: 'Invalid data' });
      }
    });
    return;
  }

  // Delete avatar
  if (path === '/make-server-5b47a45d/avatar/delete' && method === 'DELETE') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { success: false, error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const userId = tokens.get(token);
    
    if (!userId) {
      return sendJSON(res, 401, { success: false, error: 'Invalid token' });
    }
    
    avatars.delete(userId);
    
    const user = users.get(userId);
    if (user) {
      delete user.avatarUrl;
      users.set(userId, user);
    }
    
    return sendJSON(res, 200, {
      success: true,
      message: 'Avatar deleted'
    });
  }

  // Not found
  sendJSON(res, 404, {
    success: false,
    error: 'Not found'
  });
});

server.listen(PORT, () => {
  console.log(`\n✅ Mock server ishlamoqda: http://localhost:${PORT}`);
  console.log(`✅ Frontend: http://localhost:5174\n`);
  console.log('Endpoints:');
  console.log('  - GET  /make-server-5b47a45d/health');
  console.log('  - POST /make-server-5b47a45d/register');
  console.log('  - POST /make-server-5b47a45d/login');
  console.log('  - GET  /make-server-5b47a45d/jobs');
  console.log('  - POST /make-server-5b47a45d/jobs');
  console.log('  - GET  /make-server-5b47a45d/profile');
  console.log('  - GET  /make-server-5b47a45d/applications');
  console.log('  - POST /make-server-5b47a45d/applications');
  console.log('  - PUT  /make-server-5b47a45d/applications/:id');
  console.log('  - POST /make-server-5b47a45d/avatar/upload');
  console.log('  - DELETE /make-server-5b47a45d/avatar/delete\n');
});
