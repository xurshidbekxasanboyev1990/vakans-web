# 🚀 VAKANS.UZ - Production Deployment Guide

## Quick Start (Production)

### 1. Docker bilan ishga tushirish

```bash
# .env faylni yarating
cp .env.docker.example .env

# Secretlarni to'ldiring
nano .env

# Docker konteynerlarni ishga tushiring
docker-compose up -d
```

### 2. Muhim environment o'zgaruvchilari (.env)

```env
# MAJBURIY - secretlarni generatsiya qiling:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

POSTGRES_PASSWORD=your_secure_postgres_password
REDIS_PASSWORD=your_secure_redis_password
JWT_SECRET=64_character_random_string_here
JWT_REFRESH_SECRET=another_64_character_random_string
COOKIE_SECRET=your_cookie_secret
CORS_ORIGIN=https://vakans.uz
```

### 3. Portlar

| Xizmat   | Port | Tashqi foydalanish |
|----------|------|-------------------|
| Frontend | 3000 | Ha (Nginx orqali) |
| Backend  | 5000 | Yo'q (Internal)   |
| Postgres | 5432 | Yo'q (Internal)   |
| Redis    | 6379 | Yo'q (Internal)   |

---

## 🔐 Production Xavfsizlik Checklist

- [x] JWT_SECRET environment variable (fallback yo'q)
- [x] Cookie-based auth (HttpOnly, Secure, SameSite)
- [x] Password hashing (bcrypt, 12 rounds)
- [x] Rate limiting (auth: 10/15min, api: 100/min)
- [x] Input validation (Zod)
- [x] XSS protection (DOMPurify)
- [x] CORS configuration
- [x] Helmet security headers
- [ ] SSL/TLS (Nginx bilan sozlang)
- [ ] Firewall (faqat 80/443 ochiq)

---

## 📦 Manual Deployment (Docker'siz)

### Backend

```bash
cd backend
npm install --production
npm run build
NODE_ENV=production node dist/index.js
```

### Frontend

```bash
npm install
npm run build
# dist/ papkasini Nginx'ga joylashtiring
```

---

## 🔧 Nginx Configuration

```nginx
server {
    listen 80;
    server_name vakans.uz www.vakans.uz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vakans.uz www.vakans.uz;

    ssl_certificate /etc/letsencrypt/live/vakans.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vakans.uz/privkey.pem;

    # Frontend
    location / {
        root /var/www/vakans/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🗄️ Database Setup

```bash
# PostgreSQL'ga ulaning
psql -U postgres

# Database yarating
CREATE DATABASE vakans_db;
CREATE USER vakans_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vakans_db TO vakans_user;

# Migratsiyalarni bajaring
psql -U vakans_user -d vakans_db -f backend/init.sql
```

---

## 👤 Default Admin

- **Phone:** +998996983806
- **Password:** XOJISAID.13.13

⚠️ **Production'da parolni o'zgartiring!**

---

## 📞 Texnik yordam

Muammolar bo'lsa: [GitHub Issues](https://github.com/your-repo/issues)

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-08
