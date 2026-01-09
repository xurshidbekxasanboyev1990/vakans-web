#!/bin/bash
# ============================================
# VAKANS.UZ - Database Backup Script
# ============================================
# Run daily via cron: 0 2 * * * /opt/vakans.uz/scripts/backup-database.sh
# ============================================

set -e

# Configuration
BACKUP_DIR="/opt/vakans.uz/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vakans_db_$DATE.sql.gz"
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Starting database backup...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
echo -e "${YELLOW}📦 Creating backup...${NC}"
if docker exec -t vakans_postgres pg_dump -U vakans_user -d vakans_db | gzip > "$BACKUP_FILE"; then
    echo -e "${GREEN}✅ Backup created successfully: $BACKUP_FILE${NC}"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}📊 Backup size: $SIZE${NC}"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

# Clean up old backups
echo -e "${YELLOW}🧹 Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
DELETED=$(find "$BACKUP_DIR" -type f -name "vakans_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo -e "${GREEN}✅ Deleted $DELETED old backup(s)${NC}"

# List current backups
echo -e "${YELLOW}📋 Current backups:${NC}"
ls -lh "$BACKUP_DIR" | grep "vakans_db_"

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
