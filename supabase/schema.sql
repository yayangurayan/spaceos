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
-- Helper Functions (Avoid RLS Infinite Recursion)
-- SECURITY DEFINER functions bypass RLS inside their query
-- ============================================================

-- Check if user is a member of a space
CREATE OR REPLACE FUNCTION public.is_space_member(_space_id UUID, _user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.space_members
    WHERE space_id = _space_id
      AND user_id = _user_id
  );
$$;

-- Check if user is an owner or admin of a space
CREATE OR REPLACE FUNCTION public.is_space_admin_or_owner(_space_id UUID, _user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.space_members
    WHERE space_id = _space_id
      AND user_id = _user_id
      AND role IN ('owner', 'admin')
  );
$$;

-- ============================================================
-- Auto-add Space Owner to space_members (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_space()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (space_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_space_created ON public.spaces;
CREATE TRIGGER on_space_created
  AFTER INSERT ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_space();

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

-- Drop old policies to allow clean re-run
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================
-- Spaces Policies
-- ============================

DROP POLICY IF EXISTS "Users can view their spaces" ON spaces;
DROP POLICY IF EXISTS "Users can create spaces" ON spaces;
DROP POLICY IF EXISTS "Owners can update their spaces" ON spaces;
DROP POLICY IF EXISTS "Owners can delete their spaces" ON spaces;

-- Users can view spaces they own or are member of
CREATE POLICY "Users can view their spaces"
  ON spaces FOR SELECT
  USING (
    owner_id = (SELECT auth.uid())
    OR public.is_space_member(id, (SELECT auth.uid()))
  );

-- Users can create spaces (they become the owner)
CREATE POLICY "Users can create spaces"
  ON spaces FOR INSERT
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- Only owners can update their spaces
CREATE POLICY "Owners can update their spaces"
  ON spaces FOR UPDATE
  USING (owner_id = (SELECT auth.uid()));

-- Only owners can delete their spaces
CREATE POLICY "Owners can delete their spaces"
  ON spaces FOR DELETE
  USING (owner_id = (SELECT auth.uid()));

-- ============================
-- Space Members Policies
-- ============================

DROP POLICY IF EXISTS "Users can view space members" ON space_members;
DROP POLICY IF EXISTS "Owners can add members" ON space_members;
DROP POLICY IF EXISTS "Owners can remove members" ON space_members;

-- Users can view members of spaces they belong to (NO RECURSION using SECURITY DEFINER)
CREATE POLICY "Users can view space members"
  ON space_members FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_space_member(space_id, (SELECT auth.uid()))
  );

-- Space owners/admins can add members, or creator self-insert
CREATE POLICY "Owners can add members"
  ON space_members FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR public.is_space_admin_or_owner(space_id, (SELECT auth.uid()))
  );

-- Space owners can remove members, or members can leave
CREATE POLICY "Owners can remove members"
  ON space_members FOR DELETE
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_space_admin_or_owner(space_id, (SELECT auth.uid()))
  );

-- ============================
-- User Sessions Policies
-- ============================

DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. Trades Table (Trading Journal)
-- ============================================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  pair VARCHAR(20) NOT NULL,
  position VARCHAR(4) NOT NULL CHECK (position IN ('BUY', 'SELL')),
  entry_price DECIMAL(10,5) NOT NULL,
  exit_price DECIMAL(10,5),
  stop_loss DECIMAL(10,5),
  take_profit DECIMAL(10,5),
  lot_size DECIMAL(5,2) NOT NULL,
  pnl DECIMAL(10,2),
  rr_ratio DECIMAL(4,2),
  pips DECIMAL(8,2),
  account_type VARCHAR(20) DEFAULT 'Real',
  setup TEXT,
  entry_reason TEXT,
  exit_reason TEXT,
  what_went_well TEXT,
  improvements TEXT,
  emotions TEXT[],
  pre_mood VARCHAR(20),
  post_mood VARCHAR(20),
  mistakes TEXT[],
  screenshot_urls TEXT[],
  status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Win', 'Loss', 'Breakeven', 'Open')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- Trades Indexes
-- ============================
CREATE INDEX IF NOT EXISTS idx_trades_space_id ON trades(space_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_space_date ON trades(space_id, date DESC);

-- ============================
-- Trades RLS Policies
-- ============================
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view trades in their spaces" ON trades;
DROP POLICY IF EXISTS "Users can insert trades in their spaces" ON trades;
DROP POLICY IF EXISTS "Users can update their own trades" ON trades;
DROP POLICY IF EXISTS "Users can delete their own trades" ON trades;

CREATE POLICY "Users can view trades in their spaces"
  ON trades FOR SELECT
  USING (
    public.is_space_member(space_id, (SELECT auth.uid()))
  );

CREATE POLICY "Users can insert trades in their spaces"
  ON trades FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND public.is_space_member(space_id, (SELECT auth.uid()))
  );

CREATE POLICY "Users can update their own trades"
  ON trades FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own trades"
  ON trades FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- 6. Storage Bucket for Trade Screenshots (Optional)
-- Run this in Supabase SQL editor or create via Storage dashboard
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trade-screenshots', 'trade-screenshots', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Authenticated users can upload trade screenshots"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'trade-screenshots');
--
-- CREATE POLICY "Public can view trade screenshots"
--   ON storage.objects FOR SELECT
--   TO public
--   USING (bucket_id = 'trade-screenshots');

