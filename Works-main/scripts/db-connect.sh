#!/bin/bash
# ================================================
# PostgreSQL Database Connection Helper
# ================================================
# Database ga ulanish uchun script
# Foydalanish: ./scripts/db-connect.sh

set -e

echo "🔌 PostgreSQL ga ulanish..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Container ismini tekshirish
if ! docker ps | grep -q vakans_postgres; then
    echo "❌ PostgreSQL container ishlamayapti!"
    echo "Ishga tushirish: docker-compose up -d postgres"
    exit 1
fi

# psql orqali ulanish
docker exec -it vakans_postgres psql -U vakans_prod_user -d vakans_production

echo "✅ Ulanish tugadi"
