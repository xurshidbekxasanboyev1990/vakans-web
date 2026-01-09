const http = require('http');
const PORT = 54321;

// Simple storage
const db = { 
  users: {}, 
  jobs: {}, 
  tokens: {},
  otpCodes: {},
  supportMessages: {},
  passwordRecoveryRequests: {}
};

// Helper functions
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Production domen yoki environment variable dan olish
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://vakans.uz',
  'https://www.vakans.uz',
  'https://api.vakans.uz',
  // Mobil ilovalar uchun
  '*'
];

function sendJSON(res, status, data, req) {
  const origin = req?.headers?.origin || '*';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '*';
  
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',  // Barcha domenlar uchun (mobil ilovalar ham)
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  });
  res.end(JSON.stringify(data));
}

function genId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function genToken() {
  return 'token_' + Math.random().toString(36).substr(2);
}

function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Server
const server = http.createServer(async (req, res) => {
  const url = req.url;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    sendJSON(res, 200, {});
    return;
  }

  try {
    // Health
    if (url === '/make-server-5b47a45d/health' && method === 'GET') {
      sendJSON(res, 200, { success: true, message: 'Server OK', time: new Date().toISOString() });
      return;
    }

    // ============================================
    // SMS OTP ENDPOINTS
    // ============================================
    
    // Send OTP
    if (url === '/make-server-5b47a45d/otp/send' && method === 'POST') {
      const body = await parseBody(req);
      const { phone } = body;
      
      if (!phone) {
        sendJSON(res, 400, { success: false, error: 'Telefon raqami kerak' });
        return;
      }
      
      const otp = genOTP();
      const otpId = genId();
      
      db.otpCodes[phone] = {
        id: otpId,
        code: otp,
        phone: phone,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 daqiqa
        attempts: 0,
        isUsed: false
      };
      
      console.log(`📱 OTP yuborildi: ${phone} => ${otp}`);
      
      sendJSON(res, 200, { 
        success: true, 
        message: 'SMS kod yuborildi',
        data: { 
          otpId,
          // Demo uchun kodni qaytaramiz, production'da bu bo'lmaydi
          demoCode: otp 
        }
      });
      return;
    }

    // Verify OTP
    if (url === '/make-server-5b47a45d/otp/verify' && method === 'POST') {
      const body = await parseBody(req);
      const { phone, code } = body;
      
      if (!phone || !code) {
        sendJSON(res, 400, { success: false, error: 'Telefon va kod kerak' });
        return;
      }
      
      const otpData = db.otpCodes[phone];
      
      if (!otpData) {
        sendJSON(res, 400, { success: false, error: 'OTP topilmadi. Qaytadan yuborib ko\'ring' });
        return;
      }
      
      if (otpData.isUsed) {
        sendJSON(res, 400, { success: false, error: 'Bu kod allaqachon ishlatilgan' });
        return;
      }
      
      if (Date.now() > otpData.expiresAt) {
        sendJSON(res, 400, { success: false, error: 'Kod muddati tugagan' });
        return;
      }
      
      otpData.attempts++;
      
      if (otpData.attempts > 5) {
        sendJSON(res, 400, { success: false, error: 'Juda ko\'p urinish. Qaytadan kod oling' });
        return;
      }
      
      if (otpData.code !== code) {
        sendJSON(res, 400, { success: false, error: 'Noto\'g\'ri kod' });
        return;
      }
      
      otpData.isUsed = true;
      
      sendJSON(res, 200, { 
        success: true, 
        message: 'Telefon tasdiqlandi',
        data: { verified: true }
      });
      return;
    }

    // ============================================
    // PASSWORD RECOVERY ENDPOINTS
    // ============================================
    
    // Submit password recovery request
    if (url === '/make-server-5b47a45d/password-recovery/request' && method === 'POST') {
      const body = await parseBody(req);
      const { phone, message } = body;
      
      if (!phone) {
        sendJSON(res, 400, { success: false, error: 'Telefon raqami kerak' });
        return;
      }
      
      const requestId = genId();
      
      db.passwordRecoveryRequests[requestId] = {
        id: requestId,
        phone: phone,
        message: message || 'Parolni tiklash so\'rovi',
        status: 'pending',
        adminReply: null,
        newPassword: null,
        createdAt: new Date().toISOString(),
        repliedAt: null
      };
      
      console.log(`🔑 Parol tiklash so'rovi: ${phone}`);
      
      sendJSON(res, 200, { 
        success: true, 
        message: 'So\'rovingiz qabul qilindi. Admin tez orada javob beradi.',
        data: { requestId }
      });
      return;
    }

    // Check password recovery status (user checks their request)
    if (url.startsWith('/make-server-5b47a45d/password-recovery/check/') && method === 'GET') {
      const phone = decodeURIComponent(url.split('/').pop());
      
      // Find latest request for this phone
      const requests = Object.values(db.passwordRecoveryRequests)
        .filter(r => r.phone === phone)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      if (requests.length === 0) {
        sendJSON(res, 404, { success: false, error: 'So\'rov topilmadi' });
        return;
      }
      
      const latestRequest = requests[0];
      
      sendJSON(res, 200, { 
        success: true, 
        data: {
          status: latestRequest.status,
          adminReply: latestRequest.adminReply,
          newPassword: latestRequest.status === 'resolved' ? latestRequest.newPassword : null,
          repliedAt: latestRequest.repliedAt
        }
      });
      return;
    }

    // Admin: Get all password recovery requests
    if (url === '/make-server-5b47a45d/admin/password-recovery' && method === 'GET') {
      const requests = Object.values(db.passwordRecoveryRequests)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      sendJSON(res, 200, { success: true, data: { requests } });
      return;
    }

    // Admin: Reply to password recovery request
    if (url === '/make-server-5b47a45d/admin/password-recovery/reply' && method === 'POST') {
      const body = await parseBody(req);
      const { requestId, adminReply, newPassword } = body;
      
      if (!requestId) {
        sendJSON(res, 400, { success: false, error: 'Request ID kerak' });
        return;
      }
      
      const request = db.passwordRecoveryRequests[requestId];
      
      if (!request) {
        sendJSON(res, 404, { success: false, error: 'So\'rov topilmadi' });
        return;
      }
      
      request.status = 'resolved';
      request.adminReply = adminReply;
      request.newPassword = newPassword;
      request.repliedAt = new Date().toISOString();
      
      console.log(`✅ Parol tiklash javobi: ${request.phone} => ${newPassword}`);
      
      sendJSON(res, 200, { 
        success: true, 
        message: 'Javob yuborildi',
        data: { request }
      });
      return;
    }

    // ============================================
    // REGISTRATION WITH PHONE
    // ============================================
    if (url === '/make-server-5b47a45d/register' && method === 'POST') {
      const body = await parseBody(req);
      const { phone, username, password, firstName, lastName, region, userType } = body;
      
      // Check if phone already exists
      const existingUser = Object.values(db.users).find(u => u.phone === phone);
      if (existingUser) {
        sendJSON(res, 400, { success: false, error: 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan' });
        return;
      }
      
      // Check if username already exists
      if (username) {
        const existingUsername = Object.values(db.users).find(u => u.username === username);
        if (existingUsername) {
          sendJSON(res, 400, { success: false, error: 'Bu username band' });
          return;
        }
      }
      
      const userId = genId();
      const user = {
        id: userId,
        phone: phone,
        username: username,
        plainPassword: password, // Admin uchun
        firstName: firstName || 'Foydalanuvchi',
        lastName: lastName || '',
        region: region,
        userType: userType || 'worker',
        phoneVerified: true,
        createdAt: new Date().toISOString()
      };
      
      db.users[userId] = user;
      
      const accessToken = genToken();
      const refreshToken = genToken();
      const deviceId = genId();
      
      db.tokens[accessToken] = userId;
      
      console.log(`👤 Yangi foydalanuvchi: ${phone} / ${username}`);
      
      sendJSON(res, 201, {
        success: true,
        data: { user, accessToken, refreshToken, deviceId }
      });
      return;
    }

    // Login
    if (url === '/make-server-5b47a45d/login' && method === 'POST') {
      const body = await parseBody(req);
      const { phone, username, password } = body;
      
      // Find user by phone or username
      let user = null;
      if (phone) {
        user = Object.values(db.users).find(u => u.phone === phone);
      } else if (username) {
        user = Object.values(db.users).find(u => u.username === username);
      }
      
      // Demo: Agar foydalanuvchi topilmasa, test user yaratamiz
      if (!user) {
        // Check if it's admin
        if (phone === '+998996983806' && password === 'XOJISAID.13.13') {
          const adminId = genId();
          user = {
            id: adminId,
            phone: '+998996983806',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'XOJISAID',
            region: 'Toshkent',
            userType: 'admin',
            plainPassword: 'XOJISAID.13.13'
          };
          db.users[adminId] = user;
        } else {
          sendJSON(res, 401, { success: false, error: 'Telefon yoki parol noto\'g\'ri' });
          return;
        }
      } else {
        // Check password
        if (user.plainPassword && user.plainPassword !== password) {
          sendJSON(res, 401, { success: false, error: 'Parol noto\'g\'ri' });
          return;
        }
      }
      
      const accessToken = genToken();
      const refreshToken = genToken();
      const deviceId = genId();
      
      db.tokens[accessToken] = user.id;
      
      console.log(`🔐 Login: ${user.phone} / ${user.username}`);
      
      sendJSON(res, 200, {
        success: true,
        data: { user, accessToken, refreshToken, deviceId }
      });
      return;
    }

    // Profile GET
    if (url === '/make-server-5b47a45d/profile' && method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = db.tokens[token];
      
      if (!userId) {
        sendJSON(res, 401, { success: false, error: 'Unauthorized' });
        return;
      }
      
      const user = db.users[userId] || {
        id: userId,
        email: 'mock@test.com',
        firstName: 'Mock',
        lastName: 'User',
        region: 'Toshkent',
        userType: 'worker'
      };
      
      sendJSON(res, 200, { success: true, data: { user } });
      return;
    }

    // Profile PUT
    if (url === '/make-server-5b47a45d/profile' && method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = db.tokens[token];
      
      if (!userId) {
        sendJSON(res, 401, { success: false, error: 'Unauthorized' });
        return;
      }
      
      const body = await parseBody(req);
      let user = db.users[userId];
      if (user) {
        Object.assign(user, body);
        db.users[userId] = user;
      }
      
      sendJSON(res, 200, { success: true, data: { user } });
      return;
    }

    // Jobs POST
    if (url === '/make-server-5b47a45d/jobs' && method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = db.tokens[token];
      
      if (!userId) {
        sendJSON(res, 401, { success: false, error: 'Unauthorized' });
        return;
      }
      
      const body = await parseBody(req);
      const jobId = genId();
      const job = {
        id: jobId,
        ...body,
        employerId: userId,
        createdAt: new Date().toISOString()
      };
      
      db.jobs[jobId] = job;
      sendJSON(res, 201, { success: true, data: { job } });
      return;
    }

    // Jobs GET
    if (url === '/make-server-5b47a45d/jobs' && method === 'GET') {
      const jobs = Object.values(db.jobs);
      sendJSON(res, 200, { success: true, data: { jobs } });
      return;
    }

    // Logout
    if (url === '/make-server-5b47a45d/logout' && method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) delete db.tokens[token];
      sendJSON(res, 200, { success: true, message: 'Logged out' });
      return;
    }

    // Refresh
    if (url === '/make-server-5b47a45d/refresh' && method === 'POST') {
      sendJSON(res, 200, {
        success: true,
        data: {
          accessToken: genToken(),
          refreshToken: genToken(),
          deviceId: genId()
        }
      });
      return;
    }

    // Not found
    sendJSON(res, 404, { success: false, error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    sendJSON(res, 500, { success: false, error: 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log('\n🚀 Mock Backend Server ishga tushdi!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('✅ CORS: http://localhost:5173\n');
  console.log('Ready for requests!\n');
});
