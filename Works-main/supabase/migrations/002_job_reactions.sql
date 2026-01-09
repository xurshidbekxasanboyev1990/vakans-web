-- ================================================
-- JOB REACTIONS AND EXTENDED JOB STATS
-- ================================================
-- Created: 2025-01-XX
-- Features: Job reactions, view tracking, saved jobs
-- ================================================

-- ================================================
-- 1. ADD STATS COLUMNS TO JOBS TABLE
-- ================================================
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deadline DATE;

-- ================================================
-- 2. JOB REACTIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS job_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_reactions_job ON job_reactions(job_id);
CREATE INDEX IF NOT EXISTS idx_job_reactions_user ON job_reactions(user_id);

-- ================================================
-- 3. JOB VIEWS TABLE (for unique view tracking)
-- ================================================
CREATE TABLE IF NOT EXISTS job_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_job_views_job ON job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_user ON job_views(user_id);
CREATE INDEX IF NOT EXISTS idx_job_views_ip ON job_views(ip_address, job_id);

-- ================================================
-- 4. SAVED JOBS TABLE (Favorites)
-- ================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);

-- ================================================
-- 5. NOTIFICATIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'application', 'message', 'job_status', 'system'
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ================================================
-- 6. ADMIN USERS EXTENSION
-- ================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;

-- ================================================
-- 7. CATEGORIES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  job_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
  ('IT va Dasturlash', 'Dasturlash, web development, IT xizmatlari', 'code'),
  ('Marketing', 'Marketing, reklama, SMM', 'megaphone'),
  ('Savdo', 'Sotuvchi, kassir, savdo vakili', 'shopping-cart'),
  ('Qurilish', 'Qurilish ishlari, ta''mirlash', 'hammer'),
  ('Transport', 'Haydovchi, yetkazib berish xizmati', 'truck'),
  ('Ta''lim', 'O''qituvchi, repetitor', 'book'),
  ('Sog''liqni saqlash', 'Tibbiyot, shifokor, hamshira', 'heart'),
  ('Xizmat ko''rsatish', 'Restoran, mehmonxona xizmatlari', 'utensils'),
  ('Boshqa', 'Boshqa ishlar', 'briefcase')
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- 8. UPDATE TRIGGERS FOR STATS
-- ================================================

-- Trigger to update applications_count on jobs
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jobs SET applications_count = GREATEST(0, applications_count - 1) WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_job_applications_count ON applications;
CREATE TRIGGER trigger_update_job_applications_count
AFTER INSERT OR DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION update_job_applications_count();

-- Trigger to update category job_count
CREATE OR REPLACE FUNCTION update_category_job_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.category_id IS NOT NULL THEN
    UPDATE categories SET job_count = job_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
    UPDATE categories SET job_count = GREATEST(0, job_count - 1) WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      IF OLD.category_id IS NOT NULL THEN
        UPDATE categories SET job_count = GREATEST(0, job_count - 1) WHERE id = OLD.category_id;
      END IF;
      IF NEW.category_id IS NOT NULL THEN
        UPDATE categories SET job_count = job_count + 1 WHERE id = NEW.category_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_category_job_count ON jobs;
CREATE TRIGGER trigger_update_category_job_count
AFTER INSERT OR DELETE OR UPDATE OF category_id ON jobs
FOR EACH ROW EXECUTE FUNCTION update_category_job_count();

-- Add category_id column to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);

-- ================================================
-- 9. ENABLE RLS ON NEW TABLES
-- ================================================
ALTER TABLE job_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
