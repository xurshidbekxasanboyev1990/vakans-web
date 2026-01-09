# 🚀 Loyihani Ishga Tushurish

## ✅ Frontend Ishga Tushdi!

Frontend server muvaffaqiyatli ishga tushdi:
- **URL:** http://localhost:5173/
- **Status:** Running ✅

## 🔧 Backend (Supabase) ni Ishga Tushurish

Backend qismini ishga tushurish uchun Supabase CLI kerak.

### Supabase CLI ni O'rnatish

**Windows (PowerShell):**
```powershell
# Scoop bilan (tavsiya etiladi)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Yoki NPM bilan
npm install -g supabase
```

**Linux/Mac:**
```bash
# Homebrew bilan
brew install supabase/tap/supabase

# Yoki NPM bilan
npm install -g supabase
```

### Backend ni Local Ishga Tushurish

```bash
# Supabase ni local ishga tushirish
supabase start

# Edge Functions ni serve qilish
cd supabase/functions
supabase functions serve server --env-file ../../.env
```

## 🎯 Hozirgi Holat

### Ishlab Turgan:
- ✅ Frontend Development Server (http://localhost:5173/)
- ✅ Barcha npm paketlar o'rnatilgan
- ✅ Barcha security features kodda mavjud

### Kerakli Qadamlar:

1. **Supabase CLI ni o'rnatish** (yuqoridagi buyruqlar)
2. **Backend ni ishga tushirish**
3. **Environment o'zgaruvchilarini sozlash**

## 🔐 Environment Sozlash

`.env` faylini tekshiring va quyidagi qiymatlarni to'ldiring:

```env
# Frontend
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend (Supabase secrets)
JWT_SECRET=your-secret-key-min-32-characters-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters-change
ALLOWED_ORIGINS=http://localhost:5173
NODE_ENV=development
```

## 🌐 Supabase Project Yaratish

Agar Supabase account yo'q bo'lsa:

1. https://supabase.com ga boring
2. Sign up qiling
3. New Project yarating
4. Project Settings > API da URL va anon key ni oling
5. `.env` fayliga qo'shing

## 🎨 Frontend Funksiyalari

Hozir frontend quyidagi sahifalarga ega:

- `/` - Asosiy sahifa
- Login/Register formalar
- Job listings
- User dashboard (worker/employer)
- Admin dashboard

## ⚡ Tezkor Ishga Tushirish (Supabasesiz)

Agar Supabase hozir kerak bo'lmasa, frontend ni local mock data bilan sinab ko'rish mumkin.

Backend kerak bo'lganda:
1. Supabase CLI o'rnating
2. `supabase start` - Local Supabase ishga tushadi
3. `supabase functions serve server` - Backend API ishga tushadi

## 📝 Keyingi Qadamlar

1. ✅ Frontend ishlab turibdi - **http://localhost:5173/** da ochiladi
2. ⏳ Backend uchun Supabase CLI o'rnatish kerak
3. ⏳ Environment o'zgaruvchilarini sozlash
4. ⏳ Backend funksiyalarini ishga tushirish

## 🆘 Muammolar?

### Frontend xatolari
```bash
# Cache ni tozalash
npm run dev -- --force

# Node modules ni qayta o'rnatish
Remove-Item -Recurse -Force node_modules
npm install
```

### Backend xatolari
```bash
# Supabase ni qayta ishga tushirish
supabase stop
supabase start
```

---

**Status:** Frontend Running ✅ | Backend Needs Setup ⏳
