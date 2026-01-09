-- Vakans.uz Database Initialization
-- PostgreSQL 16
-- ⚠️ PRODUCTION VERSION - No demo accounts, only schema

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('worker', 'employer', 'admin')),
    avatar_url TEXT,
    bio TEXT,
    region VARCHAR(100),
    skills TEXT[],
    experience_years INTEGER DEFAULT 0,
    education TEXT,
    languages TEXT[],
    company_name VARCHAR(255),
    company_description TEXT,
    website VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_region ON users(region);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_uz VARCHAR(100),
    name_ru VARCHAR(100),
    name_en VARCHAR(100),
    icon VARCHAR(50),
    color VARCHAR(20),
    job_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO categories (name, name_uz, name_ru, name_en, icon, color) VALUES
('Qurilish', 'Qurilish', 'Строительство', 'Construction', 'HardHat', '#f59e0b'),
('IT va Dasturlash', 'IT va Dasturlash', 'IT и Программирование', 'IT & Programming', 'Code', '#3b82f6'),
('Savdo', 'Savdo', 'Торговля', 'Sales', 'ShoppingCart', '#10b981'),
('Transport', 'Transport', 'Транспорт', 'Transport', 'Truck', '#8b5cf6'),
('Oshxona', 'Oshxona', 'Кухня', 'Kitchen', 'ChefHat', '#ef4444'),
('Tozalash', 'Tozalash', 'Уборка', 'Cleaning', 'Sparkles', '#06b6d4'),
('Xavfsizlik', 'Xavfsizlik', 'Охрана', 'Security', 'Shield', '#64748b'),
('Tibbiyot', 'Tibbiyot', 'Медицина', 'Healthcare', 'Heart', '#ec4899'),
('Talim', 'Ta''lim', 'Образование', 'Education', 'GraduationCap', '#f97316'),
('Boshqa', 'Boshqa', 'Другое', 'Other', 'MoreHorizontal', '#a855f7')
ON CONFLICT DO NOTHING;

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    salary_min INTEGER,
    salary_max INTEGER,
    salary_type VARCHAR(20) DEFAULT 'monthly' CHECK (salary_type IN ('hourly', 'daily', 'monthly', 'fixed')),
    currency VARCHAR(10) DEFAULT 'UZS',
    location VARCHAR(255),
    region VARCHAR(100),
    address TEXT,
    work_type VARCHAR(50) DEFAULT 'full-time' CHECK (work_type IN ('full-time', 'part-time', 'remote', 'contract', 'temporary')),
    experience_required VARCHAR(50),
    education_required VARCHAR(100),
    languages_required TEXT[],
    benefits TEXT[],
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'closed', 'expired')),
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    deadline DATE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_category_id ON jobs(category_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_region ON jobs(region);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_salary ON jobs(salary_min, salary_max);
CREATE INDEX idx_jobs_title_trgm ON jobs USING gin(title gin_trgm_ops);
CREATE INDEX idx_jobs_description_trgm ON jobs USING gin(description gin_trgm_ops);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'withdrawn')),
    employer_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, worker_id)
);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_worker_id ON applications(worker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- ============================================
-- REFRESH TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- SUPPORT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_phone VARCHAR(20),
    user_type VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    message_type VARCHAR(30) DEFAULT 'general' CHECK (message_type IN ('general', 'password_recovery', 'complaint', 'suggestion')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    admin_reply TEXT,
    admin_id UUID REFERENCES users(id),
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX idx_support_messages_status ON support_messages(status);
CREATE INDEX idx_support_messages_type ON support_messages(message_type);

-- ============================================
-- OTP CODES TABLE (SMS Verification)
-- ============================================
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) DEFAULT 'registration' CHECK (purpose IN ('registration', 'login', 'password_reset')),
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX idx_otp_codes_expires ON otp_codes(expires_at);

-- ============================================
-- SAVED JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);

-- ============================================
-- JOB REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(10) NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, user_id)
);

CREATE INDEX idx_job_reactions_job_id ON job_reactions(job_id);
CREATE INDEX idx_job_reactions_user_id ON job_reactions(user_id);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_category_job_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories SET job_count = job_count + 1 WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories SET job_count = job_count - 1 WHERE id = OLD.category_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
        UPDATE categories SET job_count = job_count - 1 WHERE id = OLD.category_id;
        UPDATE categories SET job_count = job_count + 1 WHERE id = NEW.category_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_category_job_count
    AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_category_job_count();

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
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_job_applications_count
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_job_applications_count();

-- ============================================
-- PRODUCTION ADMIN SETUP
-- ============================================
-- ⚠️ MUHIM: Quyidagi buyruqni PRODUCTION serverda ishga tushiring:
-- 
-- 1. Avval yangi hash yarating:
--    node -e "require('bcryptjs').hash('YOUR_STRONG_PASSWORD', 12).then(console.log)"
--
-- 2. Keyin SQL da admin qo'shing:
--    INSERT INTO users (phone, email, password_hash, first_name, last_name, user_type, region, is_verified)
--    VALUES ('+998XXXXXXXXX', 'admin@vakans.uz', 'YOUR_HASH_HERE', 'Admin', 'Name', 'admin', 'Toshkent', true);
--
-- 3. Admin birinchi kirganidan keyin parolni o'zgartirishi SHART!
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Production database initialized successfully!';
    RAISE NOTICE '⚠️ Remember to create admin user manually with secure password!';
END $$;
