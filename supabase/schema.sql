-- ============================================================
-- SpaceOS - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================
-- 1. Profiles Table
-- Auto-populated via trigger when a user signs up
-- ============================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- 2. Spaces Table
-- ============================
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personal', 'couple')),
  icon TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- 3. Space Members Table
-- ============================
CREATE TABLE IF NOT EXISTS space_members (
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (space_id, user_id)
);

-- ============================
-- 4. User Sessions Table
-- Tracks which space a user last accessed
-- ============================
CREATE TABLE IF NOT EXISTS user_sessions (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- 5. Indexes
-- ============================
CREATE INDEX IF NOT EXISTS idx_spaces_owner ON spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_space_members_user ON space_members(user_id);
CREATE INDEX IF NOT EXISTS idx_space_members_space ON space_members(space_id);

-- ============================================================
-- Auto-create profile on user signup (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- ============================
-- Profiles Policies
-- ============================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================
-- Spaces Policies
-- ============================

-- Users can view spaces they are a member of
CREATE POLICY "Users can view their spaces"
  ON spaces FOR SELECT
  USING (
    id IN (
      SELECT space_id FROM space_members WHERE user_id = auth.uid()
    )
  );

-- Users can create spaces (they become the owner)
CREATE POLICY "Users can create spaces"
  ON spaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only owners can update their spaces
CREATE POLICY "Owners can update their spaces"
  ON spaces FOR UPDATE
  USING (auth.uid() = owner_id);

-- Only owners can delete their spaces
CREATE POLICY "Owners can delete their spaces"
  ON spaces FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================
-- Space Members Policies
-- ============================

-- Users can view members of spaces they belong to
CREATE POLICY "Users can view space members"
  ON space_members FOR SELECT
  USING (
    space_id IN (
      SELECT space_id FROM space_members WHERE user_id = auth.uid()
    )
  );

-- Space owners/admins can add members
CREATE POLICY "Owners can add members"
  ON space_members FOR INSERT
  WITH CHECK (
    space_id IN (
      SELECT space_id FROM space_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR user_id = auth.uid() -- Allow self-insert (for space creation flow)
  );

-- Space owners can remove members
CREATE POLICY "Owners can remove members"
  ON space_members FOR DELETE
  USING (
    space_id IN (
      SELECT space_id FROM space_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================
-- User Sessions Policies
-- ============================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);
