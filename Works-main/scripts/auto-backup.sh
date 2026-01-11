#!/bin/bash

# ============================================
# VAKANS.UZ - Automated Backup Script
# ============================================
# Bu script har kuni avtomatik backup olib turadi
# Cron job orqali ishga tushiriladi
# ============================================

set -e

# Konfiguratsiya
BACKUP_DIR="/var/backups/vakans"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_CONTAINER="vakans_postgres"
DB_NAME="vakans_production"
DB_USER="vakans_prod_user"

# Backup papkasini yaratish
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting backup at $DATE..."

# Database backup
echo "📦 Backing up database..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Redis backup (agar kerak bo'lsa)
echo "📦 Backing up Redis..."
docker exec vakans_redis redis-cli --rdb /data/dump.rdb SAVE
docker cp vakans_redis:/data/dump.rdb "$BACKUP_DIR/redis_backup_$DATE.rdb"

# Upload papkalarini backup qilish
echo "📦 Backing up uploads..."
if [ -d "/root/vakans-web/Works-main/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" -C /root/vakans-web/Works-main uploads/
fi

# Eski backuplarni o'chirish (30 kundan eski)
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Backup hajmini ko'rsatish
echo "✅ Backup completed!"
du -sh "$BACKUP_DIR"
ls -lh "$BACKUP_DIR" | tail -5

# Optional: Remote backup (S3, rsync, etc)
# aws s3 sync "$BACKUP_DIR" s3://your-bucket/vakans-backups/
# rsync -avz "$BACKUP_DIR" user@remote-server:/backups/vakans/

echo "✅ All backups completed successfully at $(date)"
