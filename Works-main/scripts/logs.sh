#!/bin/bash
# ================================================
# Container Logs Viewer
# ================================================
# Barcha yoki bitta container loglarini ko'rish
# Foydalanish: 
#   ./scripts/logs.sh              # Barcha loglar
#   ./scripts/logs.sh backend      # Faqat backend
#   ./scripts/logs.sh frontend -f  # Frontend (follow mode)

set -e

SERVICE=$1
FOLLOW_FLAG=$2

echo "📋 Container loglar..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/.."

if [ -z "$SERVICE" ]; then
    # Barcha loglar
    echo "Barcha servislar:"
    docker-compose logs --tail=50 $FOLLOW_FLAG
else
    # Bitta servis
    echo "Servis: $SERVICE"
    docker-compose logs $SERVICE --tail=100 $FOLLOW_FLAG
fi
