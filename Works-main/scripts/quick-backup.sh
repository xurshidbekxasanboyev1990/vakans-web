#!/bin/bash
# ================================================
# Quick Database Backup
# ================================================
# Tez backup olish (PostgreSQL)
# Foydalanish: ./scripts/quick-backup.sh [fayl_nomi]

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE=${1:-"vakans_backup_$TIMESTAMP.sql"}

mkdir -p "$BACKUP_DIR"

echo "💾 Database backup olish..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Container tekshirish
if ! docker ps | grep -q vakans_postgres; then
    echo "❌ PostgreSQL container ishlamayapti!"
    exit 1
fi

# Backup olish
echo "Backup fayl: $BACKUP_DIR/$BACKUP_FILE"
docker exec vakans_postgres pg_dump \
    -U vakans_prod_user \
    -d vakans_production \
    --clean \
    --if-exists \
    > "$BACKUP_DIR/$BACKUP_FILE"

# Compress qilish
echo "🗜️  Siqish..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

FINAL_FILE="$BACKUP_DIR/$BACKUP_FILE.gz"
FILE_SIZE=$(du -h "$FINAL_FILE" | cut -f1)

echo "✅ Backup tayyor!"
echo "Fayl: $FINAL_FILE"
echo "Hajm: $FILE_SIZE"
echo ""
echo "Restore qilish:"
echo "gunzip $FINAL_FILE"
echo "docker exec -i vakans_postgres psql -U vakans_prod_user -d vakans_production < $BACKUP_DIR/$BACKUP_FILE"
