# 🛠️ Helper Scripts

Production muhitda ishni osonlashtirish uchun scriptlar to'plami.

## 📋 Mavjud Scriptlar

### 1. 🔌 Database Management

#### **db-connect.sh** - PostgreSQL ga ulanish
```bash
./scripts/db-connect.sh
```
PostgreSQL ga psql CLI orqali to'g'ridan-to'g'ri ulanish.

#### **db-tunnel.sh** - Port forwarding (DataGrip/pgAdmin uchun)
```bash
./scripts/db-tunnel.sh [port]
# Default port: 15432
```
DataGrip, pgAdmin, DBeaver kabi GUI toollar uchun local port orqali ulanish:
- **Host:** localhost
- **Port:** 15432 (yoki o'zingiz ko'rsatgan)
- **Database:** vakans_production
- **Username:** vakans_prod_user
- **Password:** KUCHLI_PAROL

#### **quick-backup.sh** - Tez backup olish
```bash
./scripts/quick-backup.sh [fayl_nomi]
# Backup: ./backups/ papkaga saqlanadi
```

**Restore qilish:**
```bash
gunzip backups/vakans_backup_20260110_123456.sql.gz
docker exec -i vakans_postgres psql -U vakans_prod_user -d vakans_production < backups/vakans_backup_20260110_123456.sql
```

---

### 2. 🔴 Redis Management

#### **redis-connect.sh** - Redis CLI
```bash
./scripts/redis-connect.sh
```
Redis ga ulanib cache ma'lumotlarini ko'rish/o'zgartirish.

**Redis komandalar:**
```redis
KEYS *                    # Barcha keylar
GET key_name              # Key qiymatini olish
FLUSHDB                   # Barcha cache tozalash
DBSIZE                    # Keylar soni
```

---

### 3. 🌐 Nginx Management

#### **nginx-reload.sh** - Hot reload (rebuild qilmasdan)
```bash
./scripts/nginx-reload.sh
```
Nginx konfiguratsiyani test qilib reload qiladi.

#### **nginx-edit.sh** - Live edit
```bash
./scripts/nginx-edit.sh
```
Nginx config ni hot-edit qilish (rebuild kerak emas).

**Eslatma:** Hot-edit vaqtincha, rebuild qilsangiz yo'qoladi. Doimiy qilish uchun:
```bash
git add docker/nginx/nginx.conf
git commit -m "Nginx config yangilandi"
```

---

### 4. 📊 Monitoring

#### **health-check.sh** - Tizim sog'ligini tekshirish
```bash
./scripts/health-check.sh
```
Barcha servislar (PostgreSQL, Redis, Backend, Frontend) statusini ko'rsatadi.

#### **logs.sh** - Loglarni ko'rish
```bash
# Barcha loglar (oxirgi 50 ta)
./scripts/logs.sh

# Bitta servis
./scripts/logs.sh backend
./scripts/logs.sh frontend
./scripts/logs.sh postgres

# Real-time monitoring (follow mode)
./scripts/logs.sh backend -f
```

---

## 🚀 Tez ishga tushirish

```bash
# 1. Barcha servislarni ishga tushirish
docker-compose up -d

# 2. Sog'likni tekshirish
./scripts/health-check.sh

# 3. Database ga ulanish
./scripts/db-connect.sh

# 4. Backup olish
./scripts/quick-backup.sh

# 5. Loglarni kuzatish
./scripts/logs.sh backend -f
```

---

## 🔧 Muammolarni hal qilish

### PostgreSQL ulanmayapti
```bash
# Container statusini ko'rish
docker-compose ps postgres

# Loglarni ko'rish
./scripts/logs.sh postgres

# Qayta ishga tushirish
docker-compose restart postgres
```

### Redis cache tozalash kerak
```bash
./scripts/redis-connect.sh
# Redis CLI da: FLUSHDB
```

### Nginx konfiguratsiya xato
```bash
# Test qilish
docker exec vakans_frontend nginx -t

# Eski holatga qaytarish
git checkout docker/nginx/nginx.conf
./scripts/nginx-edit.sh
```

### Disk to'lib ketgan
```bash
# Docker tozalash
docker system prune -a --volumes

# Eski backuplarni o'chirish
rm -rf backups/*.sql.gz
```

---

## 📦 Production Deployment

```bash
# 1. Serverga SSH
ssh root@77.237.239.235

# 2. Repository ga o'tish
cd ~/vakans-web/Works-main

# 3. Yangilanishlarni olish
git pull

# 4. Rebuild va restart
docker-compose up -d --build

# 5. Sog'likni tekshirish
./scripts/health-check.sh

# 6. Backup olish
./scripts/quick-backup.sh
```

---

## ⚠️ Xavfsizlik

- **PostgreSQL/Redis** - Portlar expose qilinmagan, faqat Docker network ichida
- **Backup fayllar** - `.gitignore` da, Git ga qo'shilmaydi
- **Parollar** - `.env` faylda, hech qachon commit qilinmaydi
- **Scripts** - Faqat local/server da ishlatish uchun

---

## 💡 Tips

1. **DataGrip bilan ishlash:**
   ```bash
   ./scripts/db-tunnel.sh 15432
   # DataGrip da localhost:15432 ga ulanish
   ```

2. **Tez debug:**
   ```bash
   # Backend xatoliklarini real-time ko'rish
   ./scripts/logs.sh backend -f | grep ERROR
   ```

3. **Performance monitoring:**
   ```bash
   # CPU/Memory ishlatish
   docker stats vakans_backend vakans_frontend
   ```

4. **Daily backup (cron):**
   ```bash
   # crontab -e
   0 2 * * * cd /root/vakans-web/Works-main && ./scripts/quick-backup.sh
   ```

---

**Yordam kerakmi?** 
- Health check: `./scripts/health-check.sh`
- Loglar: `./scripts/logs.sh backend -f`
- Database: `./scripts/db-connect.sh`
