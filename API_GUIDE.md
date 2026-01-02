<!-- # API Integration Guide

## Overview

Ushbu qo'llanma Works.uz platformasida API bilan qanday ishlashni ko'rsatadi. Clean Architecture pattern asosida yaratilgan service layerdan foydalanish.

## Service Layer Structure

```
src/lib/services/
├── auth.service.ts    # Authentication operations
├── jobs.service.ts    # Jobs CRUD operations
└── index.ts          # Exports
```

## Authentication Service

### Import

```typescript
import { authService } from '@/lib/services';
```

### Login

```typescript
// Phone va parol bilan kirish
const result = await authService.login({
  phone: '+998901234567',
  password: 'mypassword123'
});

if (result.success) {
  // Success
  const { user, accessToken, refreshToken } = result.data;
  console.log('Logged in as:', user.firstName);
} else {
  // Error
  console.error(result.error);
  toast.error(result.error);
}
```

### Register

```typescript
// Yangi foydalanuvchi ro'yxatdan o'tkazish
const result = await authService.register({
  firstName: 'Jamshid',
  lastName: 'Aliyev',
  phone: '+998901234567',
  region: 'Toshkent',
  password: 'securepassword',
  userType: 'worker' // yoki 'employer'
});

if (result.success) {
  // Ro'yxatdan o'tish muvaffaqiyatli
  const { user, accessToken } = result.data;
  // Auto-login qilinadi
} else {
  console.error(result.error);
}
```

### Logout

```typescript
// Tizimdan chiqish
await authService.logout();
// Tokenlar tozalanadi
```

### Get Current User

```typescript
// Joriy foydalanuvchini olish
const user = await authService.getCurrentUser();

if (user) {
  console.log(user.firstName, user.lastName);
} else {
  // Foydalanuvchi kirilmagan
}
```

### Check Authentication

```typescript
// Autentifikatsiya holatini tekshirish
const isLoggedIn = authService.isAuthenticated();

if (isLoggedIn) {
  // User logged in
} else {
  // User not logged in
}
```

## Jobs Service

### Import

```typescript
import { jobsService } from '@/lib/services';
```

### Get All Jobs

```typescript
// Barcha ishlarni olish
const result = await jobsService.getJobs();

if (result.success) {
  const jobs = result.data; // Job[]
  jobs.forEach(job => {
    console.log(job.title, job.salary);
  });
}
```

### Get Jobs with Filters

```typescript
// Filtrlangan ishlar
const result = await jobsService.getJobs({
  region: 'Toshkent',
  category: 'IT',
  search: 'developer'
});

if (result.success) {
  console.log(`Found ${result.data.length} jobs`);
}
```

### Get Single Job

```typescript
// Bitta ishni ID orqali olish
const result = await jobsService.getJobById('job-123');

if (result.success) {
  const job = result.data;
  console.log(job.title, job.description);
} else {
  console.error(result.error);
}
```

### Create Job (Employer Only)

```typescript
// Yangi ish e'lon qilish
const result = await jobsService.createJob({
  title: 'Frontend Developer',
  description: 'We are looking for an experienced React developer...',
  location: 'Toshkent, Yunusobod',
  salary: '5000000 - 8000000',
  region: 'Toshkent',
  category: 'IT',
  workType: 'full-time',
  experience: '2-3 yil'
});

if (result.success) {
  toast.success('Ish muvaffaqiyatli e\'lon qilindi!');
  const newJob = result.data;
  console.log('Created job ID:', newJob.id);
} else {
  toast.error(result.error);
}
```

### Update Job

```typescript
// Ishni yangilash
const result = await jobsService.updateJob({
  id: 'job-123',
  title: 'Senior Frontend Developer', // yangi nom
  salary: '8000000 - 12000000' // yangi maosh
});

if (result.success) {
  toast.success('Ish yangilandi!');
}
```

### Delete Job

```typescript
// Ishni o'chirish
const result = await jobsService.deleteJob('job-123');

if (result.success) {
  toast.success('Ish o\'chirildi');
} else {
  toast.error(result.error);
}
```

### Get My Jobs (Employer)

```typescript
// Mening e'lonlarim
const result = await jobsService.getMyJobs();

if (result.success) {
  const myJobs = result.data;
  console.log(`You have ${myJobs.length} active jobs`);
}
```

### Apply to Job (Worker)

```typescript
// Ishga ariza yuborish
const result = await jobsService.applyToJob(
  'job-123',
  'Hello, I am interested in this position...' // cover letter
);

if (result.success) {
  toast.success('Ariza yuborildi!');
} else {
  toast.error(result.error);
}
```

## Error Handling

Barcha service metodlari bir xil response formatida javob qaytaradi:

```typescript
interface Response {
  success: boolean;
  data?: any;
  error?: string;
}
```

### Example

```typescript
const result = await authService.login(credentials);

if (result.success) {
  // ✅ Success
  const data = result.data;
  // Process data
} else {
  // ❌ Error
  const errorMessage = result.error;
  toast.error(errorMessage);
}
```

## Validation

Barcha input ma'lumotlar validatsiya qilinadi:

```typescript
// ❌ Invalid phone
await authService.login({
  phone: '123', // Invalid format
  password: 'pass'
});
// Result: { success: false, error: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak' }

// ❌ Short password
await authService.register({
  // ...
  password: '12345' // Too short
});
// Result: { success: false, error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' }
```

## XSS Protection

Barcha input ma'lumotlar sanitize qilinadi:

```typescript
// User input (potential XSS)
const input = '<script>alert("XSS")</script>';

// Service layer avtomatik sanitize qiladi
await jobsService.createJob({
  title: input,
  description: 'Safe content'
});

// Saqlangan ma'lumot:
// title: '&lt;script&gt;alert("XSS")&lt;/script&gt;'
```

## Token Management

Service layer avtomatik token management qiladi:

```typescript
// Login qilish
await authService.login(credentials);
// ✅ Tokens avtomatik saqlanadi (sessionStorage)

// API requests
await jobsService.getJobs();
// ✅ Avtomatik Authorization header qo'shiladi

// Token expired bo'lsa
// ✅ Avtomatik refresh qilinadi

// Logout
await authService.logout();
// ✅ Tokens avtomatik o'chiriladi
```

## React Component Integration

### With useState

```typescript
import { useState, useEffect } from 'react';
import { jobsService } from '@/lib/services';

function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const result = await jobsService.getJobs();
      
      if (result.success) {
        setJobs(result.data);
      }
      
      setLoading(false);
    };

    fetchJobs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {jobs.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

### With Form Submission

```typescript
import { authService } from '@/lib/services';
import { toast } from 'sonner';

function LoginForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await authService.login({
      phone: e.target.phone.value,
      password: e.target.password.value
    });

    if (result.success) {
      toast.success('Login successful!');
      // Redirect to dashboard
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="phone" type="tel" />
      <input name="password" type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

## TypeScript Types

### Auth Types

```typescript
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from '@/lib/services';

const credentials: LoginRequest = {
  phone: '+998901234567',
  password: 'password'
};

const userData: RegisterRequest = {
  firstName: 'John',
  lastName: 'Doe',
  phone: '+998901234567',
  region: 'Toshkent',
  password: 'password',
  userType: 'worker'
};
```

### Jobs Types

```typescript
import type { 
  Job, 
  CreateJobRequest, 
  UpdateJobRequest 
} from '@/lib/services';

const jobData: CreateJobRequest = {
  title: 'Developer',
  description: '...',
  location: 'Toshkent',
  salary: '5000000',
  region: 'Toshkent'
};
```

## Best Practices

### 1. Always check result.success

```typescript
// ✅ Good
const result = await jobsService.getJobs();
if (result.success) {
  // Use data
}

// ❌ Bad
const result = await jobsService.getJobs();
const jobs = result.data; // Might be undefined
```

### 2. Handle errors properly

```typescript
// ✅ Good
const result = await authService.login(credentials);
if (!result.success) {
  toast.error(result.error);
  return;
}
// Continue with success case

// ❌ Bad
const result = await authService.login(credentials);
// No error handling
```

### 3. Use TypeScript types

```typescript
// ✅ Good
import type { Job } from '@/lib/services';

const [jobs, setJobs] = useState<Job[]>([]);

// ❌ Bad
const [jobs, setJobs] = useState([]); // any[]
```

### 4. Async/await with try-catch

```typescript
// ✅ Good
try {
  const result = await jobsService.createJob(data);
  if (result.success) {
    toast.success('Success!');
  } else {
    toast.error(result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
  toast.error('Something went wrong');
}
```

## Performance Tips

### 1. Cache data when appropriate

```typescript
const [jobs, setJobs] = useState<Job[]>([]);
const [lastFetch, setLastFetch] = useState(0);

const fetchJobs = async () => {
  const now = Date.now();
  
  // Only fetch if cache is older than 5 minutes
  if (now - lastFetch < 5 * 60 * 1000) {
    return;
  }

  const result = await jobsService.getJobs();
  if (result.success) {
    setJobs(result.data);
    setLastFetch(now);
  }
};
```

### 2. Debounce search queries

```typescript
import { useDebouncedCallback } from 'use-debounce';

const searchJobs = useDebouncedCallback(
  async (query: string) => {
    const result = await jobsService.getJobs({ search: query });
    if (result.success) {
      setJobs(result.data);
    }
  },
  500 // 500ms delay
);
```

## Summary

Service layer provides:
- ✅ Clean API
- ✅ Auto validation
- ✅ XSS protection
- ✅ Error handling
- ✅ Token management
- ✅ TypeScript support
- ✅ Consistent response format

Use service layer instead of direct API calls for better:
- Code organization
- Type safety
- Error handling
- Maintainability -->
