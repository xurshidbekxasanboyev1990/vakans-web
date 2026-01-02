# 🚀 Backend ni Ishga Tushurish (Supabase)

## Opsiya 1: Supabase Cloud (Tavsiya etiladi)

### 1. Supabase Project Yaratish

1. **Supabase.com ga boring:** https://supabase.com
2. **Sign up** qiling (GitHub bilan kirish mumkin)
3. **New Project** tugmasini bosing
4. Project nomi, database parol va region tanlang
5. **Create new project** tugmasini bosing (1-2 daqiqa kutish kerak)

### 2. API Credentials Olish

1. Project ochilgandan keyin, **Settings** > **API** ga boring
2. Quyidagilarni nusxalang:
   - **Project URL** (masalan: https://xxxxx.supabase.co)
   - **anon public** key

### 3. Environment O'zgaruvchilarini Sozlash

`.env` faylini tahrirlang:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Backend Funksiyalarini Deploy Qilish

Terminal ochib quyidagi buyruqlarni bajaring:

```powershell
# Supabase CLI ni o'rnatish (NPM orqali)
npm install -g supabase

# Supabase ga login qilish
supabase login

# Project bilan bog'lanish
supabase link --project-ref your-project-ref

# Edge Function ni deploy qilish
supabase functions deploy server

# Secrets sozlash
supabase secrets set JWT_SECRET="your-secret-key-min-32-characters-change-in-production"
supabase secrets set JWT_REFRESH_SECRET="your-refresh-secret-min-32-characters-change"
supabase secrets set ALLOWED_ORIGINS="http://localhost:5173,https://yourdomain.com"
supabase secrets set NODE_ENV="production"
```

### 5. Database Tables Yaratish

Supabase Dashboard da **SQL Editor** ga boring va quyidagi scriptni ishga tushiring:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  region TEXT,
  user_type TEXT CHECK (user_type IN ('worker', 'employer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  salary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table (optional)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, worker_id)
);

-- Indexes for better performance
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
```

---

## Opsiya 2: Local Supabase (Development uchun)

### 1. Docker ni O'rnatish

**Windows:**
- Docker Desktop ni yuklab oling: https://www.docker.com/products/docker-desktop/
- O'rnating va ishga tushiring

**Linux/Mac:**
```bash
# Docker ni o'rnatish
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Supabase CLI ni O'rnatish

**Windows (PowerShell):**
```powershell
# NPM orqali
npm install -g supabase

# Yoki Scoop orqali (tavsiya etiladi)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux/Mac:**
```bash
# Homebrew bilan
brew install supabase/tap/supabase

# Yoki NPM bilan
npm install -g supabase
```

### 3. Local Supabase ni Ishga Tushirish

```bash
# Supabase ni ishga tushirish (birinchi marta 5-10 daqiqa davom etishi mumkin)
supabase start

# Output:
# Started supabase local development setup.
#
# API URL: http://localhost:54321
# GraphQL URL: http://localhost:54321/graphql/v1
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
# JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Environment ni Yangilash

`.env` faylini yangilang:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGci... (yuqoridagi anon key)
```

### 5. Edge Functions ni Local Serve Qilish

```bash
# Edge function ni local ishga tushirish
cd supabase/functions
supabase functions serve server --env-file ../../.env --no-verify-jwt

# Yoki production mode bilan
supabase functions serve server --env-file ../../.env
```

---

## 🧪 Backend ni Test Qilish

### Health Check

```bash
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:54321/functions/v1/make-server-5b47a45d/health" -Method GET

# Yoki curl bilan
curl http://localhost:54321/functions/v1/make-server-5b47a45d/health
```

Javob:
```json
{
  "success": true,
  "message": "Server ishlayapti",
  "timestamp": "2024-12-30T..."
}
```

### User Registration Test

```bash
# PowerShell
$body = @{
  email = "test@example.com"
  password = "Test@1234"
  firstName = "Test"
  lastName = "User"
  region = "Toshkent"
  userType = "worker"
  phone = "+998901234567"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:54321/functions/v1/make-server-5b47a45d/register" -Method POST -Body $body -ContentType "application/json"
```

---

## 🎯 To'liq Stack Ishga Tushirish

### 1. Backend (Terminal 1)
```bash
cd supabase/functions
supabase functions serve server --env-file ../../.env
```

### 2. Frontend (Terminal 2)
```bash
npm run dev
```

### 3. Ochish

- **Frontend:** http://localhost:5173/
- **Backend API:** http://localhost:54321/functions/v1/make-server-5b47a45d/
- **Supabase Studio:** http://localhost:54323/

---

## ⚡ Tezkor Ishga Tushirish (Har safar)

```bash
# Terminal 1: Supabase
supabase start
cd supabase/functions
supabase functions serve server

# Terminal 2: Frontend
npm run dev
```

---

## 🛑 To'xtatish

```bash
# Frontend
Ctrl + C

# Supabase
supabase stop
```

---

## 📝 Muhim Eslatmalar

### JWT Secrets
Backend ishga tushganda, `JWT_SECRET` va `JWT_REFRESH_SECRET` sozlangan bo'lishi kerak:

```bash
# Local development uchun
supabase secrets set JWT_SECRET="dev-secret-key-min-32-characters-long-change-in-production"
supabase secrets set JWT_REFRESH_SECRET="dev-refresh-secret-min-32-characters-change"
supabase secrets set ALLOWED_ORIGINS="http://localhost:5173"
supabase secrets set NODE_ENV="development"
```

### CORS
Local development uchun ALLOWED_ORIGINS ni `http://localhost:5173` qilib sozlang.

### Database Migrations
Agar database schema o'zgarsa:

```bash
# Migration yaratish
supabase migration new your_migration_name

# Migration ni apply qilish
supabase db push
```

---

## 🆘 Muammolar va Yechimlar

### "Cannot connect to Supabase"
✓ Docker ishlab turganini tekshiring: `docker ps`
✓ Supabase ishga tushganini tekshiring: `supabase status`
✓ Port band emasligini tekshiring (54321, 54322, 54323)

### "JWT_SECRET not found"
✓ Secrets sozlanganini tekshiring: `supabase secrets list`
✓ .env fayliga secrets qo'shing

### "Function not found"
✓ Function deploy qilinganini tekshiring
✓ Function nomi to'g'ri yozilganini tekshiring
✓ URL to'g'ri formatda: `/functions/v1/make-server-5b47a45d/...`

### Docker xatolari
✓ Docker Desktop ishga tushiring
✓ WSL 2 yoqilgan bo'lsin (Windows)
✓ Virtualization BIOS da yoqilgan bo'lsin

---

**Status:** Backend Setup Guide ✅
**Next:** SMS Verification Implementation
