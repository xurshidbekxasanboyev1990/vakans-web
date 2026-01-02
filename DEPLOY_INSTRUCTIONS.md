# 🚀 Deployment Instructions for Contabo Server

Server IP: **77.237.239.235**

## 📋 Step-by-Step Deployment

### 1️⃣ Serverga fayllarni yuklash

Loyihangiz allaqachon `/www/wwwroot/vakans-web` da bo'lishi kerak.

Agar yangilanish kerak bo'lsa:
```bash
cd /www/wwwroot/vakans-web
git pull origin main
```

### 2️⃣ .env.production va docker-compose.prod.yml fayllarini yuklash

Lokal kompyuteringizdan serverga yuklang:

```bash
# Lokal terminalda (PowerShell):
scp .env.production root@77.237.239.235:/www/wwwroot/vakans-web/
scp docker-compose.prod.yml root@77.237.239.235:/www/wwwroot/vakans-web/
```

Yoki SSH orqali serverda yarating va to'ldiring.

### 3️⃣ Docker konteynerlarni ishga tushirish

SSH orqali serverga kiring:
```bash
ssh root@77.237.239.235
```

Keyin:
```bash
cd /www/wwwroot/vakans-web

# Docker konteynerlarni ishga tushirish
docker-compose -f docker-compose.prod.yml up -d --build

# Loglarni ko'rish
docker-compose -f docker-compose.prod.yml logs -f

# Agar hammasi yaxshi bo'lsa, Ctrl+C bosing
```

### 4️⃣ Frontend build qilish

```bash
cd /www/wwwroot/vakans-web

# .env faylini yaratish (frontend build uchun)
cat > .env << 'EOF'
VITE_API_URL=http://77.237.239.235/api
VITE_WS_URL=http://77.237.239.235
NODE_ENV=production
EOF

# Dependencies (agar kerak bo'lsa)
npm install

# Build
npm run build
```

### 5️⃣ aaPanel'da Website sozlash

aaPanel web interface'ga kiring: `http://77.237.239.235:7800`

#### Website yaratish:
1. **Website** → **Add site**
   - Domain: `77.237.239.235`
   - Root directory: `/www/wwwroot/vakans-web/dist`
   - PHP Version: **Pure Static** yoki **Disable PHP**
   - Create

#### Reverse Proxy sozlash:
1. Site Settings (77.237.239.235) → **Reverse proxy**
2. **Add reverse proxy**:
   - Proxy name: `backend-api`
   - Target URL: `http://127.0.0.1:5000`
   - Send domain: `$host`
   - Proxy directory: `/api`
   - Reverse proxy directory: `/`
   - **Enable** - check
   - **Enable WebSocket** - check
   - Submit

#### Nginx config qo'shimcha sozlash:
1. Site Settings → **Config File**
2. `location /` qismini toping va quyidagini qo'shing:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

3. Save

### 6️⃣ Firewall portlarini ochish

aaPanel'da:
1. **Security** → **Firewall**
2. Quyidagi portlarni qo'shing (agar yo'q bo'lsa):
   - Port: **5000**, Protocol: **TCP**, Description: **Backend API**
   - Port: **80**, Protocol: **TCP**, Description: **HTTP**
   - Port: **443**, Protocol: **TCP**, Description: **HTTPS**

### 7️⃣ Test qilish

Browser'da:
- Frontend: `http://77.237.239.235`
- Backend health: `http://77.237.239.235/api/health`
- API docs: `http://77.237.239.235/api`

### 8️⃣ Monitoring komandalar

```bash
# Konteynerlar holati
docker ps

# Backend logs
docker logs -f vakans_backend

# PostgreSQL logs
docker logs -f vakans_postgres

# Redis logs
docker logs -f vakans_redis

# Database'ga kirish
docker exec -it vakans_postgres psql -U works_user -d works_db

# Barcha loglar
docker-compose -f docker-compose.prod.yml logs -f

# Restart
docker-compose -f docker-compose.prod.yml restart

# Stop
docker-compose -f docker-compose.prod.yml down

# Yangi build
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔐 Login Ma'lumotlar

### Admin:
- **Phone**: +998996983806
- **Email**: admin@vakans.uz
- **Parol**: XOJISAID.13.13

### Test Employer:
- **Phone**: +998901234567
- **Email**: employer@demo.uz
- **Parol**: employer123

### Test Worker:
- **Phone**: +998907654321
- **Email**: worker@demo.uz
- **Parol**: worker123

## 📝 Keyingi qadamlar

Domenni ulaganingizda:
1. `.env.production` va `.env` fayllarida IP ni domen bilan almashtiring
2. Frontend'ni qayta build qiling
3. CORS_ORIGIN'ni yangilang
4. aaPanel'da SSL o'rnating (Let's Encrypt)
5. Nginx config'da server_name'ni yangilang

---

**Sayt manzili**: http://77.237.239.235
**API manzili**: http://77.237.239.235/api
