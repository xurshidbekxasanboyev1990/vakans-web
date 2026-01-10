#!/bin/bash
# ================================================
# Nginx Hot Reload (Without Rebuild)
# ================================================
# Nginx konfiguratsiyani rebuild qilmasdan yangilash
# Foydalanish: ./scripts/nginx-reload.sh

set -e

echo "🔄 Nginx konfiguratsiyani yangilash..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Container ismini tekshirish
if ! docker ps | grep -q vakans_frontend; then
    echo "❌ Frontend container ishlamayapti!"
    echo "Ishga tushirish: docker-compose up -d frontend"
    exit 1
fi

# Nginx config test
echo "1️⃣ Konfiguratsiya test qilish..."
if docker exec vakans_frontend nginx -t; then
    echo "✅ Konfiguratsiya to'g'ri"
else
    echo "❌ Konfiguratsiya xato!"
    exit 1
fi

# Nginx reload
echo "2️⃣ Nginx ni reload qilish..."
docker exec vakans_frontend nginx -s reload

echo "✅ Nginx muvaffaqiyatli reload qilindi!"
echo ""
echo "Tekshirish: curl http://localhost:8080"
