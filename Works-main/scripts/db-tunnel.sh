#!/bin/bash
# ================================================
# PostgreSQL Port Forwarding (Development)
# ================================================
# DataGrip, pgAdmin kabi toollar uchun
# Local portga forward qilish
# Foydalanish: ./scripts/db-tunnel.sh [port]

set -e

LOCAL_PORT=${1:-15432}

echo "🔌 PostgreSQL port forwarding..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Local port: localhost:$LOCAL_PORT"
echo "Database: vakans_production"
echo "Username: vakans_prod_user"
echo "Password: KUCHLI_PAROL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Container ismini tekshirish
if ! docker ps | grep -q vakans_postgres; then
    echo "❌ PostgreSQL container ishlamayapti!"
    echo "Ishga tushirish: docker-compose up -d postgres"
    exit 1
fi

echo "✅ Port forwarding ishga tushdi"
echo "DataGrip/pgAdmin da ulanish:"
echo "  Host: localhost"
echo "  Port: $LOCAL_PORT"
echo "  Database: vakans_production"
echo "  Username: vakans_prod_user"
echo ""
echo "⏹️  To'xtatish: Ctrl+C"
echo ""

# socat orqali port forwarding
docker run --rm -it \
  --network works-main_vakans_network \
  alpine/socat \
  TCP-LISTEN:$LOCAL_PORT,fork,reuseaddr \
  TCP:vakans_postgres:5432
