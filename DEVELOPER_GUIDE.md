<!-- # Works.uz - Vakansiyalar Platformasi

## 📋 Tavsif

Works.uz - bu ishchilar va ish beruvchilarni bog'lovchi zamonaviy platforma. Platforma orqali ishchilar ish topishi va ish beruvchilar xodim topishi mumkin.

## ✨ Asosiy Xususiyatlar

### Ishchilar uchun:
- ✅ Vakansiyalarni ko'rish va qidirish
- ✅ Viloyat bo'yicha filtrlash
- ✅ Ishga ariza yuborish
- ✅ Ish beruvchilar bilan chat
- ✅ Profil boshqaruvi
- ✅ 4 tilda qo'llab-quvvatlash (O'zbek, Ўзбек, Русский, English)

### Ish beruvchilar uchun:
- ✅ Vakansiya e'lon qilish
- ✅ Arizalarni ko'rish va boshqarish
- ✅ Ishchilar bilan chat
- ✅ Ish e'lonlarini tahrirlash va o'chirish
- ✅ Profil boshqaruvi

## 🏗️ Arxitektura

Loyiha **Clean Architecture** prinsipiga asoslangan:

```
src/
├── app/                    # Presentation Layer
│   ├── components/        # UI Components
│   └── i18n/             # Internationalization
├── contexts/              # React Contexts
├── lib/                   # Business Logic Layer
│   ├── services/         # Service Layer (Auth, Jobs, etc.)
│   ├── api.ts            # API Client
│   ├── validation.ts     # Input Validation
│   └── sanitize.ts       # XSS Protection
└── styles/               # Global Styles
```

### Layer tuzilmasi:

1. **Presentation Layer** (`app/`)
   - React komponentlar
   - UI logikasi
   - User interactions

2. **Business Logic Layer** (`lib/services/`)
   - `AuthService` - Authentication
   - `JobsService` - Jobs CRUD
   - Validation
   - Data transformation

3. **Data Layer** (`lib/api.ts`)
   - API calls
   - Token management
   - Error handling

## 🔒 Xavfsizlik

- ✅ XSS himoyasi (DOMPurify)
- ✅ Input validation (Zod)
- ✅ Sanitization barcha ma'lumotlar uchun
- ✅ JWT token authentication
- ✅ Auto token refresh
- ✅ Session management

## 🚀 Ishga Tushirish

### 1. Dependencies o'rnatish

```powershell
npm install
```

### 2. Environment o'rnatish

`.env` fayl yarating va quyidagilarni qo'shing:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Development server

```powershell
npm run dev
```

Server `http://localhost:5173` da ishga tushadi.

### 4. Production build

```powershell
npm run build
```

## 📦 Texnologiyalar

### Frontend:
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI Components
- **Radix UI** - Accessible Components

### Validation & Security:
- **Zod** - Schema Validation
- **DOMPurify** - XSS Protection

### State Management:
- **React Context API** - Global State
- **React Hooks** - Local State

### Backend Integration:
- **Supabase** - Backend as a Service
- **REST API** - API Architecture

## 🌐 Internationalization (i18n)

Platforma 4 tilda ishlaydi:
- 🇺🇿 O'zbekcha (Lotin)
- 🇺🇿 Ўзбекча (Kirill)
- 🇷🇺 Русский
- 🇬🇧 English

Til o'zgartirish - yuqori o'ng burchakdagi tugma orqali.

## 📱 Responsive Design

Platforma barcha qurilmalarda ishlaydi:
- 📱 Mobile (320px+)
- 💻 Tablet (768px+)
- 🖥️ Desktop (1024px+)

## 🎨 Dizayn Tizimi

### Color Scheme:
```css
/* Light Mode */
--primary: Blue-Purple gradient
--background: Blue-Indigo-Purple gradient
--card: White with shadow

/* Dark Mode */
--primary: Blue-Purple gradient
--background: Gray gradient
--card: Dark with border
```

### Typography:
- Headings: Bold, 2xl-6xl
- Body: Regular, base
- Small: sm, muted

## 🔧 Service Layer API

### AuthService

```typescript
import { authService } from '@/lib/services';

// Login
const result = await authService.login({
  phone: '+998901234567',
  password: 'password123'
});

// Register
const result = await authService.register({
  firstName: 'John',
  lastName: 'Doe',
  phone: '+998901234567',
  region: 'Toshkent',
  password: 'password123',
  userType: 'worker'
});

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();
```

### JobsService

```typescript
import { jobsService } from '@/lib/services';

// Get all jobs
const { data: jobs } = await jobsService.getJobs({
  region: 'Toshkent',
  search: 'developer'
});

// Create job (employer only)
const result = await jobsService.createJob({
  title: 'Frontend Developer',
  description: 'We are looking for...',
  location: 'Toshkent',
  salary: '5000000',
  region: 'Toshkent'
});

// Apply to job (worker only)
await jobsService.applyToJob(jobId, 'Cover letter...');
```

## 🧪 Test Accountlar

### Ishchi:
- 📞 Tel: `+998901234567`
- 🔐 Parol: `123456`

### Ish beruvchi:
- 📞 Tel: `+998912345678`
- 🔐 Parol: `123456`

## 📝 Development Guidelines

### Code Style:
- ✅ TypeScript strict mode
- ✅ ESLint rules
- ✅ Prettier formatting
- ✅ Clean Code principles

### Component Structure:
```typescript
// 1. Imports
import { Component } from 'library';

// 2. Types/Interfaces
interface Props {
  name: string;
}

// 3. Component
export function MyComponent({ name }: Props) {
  // 4. State
  const [state, setState] = useState();
  
  // 5. Effects
  useEffect(() => {}, []);
  
  // 6. Handlers
  const handleClick = () => {};
  
  // 7. Render
  return <div>...</div>;
}
```

### Service Structure:
```typescript
export class MyService {
  /**
   * Method description
   * @param param - Parameter description
   * @returns Return description
   */
  async myMethod(param: string): Promise<Result> {
    try {
      // Validation
      // Sanitization
      // API call
      // Return result
    } catch (error) {
      // Error handling
    }
  }
}
```

## 🐛 Debugging

### Browser Console:
```javascript
// Check auth status
console.log(localStorage.getItem('access_token'));

// Check user data
console.log(JSON.parse(sessionStorage.getItem('currentUser')));
```

## 📊 Performance

- ⚡ Vite - Lightning fast builds
- 🎯 Code splitting
- 📦 Tree shaking
- 🗜️ Minification
- 🖼️ Image optimization

## 🤝 Contributing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/amazing`)
3. Commit qiling (`git commit -m 'Add amazing feature'`)
4. Push qiling (`git push origin feature/amazing`)
5. Pull Request oching

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Created with ❤️ by Works.uz Team

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** 2024 -->
