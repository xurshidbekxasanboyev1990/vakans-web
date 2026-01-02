<!-- # Security Implementation Guide

Bu loyihada quyidagi xavfsizlik choralari amalga oshirilgan:

## ✅ Amalga oshirilgan xavfsizlik choralari

### 1. Parollarni Hash qilish (bcrypt)
- **Backend**: `bcrypt` kutubxonasi yordamida parollar xesh qilinadi
- **Fayl**: `supabase/functions/server/index.tsx`
- **Funksiyalar**: `hashPassword()`, `verifyPassword()`
- Parollar hech qachon ochiq ko'rinishda saqlanmaydi

### 2. JWT Autentifikatsiya
- **Access Token**: 15 daqiqa amal qiladi
- **Refresh Token**: 7 kun amal qiladi
- **Algorihm**: HS256 (HMAC SHA-256)
- **Fayl**: `supabase/functions/server/index.tsx`
- Tokenlar server tarafida yaratiladi va tekshiriladi
- Refresh token avtomatik yangilanadi

### 3. LocalStorage'dan voz kechish
- **Frontend**: `sessionStorage` ishlatiladi (xavfsizroq)
- **Fayl**: `src/lib/api.ts`
- Sessionlar brauzer yopilganda tozalanadi
- XSS hujumlaridan himoyalangan

### 4. Rate Limiting
- **Umumiy endpoint**: 15 daqiqada 100 ta so'rov
- **Auth endpoint**: 15 daqiqada 5 ta so'rov
- **Kutubxona**: `hono-rate-limiter`
- IP manzil asosida cheklanadi

### 5. XSS Protection (DOMPurify)
- **Frontend**: `src/lib/sanitize.ts`
- **Backend**: HTML teglar escape qilinadi
- Barcha foydalanuvchi kiritmalari tozalanadi
- 4 xil sanitize funksiyasi:
  - `sanitizeInput()` - oddiy matn
  - `sanitizeHTML()` - asosiy HTML
  - `sanitizeRichText()` - to'liq matn editorda
  - `sanitizeObject()` - obyektlar uchun

### 6. Environment Variables (.env)
- **Fayl**: `.env` (gitignore'ga qo'shilgan)
- **Namuna**: `.env.example`
- Barcha maxfiy ma'lumotlar `.env` faylida
- Production uchun Supabase environment variables ishlatiladi

### 7. Backend Validation (Zod)
- **Fayl**: `src/lib/validation.ts`
- **Sxemalar**:
  - `registerSchema` - ro'yxatdan o'tish
  - `loginSchema` - kirish
  - `jobSchema` - ish e'lonlari
  - `profileUpdateSchema` - profil yangilash
- Frontend va backend ikkalasida ham validatsiya

### 8. HTTPS Enforcement
- **Middleware**: `supabase/functions/server/index.tsx`
- Production'da HTTP'dan HTTPS'ga yo'naltiradi
- `X-Forwarded-Proto` sarlavhasi tekshiriladi
- HSTS (Strict-Transport-Security) header

### 9. CORS Properly Configured
- **Whitelist**: Faqat ruxsat etilgan domenlar
- **Credentials**: `true` (cookie'lar uchun)
- **Methods**: GET, POST, PUT, DELETE
- **Headers**: Content-Type, Authorization
- Production uchun `.env`da sozlanadi

## 📁 Fayl Tuzilmasi

```
├── .env                          # Environment variables (gitignore)
├── .env.example                  # Environment variables namunasi
├── src/
│   ├── lib/
│   │   ├── api.ts               # API service (token management)
│   │   ├── sanitize.ts          # XSS protection utilities
│   │   ├── validation.ts        # Zod validation schemas
│   │   └── supabase.ts          # Supabase client config
│   └── contexts/
│       └── AuthContext.tsx      # Secure auth context (no localStorage)
└── supabase/
    └── functions/
        └── server/
            └── index.tsx         # Secure backend server
```

## 🚀 O'rnatish

### 1. Dependencies o'rnatish

```bash
npm install dompurify isomorphic-dompurify @types/dompurify
```

Zod allaqachon package.json'da mavjud.

### 2. Environment variables sozlash

`.env` faylini yarating va quyidagilarni kiriting:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# JWT Configuration
JWT_SECRET=super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=super-secret-refresh-key-change-this-in-production-min-32
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com

# Environment
NODE_ENV=development
```

### 3. Supabase Functions deploy qilish

```bash
# Supabase CLI o'rnatish
npm install -g supabase

# Login qilish
supabase login

# Function deploy qilish
supabase functions deploy server

# Environment variables qo'shish
supabase secrets set JWT_SECRET=your-secret-key
supabase secrets set JWT_REFRESH_SECRET=your-refresh-secret
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com
```

### 4. Frontend ishga tushirish

```bash
npm run dev
```

## 🔐 Security Headers

Backend har bir javobda quyidagi xavfsizlik sarlavhalarini qaytaradi:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'...`

## 🔑 API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `POST /register` - Ro'yxatdan o'tish
- `POST /login` - Kirish
- `GET /jobs` - Barcha ishlar

### Protected Endpoints (JWT required)
- `GET /profile` - Profil olish
- `PUT /profile` - Profilni yangilash
- `POST /logout` - Chiqish
- `POST /jobs` - Ish e'lon qilish (employer only)
- `DELETE /jobs/:id` - Ish o'chirish (employer only)

### Token Management
- `POST /refresh` - Token yangilash

## 🛡️ Xavfsizlik Testlari

### 1. XSS Test
```javascript
// Bu input avtomatik tozalanadi
const maliciousInput = '<script>alert("XSS")</script>';
const safe = sanitizeInput(maliciousInput);
// Result: "&lt;script&gt;alert("XSS")&lt;/script&gt;"
```

### 2. Rate Limiting Test
```bash
# 5 martadan ko'p login urinishi
for i in {1..10}; do
  curl -X POST http://localhost:54321/functions/v1/make-server-5b47a45d/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# 6-chi so'rovdan keyin 429 Too Many Requests
```

### 3. JWT Expiry Test
```javascript
// Token 15 daqiqadan keyin avtomatik yangilanadi
// Agar refresh token ham yaroqsiz bo'lsa, foydalanuvchi chiqariladi
```

## 📝 Qo'shimcha Tavsiyalar

1. **Production'da**:
   - `NODE_ENV=production` qiling
   - Strong JWT secrets ishlatilsin (32+ characters)
   - ALLOWED_ORIGINS'ga faqat o'z domenlaringizni qo'shing
   - Regular backup oling

2. **Database Security**:
   - Supabase Row Level Security (RLS) yoqing
   - Database migrations bilan ishlang
   - Sensitive data'ni encrypt qiling

3. **Monitoring**:
   - Failed login attempts monitor qiling
   - Rate limit violations kuzatib boring
   - Error logs'ni tekshiring

4. **Future Enhancements**:
   - Two-Factor Authentication (2FA)
   - Email verification
   - Password reset functionality
   - SMS verification (keyingi qadam)
   - Audit logging
   - IP blacklisting

## ⚠️ Muhim Eslatmalar

- `.env` faylini hech qachon Git'ga commit qilmang
- Production'da JWT secret'larini o'zgartiring
- Regular security audit'lar o'tkazing
- Dependencies'ni yangilab turing
- HTTPS'dan foydalaning (HTTP emas)

## 🎯 Keyingi Qadamlar

- [ ] SMS verification (Twilio/Vonage)
- [ ] Email verification
- [ ] Password reset
- [ ] Two-Factor Authentication (2FA)
- [ ] Audit logging
- [ ] IP-based restrictions
- [ ] CAPTCHA integration
- [ ] Session management dashboard

## 📞 Muammolar

Agar muammo bo'lsa:
1. `.env` fayli to'g'ri sozlanganligini tekshiring
2. Supabase secrets sozlanganligini tekshiring
3. Node.js versiyasi 18+ ekanligini tekshiring
4. Dependencies to'liq o'rnatilganligini tekshiring -->
