-- ================================================
-- 🗄️ COMPLETE DATABASE SCHEMA FOR JOB PLATFORM
-- ================================================
-- Created: 2025-12-30
-- Features: Users, Jobs, Applications, Tokens, Messages (Real-time Chat)
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. USERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  region TEXT,
  user_type TEXT CHECK (user_type IN ('worker', 'employer')) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);

-- ================================================
-- 2. JOBS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  salary NUMERIC(12, 2),
  location TEXT,
  region TEXT,
  category TEXT,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior')),
  status TEXT CHECK (status IN ('active', 'closed', 'draft')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_status ON jobs(status);

-- ================================================
-- 3. APPLICATIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  cover_letter TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, worker_id) -- One application per job per worker
);

-- Indexes
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ================================================
-- 4. REFRESH TOKENS TABLE (Multi-device support)
-- ================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_device ON refresh_tokens(device_id);

-- ================================================
-- 5. MESSAGES TABLE (Real-time Chat)
-- ================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL, -- Unique ID for each conversation
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast message retrieval
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(receiver_id, read) WHERE read = false;

-- ================================================
-- 6. CONVERSATIONS TABLE (Chat metadata)
-- ================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  participant2_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id),
  CHECK (participant1_id < participant2_id) -- Ensure consistent ordering
);

-- Indexes
CREATE INDEX idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES: USERS
-- ================================================

-- Users can read their own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Public can read basic user info (for displaying job posters, etc.)
CREATE POLICY "users_select_public" ON users
  FOR SELECT
  USING (true);

-- ================================================
-- RLS POLICIES: JOBS
-- ================================================

-- Anyone can view active jobs
CREATE POLICY "jobs_select_active" ON jobs
  FOR SELECT
  USING (status = 'active' OR employer_id = auth.uid());

-- Employers can insert their own jobs
CREATE POLICY "jobs_insert_employer" ON jobs
  FOR INSERT
  WITH CHECK (
    employer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'employer')
  );

-- Employers can update their own jobs
CREATE POLICY "jobs_update_employer" ON jobs
  FOR UPDATE
  USING (employer_id = auth.uid());

-- Employers can delete their own jobs
CREATE POLICY "jobs_delete_employer" ON jobs
  FOR DELETE
  USING (employer_id = auth.uid());

-- ================================================
-- RLS POLICIES: APPLICATIONS
-- ================================================

-- Workers can view their own applications
CREATE POLICY "applications_select_worker" ON applications
  FOR SELECT
  USING (worker_id = auth.uid());

-- Employers can view applications to their jobs
CREATE POLICY "applications_select_employer" ON applications
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND employer_id = auth.uid())
  );

-- Workers can create applications
CREATE POLICY "applications_insert_worker" ON applications
  FOR INSERT
  WITH CHECK (
    worker_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'worker')
  );

-- Workers can update their own applications (withdraw)
CREATE POLICY "applications_update_worker" ON applications
  FOR UPDATE
  USING (worker_id = auth.uid());

-- Employers can update applications to their jobs (accept/reject)
CREATE POLICY "applications_update_employer" ON applications
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND employer_id = auth.uid())
  );

-- ================================================
-- RLS POLICIES: REFRESH TOKENS
-- ================================================

-- Users can only see their own tokens
CREATE POLICY "refresh_tokens_select_own" ON refresh_tokens
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can delete their own tokens (logout)
CREATE POLICY "refresh_tokens_delete_own" ON refresh_tokens
  FOR DELETE
  USING (user_id = auth.uid());

-- ================================================
-- RLS POLICIES: MESSAGES (Real-time Chat)
-- ================================================

-- Users can read messages where they are sender or receiver
CREATE POLICY "messages_select_participant" ON messages
  FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can send messages
CREATE POLICY "messages_insert_sender" ON messages
  FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Users can update their own sent messages (mark as edited, etc.)
CREATE POLICY "messages_update_sender" ON messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Users can mark received messages as read
CREATE POLICY "messages_update_receiver" ON messages
  FOR UPDATE
  USING (receiver_id = auth.uid());

-- Users can delete their own sent messages
CREATE POLICY "messages_delete_sender" ON messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- ================================================
-- RLS POLICIES: CONVERSATIONS
-- ================================================

-- Users can view conversations they're part of
CREATE POLICY "conversations_select_participant" ON conversations
  FOR SELECT
  USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Users can create conversations
CREATE POLICY "conversations_insert_participant" ON conversations
  FOR INSERT
  WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- System can update conversations (last message timestamp)
CREATE POLICY "conversations_update_participant" ON conversations
  FOR UPDATE
  USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- ================================================
-- 8. FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Get or create conversation ID
  SELECT id INTO conv_id
  FROM conversations
  WHERE (participant1_id = LEAST(NEW.sender_id, NEW.receiver_id) 
     AND participant2_id = GREATEST(NEW.sender_id, NEW.receiver_id));
  
  IF conv_id IS NULL THEN
    -- Create new conversation
    INSERT INTO conversations (id, participant1_id, participant2_id, last_message, last_message_at)
    VALUES (NEW.conversation_id, LEAST(NEW.sender_id, NEW.receiver_id), GREATEST(NEW.sender_id, NEW.receiver_id), NEW.message, NEW.created_at);
  ELSE
    -- Update existing conversation
    UPDATE conversations
    SET last_message = NEW.message,
        last_message_at = NEW.created_at
    WHERE id = conv_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ================================================
-- 9. REALTIME PUBLICATION (for Supabase Realtime)
-- ================================================

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ================================================
-- 10. INITIAL DATA (Optional)
-- ================================================

-- You can add sample data here if needed

-- ================================================
-- MIGRATION COMPLETE ✅
-- ================================================
