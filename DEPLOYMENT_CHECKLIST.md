# 🎯 VAKANS.UZ - QUICK DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment

- [ ] VPS Server ready (Ubuntu 22.04/24.04)
- [ ] Docker & Docker Compose installed
- [ ] Domain DNS configured (vakans.uz → Server IP)
- [ ] Cloudflare configured (if using)
- [ ] SSL certificates ready
- [ ] `.env` file configured with production secrets

## 📦 Installation Steps

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

### 2. Project Setup
```bash
# Create directory
sudo mkdir -p /opt/vakans.uz
cd /opt/vakans.uz

# Upload files (via Git or SFTP)
# Option A: Git
git clone https://github.com/xurshidbekxasanboyev1990/vakans-web.git .

# Option B: Upload manually
# scp -r ./Works-main/* root@your-server:/opt/vakans.uz/
```

### 3. Configure Environment
```bash
# Copy template
cp .env.production.template .env

# Edit with your secrets
nano .env

# CRITICAL: Change ALL these values:
# - POSTGRES_PASSWORD
# - REDIS_PASSWORD
# - JWT_SECRET (openssl rand -base64 64)
# - JWT_REFRESH_SECRET (openssl rand -base64 64)
# - COOKIE_SECRET (openssl rand -base64 32)
# - ESKIZ_EMAIL
# - ESKIZ_PASSWORD

# Set permissions
chmod 600 .env
```

### 4. SSL Certificates
```bash
# Option A: Automated script
sudo bash scripts/setup-ssl.sh

# Option B: Manual
sudo apt install -y certbot
sudo certbot certonly --standalone -d vakans.uz -d www.vakans.uz
```

### 5. Nginx Configuration
```bash
# Copy config
sudo cp nginx-multi-site.conf /etc/nginx/sites-available/multi-site

# Enable
sudo ln -s /etc/nginx/sites-available/multi-site /etc/nginx/sites-enabled/

# Test
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

### 6. Deploy Application
```bash
# Option A: Automated script
cd /opt/vakans.uz
sudo bash scripts/deploy.sh

# Option B: Manual
cd /opt/vakans.uz
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
```

### 7. Verification
```bash
# Check containers
docker compose -f docker-compose.production.yml ps

# Check logs
docker compose -f docker-compose.production.yml logs -f

# Test endpoints
curl http://localhost:5000/api/health
curl http://localhost:3001

# Test in browser
# https://vakans.uz

# Verify sysmasters.uz still works!
# https://sysmasters.uz
```

## 🔧 Post-Deployment

### Setup Automatic Backups
```bash
# Make script executable
chmod +x /opt/vakans.uz/scripts/backup-database.sh

# Add to crontab
crontab -e

# Add this line (daily backup at 2 AM):
0 2 * * * /opt/vakans.uz/scripts/backup-database.sh
```

### Monitor Services
```bash
# View container status
docker ps

# View logs
docker logs -f vakans_backend
docker logs -f vakans_frontend

# View resource usage
docker stats
```

## 🚨 Common Issues & Solutions

### Issue: Port already in use
```bash
# Find what's using port
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

### Issue: Database connection failed
```bash
# Check PostgreSQL
docker exec -it vakans_postgres psql -U vakans_user -d vakans_db

# View logs
docker logs vakans_postgres
```

### Issue: Frontend 404
```bash
# Rebuild frontend
docker compose -f docker-compose.production.yml build frontend
docker compose -f docker-compose.production.yml up -d frontend
```

### Issue: SSL certificate error
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

## 📊 Useful Commands

```bash
# View all containers
docker compose -f docker-compose.production.yml ps

# Restart specific service
docker compose -f docker-compose.production.yml restart backend

# Stop all services
docker compose -f docker-compose.production.yml down

# View logs (real-time)
docker compose -f docker-compose.production.yml logs -f

# View logs (specific service)
docker compose -f docker-compose.production.yml logs -f backend

# Execute command in container
docker exec -it vakans_backend sh

# Backup database manually
docker exec -t vakans_postgres pg_dump -U vakans_user -d vakans_db > backup.sql

# Restore database
docker exec -i vakans_postgres psql -U vakans_user -d vakans_db < backup.sql

# Clean up unused resources
docker system prune -af
```

## ✅ Final Verification Checklist

- [ ] vakans.uz loads correctly
- [ ] HTTPS certificate is valid
- [ ] API endpoints work (/api/health)
- [ ] Login/Register works
- [ ] WebSocket connection works
- [ ] Database queries work
- [ ] Redis caching works
- [ ] **sysmasters.uz still works (CRITICAL!)**
- [ ] No console errors
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] SSL auto-renewal works

## 🎉 Success!

Your vakans.uz is now deployed in production alongside sysmasters.uz!

**Important URLs:**
- Frontend: https://vakans.uz
- API: https://vakans.uz/api
- WebSocket: wss://vakans.uz/socket.io

**Monitoring:**
```bash
# Watch logs
docker compose -f docker-compose.production.yml logs -f

# Check health
watch -n 5 'curl -s http://localhost:5000/api/health | jq'
```

---

**Need help?** Check the full guide: [PRODUCTION_DEPLOYMENT_COMPLETE_GUIDE.md](./PRODUCTION_DEPLOYMENT_COMPLETE_GUIDE.md)
