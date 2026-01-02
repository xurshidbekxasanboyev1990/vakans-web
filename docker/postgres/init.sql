-- Works.uz Database Schema
-- PostgreSQL 16

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_type AS ENUM ('worker', 'employer', 'admin');
CREATE TYPE job_status AS ENUM ('active', 'paused', 'closed', 'expired');
CREATE TYPE application_status AS ENUM ('pending', 'viewed', 'accepted', 'rejected');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file');

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type user_type NOT NULL DEFAULT 'worker',
    region VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    skills TEXT[], -- Array of skills
    is_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_region ON users(region);
CREATE INDEX idx_users_is_blocked ON users(is_blocked);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_uz VARCHAR(100),
    name_ru VARCHAR(100),
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, name_uz, icon, color, sort_order) VALUES
('Qurilish', 'Qurilish', 'hammer', '#f97316', 1),
('IT va Dasturlash', 'IT va Dasturlash', 'code', '#3b82f6', 2),
('Yetkazib berish', 'Yetkazib berish', 'truck', '#22c55e', 3),
('Oshxona', 'Oshxona', 'chef-hat', '#eab308', 4),
('Tozalash', 'Tozalash', 'sparkles', '#06b6d4', 5),
('Haydovchi', 'Haydovchi', 'car', '#8b5cf6', 6),
('Sotuvchi', 'Sotuvchi', 'shopping-bag', '#ec4899', 7),
('Ofis', 'Ofis', 'briefcase', '#6366f1', 8),
('Boshqa', 'Boshqa', 'more-horizontal', '#64748b', 99);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_type VARCHAR(20) DEFAULT 'monthly', -- monthly, daily, hourly, fixed
    region VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_name VARCHAR(100),
    status job_status DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for jobs
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_category_id ON jobs(category_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_region ON jobs(region);
CREATE INDEX idx_jobs_is_featured ON jobs(is_featured);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_salary ON jobs(salary_min, salary_max);

-- Full text search index
CREATE INDEX idx_jobs_search ON jobs USING GIN(to_tsvector('simple', title || ' ' || description));

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status application_status DEFAULT 'pending',
    employer_notes TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, worker_id) -- One application per job per worker
);

-- Indexes for applications
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_worker_id ON applications(worker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- ============================================
-- MESSAGES TABLE (Chat)
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, worker_id, employer_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- RATINGS TABLE
-- ============================================
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id, job_id)
);

CREATE INDEX idx_ratings_to_user_id ON ratings(to_user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- application, message, job, system
    reference_id UUID, -- job_id, application_id, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- REFRESH TOKENS TABLE
-- ============================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (key, value) VALUES
('site_name', '"Works.uz"'),
('site_description', '"O''zbekiston bo''ylab ish topish va ishchi topish platformasi"'),
('contact_email', '"info@works.uz"'),
('contact_phone', '"+998901234567"'),
('max_jobs_per_employer', '50'),
('job_expiry_days', '30'),
('featured_job_price', '50000'),
('sms_enabled', 'true'),
('maintenance_mode', 'false');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update applications count on jobs
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs SET applications_count = applications_count - 1 WHERE id = OLD.job_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_applications_count
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_job_applications_count();

-- ============================================
-- DEFAULT ADMIN USER
-- ============================================
-- Password: admin123 (bcrypt hash)
INSERT INTO users (phone, email, password_hash, first_name, last_name, user_type, region, is_verified)
VALUES (
    '+998901234567',
    'admin@works.uz',
    '$2b$10$rQZ8K.N8H8M8M8M8M8M8M.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'Admin',
    'Works',
    'admin',
    'Toshkent shahri',
    true
);

-- ============================================
-- VIEWS
-- ============================================

-- Job search view with employer info
CREATE VIEW jobs_with_employer AS
SELECT 
    j.*,
    u.first_name as employer_first_name,
    u.last_name as employer_last_name,
    u.phone as employer_phone,
    u.avatar_url as employer_avatar,
    c.name as category_name,
    c.icon as category_icon
FROM jobs j
JOIN users u ON j.employer_id = u.id
LEFT JOIN categories c ON j.category_id = c.id
WHERE j.status = 'active' AND u.is_blocked = FALSE;

-- User statistics view
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.user_type,
    CASE 
        WHEN u.user_type = 'employer' THEN (SELECT COUNT(*) FROM jobs WHERE employer_id = u.id)
        ELSE 0
    END as jobs_count,
    CASE 
        WHEN u.user_type = 'worker' THEN (SELECT COUNT(*) FROM applications WHERE worker_id = u.id)
        ELSE 0
    END as applications_count,
    (SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE to_user_id = u.id) as avg_rating,
    (SELECT COUNT(*) FROM ratings WHERE to_user_id = u.id) as ratings_count
FROM users u;

-- ============================================
-- TRANSLATIONS TABLE (i18n)
-- ============================================
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language VARCHAR(10) NOT NULL, -- 'uz', 'uzk', 'ru', 'en'
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(language, key)
);

-- Index for fast lookups
CREATE INDEX idx_translations_language ON translations(language);
CREATE INDEX idx_translations_key ON translations(key);

-- Insert default translations for Uzbek
INSERT INTO translations (language, key, value) VALUES
('uz', 'appName', 'Works.uz'),
('uz', 'welcome', 'Xush kelibsiz'),
('uz', 'loading', 'Yuklanmoqda...'),
('uz', 'login', 'Kirish'),
('uz', 'register', 'Ro''yxatdan o''tish'),
('uz', 'logout', 'Chiqish'),
('uz', 'phone', 'Telefon'),
('uz', 'password', 'Parol'),
('uz', 'worker', 'Ishchi'),
('uz', 'employer', 'Ish beruvchi'),
('uz', 'phoneRequired', 'Telefon raqam kiritilishi shart'),
('uz', 'passwordRequired', 'Parol kiritilishi shart'),
('uz', 'noAccount', 'Hisobingiz yo''qmi?'),
('uz', 'haveAccount', 'Hisobingiz bormi?');

-- Insert default translations for Russian
INSERT INTO translations (language, key, value) VALUES
('ru', 'appName', 'Works.uz'),
('ru', 'welcome', 'Добро пожаловать'),
('ru', 'loading', 'Загрузка...'),
('ru', 'login', 'Войти'),
('ru', 'register', 'Регистрация'),
('ru', 'logout', 'Выйти'),
('ru', 'phone', 'Телефон'),
('ru', 'password', 'Пароль'),
('ru', 'worker', 'Работник'),
('ru', 'employer', 'Работодатель'),
('ru', 'phoneRequired', 'Введите номер телефона'),
('ru', 'passwordRequired', 'Введите пароль'),
('ru', 'noAccount', 'Нет аккаунта?'),
('ru', 'haveAccount', 'Уже есть аккаунт?');

-- Insert default translations for English
INSERT INTO translations (language, key, value) VALUES
('en', 'appName', 'Works.uz'),
('en', 'welcome', 'Welcome'),
('en', 'loading', 'Loading...'),
('en', 'login', 'Login'),
('en', 'register', 'Register'),
('en', 'logout', 'Logout'),
('en', 'phone', 'Phone'),
('en', 'password', 'Password'),
('en', 'worker', 'Worker'),
('en', 'employer', 'Employer'),
('en', 'phoneRequired', 'Phone number is required'),
('en', 'passwordRequired', 'Password is required'),
('en', 'noAccount', 'Don''t have an account?'),
('en', 'haveAccount', 'Already have an account?');

COMMENT ON DATABASE works_db IS 'Works.uz - Job platform database';
