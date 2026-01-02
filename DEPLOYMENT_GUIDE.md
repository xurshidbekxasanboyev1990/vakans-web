# 🚀 DEPLOYMENT GUIDE - Production Ready

Sizning loyihangiz endi production serverga deploy qilishga tayyor! Quyidagi qadamlarni bajaring.

## ✅ Nima Tayyor

1. **✅ Database Schema** - `supabase/migrations/001_initial_schema.sql`
   - Users, Jobs, Applications, Refresh Tokens, Messages, Conversations
   - Row Level Security (RLS) policies
   - Real-time messaging qo'llab-quvvatlash
   
2. **✅ JWT Secrets** - `.env` faylida strong secrets
   - `JWT_SECRET` - 32+ belgili kuchli kalit
   - `JWT_REFRESH_SECRET` - boshqa kuchli kalit

3. **✅ HTTPS & Security** - `supabase/functions/server/index.tsx`
   - HSTS headers (1 yillik)
   - Content Security Policy
   - XSS protection
   - Clickjacking protection
   - HTTPS majburlash

4. **✅ Real-time Chat** - `src/lib/chat.ts` va `src/app/components/ChatComponents.tsx`
   - Worker va Employer uchun bir xil ishlaydi
   - Real-time message delivery
   - Unread count
   - Conversation list

## 📋 Deployment Qadamlari

### 1. Supabase Project Yaratish (5 daqiqa)

```bash
# A) Supabase CLI o'rnatish
npm install -g supabase

# B) Supabase.com ga kiring
# https://supabase.com/dashboard
# "New Project" bosing:
#   - Organization: Yangi yarating yoki mavjudni tanlang
#   - Name: works-uz-job-platform (yoki istalgan nom)
#   - Database Password: Kuchli parol yarating va saqlang!
#   - Region: Singapore (yoki yaqin region)

# C) CLI login
supabase login

# D) Project bilan bog'lang
cd c:\Users\User\Desktop\Works-main\Works-main
supabase link --project-ref YOUR_PROJECT_REF
# YOUR_PROJECT_REF - Supabase dashboard URL dan oling
# Masalan: https://app.supabase.com/project/abcdefghij
# abcdefghij - bu project ref
```

### 2. Database Migration (2 daqiqa)

```bash
# Migration faylini tekshiring
cat supabase\migrations\001_initial_schema.sql

# Migration qiling
supabase db push

# Tekshiring
supabase db pull
```

**Yoki Dashboard orqali:**
1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/001_initial_schema.sql` faylini oching
3. Butun kodni copy qiling
4. SQL Editor ga paste qiling
5. "Run" bosing

### 3. Backend Deploy (5 daqiqa)

```bash
# A) Environment secrets o'rnating
supabase secrets set JWT_SECRET="wyYcIiA9rrzpGn3jSZSQZcwgBZ9qiQwkpG+AJ1I96PA="
supabase secrets set JWT_REFRESH_SECRET="zQquxEoZVBqkfB11PLRWtvFcxEttETUeOq/aiyK2By8="
supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com,http://localhost:5173"

# B) Backend function deploy
supabase functions deploy server

# C) Test qiling
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-5b47a45d/health
```

### 4. Frontend Configuration (1 daqiqa)

`.env` faylini yangilang:

```env
# Supabase (Real production)
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-from-dashboard

# JWT (Backend secrets da o'rnatilgan, frontend ga kerak emas)
# Lekin local test uchun:
JWT_SECRET=wyYcIiA9rrzpGn3jSZSQZcwgBZ9qiQwkpG+AJ1I96PA=
JWT_REFRESH_SECRET=zQquxEoZVBqkfB11PLRWtvFcxEttETUeOq/aiyK2By8=
```

**Anon Key topish:**
1. Supabase Dashboard
2. Settings → API
3. "anon public" key ni copy qiling

### 5. Real-time Messaging Setup (1 daqiqa)

Supabase Dashboard:
1. **Database** → **Replication** 
2. **messages** table ni toping
3. Enable replication (toggle on)
4. **conversations** table ni toping  
5. Enable replication (toggle on)

Yoki SQL orqali:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

### 6. Frontend Deploy (10 daqiqa)

**Vercel (Tavsiya etiladi):**

```bash
# A) Vercel CLI o'rnatish
npm install -g vercel

# B) Build test
npm run build

# C) Deploy
vercel

# D) Production deploy
vercel --prod
```

**Environment variables Vercel da:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Qo'shing:
   - `VITE_SUPABASE_URL` = `https://YOUR_PROJECT_REF.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`

**Yoki Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### 7. CORS Update (1 daqiqa)

Production domain olingandan keyin:

```bash
# Supabase secrets yangilang
supabase secrets set ALLOWED_ORIGINS="https://your-production-domain.com,https://www.your-production-domain.com"
```

### 8. Test Everything! (15 daqiqa)

**A) Health Check:**
```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-5b47a45d/health
```

**B) Frontend Test:**
1. https://your-vercel-app.vercel.app oching
2. Register qiling
3. Login qiling
4. Profile ni tekshiring
5. Job post qiling (agar employer bo'lsangiz)
6. Chat ni test qiling - boshqa user bilan xabar yozing

**C) Real-time Test:**
1. Ikki browser oching (yoki incognito)
2. Har birida alohida user
3. Bir user message yuboring
4. Ikkinchi user real-time da ko'rishi kerak

## 🔒 Final Security Checklist

- [ ] **JWT Secrets** - Production secrets o'rnatilgan
- [ ] **HTTPS** - Supabase va Vercel avtomatik beradi
- [ ] **CORS** - Production domain bilan o'rnatilgan
- [ ] **RLS Policies** - Database da enable qilingan
- [ ] **Rate Limiting** - Backend da ishlayapti
- [ ] **XSS Protection** - Input sanitization bor
- [ ] **Security Headers** - HSTS, CSP, etc. qo'shilgan
- [ ] **Realtime** - Messages va conversations enabled
- [ ] **Environment Variables** - Production values bilan

## 📊 Architecture

```
Frontend (Vercel)
    ↓ HTTPS
Supabase Edge Functions (Backend)
    ↓
PostgreSQL Database
    ↓
Realtime Subscriptions (Chat)
```

## 💰 Cost Estimate

**Supabase Free Tier:**
- 500 MB database
- 2 GB bandwidth
- 50,000 monthly active users
- Realtime connections: 200 concurrent

**Vercel Free Tier:**
- 100 GB bandwidth
- Unlimited deployments
- Automatic HTTPS

**Jami: $0/oy** (Free tier yetarli bo'lsa)

## 🆘 Troubleshooting

**Backend 404 error:**
```bash
# Function nomi to'g'ri ekanligini tekshiring
supabase functions list

# Logs ko'ring
supabase functions logs server
```

**Database connection error:**
```bash
# Connection string to'g'ri ekanligini tekshiring
supabase status
```

**CORS error:**
```bash
# ALLOWED_ORIGINS to'g'ri o'rnatilganligini tekshiring
supabase secrets list
```

**Realtime not working:**
```sql
-- Messages table replication enabled ekanligini tekshiring
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

## 🎯 Next Steps (Opsional)

Loyiha ishlasa, keyingi qo'shimchalar:

1. **SMS Verification** - Eskiz.uz integration
2. **Email Verification** - Supabase Auth
3. **File Upload** - Resume, avatars (Supabase Storage)
4. **Push Notifications** - New messages, job alerts
5. **Analytics** - User behavior tracking
6. **Admin Dashboard** - User management
7. **Payment Integration** - Premium features

## 🚀 Deploy Qilamizmi?

Tayyor bo'lsangiz, quyidagi buyruqni ishga tushuring:

```bash
# 1. Supabase login
supabase login

# 2. Project link
supabase link --project-ref YOUR_PROJECT_REF

# 3. Database migration
supabase db push

# 4. Secrets set
supabase secrets set JWT_SECRET="wyYcIiA9rrzpGn3jSZSQZcwgBZ9qiQwkpG+AJ1I96PA="
supabase secrets set JWT_REFRESH_SECRET="zQquxEoZVBqkfB11PLRWtvFcxEttETUeOq/aiyK2By8="
supabase secrets set ALLOWED_ORIGINS="http://localhost:5173"

# 5. Deploy backend
supabase functions deploy server

# 6. Test
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-5b47a45d/health
```

**Deploy boshlaymizmi?** 🎉
