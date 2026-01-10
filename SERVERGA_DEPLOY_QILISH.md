# 🚀 PRODUCTION SERVERGA DEPLOY QILISH QO'LLANMASI

## ⚠️ MUHIM ESLATMALAR

**Serverda band portlar (tegmaslik!):**
- ✅ 3000 - Frontend (boshqa loyiha)
- ✅ 4000 - Backend API (boshqa loyiha)  
- ✅ 6379 - Redis (boshqa loyiha)
- ✅ 5432 - PostgreSQL (boshqa loyiha)

**Bizning loyiha portlari:**
- **Backend API:** 5000
- **Redis:** 16379 (host) → 6379 (container ichida)
- **PostgreSQL:** 15432 (yoki yangi port) → 5432 (container ichida)
- **Frontend:** Nginx orqali serve (80/443)

---

## 📝 1-QADAM: Backend Kodni Serverlarga Yuklash

```bash
# Serverga ulanish
ssh root@77.237.239.235

# Loyiha papkasiga o'tish
cd /www/wwwroot/vakans-web/Works-main

# Git dan yangi kodni olish
git pull origin main
```

---

## 📝 2-QADAM: Backend Environment O'rnatish

```bash
# Backend papkaga o'tish
cd /www/wwwroot/vakans-web/Works-main/backend

# .env fayl yaratish
nano .env
```

**`.env` fayl matni (serverda):**

```env
# Server
PORT=5000
NODE_ENV=production

# Database (yangi instance yoki boshqa port)
DB_HOST=localhost
DB_PORT=15432
DB_NAME=vakans_production
DB_USER=vakans_prod_user
DB_PASSWORD=KUCHLI_PAROL_KIRITING

# Redis (container 16379→6379)
REDIS_HOST=localhost
REDIS_PORT=16379
REDIS_PASSWORD=
REDIS_DB=0

# JWT (bu secretlarni O'ZGARTIRING!)
JWT_SECRET=juda-kuchli-secret-key-64-belgidan-ortiq-random
JWT_REFRESH_SECRET=boshqa-kuchli-refresh-secret-64-belgi
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=https://vakans.uz,https://www.vakans.uz
COOKIE_DOMAIN=.vakans.uz

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5

# SMS
SMS_API_URL=https://notify.eskiz.uz/api
SMS_EMAIL=email@example.uz
SMS_PASSWORD=parol
SMS_SENDER=4546
```

---

## 📝 3-QADAM: Database Va Redis Tekshirish

### Redis tekshirish:

```bash
# Redis container ishlayabdimi?
docker ps | grep redis

# Container nomi: vakans_redis
# Port: 16379:6379

# Test qilish
redis-cli -h localhost -p 16379 ping
# Javob: PONG
```

### PostgreSQL sozlash:

**Variant 1: Yangi PostgreSQL container (tavsiya etiladi)**

```bash
# Yangi PostgreSQL container yaratish (15432 portda)
docker run -d \
  --name vakans_postgres \
  --restart unless-stopped \
  -e POSTGRES_DB=vakans_production \
  -e POSTGRES_USER=vakans_prod_user \
  -e POSTGRES_PASSWORD=KUCHLI_PAROL \
  -p 15432:5432 \
  -v vakans_postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine

# Test qilish
docker exec vakans_postgres psql -U vakans_prod_user -d vakans_production -c "SELECT 1;"
```

**Variant 2: Mavjud PostgreSQL ishlatish (ehtiyot bo'ling!)**

```bash
# Yangi database yaratish
psql -U postgres -p 5432 -c "CREATE DATABASE vakans_production;"
psql -U postgres -p 5432 -c "CREATE USER vakans_prod_user WITH PASSWORD 'KUCHLI_PAROL';"
psql -U postgres -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE vakans_production TO vakans_prod_user;"
```

---

## 📝 4-QADAM: Database Migration

```bash
cd /www/wwwroot/vakans-web/Works-main/backend

# Dependencies o'rnatish
npm install

# Database schema yaratish
npm run migrate
# yoki
node -r ts-node/register src/scripts/init-database.ts
```

---

## 📝 5-QADAM: PM2 bilan Backend Ishga Tushirish

```bash
# PM2 o'rnatish (agar yo'q bo'lsa)
npm install -g pm2

# Backend ishga tushirish
cd /www/wwwroot/vakans-web/Works-main/backend
pm2 start npm --name "vakans-backend" -- start

# Yoki tsx bilan
pm2 start "npx tsx src/index.ts" --name "vakans-backend"

# Status tekshirish
pm2 status
pm2 logs vakans-backend

# Auto-restart o'rnatish
pm2 startup
pm2 save
```

---

## 📝 6-QADAM: Nginx Sozlash

```bash
# Nginx config yaratish/tahrirlash
nano /etc/nginx/sites-available/vakans.uz
```

**Nginx config:**

```nginx
# API Backend Proxy
upstream vakans_backend {
    server localhost:5000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name vakans.uz www.vakans.uz;

    # SSL uchun redirect (keyin qo'shamiz)
    # return 301 https://$server_name$request_uri;

    # Frontend static files
    root /www/wwwroot/vakans-web/Works-main/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API requests → Backend
    location /api/ {
        proxy_pass http://vakans_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Cookie uchun
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://vakans_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Nginx test
nginx -t

# Nginx restart
systemctl restart nginx
```

---

## 📝 7-QADAM: Frontend Build va Deploy

```bash
cd /www/wwwroot/vakans-web/Works-main

# Dependencies o'rnatish
npm install

# Production build
npm run build

# Build fayllar dist/ papkada paydo bo'ladi
ls -la dist/
```

---

## 📝 8-QADAM: Test Qilish

```bash
# Backend test
curl http://localhost:5000/health
# Javob: {"status":"ok"}

# i18n test
curl http://localhost:5000/api/i18n/uz

# Frontend test (browser da)
# https://vakans.uz

# PM2 logs
pm2 logs vakans-backend --lines 100
```

---

## 🔐 9-QADAM: SSL Sertifikat (Let's Encrypt)

```bash
# Certbot o'rnatish
apt install certbot python3-certbot-nginx -y

# SSL olish
certbot --nginx -d vakans.uz -d www.vakans.uz

# Auto-renewal test
certbot renew --dry-run
```

---

## 📊 10-QADAM: Monitoring

```bash
# PM2 monitoring
pm2 monit

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Backend logs
pm2 logs vakans-backend

# Container logs
docker logs -f vakans_redis
docker logs -f vakans_postgres
```

---

## 🐛 MUAMMOLARNI HAL QILISH

### 1. Backend 401 xatosi

**Sabab:** CORS yoki Cookie muammosi

**Hal:**
```bash
# .env tekshirish
cat /www/wwwroot/vakans-web/Works-main/backend/.env | grep CORS
# CORS_ORIGIN=https://vakans.uz,https://www.vakans.uz bo'lishi kerak

# Backend qayta ishga tushirish
pm2 restart vakans-backend
```

### 2. i18n 404 xatosi

**Sabab:** Backend ishlamayapti yoki route yo'q

**Hal:**
```bash
# Backend ishlayabdimi?
pm2 status

# Test
curl http://localhost:5000/api/i18n/uz

# Logs tekshirish
pm2 logs vakans-backend
```

### 3. Database ulanish xatosi

**Sabab:** Port yoki parol noto'g'ri

**Hal:**
```bash
# PostgreSQL tekshirish
docker ps | grep postgres

# Ulanishni test qilish
psql -h localhost -p 15432 -U vakans_prod_user -d vakans_production
```

### 4. Redis xatosi

**Sabab:** Redis ishlamayapti

**Hal:**
```bash
# Redis tekshirish
docker ps | grep redis

# Test
redis-cli -h localhost -p 16379 ping
```

---

## 📝 DEMO LOGIN MA'LUMOTLARI

**Admin:**
- Phone: `+998996983806`
- Parol: `Admin@13.13`

**Ishchi:**
- Phone: `+998907654321`
- Parol: `Worker@123!`

**Ish beruvchi:**
- Phone: `+998901234567`
- Parol: `Employer@123!`

---

## ✅ YAKUNIY TEKSHIRUV

- [ ] Redis ishlamoqda (port 16379)
- [ ] PostgreSQL ishlamoqda (port 15432)
- [ ] Backend ishlamoqda (port 5000)
- [ ] Frontend build qilingan (dist/)
- [ ] Nginx sozlangan va ishlamoqda
- [ ] SSL sertifikat o'rnatilgan
- [ ] CORS to'g'ri sozlangan
- [ ] Cookie ishlayapti
- [ ] Login/Register ishlayapti
- [ ] i18n endpoint ishlayapti

---

**Yordam kerak bo'lsa, loglarni tekshiring:**
```bash
pm2 logs vakans-backend --lines 200
tail -f /var/log/nginx/error.log
```
