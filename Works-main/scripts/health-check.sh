#!/bin/bash
# ================================================
# System Health Check
# ================================================
# Barcha servislarning sog'ligini tekshirish
# Foydalanish: ./scripts/health-check.sh

set -e

echo "🏥 Tizim sog'ligini tekshirish..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/.."

# Container statuslari
echo "📦 Container statuslari:"
docker-compose ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# PostgreSQL
echo "🐘 PostgreSQL:"
if docker exec vakans_postgres pg_isready -U vakans_prod_user > /dev/null 2>&1; then
    echo "  ✅ Ishlayapti"
    USERS=$(docker exec vakans_postgres psql -U vakans_prod_user -d vakans_production -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)
    echo "  👥 Foydalanuvchilar: $USERS"
else
    echo "  ❌ Ishlamayapti"
fi

# Redis
echo "🔴 Redis:"
if docker exec vakans_redis redis-cli -a works_redis_password_2024 ping > /dev/null 2>&1; then
    echo "  ✅ Ishlayapti"
    KEYS=$(docker exec vakans_redis redis-cli -a works_redis_password_2024 DBSIZE 2>/dev/null | grep -o '[0-9]*')
    echo "  🔑 Keys: $KEYS"
else
    echo "  ❌ Ishlamayapti"
fi

# Backend API
echo "🖥️  Backend API:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health | grep -q 200; then
    echo "  ✅ Ishlayapti (http://localhost:5000)"
else
    echo "  ❌ Ishlamayapti"
fi

# Frontend
echo "🌐 Frontend:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q 200; then
    echo "  ✅ Ishlayapti (http://localhost:8080)"
else
    echo "  ❌ Ishlamayapti"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Disk space
echo "💾 Disk space:"
df -h / | tail -1 | awk '{print "  Jami: "$2" | Ishlatilgan: "$3" ("$5") | Bo'\''sh: "$4}'

# Docker disk usage
echo "🐳 Docker disk:"
docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}" | tail -n +2 | while read line; do
    echo "  $line"
done

echo ""
echo "✅ Tekshirish tugadi!"
