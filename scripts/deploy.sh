#!/bin/bash
# ============================================
# VAKANS.UZ - PRODUCTION DEPLOYMENT SCRIPT
# ============================================
# Usage: sudo bash deploy.sh
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/vakans.uz"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🚀 VAKANS.UZ - PRODUCTION DEPLOYMENT${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo bash deploy.sh)${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}💡 Copy .env.production.template to .env and configure it first:${NC}"
    echo -e "${YELLOW}   cp .env.production.template .env${NC}"
    echo -e "${YELLOW}   nano .env${NC}"
    exit 1
fi

# Check required commands
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is not installed!${NC}"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose is not installed!${NC}"; exit 1; }

echo -e "${GREEN}✅ Prerequisites checked${NC}"
echo ""

# Pull latest changes (if Git repo)
if [ -d "$PROJECT_DIR/.git" ]; then
    echo -e "${YELLOW}📥 Pulling latest changes from Git...${NC}"
    cd "$PROJECT_DIR"
    git pull || echo -e "${YELLOW}⚠️  Git pull failed (skipping)${NC}"
    echo ""
fi

# Build Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
cd "$PROJECT_DIR"
docker compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
echo -e "${GREEN}✅ Images built successfully${NC}"
echo ""

# Stop old containers
echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker compose -f "$DOCKER_COMPOSE_FILE" down || true
echo -e "${GREEN}✅ Old containers stopped${NC}"
echo ""

# Start new containers
echo -e "${YELLOW}🚀 Starting new containers...${NC}"
docker compose -f "$DOCKER_COMPOSE_FILE" up -d
echo -e "${GREEN}✅ Containers started${NC}"
echo ""

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check container status
echo -e "${BLUE}📊 Container Status:${NC}"
docker compose -f "$DOCKER_COMPOSE_FILE" ps
echo ""

# Check health
echo -e "${YELLOW}🏥 Checking health endpoints...${NC}"

# Check PostgreSQL
if docker exec -t vakans_postgres pg_isready -U vakans_user -d vakans_db >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is healthy${NC}"
else
    echo -e "${RED}❌ PostgreSQL is NOT healthy${NC}"
fi

# Check Redis
if docker exec -t vakans_redis redis-cli -a "$(grep REDIS_PASSWORD "$PROJECT_DIR/.env" | cut -d '=' -f2)" ping >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis is NOT healthy${NC}"
fi

# Check Backend
if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend is NOT healthy${NC}"
fi

# Check Frontend
if curl -f http://localhost:3001 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend is NOT healthy${NC}"
fi

echo ""

# Show logs
echo -e "${YELLOW}📝 Recent logs:${NC}"
docker compose -f "$DOCKER_COMPOSE_FILE" logs --tail=20
echo ""

# Cleanup
echo -e "${YELLOW}🧹 Cleaning up unused Docker resources...${NC}"
docker system prune -f
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETED!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Check logs: ${BLUE}docker compose -f $DOCKER_COMPOSE_FILE logs -f${NC}"
echo -e "   2. Test website: ${BLUE}https://vakans.uz${NC}"
echo -e "   3. Verify sysmasters.uz: ${BLUE}https://sysmasters.uz${NC}"
echo ""
echo -e "${YELLOW}🔧 Useful commands:${NC}"
echo -e "   Restart: ${BLUE}docker compose -f $DOCKER_COMPOSE_FILE restart${NC}"
echo -e "   Stop: ${BLUE}docker compose -f $DOCKER_COMPOSE_FILE down${NC}"
echo -e "   Logs: ${BLUE}docker compose -f $DOCKER_COMPOSE_FILE logs -f [service]${NC}"
echo ""
