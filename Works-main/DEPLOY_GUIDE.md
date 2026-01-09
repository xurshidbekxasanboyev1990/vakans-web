# 🚀 VAKANS.UZ - Contabo Serverga Deploy Qo'llanmasi

## 📋 Tizim Talablari

- **Server:** Contabo VPS (Ubuntu 22.04 LTS)
- **RAM:** Kamida 2GB
- **Disk:** Kamida 20GB SSD
- **Domen:** vakans.uz (DNS sozlangan)

---

## 🛠️ 1-Qadam: Serverni Sozlash

### 1.1 SSH orqali ulaning
```bash
ssh root@YOUR_SERVER_IP
```

### 1.2 Tizimni yangilang
```bash
apt update && apt upgrade -y
```

### 1.3 Docker o'rnating
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose
apt install docker-compose-plugin -y

# Tekshirish
docker --version
docker compose version
```

### 1.4 Git o'rnating (agar yo'q bo'lsa)
```bash
apt install git -y
```

---

## 📁 2-Qadam: Loyihani Yuklash

### 2.1 Loyihani klonlang
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/vakans.uz.git vakans.uz
cd vakans.uz
```

### 2.2 Yoki fayllarni yuklang (SCP orqali)
```bash
# Kompyuteringizdan:
scp -r "C:\Users\User\Desktop\Works-main\Works-main\*" root@YOUR_SERVER_IP:/var/www/vakans.uz/
```

---

## ⚙️ 3-Qadam: Environment Sozlash

### 3.1 .env faylini yarating
```bash
cd /var/www/vakans.uz
nano .env
```

### 3.2 Quyidagilarni kiriting:
```env
# ================================================
# VAKANS.UZ - Production Environment
# ================================================

# DATABASE
POSTGRES_USER=vakans_user
POSTGRES_PASSWORD=YANGI_XAVFSIZ_PAROL_32_BELGI
POSTGRES_DB=vakans_db

# REDIS
REDIS_PASSWORD=YANGI_REDIS_PAROL

# JWT (openssl rand -base64 48 bilan yarating)
JWT_SECRET=YANGI_64_BELGILI_SECRET
JWT_REFRESH_SECRET=YANGI_64_BELGILI_REFRESH_SECRET

# COOKIE
COOKIE_SECRET=YANGI_COOKIE_SECRET

# CORS
CORS_ORIGIN=https://vakans.uz,https://www.vakans.uz

# SMS - ESKIZ.UZ
ESKIZ_EMAIL=sizning_eskiz_email
ESKIZ_PASSWORD=sizning_eskiz_parol
ESKIZ_FROM=4546
SMS_TEST_MODE=false

# NODE
NODE_ENV=production
```

### 3.3 Secret yaratish
```bash
# JWT Secret
openssl rand -base64 48

# Redis password
openssl rand -base64 32
```

---

## 🔐 4-Qadam: SSL Sertifikat (Let's Encrypt)

### 4.1 Certbot o'rnating
```bash
apt install certbot -y
```

### 4.2 Sertifikat oling
```bash
certbot certonly --standalone -d vakans.uz -d www.vakans.uz
```

### 4.3 Auto-renewal sozlang
```bash
echo "0 0 * * * root certbot renew --quiet" >> /etc/crontab
```

---

## 🐳 5-Qadam: Docker bilan Ishga Tushirish

### 5.1 Imagelarni build qiling
```bash
cd /var/www/vakans.uz
docker compose build
```

### 5.2 Servicelarni ishga tushiring
```bash
docker compose up -d
```

### 5.3 Loglarni tekshiring
```bash
# Barcha loglar
docker compose logs -f

# Faqat backend
docker compose logs -f backend

# Faqat frontend
docker compose logs -f frontend
```

### 5.4 Statusni tekshiring
```bash
docker compose ps
```

---

## 🌐 6-Qadam: DNS Sozlash

Domen provayderingizda quyidagi recordlarni qo'shing:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| A | www | YOUR_SERVER_IP | 3600 |
| A | api | YOUR_SERVER_IP | 3600 |

---

## ✅ 7-Qadam: Tekshirish

### 7.1 Health check
```bash
curl http://localhost:5000/health
```

### 7.2 Frontend
```bash
curl http://localhost:80
```

### 7.3 Brauzerda
- https://vakans.uz
- https://vakans.uz/api/health

---

## 🔧 Foydali Buyruqlar

### Servicelarni qayta ishga tushirish
```bash
docker compose restart
```

### Servicelarni to'xtatish
```bash
docker compose down
```

### Yangilash (yangi kod kelganda)
```bash
cd /var/www/vakans.uz
git pull origin main
docker compose build
docker compose up -d
```

### Database backup
```bash
docker exec vakans_postgres pg_dump -U vakans_user vakans_db > backup_$(date +%Y%m%d).sql
```

### Database restore
```bash
cat backup.sql | docker exec -i vakans_postgres psql -U vakans_user -d vakans_db
```

### Diskni tozalash
```bash
docker system prune -a
```

---

## 🔥 Firewall Sozlash

```bash
# UFW yoqish
ufw enable

# Portlarni ochish
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS

# Status
ufw status
```

---

## 📊 Monitoring

### Serverning RAM/CPU
```bash
htop
```

### Docker containers
```bash
docker stats
```

### Disk usage
```bash
df -h
```

---

## 🆘 Muammolarni Hal Qilish

### 1. Backend ishlamayapti
```bash
docker compose logs backend
docker compose restart backend
```

### 2. Database ulanmayapti
```bash
docker compose logs postgres
docker exec -it vakans_postgres psql -U vakans_user -d vakans_db
```

### 3. Port band
```bash
lsof -i :80
lsof -i :5000
```

### 4. SSL xatosi
```bash
certbot renew --force-renewal
docker compose restart frontend
```

---

## 📞 Yordam

Muammo yuzaga kelsa:
1. `docker compose logs` ni tekshiring
2. `/var/log/nginx/error.log` ni ko'ring
3. GitHub Issues oching

---

**Tayyor! 🎉 Vakans.uz production serverda ishlaydi!**
