<!-- # 🚀 Production Deployment Checklist

Bu loyihani production serverga qo'yishdan oldin bajarilishi kerak bo'lgan ishlar.

## 📋 Talab qilinadigan Ishlar

### 1. ✅ Backend Setup (Supabase yoki boshqa)

**Variant A: Supabase (Tavsiya etiladi)**
```bash
# Supabase CLI o'rnatish
npm install -g supabase

# Supabase account yaratish
# https://supabase.com/ - ro'yxatdan o'ting
# Yangi project yarating

# Login qiling
supabase login

# Project bilan bog'lang
supabase link --project-ref YOUR_PROJECT_REF

# Secrets o'rnating
supabase secrets set JWT_SECRET="kamida-32-ta-belgidan-iborat-maxfiy-kalit"
supabase secrets set JWT_REFRESH_SECRET="boshqa-32-ta-belgidan-maxfiy-kalit"
supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com"

# Backend deploy qiling
supabase functions deploy server
```

**Variant B: Railway.app, Render.com, yoki Fly.io**
- Node.js backend deploy qilish mumkin
- PostgreSQL database qo'shish kerak

### 2. 📱 SMS Verification (KERAK!)

**Eskiz.uz Integration (O'zbekiston uchun)**

1. Eskiz.uz da ro'yxatdan o'ting: https://eskiz.uz/
2. API token oling
3. Backend ga SMS kod yuborish funksiyasini qo'shing

```typescript
// supabase/functions/server/index.tsx ga qo'shish kerak:

// SMS verification endpoint
app.post('/auth/verify-sms', async (c) => {
  const { phone, code } = await c.req.json();
  
  // Verify code from database
  // Update user as verified
  
  return c.json({ success: true });
});

// SMS yuborish funksiyasi
async function sendSMS(phone: string, code: string) {
  const response = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('ESKIZ_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobile_phone: phone,
      message: `Tasdiqlash kodi: ${code}`,
      from: '4546',
    }),
  });
  
  return response.json();
}
```

4. Environment ga qo'shing:
```bash
supabase secrets set ESKIZ_TOKEN="your-eskiz-api-token"
```

### 3. 🗄️ Real Database

**Supabase Postgres Tables yaratish:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  region TEXT,
  user_type TEXT CHECK (user_type IN ('worker', 'employer')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  salary NUMERIC,
  location TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  worker_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token TEXT NOT NULL,
  device_id TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SMS verification codes
CREATE TABLE sms_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can read jobs" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Employers can create jobs" ON jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'employer'
    )
  );
```

### 4. 🔐 Environment Variables

**Production .env:**
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Backend secrets (Supabase Secrets da)
JWT_SECRET=kamida-32-ta-belgidan-iborat-kuchli-maxfiy-kalit
JWT_REFRESH_SECRET=boshqa-32-ta-belgidan-maxfiy-refresh-kalit
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# SMS
ESKIZ_TOKEN=your-eskiz-api-token

# Database
DATABASE_URL=your-supabase-postgres-connection-string
```

### 5. 🌐 Frontend Deploy

**Vercel (Tavsiya etiladi):**
```bash
# Vercel CLI o'rnatish
npm install -g vercel

# Deploy
vercel

# Environment variables o'rnatish (Vercel dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Yoki Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### 6. 🔒 HTTPS & Domain

1. Domain xarid qiling (example.com)
2. DNS sozlang:
   - Frontend: Vercel/Netlify DNS
   - Backend: Supabase avtomatik HTTPS beradi
3. CORS sozlang production domain bilan

### 7. ✅ Security Checklist

Oxirgi tekshiruvlar:

- [ ] **JWT Secrets** - 32+ belgili, tasodifiy
- [ ] **HTTPS** - Hamma joyda majburiy
- [ ] **CORS** - Faqat production domain
- [ ] **Rate Limiting** - Aktiv
- [ ] **Database RLS** - Yoqilgan
- [ ] **SMS Verification** - Ishlayapti
- [ ] **Error Handling** - Maxfiy ma'lumot chiqmaydi
- [ ] **Input Validation** - Barcha endpointlarda
- [ ] **Password Hashing** - bcrypt bilan
- [ ] **XSS Protection** - DOMPurify aktiv

## 📝 Qisqacha Qadamlar

1. **Supabase project yarating** → Database tables yarating
2. **SMS provider (Eskiz.uz)** → Token oling va integratsiya qiling
3. **Backend deploy** → `supabase functions deploy server`
4. **Environment sozlash** → Production secrets o'rnating
5. **Frontend deploy** → Vercel yoki Netlify
6. **Domain sozlash** → DNS va HTTPS
7. **Test qiling** → Barcha funksiyalarni tekshiring

## ⏱️ Taxminiy Vaqt

- Supabase setup: **30 daqiqa**
- SMS integration: **1-2 soat**
- Database migration: **30 daqiqa**
- Frontend deploy: **15 daqiqa**
- Testing: **1-2 soat**

**Jami: 4-6 soat**

## 💰 Narxlar (Taxminiy)

- **Supabase Free Tier**: $0/oy (500MB DB, 50,000 requests)
- **Vercel Free**: $0/oy (hobby projects)
- **Eskiz.uz SMS**: ~30-50 so'm/SMS
- **Domain**: ~$10-15/yil (.com, .uz)

**Jami start uchun: Deyarli bepul!**

## 🆘 Keyingi Qadam

Agar production ga deploy qilmoqchi bo'lsangiz:

```bash
# Birinchi, SMS integrationni qo'shamiz
# Keyin Supabase sozlaymiz
# Keyin deploy qilamiz
```

**Menga ayting, qaysi qismidan boshlaysiz?**
1. SMS verification qo'shish
2. Supabase setup
3. Ikkisini birga -->
