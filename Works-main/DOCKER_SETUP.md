# Works.uz - Docker bilan ishga tushirish

## Tizim talablari

- Docker Desktop (Windows/Mac) yoki Docker Engine (Linux)
- Docker Compose v2+
- Node.js 18+ (development uchun)

## Tez boshlash

### 1. Docker bilan ishga tushirish (production)

```bash
# Barcha servislarni build va ishga tushirish
docker-compose up --build

# Yoki background mode'da
docker-compose up -d --build
```

Servislar:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### 2. Development mode (Docker'siz)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
npm install
npm run dev
```

## Demo kirish ma'lumotlari

### Admin
- **Telefon:** +998901234567
- **Parol:** admin123
- **PIN:** 2024

### Worker (Ishchi)
- **Telefon:** +998911112233
- **Parol:** worker123

### Employer (Ish beruvchi)
- **Telefon:** +998912345678
- **Parol:** employer123

## Docker buyruqlari

```bash
# Servislarni to'xtatish
docker-compose down

# Servislarni to'xtatish va ma'lumotlarni o'chirish
docker-compose down -v

# Loglarni ko'rish
docker-compose logs -f

# Faqat backend loglarini ko'rish
docker-compose logs -f backend

# Konteynerga kirish
docker-compose exec backend sh
docker-compose exec postgres psql -U works_user -d works_db
```

## Arxitektura

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                   (React + TypeScript)                       │
│                      Port: 3000                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│              (Node.js + Express + Socket.io)                 │
│                      Port: 5000                              │
└─────────────┬───────────────────────────────┬───────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│       PostgreSQL        │     │          Redis               │
│    (Primary Database)   │     │   (Cache + Sessions +        │
│       Port: 5432        │     │    Real-time Pub/Sub)        │
│                         │     │       Port: 6379             │
└─────────────────────────┘     └─────────────────────────────┘
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish
- `POST /api/auth/logout` - Chiqish
- `POST /api/auth/refresh` - Token yangilash

### Users
- `GET /api/users/me` - Profilni olish
- `PUT /api/users/me` - Profilni yangilash
- `GET /api/users/:id` - Foydalanuvchini olish

### Jobs
- `GET /api/jobs` - Ishlar ro'yxati
- `POST /api/jobs` - Yangi ish yaratish
- `GET /api/jobs/:id` - Bitta ishni olish
- `PUT /api/jobs/:id` - Ishni yangilash
- `DELETE /api/jobs/:id` - Ishni o'chirish

### Applications
- `POST /api/applications` - Ariza yuborish
- `GET /api/applications/my` - Mening arizalarim
- `GET /api/applications/job/:id` - Ish uchun arizalar

### Admin
- `GET /api/admin/stats` - Statistika
- `GET /api/admin/users` - Foydalanuvchilar
- `PUT /api/admin/users/:id` - Foydalanuvchini yangilash
- `POST /api/admin/users/:id/block` - Bloklash/Blokdan chiqarish

## Muhim sozlamalar

### Environment variables

Backend uchun `.env` fayli:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://works_user:works_secure_password_2024@localhost:5432/works_db
REDIS_URL=redis://:works_redis_password_2024@localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

## Xavfsizlik

- Barcha parollar bcrypt bilan hashlangan
- JWT access token (15 daqiqa) + refresh token (7 kun)
- Rate limiting: 100 so'rov/daqiqa
- CORS himoyasi
- Helmet.js bilan HTTP headers himoyasi
- Input validation (Zod)

## Texnologiyalar

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Shadcn/UI
- **Backend:** Node.js, Express, TypeScript, Socket.io
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Container:** Docker, Docker Compose
