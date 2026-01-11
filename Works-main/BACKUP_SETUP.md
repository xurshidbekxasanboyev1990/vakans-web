# ============================================
# VAKANS.UZ - Automated Backup Setup
# ============================================

## 📋 Qo'llanma

### 1. Backup Scriptni executable qilish
```bash
chmod +x /workspaces/vakans-web/Works-main/scripts/auto-backup.sh
```

### 2. Cron job sozlash (har kuni soat 02:00 da backup)
```bash
# Crontab ni ochish
crontab -e

# Quyidagi qatorni qo'shish
0 2 * * * /root/vakans-web/Works-main/scripts/auto-backup.sh >> /var/log/vakans-backup.log 2>&1
```

### 3. Boshqa vaqtlar uchun cron syntax:
```
# Har soatda
0 * * * * /path/to/auto-backup.sh

# Har 6 soatda
0 */6 * * * /path/to/auto-backup.sh

# Har hafta yakshanba kuni soat 03:00 da
0 3 * * 0 /path/to/auto-backup.sh

# Har oyning 1-kuni soat 04:00 da
0 4 1 * * /path/to/auto-backup.sh
```

### 4. Backup restore qilish

#### Database restore:
```bash
# Backupdan foydalanish
gunzip < /var/backups/vakans/db_backup_2026-01-11_02-00-00.sql.gz | \
docker exec -i vakans_postgres psql -U vakans_prod_user -d vakans_production
```

#### Redis restore:
```bash
# Redis konteynerini to'xtatish
docker stop vakans_redis

# Backup faylni ko'chirish
docker cp /var/backups/vakans/redis_backup_2026-01-11_02-00-00.rdb vakans_redis:/data/dump.rdb

# Redis ni qayta ishga tushirish
docker start vakans_redis
```

#### Uploads restore:
```bash
tar -xzf /var/backups/vakans/uploads_backup_2026-01-11_02-00-00.tar.gz -C /root/vakans-web/Works-main/
```

### 5. Backuplarni monitoring qilish
```bash
# Oxirgi backuplarni ko'rish
ls -lh /var/backups/vakans/ | tail -10

# Backup log'larni ko'rish
tail -f /var/log/vakans-backup.log

# Backup hajmini tekshirish
du -sh /var/backups/vakans/
```

### 6. S3 yoki remote serverga backup yuborish (Optional)

#### AWS S3 ga yuborish:
```bash
# AWS CLI o'rnatish
apt-get install awscli

# AWS credentials sozlash
aws configure

# Script ichiga qo'shish (auto-backup.sh ning oxiriga):
aws s3 sync /var/backups/vakans/ s3://your-bucket/vakans-backups/ \
  --storage-class STANDARD_IA \
  --delete
```

#### Rsync bilan remote serverga:
```bash
# SSH key sozlash
ssh-keygen -t rsa -b 4096
ssh-copy-id backup-user@remote-server

# Script ichiga qo'shish:
rsync -avz --delete /var/backups/vakans/ \
  backup-user@remote-server:/backups/vakans/
```

### 7. Backup storage ma'lumotlari
```
📦 Retention: 30 kun
📁 Backup location: /var/backups/vakans/
📊 Backup types:
  - Database: Compressed SQL dump (.sql.gz)
  - Redis: RDB snapshot (.rdb)
  - Uploads: Tar archive (.tar.gz)
```

### 8. Test backup
```bash
# Manual backup ishga tushirish (test uchun)
/root/vakans-web/Works-main/scripts/auto-backup.sh

# Backup ishlaganini tekshirish
ls -lh /var/backups/vakans/ | tail -3
```

### 9. Email notifications (Optional)
```bash
# Postfix o'rnatish
apt-get install postfix mailutils

# auto-backup.sh scriptning oxiriga qo'shish:
if [ $? -eq 0 ]; then
    echo "Backup completed successfully" | mail -s "Vakans.uz Backup Success" admin@vakans.uz
else
    echo "Backup failed! Check logs" | mail -s "Vakans.uz Backup FAILED" admin@vakans.uz
fi
```

### 10. Monitoring script
```bash
# Backup monitoring script yaratish
#!/bin/bash
# /root/vakans-web/Works-main/scripts/check-backup.sh

LATEST_BACKUP=$(ls -t /var/backups/vakans/db_backup_*.sql.gz 2>/dev/null | head -1)
if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found!"
    exit 1
fi

BACKUP_AGE=$(find "$LATEST_BACKUP" -mtime +1)
if [ -n "$BACKUP_AGE" ]; then
    echo "⚠️ Backup older than 24 hours!"
    exit 1
fi

echo "✅ Backup is fresh ($(stat -c %y "$LATEST_BACKUP"))"
```

## ✅ Tayyor!

Backup avtomatik ravishda ishlaydi va 30 kun davomida saqlanadi.
