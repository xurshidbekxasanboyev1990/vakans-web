#!/bin/bash

# ====================================
# VAKANS.UZ - Docker Production Deploy
# Contabo VPS uchun
# ====================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🚀 VAKANS.UZ PRODUCTION DEPLOY       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# ====================================
# 1. TEKSHIRUVLAR
# ====================================
echo -e "${YELLOW}📋 Tekshiruvlar...${NC}"

# Docker mavjudligini tekshirish
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker o'rnatilmagan!${NC}"
    echo "O'rnatish: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Docker Compose mavjudligini tekshirish
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose o'rnatilmagan!${NC}"
    echo "O'rnatish: apt install docker-compose-plugin -y"
    exit 1
fi

# .env fayli mavjudligini tekshirish
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env fayli topilmadi!${NC}"
    echo ""
    echo "Quyidagi buyruqni ishga tushiring:"
    echo "  cp .env.docker .env"
    echo "  nano .env  # Secret'larni o'zgartiring"
    exit 1
fi

echo -e "${GREEN}✅ Barcha tekshiruvlar o'tdi${NC}"
echo ""

# ====================================
# 2. ESKI KONTEYNERLARNI TO'XTATISH
# ====================================
echo -e "${YELLOW}🛑 Eski konteynerlarni to'xtatish...${NC}"

docker compose down --remove-orphans 2>/dev/null || true

echo -e "${GREEN}✅ Eski konteynerlar to'xtatildi${NC}"
echo ""

# ====================================
# 3. IMAGELARNI BUILD QILISH
# ====================================
echo -e "${YELLOW}🔨 Docker imagelarni build qilish...${NC}"

docker compose build --no-cache

echo -e "${GREEN}✅ Build muvaffaqiyatli tugadi${NC}"
echo ""

# ====================================
# 4. SERVICELARNI ISHGA TUSHIRISH
# ====================================
echo -e "${YELLOW}🚀 Servicelarni ishga tushirish...${NC}"

docker compose up -d

echo -e "${GREEN}✅ Barcha servicelar ishga tushdi${NC}"
echo ""

# ====================================
# 5. HEALTH CHECK
# ====================================
echo -e "${YELLOW}🏥 Health check...${NC}"

sleep 10

# PostgreSQL
if docker compose exec -T postgres pg_isready -U vakans_user -d vakans_db &>/dev/null; then
    echo -e "${GREEN}✅ PostgreSQL - OK${NC}"
else
    echo -e "${RED}❌ PostgreSQL - XATO${NC}"
fi

# Redis
if docker compose exec -T redis redis-cli ping &>/dev/null; then
    echo -e "${GREEN}✅ Redis - OK${NC}"
else
    echo -e "${RED}❌ Redis - XATO${NC}"
fi

# Backend
if curl -sf http://localhost:5000/health &>/dev/null; then
    echo -e "${GREEN}✅ Backend API - OK${NC}"
else
    echo -e "${YELLOW}⏳ Backend hali ishga tushmagan, 10 soniya kutamiz...${NC}"
    sleep 10
    if curl -sf http://localhost:5000/health &>/dev/null; then
        echo -e "${GREEN}✅ Backend API - OK${NC}"
    else
        echo -e "${RED}❌ Backend API - XATO${NC}"
        echo "Loglarni tekshiring: docker compose logs backend"
    fi
fi

# Frontend (NGINX)
if curl -sf http://localhost:80 &>/dev/null; then
    echo -e "${GREEN}✅ Frontend (NGINX) - OK${NC}"
else
    echo -e "${RED}❌ Frontend - XATO${NC}"
fi

echo ""

# ====================================
# 6. STATUS
# ====================================
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              📊 STATUS                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

docker compose ps

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 DEPLOY MUVAFFAQIYATLI TUGADI!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "🌐 Sayt: ${BLUE}https://vakans.uz${NC}"
echo -e "📊 API:  ${BLUE}https://vakans.uz/api${NC}"
echo ""
echo -e "${YELLOW}Foydali buyruqlar:${NC}"
echo "  docker compose logs -f          # Barcha loglar"
echo "  docker compose logs backend -f  # Backend loglari"
echo "  docker compose restart backend  # Backend qayta ishga tushirish"
echo "  docker compose down             # Barcha servicelarni to'xtatish"
echo ""
