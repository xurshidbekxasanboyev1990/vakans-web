<!-- # 🔐 Secure Job Application Platform

A modern, secure job platform with comprehensive security features including JWT authentication, XSS protection, rate limiting, and more.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Deploy Backend

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set JWT_SECRET="your-secure-secret-min-32-chars"
supabase secrets set JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
supabase secrets set ALLOWED_ORIGINS="http://localhost:5173"

# Deploy function
supabase functions deploy server
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## ✅ Security Features

This project implements **9 comprehensive security measures**:

1. ✅ **Password Hashing** - bcrypt for secure password storage
2. ✅ **JWT Authentication** - Access & Refresh tokens with auto-refresh
3. ✅ **No LocalStorage** - SessionStorage for better security
4. ✅ **Rate Limiting** - API abuse prevention (5 login attempts per 15 min)
5. ✅ **XSS Protection** - DOMPurify sanitization on all inputs
6. ✅ **Environment Variables** - Secure configuration management
7. ✅ **Backend Validation** - Zod schemas for all inputs
8. ✅ **HTTPS Enforcement** - Security headers & HSTS
9. ✅ **CORS Configured** - Domain whitelist protection

## 📚 Documentation

- **[SECURITY.md](SECURITY.md)** - Detailed security implementation guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment instructions
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Complete implementation reference

## 🏗️ Project Structure

```
├── src/
│   ├── lib/
│   │   ├── api.ts              # API service with token management
│   │   ├── sanitize.ts         # XSS protection utilities
│   │   ├── validation.ts       # Zod validation schemas
│   │   └── supabase.ts         # Supabase client
│   ├── contexts/
│   │   └── AuthContext.tsx     # Secure authentication context
│   └── app/
│       └── components/         # React components
└── supabase/
    └── functions/
        └── server/
            └── index.tsx       # Secure backend server
```

## 🔑 Key Features

### Authentication
- Secure user registration with email & password
- JWT-based authentication with automatic token refresh
- Role-based access (Worker/Employer)
- Session management

### Job Management
- Employers can post jobs
- Workers can browse and apply
- Protected endpoints with JWT
- Input validation and sanitization

### Security
- All passwords hashed with bcrypt
- XSS attack prevention
- CSRF protection
- Rate limiting on sensitive endpoints
- Comprehensive input validation
- Security headers (HSTS, CSP, etc.)

## 🛠️ Tech Stack

**Frontend:**
- React 18.3
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- DOMPurify
- Zod

**Backend:**
- Supabase Edge Functions
- Hono (Web framework)
- Deno runtime
- bcrypt
- JWT (djwt)
- Rate limiting

## 📝 Usage Examples

### Registration

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { signUp } = useAuth();

await signUp(email, password, {
  firstName: 'John',
  lastName: 'Doe',
  region: 'Tashkent',
  userType: 'worker',
  phone: '+998901234567'
});
```

### Making Authenticated Requests

```typescript
import { apiService } from '@/lib/api';

// Post a job (protected endpoint)
const response = await apiService.postJob({
  title: 'Frontend Developer',
  description: 'Looking for React expert',
  salary: 5000000,
  location: 'Tashkent',
  category: 'IT'
});
```

### Input Sanitization

```typescript
import { sanitizeInput } from '@/lib/sanitize';

const userInput = '<script>alert("XSS")</script>';
const safe = sanitizeInput(userInput);
// Result: "&lt;script&gt;alert("XSS")&lt;/script&gt;"
```

## 🧪 Testing

```bash
# Test health endpoint
curl https://your-project.supabase.co/functions/v1/make-server-5b47a45d/health

# Test rate limiting (should fail after 5 attempts)
for i in {1..10}; do
  curl -X POST https://your-api.com/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

Quick steps:
1. Set environment variables in your hosting platform
2. Deploy backend to Supabase
3. Deploy frontend to Vercel/Netlify
4. Configure CORS for production domain

## 🔒 Security Checklist

Before deploying to production:

- [ ] Strong JWT secrets (32+ characters)
- [ ] Production ALLOWED_ORIGINS configured
- [ ] HTTPS enabled and enforced
- [ ] Database Row Level Security enabled
- [ ] Rate limits configured appropriately
- [ ] Security headers verified
- [ ] Input validation on all endpoints
- [ ] Error handling doesn't leak sensitive info

## 🎯 Next Steps

- [ ] SMS verification integration
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-Factor Authentication (2FA)
- [ ] Audit logging
- [ ] Session management dashboard

## 🤝 Contributing

Contributions are welcome! Please ensure all security features are maintained.

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:
1. Check documentation in `SECURITY.md` and `IMPLEMENTATION.md`
2. Review backend logs: `supabase functions logs server`
3. Verify environment variables are set correctly

---

**Built with security in mind** 🔐 -->