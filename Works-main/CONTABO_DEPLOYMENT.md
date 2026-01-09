# 🚀 VAKANS.UZ - CONTABO SERVER DEPLOYMENT GUIDE

Bu qo'llanma loyihani Contabo VPS serverga deploy qilish uchun.

## 📋 TIZIM TALABLARI

- **OS:** Ubuntu 22.04 LTS
- **RAM:** Minimum 2GB (4GB tavsiya etiladi)
- **CPU:** 2+ core
- **Disk:** 20GB+ SSD

---

## 🔧 1-QADAM: SERVER SOZLASH

### 1.1 Serverni yangilash
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Kerakli dasturlarni o'rnatish
```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Redis (optional)
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# Git
sudo apt install -y git

# PM2 (Node.js process manager)
sudo npm install -g pm2

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🗄️ 2-QADAM: DATABASE SOZLASH

### 2.1 PostgreSQL user yaratish
```bash
sudo -u postgres psql

CREATE USER vakans_user WITH PASSWORD 'KUCHLI_PAROL_QOYING';
CREATE DATABASE vakans_db OWNER vakans_user;
GRANT ALL PRIVILEGES ON DATABASE vakans_db TO vakans_user;
\q
```

### 2.2 Database migration
```bash
cd /var/www/vakans.uz/backend
psql -U vakans_user -d vakans_db -f ../supabase/migrations/001_initial_schema.sql
psql -U vakans_user -d vakans_db -f ../supabase/migrations/002_job_reactions.sql
```

---

## 📁 3-QADAM: LOYIHANI YUKLASH

### 3.1 Directory yaratish
```bash
sudo mkdir -p /var/www/vakans.uz
sudo chown -R $USER:$USER /var/www/vakans.uz
cd /var/www/vakans.uz
```

### 3.2 Loyihani klonlash yoki yuklash
```bash
# Git orqali
git clone https://github.com/your-repo/vakans.git .

# Yoki FTP/SCP orqali yuklang
```

### 3.3 Dependencies o'rnatish
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

---

## ⚙️ 4-QADAM: ENVIRONMENT SOZLASH

### 4.1 Backend .env yaratish
```bash
nano /var/www/vakans.uz/backend/.env
```

Quyidagi mazmun:
```env
# ================================================
# PRODUCTION CONFIGURATION
# ================================================

# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://vakans_user:KUCHLI_PAROL@localhost:5432/vakans_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vakans_db
DB_USER=vakans_user
DB_PASSWORD=KUCHLI_PAROL

# Redis
REDIS_URL=redis://localhost:6379

# JWT - Yangi secret yarating!
# openssl rand -base64 32
JWT_SECRET=YANGI_64_BELGILIK_SECRET_QOYING
JWT_REFRESH_SECRET=YANGI_64_BELGILIK_REFRESH_SECRET_QOYING
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cookie
COOKIE_SECRET=YANGI_COOKIE_SECRET_QOYING

# SMS - Eskiz.uz
ESKIZ_EMAIL=your-email@eskiz.uz
ESKIZ_PASSWORD=your-password
ESKIZ_FROM=4546
SMS_TEST_MODE=false

# CORS
CORS_ORIGIN=https://vakans.uz,https://www.vakans.uz
```

### 4.2 Frontend build
```bash
cd /var/www/vakans.uz

# Production .env yaratish
echo "VITE_API_URL=/api" > .env.production.local
echo "VITE_DEMO_MODE=false" >> .env.production.local

# Build
npm run build
```

---

## 🌐 5-QADAM: NGINX SOZLASH

### 5.1 Nginx config yaratish
```bash
sudo nano /etc/nginx/sites-available/vakans.uz
```

`docker/nginx/nginx.production.conf` faylini nusxalang.

### 5.2 Symlink yaratish
```bash
sudo ln -s /etc/nginx/sites-available/vakans.uz /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

### 5.3 SSL sertifikat olish (Let's Encrypt)
```bash
# Avval HTTP'da test qiling
sudo nginx -t
sudo systemctl restart nginx

# SSL olish
sudo certbot --nginx -d vakans.uz -d www.vakans.uz
```

---

## 🔄 6-QADAM: BACKEND ISHGA TUSHIRISH

### 6.1 PM2 bilan ishga tushirish
```bash
cd /var/www/vakans.uz/backend

# TypeScript compile
npm run build

# PM2 bilan ishga tushirish
pm2 start dist/index.js --name vakans-api

# Startup'da avtomatik ishga tushish
pm2 startup
pm2 save
```

### 6.2 PM2 buyruqlari
```bash
pm2 status          # Holat ko'rish
pm2 logs vakans-api # Loglarni ko'rish
pm2 restart vakans-api # Qayta ishga tushirish
pm2 stop vakans-api # To'xtatish
```

---

## ✅ 7-QADAM: TEKSHIRISH

### 7.1 API tekshirish
```bash
curl https://vakans.uz/api/health
# {"status":"ok","timestamp":"..."}
```

### 7.2 Frontend tekshirish
```bash
curl -I https://vakans.uz
# HTTP/2 200 OK bo'lishi kerak
```

---

## 🛡️ 8-QADAM: XAVFSIZLIK

### 8.1 Firewall sozlash
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 8.2 Fail2Ban o'rnatish
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📊 9-QADAM: MONITORING

### 9.1 PM2 monitoring
```bash
pm2 monit
```

### 9.2 Nginx loglar
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 YANGILASH (DEPLOY)

Har safar yangi versiya chiqganda:

```bash
cd /var/www/vakans.uz

# Yangi kodni olish
git pull origin main

# Frontend qayta build
npm install
npm run build

# Backend qayta build
cd backend
npm install
npm run build
pm2 restart vakans-api

cd ..
```

---

## 🐛 XATOLAR VA YECHIMLAR

### Port 5000 band
```bash
sudo lsof -i :5000
# PID topib o'chirish
sudo kill -9 PID
```

### PostgreSQL ulanish xatosi
```bash
# pg_hba.conf tekshiring
sudo nano /etc/postgresql/14/main/pg_hba.conf
# local all all md5 qo'shing
sudo systemctl restart postgresql
```

### Nginx 502 Bad Gateway
```bash
# Backend ishlayotganmi?
pm2 status
pm2 logs vakans-api
```

---

## 📞 YORDAM

Muammo yuzaga kelsa:
1. PM2 loglarni tekshiring: `pm2 logs`
2. Nginx loglarni tekshiring: `sudo tail -f /var/log/nginx/error.log`
3. PostgreSQL loglarni tekshiring: `sudo tail -f /var/log/postgresql/postgresql-14-main.log`

---

**Muvaffaqiyatli deploy!** 🎉
