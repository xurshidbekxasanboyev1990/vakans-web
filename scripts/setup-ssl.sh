#!/bin/bash
# ============================================
# SSL CERTIFICATE SETUP (Let's Encrypt)
# ============================================
# Usage: sudo bash setup-ssl.sh
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🔐 SSL Certificate Setup${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo bash setup-ssl.sh)${NC}"
    exit 1
fi

# Install Certbot
echo -e "${YELLOW}📦 Installing Certbot...${NC}"
apt update
apt install -y certbot python3-certbot-nginx
echo -e "${GREEN}✅ Certbot installed${NC}"
echo ""

# Get SSL certificate for vakans.uz
echo -e "${YELLOW}🔐 Obtaining SSL certificate for vakans.uz...${NC}"
echo -e "${YELLOW}⚠️  Make sure domain DNS points to this server!${NC}"
read -p "Press Enter to continue..."

certbot certonly --standalone -d vakans.uz -d www.vakans.uz --non-interactive --agree-tos --email admin@vakans.uz

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate obtained successfully!${NC}"
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    exit 1
fi

# Test auto-renewal
echo -e "${YELLOW}🔄 Testing auto-renewal...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Auto-renewal is working${NC}"
else
    echo -e "${RED}❌ Auto-renewal test failed${NC}"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✅ SSL Setup Complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}📋 Certificate locations:${NC}"
echo -e "   Fullchain: ${BLUE}/etc/letsencrypt/live/vakans.uz/fullchain.pem${NC}"
echo -e "   Private Key: ${BLUE}/etc/letsencrypt/live/vakans.uz/privkey.pem${NC}"
echo ""
echo -e "${YELLOW}🔧 Next step:${NC}"
echo -e "   Configure Nginx with SSL${NC}"
echo ""
