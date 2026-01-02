# 📱 VAKANS.UZ - API HUJJATLARI

Bu hujjat mobil ilova (Android/iOS), desktop ilova yoki boshqa clientlar uchun API endpointlarini tavsiflaydi.

---

## 🔗 Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:5000/api
Backend Port: 54321
```

**Full API URL:** `http://localhost:54321/make-server-5b47a45d`

---

## 🔐 Authentication

Barcha himoyalangan endpointlar uchun header:
```
Authorization: Bearer <access_token>
```

---

## 📋 API ENDPOINTS

### 1. Health Check
```http
GET /make-server-5b47a45d/health
```
**Response:**
```json
{
  "success": true,
  "message": "Server OK",
  "time": "2026-01-01T12:00:00.000Z"
}
```

---

### 2. SMS OTP

#### 2.1 Send OTP
```http
POST /make-server-5b47a45d/otp/send
Content-Type: application/json

{
  "phone": "+998901234567"
}
```
**Response:**
```json
{
  "success": true,
  "message": "SMS kod yuborildi",
  "data": {
    "otpId": "id_xxx",
    "demoCode": "123456"  // Faqat demo uchun
  }
}
```

#### 2.2 Verify OTP
```http
POST /make-server-5b47a45d/otp/verify
Content-Type: application/json

{
  "phone": "+998901234567",
  "code": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Telefon tasdiqlandi"
}
```

---

### 3. Authentication

#### 3.1 Register
```http
POST /make-server-5b47a45d/auth/register
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "mypassword123",
  "firstName": "Ism",
  "lastName": "Familiya",
  "region": "Toshkent shahri",
  "userType": "worker"  // "worker" | "employer"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Ro'yxatdan o'tdingiz",
  "data": {
    "user": {
      "id": "user_xxx",
      "phone": "+998901234567",
      "firstName": "Ism",
      "lastName": "Familiya",
      "region": "Toshkent shahri",
      "userType": "worker"
    },
    "accessToken": "token_xxx",
    "refreshToken": "refresh_xxx"
  }
}
```

#### 3.2 Login
```http
POST /make-server-5b47a45d/auth/login
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "mypassword123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_xxx",
      "phone": "+998901234567",
      "firstName": "Ism",
      "lastName": "Familiya",
      "userType": "worker"
    },
    "accessToken": "token_xxx",
    "refreshToken": "refresh_xxx"
  }
}
```

#### 3.3 Refresh Token
```http
POST /make-server-5b47a45d/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_xxx"
}
```
**Response:**
```json
{
  "success": true,
  "accessToken": "new_token_xxx",
  "refreshToken": "new_refresh_xxx"
}
```

#### 3.4 Logout
```http
POST /make-server-5b47a45d/auth/logout
Authorization: Bearer <access_token>
```
**Response:**
```json
{
  "success": true,
  "message": "Chiqildi"
}
```

---

### 4. Jobs (Ishlar)

#### 4.1 Get All Jobs
```http
GET /make-server-5b47a45d/jobs
```
**Query Parameters:**
- `region` - Viloyat bo'yicha filter
- `category` - Kategoriya bo'yicha filter
- `salary_min` - Minimum maosh
- `salary_max` - Maksimum maosh
- `page` - Sahifa raqami
- `limit` - Har sahifadagi sonlar

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_xxx",
        "title": "Web Dasturchi",
        "company": "Tech Company",
        "location": "Toshkent",
        "salary": "5,000,000 - 8,000,000 so'm",
        "description": "...",
        "requirements": ["React", "Node.js"],
        "category": "IT",
        "employerId": "user_xxx",
        "createdAt": "2026-01-01T12:00:00.000Z",
        "status": "active"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 10
  }
}
```

#### 4.2 Get Single Job
```http
GET /make-server-5b47a45d/jobs/:id
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job_xxx",
    "title": "Web Dasturchi",
    "company": "Tech Company",
    "location": "Toshkent",
    "salary": "5,000,000 - 8,000,000 so'm",
    "description": "Full description...",
    "requirements": ["React", "Node.js"],
    "benefits": ["Lunch", "Remote"],
    "category": "IT",
    "employerId": "user_xxx",
    "createdAt": "2026-01-01T12:00:00.000Z"
  }
}
```

#### 4.3 Create Job (Employer only)
```http
POST /make-server-5b47a45d/jobs
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Web Dasturchi",
  "company": "Tech Company",
  "location": "Toshkent",
  "salary": "5,000,000 - 8,000,000 so'm",
  "description": "Batafsil ma'lumot...",
  "requirements": ["React", "Node.js"],
  "benefits": ["Lunch", "Remote"],
  "category": "IT",
  "contactPhone": "+998901234567",
  "contactEmail": "hr@company.uz"
}
```

#### 4.4 Update Job
```http
PUT /make-server-5b47a45d/jobs/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "salary": "New salary"
}
```

#### 4.5 Delete Job
```http
DELETE /make-server-5b47a45d/jobs/:id
Authorization: Bearer <access_token>
```

---

### 5. Applications (Arizalar)

#### 5.1 Apply for Job
```http
POST /make-server-5b47a45d/applications
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "jobId": "job_xxx",
  "coverLetter": "Salom, men bu ishga murojaat qilmoqchiman..."
}
```

#### 5.2 Get My Applications (Worker)
```http
GET /make-server-5b47a45d/applications/my
Authorization: Bearer <access_token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app_xxx",
      "jobId": "job_xxx",
      "jobTitle": "Web Dasturchi",
      "company": "Tech Company",
      "status": "pending",  // "pending" | "accepted" | "rejected"
      "appliedAt": "2026-01-01T12:00:00.000Z"
    }
  ]
}
```

#### 5.3 Get Job Applications (Employer)
```http
GET /make-server-5b47a45d/jobs/:jobId/applications
Authorization: Bearer <access_token>
```

#### 5.4 Update Application Status (Employer)
```http
PUT /make-server-5b47a45d/applications/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "accepted"  // "accepted" | "rejected"
}
```

---

### 6. User Profile

#### 6.1 Get Profile
```http
GET /make-server-5b47a45d/profile
Authorization: Bearer <access_token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_xxx",
    "phone": "+998901234567",
    "firstName": "Ism",
    "lastName": "Familiya",
    "region": "Toshkent shahri",
    "userType": "worker",
    "avatar": "https://...",
    "bio": "About me...",
    "skills": ["JavaScript", "React"],
    "experience": "2 yil"
  }
}
```

#### 6.2 Update Profile
```http
PUT /make-server-5b47a45d/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "Yangi Ism",
  "bio": "Updated bio",
  "skills": ["New skill"]
}
```

#### 6.3 Upload Avatar
```http
POST /make-server-5b47a45d/profile/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

avatar: <file>
```

---

### 7. Support (Yordam)

#### 7.1 Send Support Message
```http
POST /make-server-5b47a45d/support/message
Content-Type: application/json

{
  "name": "Foydalanuvchi ismi",
  "phone": "+998901234567",
  "email": "user@email.com",
  "subject": "Savol mavzusi",
  "message": "Xabar matni..."
}
```

#### 7.2 Password Recovery Request
```http
POST /make-server-5b47a45d/support/password-recovery
Content-Type: application/json

{
  "phone": "+998901234567",
  "email": "user@email.com"
}
```

---

### 8. Admin Endpoints

#### 8.1 Get All Users
```http
GET /make-server-5b47a45d/admin/users
Authorization: Bearer <admin_token>
```

#### 8.2 Get All Jobs (Admin)
```http
GET /make-server-5b47a45d/admin/jobs
Authorization: Bearer <admin_token>
```

#### 8.3 Delete User
```http
DELETE /make-server-5b47a45d/admin/users/:id
Authorization: Bearer <admin_token>
```

#### 8.4 Get Support Messages
```http
GET /make-server-5b47a45d/admin/support
Authorization: Bearer <admin_token>
```

---

## 📱 Mobile App Integration

### Android (Kotlin/Java)
```kotlin
// Retrofit interface
interface VakansApi {
    @POST("auth/login")
    suspend fun login(@Body credentials: LoginRequest): Response<AuthResponse>
    
    @GET("jobs")
    suspend fun getJobs(@Query("region") region: String?): Response<JobsResponse>
    
    @POST("jobs")
    suspend fun createJob(
        @Header("Authorization") token: String,
        @Body job: CreateJobRequest
    ): Response<JobResponse>
}
```

### iOS (Swift)
```swift
// URLSession example
func login(phone: String, password: String) async throws -> AuthResponse {
    var request = URLRequest(url: URL(string: "\(baseURL)/auth/login")!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(["phone": phone, "password": password])
    
    let (data, _) = try await URLSession.shared.data(for: request)
    return try JSONDecoder().decode(AuthResponse.self, from: data)
}
```

### React Native
```javascript
// API service
const API_URL = 'http://your-server.com/make-server-5b47a45d';

export const api = {
  login: async (phone, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    return response.json();
  },
  
  getJobs: async (token) => {
    const response = await fetch(`${API_URL}/jobs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

### Flutter (Dart)
```dart
// API service
class ApiService {
  final String baseUrl = 'http://your-server.com/make-server-5b47a45d';
  
  Future<Map<String, dynamic>> login(String phone, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'password': password}),
    );
    return jsonDecode(response.body);
  }
}
```

---

## 🔒 Error Responses

Barcha xatoliklar quyidagi formatda:
```json
{
  "success": false,
  "error": "Xatolik xabari"
}
```

### HTTP Status Codes:
- `200` - Muvaffaqiyatli
- `201` - Yaratildi
- `400` - Noto'g'ri so'rov
- `401` - Autentifikatsiya kerak
- `403` - Ruxsat yo'q
- `404` - Topilmadi
- `500` - Server xatosi

---

## 🚀 Demo Accounts

| Role | Phone | Password |
|------|-------|----------|
| Admin | +998996983806 | XOJISAID.13.13 |
| Worker | +998907654321 | worker123 |
| Employer | +998901234567 | employer123 |

---

## 📞 Support

Savollar uchun: support@vakans.uz
