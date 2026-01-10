#!/bin/bash
# ================================================
# Nginx Config Live Edit
# ================================================
# Nginx konfiguratsiyani hot-edit qilish
# Rebuild qilmasdan o'zgartirish va reload
# Foydalanish: ./scripts/nginx-edit.sh

set -e

CONFIG_FILE="docker/nginx/nginx.conf"
TEMP_CONFIG="/tmp/vakans_nginx_temp.conf"

echo "✏️  Nginx konfiguratsiya edit qilish..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Container ismini tekshirish
if ! docker ps | grep -q vakans_frontend; then
    echo "❌ Frontend container ishlamayapti!"
    exit 1
fi

# Hozirgi config ni ko'rsatish
echo "📄 Hozirgi konfiguratsiya:"
docker exec vakans_frontend cat /etc/nginx/conf.d/default.conf

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "O'zgartirish uchun davom etasizmi? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Bekor qilindi"
    exit 0
fi

# Local config ni container ga copy qilish
echo "1️⃣ Yangi konfiguratsiyani yuklash..."
docker cp "$CONFIG_FILE" vakans_frontend:/etc/nginx/conf.d/default.conf

# Test qilish
echo "2️⃣ Konfiguratsiya test qilish..."
if docker exec vakans_frontend nginx -t; then
    echo "✅ Konfiguratsiya to'g'ri"
    
    # Reload
    echo "3️⃣ Nginx reload..."
    docker exec vakans_frontend nginx -s reload
    
    echo "✅ Muvaffaqiyatli yangilandi!"
    echo ""
    echo "⚠️  ESLATMA: Bu hot-edit, rebuild qilsangiz yo'qoladi!"
    echo "Doimiy qilish uchun: git add $CONFIG_FILE && git commit"
else
    echo "❌ Konfiguratsiya xato! Eski holatga qaytarildi."
    exit 1
fi
