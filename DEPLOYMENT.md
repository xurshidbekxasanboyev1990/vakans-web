<!-- # Production Deployment Guide

## 🚀 Production'ga Deploy Qilish

### 1. Environment Variables

**Frontend (.env)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
NODE_ENV=production
```

**Backend (Supabase Secrets)**
```bash
supabase secrets set JWT_SECRET="your-very-secure-secret-min-32-characters-random"
supabase secrets set JWT_REFRESH_SECRET="your-very-secure-refresh-secret-min-32-characters"
supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
supabase secrets set NODE_ENV="production"
```

### 2. JWT Secrets Generatsiya qilish

**Node.js yordamida:**
```javascript
// generate-secrets.js
const crypto = require('crypto');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');

console.log('JWT_SECRET:', jwtSecret);
console.log('JWT_REFRESH_SECRET:', refreshSecret);
```

**Terminal'da:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Supabase Functions Deploy

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy server

# Set secrets
supabase secrets set JWT_SECRET="your-secret-here"
supabase secrets set JWT_REFRESH_SECRET="your-refresh-secret-here"
supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com"
supabase secrets set NODE_ENV="production"

# Verify deployment
curl https://your-project.supabase.co/functions/v1/make-server-5b47a45d/health
```

### 4. Frontend Build va Deploy

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod

# Set environment variables in Netlify Dashboard
```

### 5. Domain va HTTPS Sozlash

1. **Domain ulash:**
   - Vercel/Netlify'da custom domain qo'shing
   - DNS records sozlang (A/CNAME)

2. **SSL Certificate:**
   - Vercel/Netlify avtomatik SSL beradi
   - Yoki Let's Encrypt ishlatilng

3. **CORS sozlash:**
   ```bash
   supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com"
   ```

### 6. Database Migration

```bash
# Create migration
supabase migration new initial_schema

# Add your SQL
# supabase/migrations/XXXXXX_initial_schema.sql

# Apply migration
supabase db push

# Enable Row Level Security
```

**RLS Policies Misoli:**
```sql
-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Jobs table RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view jobs"
  ON jobs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Employers can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.uid() = employer_id AND
    (SELECT user_type FROM users WHERE id = auth.uid()) = 'employer'
  );

CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = employer_id);
```

### 7. Monitoring va Logging

**Supabase Dashboard:**
- Function logs: `supabase functions logs server`
- Database logs
- API usage

**Sentry Integration:**
```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 8. Performance Optimization

**Frontend:**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

**Backend:**
- Edge Functions avtomatik scale bo'ladi
- Rate limiting configured
- Connection pooling

### 9. Security Checklist

#### Pre-deployment:
- [ ] JWT secrets strong va random
- [ ] ALLOWED_ORIGINS faqat production domain
- [ ] NODE_ENV=production
- [ ] Database RLS yoqilgan
- [ ] .env fayli gitignore'da
- [ ] API rate limits sozlangan
- [ ] HTTPS majburiy
- [ ] Security headers sozlangan
- [ ] XSS protection active
- [ ] Input validation frontend+backend

#### Post-deployment:
- [ ] SSL certificate ishlayapti
- [ ] CORS to'g'ri sozlangan
- [ ] Health check endpoint ishlayapti
- [ ] Authentication flow test qilindi
- [ ] Rate limiting test qilindi
- [ ] Error handling ishlayapti
- [ ] Logs monitoring sozlandi

### 10. Backup Strategy

**Database Backup:**
```bash
# Manual backup
supabase db dump -f backup.sql

# Automated backups (Supabase Pro)
# Dashboard > Settings > Database > Automated Backups
```

**Code Backup:**
- Git repository (GitHub/GitLab)
- Tag each release: `git tag v1.0.0`

### 11. CI/CD Pipeline

**GitHub Actions Example:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Supabase Functions
        run: |
          supabase functions deploy server
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### 12. Health Checks

**Backend Health Endpoint:**
```bash
curl https://your-project.supabase.co/functions/v1/make-server-5b47a45d/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Frontend Health:**
- Monitor with Uptime Robot
- Status page bilan (StatusPage.io)

### 13. Rollback Plan

**Vercel Rollback:**
```bash
vercel rollback
```

**Supabase Function Rollback:**
```bash
# Previous version restore
supabase functions deploy server --version previous
```

**Database Rollback:**
```bash
# Restore from backup
supabase db reset
supabase db push
```

### 14. Post-Deployment Testing

```bash
# Test authentication
curl -X POST https://your-api.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Test protected endpoint
curl -X GET https://your-api.com/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test rate limiting
for i in {1..10}; do
  curl -X POST https://your-api.com/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### 15. Common Issues

**Issue: CORS Error**
```bash
# Check allowed origins
supabase secrets list

# Update if needed
supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com"
```

**Issue: JWT Token Invalid**
```bash
# Verify JWT secret is set
supabase secrets list

# Regenerate if compromised
supabase secrets set JWT_SECRET="new-secret"
```

**Issue: Rate Limit Too Strict**
```typescript
// Adjust in index.tsx
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 200, // Increase limit
  // ...
});
```

### 16. Maintenance Mode

**Enable Maintenance:**
```typescript
// Add to backend index.tsx
app.use('*', async (c, next) => {
  if (Deno.env.get('MAINTENANCE_MODE') === 'true') {
    return c.json({ 
      error: 'Tizim texnik xizmat ko\'rsatishda' 
    }, 503);
  }
  await next();
});
```

```bash
# Enable
supabase secrets set MAINTENANCE_MODE="true"

# Disable
supabase secrets set MAINTENANCE_MODE="false"
```

### 17. Cost Optimization

**Supabase:**
- Monitor function invocations
- Optimize database queries
- Use caching where possible
- Clean up old data regularly

**Vercel/Netlify:**
- Optimize bundle size
- Use CDN caching
- Compress images
- Lazy load components

## 📞 Support

Muammolar yuzaga kelsa:
1. Logs'ni tekshiring: `supabase functions logs server`
2. Health endpoint test qiling
3. Environment variables to'g'riligini tekshiring
4. Security checklist'ni qayta ko'rib chiqing -->
