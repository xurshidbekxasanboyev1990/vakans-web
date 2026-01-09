# VPS: Pause status fix (paused vs closed)

## Why you still see “pause closes job”
If the browser is still running an older frontend build, it can **send `closed` to the API while showing toast `paused`** (toast uses UI label).
Also, production Postgres must allow `paused` in the `jobs.status` CHECK constraint.

## 1) Update Postgres constraint (REQUIRED)
Run this against your **production** database (container `vakans_postgres`):

```bash
# on VPS
cd /www/wwwroot/vakans-web

docker exec -i vakans_postgres psql -U postgres -d works < ./backend/migrations/002_add_paused_status.sql
```

If your DB name/user differ, adjust `-U` and `-d`.

## 2) Rebuild/restart backend (REQUIRED)
Your backend container must include the new code that accepts `paused`.

```bash
# on VPS
cd /www/wwwroot/vakans-web

docker compose -f docker-compose.prod.yml up -d --build vakans_backend
```

## 3) Deploy new frontend build (REQUIRED)
Build locally and deploy `dist/` to the VPS web root.

On Windows (local):
```powershell
cd "C:\Users\user\Desktop\Works-main"
npm run build
# then use your existing deploy script
# (example)
# .\tools\deploy-dist.ps1 -Host 77.237.239.235 -RemotePath "/www/wwwroot/77.237.239.235"
```

## 4) Force client to pick up new service worker (one-time)
After deploy, on the site:
- Hard reload (`Ctrl+F5`), OR
- DevTools → Application → Service Workers → **Unregister** → reload.

Current SW cache version in repo: `vakans-uz-v4`.

## 5) Verify
- Pause should store `paused` (not `closed`).
- Employer/Admin dashboards auto-refresh every **5s** (polling).
