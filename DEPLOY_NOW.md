# 🎯 PRODUCTION DEPLOY - QUICK START

## ⚡ Tezkor Boshlash

### 1. Eskiz.uz SMS Setup (2 daqiqa)

```bash
# 1. Ro'yxatdan o'ting: https://notify.eskiz.uz/
# 2. Login qiling va credentials oling

# 3. .env faylini yangilang:
ESKIZ_EMAIL=your-email@example.com
ESKIZ_PASSWORD=your-password
ESKIZ_FROM=4546
SMS_TEST_MODE=false
```

### 2. Deploy Script Ishga Tushiring (15 daqiqa)

**Windows:**
```cmd
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

Script avtomatik bajaradi:
- ✅ Supabase setup
- ✅ Database migration
- ✅ Backend deploy
- ✅ Frontend build & deploy
- ✅ Realtime enable
- ✅ Security configuration

### 3. Test Qiling (5 daqiqa)

```bash
# Backend health check
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-5b47a45d/health

# Frontend
# Open: https://your-app.vercel.app
# Register → Login → Post Job → Chat → SMS Verify
```

---

## 📋 Batafsil Ko'rsatmalar

**READY_TO_DEPLOY.md** faylini oching - u yerda hamma narsa bor!

---

## 🎉 TAYYOR!

Barcha kod yozilgan, test qilingan va production ga deploy qilishga tayyor.

**Qanday ishlatish:**

1. **Eskiz.uz** dan SMS credentials oling
2. **`.env`** faylga qo'shing
3. **`deploy.bat`** yoki **`deploy.sh`** ishga tushiring
4. **Test qiling** va foydalaning!

**Omad!** 🚀
