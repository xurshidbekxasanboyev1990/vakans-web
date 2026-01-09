#!/bin/bash

# ====================================
# PRODUCTION DEPLOYMENT SCRIPT
# Works.uz Job Platform
# ====================================

set -e  # Exit on error

echo "🚀 Starting deployment to production..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ====================================
# 1. CHECK PREREQUISITES
# ====================================
echo "📋 Checking prerequisites..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not installed${NC}"
    echo "Install it: npm install -g supabase"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# ====================================
# 2. ENVIRONMENT VARIABLES
# ====================================
echo "🔐 Setting up environment variables..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Create .env file with required variables"
    exit 1
fi

# Load .env
export $(cat .env | grep -v '^#' | xargs)

echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo ""

# ====================================
# 3. SUPABASE LOGIN & LINK
# ====================================
echo "🔗 Connecting to Supabase..."

# Check if already logged in
if ! supabase projects list &> /dev/null; then
    echo "Please login to Supabase:"
    supabase login
fi

# Link project (if not already linked)
echo "Enter your Supabase project ref (from dashboard URL):"
read -p "Project Ref: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo -e "${RED}❌ Project ref required${NC}"
    exit 1
fi

supabase link --project-ref $PROJECT_REF

echo -e "${GREEN}✅ Connected to Supabase${NC}"
echo ""

# ====================================
# 4. DATABASE MIGRATION
# ====================================
echo "🗄️ Running database migrations..."

if [ -d "supabase/migrations" ]; then
    supabase db push
    echo -e "${GREEN}✅ Database migrations complete${NC}"
else
    echo -e "${YELLOW}⚠️ No migrations found${NC}"
fi

echo ""

# ====================================
# 5. SET SUPABASE SECRETS
# ====================================
echo "🔒 Setting Supabase secrets..."

# Read secrets from .env
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
ESKIZ_EMAIL=${ESKIZ_EMAIL}
ESKIZ_PASSWORD=${ESKIZ_PASSWORD}
ESKIZ_FROM=${ESKIZ_FROM}

# Set secrets
supabase secrets set JWT_SECRET="$JWT_SECRET"
supabase secrets set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
supabase secrets set ALLOWED_ORIGINS="$ALLOWED_ORIGINS"

# SMS Secrets (if provided)
if [ ! -z "$ESKIZ_EMAIL" ]; then
    supabase secrets set ESKIZ_EMAIL="$ESKIZ_EMAIL"
    supabase secrets set ESKIZ_PASSWORD="$ESKIZ_PASSWORD"
    supabase secrets set ESKIZ_FROM="$ESKIZ_FROM"
    supabase secrets set SMS_TEST_MODE="false"
    supabase secrets set OTP_EXPIRY_MINUTES="5"
    supabase secrets set OTP_LENGTH="6"
    echo -e "${GREEN}✅ SMS secrets configured${NC}"
else
    echo -e "${YELLOW}⚠️ SMS secrets not configured (test mode will be used)${NC}"
fi

echo -e "${GREEN}✅ Secrets configured${NC}"
echo ""

# ====================================
# 6. DEPLOY BACKEND FUNCTION
# ====================================
echo "☁️ Deploying backend function..."

# Deploy Supabase Edge Function
supabase functions deploy server

echo -e "${GREEN}✅ Backend deployed${NC}"
echo ""

# ====================================
# 7. ENABLE REALTIME
# ====================================
echo "⚡ Enabling Realtime for chat..."

echo "Please enable Realtime manually in Supabase Dashboard:"
echo "1. Go to Database → Replication"
echo "2. Enable 'messages' table"
echo "3. Enable 'conversations' table"
echo ""
echo "Or run this SQL in SQL Editor:"
echo ""
echo "ALTER PUBLICATION supabase_realtime ADD TABLE messages;"
echo "ALTER PUBLICATION supabase_realtime ADD TABLE conversations;"
echo ""
read -p "Press Enter when done..."

echo -e "${GREEN}✅ Realtime setup complete${NC}"
echo ""

# ====================================
# 8. BUILD FRONTEND
# ====================================
echo "🏗️ Building frontend..."

# Install dependencies
npm install

# Build
npm run build

echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# ====================================
# 9. DEPLOY FRONTEND (OPTIONAL)
# ====================================
echo "🌐 Frontend deployment options:"
echo ""
echo "Choose deployment platform:"
echo "1. Vercel (recommended)"
echo "2. Netlify"
echo "3. Skip (deploy manually)"
echo ""
read -p "Choose (1-3): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        echo "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
            echo -e "${GREEN}✅ Deployed to Vercel${NC}"
        else
            echo -e "${YELLOW}Install Vercel CLI: npm install -g vercel${NC}"
            echo "Then run: vercel --prod"
        fi
        ;;
    2)
        echo "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod
            echo -e "${GREEN}✅ Deployed to Netlify${NC}"
        else
            echo -e "${YELLOW}Install Netlify CLI: npm install -g netlify-cli${NC}"
            echo "Then run: netlify deploy --prod"
        fi
        ;;
    3)
        echo -e "${YELLOW}Skipping frontend deployment${NC}"
        echo "Deploy manually to your hosting provider"
        ;;
    *)
        echo -e "${YELLOW}Invalid choice. Skipping deployment${NC}"
        ;;
esac

echo ""

# ====================================
# 10. FINAL CHECKS
# ====================================
echo "✅ Testing deployment..."

# Get Supabase URL
SUPABASE_URL="https://$PROJECT_REF.supabase.co"

# Test health endpoint
echo "Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s "$SUPABASE_URL/functions/v1/make-server-5b47a45d/health")

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
fi

echo ""

# ====================================
# DEPLOYMENT COMPLETE
# ====================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update .env with production URLs:"
echo "   VITE_SUPABASE_URL=$SUPABASE_URL"
echo ""
echo "2. Get Anon Key from Supabase Dashboard:"
echo "   Settings → API → anon public key"
echo ""
echo "3. Test the application:"
echo "   - Register new user"
echo "   - Login"
echo "   - Post a job"
echo "   - Send a message (real-time chat)"
echo "   - Verify phone number (SMS)"
echo ""
echo "4. Update CORS in production:"
echo "   supabase secrets set ALLOWED_ORIGINS=\"https://your-domain.com\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation:"
echo "   - DEPLOYMENT_GUIDE.md"
echo "   - PRODUCTION_READY.md"
echo "   - READY_TO_DEPLOY.md"
echo ""
echo "🆘 Support:"
echo "   - Supabase logs: supabase functions logs server"
echo "   - Check errors in Supabase Dashboard"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
