#!/bin/bash
# ================================================
# Redis Cache Connection Helper
# ================================================
# Redis ga ulanish uchun script
# Foydalanish: ./scripts/redis-connect.sh

set -e

echo "🔌 Redis ga ulanish..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Container ismini tekshirish
if ! docker ps | grep -q vakans_redis; then
    echo "❌ Redis container ishlamayapti!"
    echo "Ishga tushirish: docker-compose up -d redis"
    exit 1
fi

# Redis CLI orqali ulanish
docker exec -it vakans_redis redis-cli -a works_redis_password_2024

echo "✅ Ulanish tugadi"
