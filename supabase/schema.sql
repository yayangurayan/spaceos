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
-- 6. Storage Bucket for Trade Screenshots & Receipts (Optional)
-- Run this in Supabase SQL editor or create via Storage dashboard
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trade-screenshots', 'trade-screenshots', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('finance-receipts', 'finance-receipts', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Authenticated users can upload media"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id IN ('trade-screenshots', 'finance-receipts'));
--
-- CREATE POLICY "Public can view media"
--   ON storage.objects FOR SELECT
--   TO public
--   USING (bucket_id IN ('trade-screenshots', 'finance-receipts'));

-- ============================================================
-- 7. Finance Tracker: Transactions & Budgets
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  wallet VARCHAR(50) DEFAULT 'Main Account',
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  monthly_limit DECIMAL(12,2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, category, month, year)
);

-- Indexes for Finance
CREATE INDEX IF NOT EXISTS idx_transactions_space_date ON transactions(space_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(space_id, category);
CREATE INDEX IF NOT EXISTS idx_budgets_space_month ON budgets(space_id, year, month);

-- RLS for Finance
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transactions in their spaces" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions in their spaces" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions in their spaces" ON transactions;
DROP POLICY IF EXISTS "Users can delete transactions in their spaces" ON transactions;

CREATE POLICY "Users can view transactions in their spaces"
  ON transactions FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert transactions in their spaces"
  ON transactions FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND public.is_space_member(space_id, (SELECT auth.uid()))
  );

CREATE POLICY "Users can update transactions in their spaces"
  ON transactions FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete transactions in their spaces"
  ON transactions FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can view budgets in their spaces" ON budgets;
DROP POLICY IF EXISTS "Users can insert budgets in their spaces" ON budgets;
DROP POLICY IF EXISTS "Users can update budgets in their spaces" ON budgets;
DROP POLICY IF EXISTS "Users can delete budgets in their spaces" ON budgets;

CREATE POLICY "Users can view budgets in their spaces"
  ON budgets FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert budgets in their spaces"
  ON budgets FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update budgets in their spaces"
  ON budgets FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete budgets in their spaces"
  ON budgets FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- ============================================================
-- 8. Habit Tracker: Habits & Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '✨',
  frequency VARCHAR(20) NOT NULL DEFAULT 'daily', -- 'daily', 'weekly', 'custom'
  frequency_days TEXT[] DEFAULT '{}', -- ['monday', 'wednesday', 'friday']
  reminder_time TIME,
  target TEXT,
  category VARCHAR(50) DEFAULT 'Health',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Indexes for Habits
CREATE INDEX IF NOT EXISTS idx_habits_space ON habits(space_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, date);

-- RLS for Habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view habits in their spaces" ON habits;
DROP POLICY IF EXISTS "Users can insert habits in their spaces" ON habits;
DROP POLICY IF EXISTS "Users can update habits in their spaces" ON habits;
DROP POLICY IF EXISTS "Users can delete habits in their spaces" ON habits;

CREATE POLICY "Users can view habits in their spaces"
  ON habits FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert habits in their spaces"
  ON habits FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND public.is_space_member(space_id, (SELECT auth.uid()))
  );

CREATE POLICY "Users can update habits in their spaces"
  ON habits FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete habits in their spaces"
  ON habits FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can view habit logs in their spaces" ON habit_logs;
DROP POLICY IF EXISTS "Users can insert habit logs in their spaces" ON habit_logs;
DROP POLICY IF EXISTS "Users can update habit logs in their spaces" ON habit_logs;
DROP POLICY IF EXISTS "Users can delete habit logs in their spaces" ON habit_logs;

CREATE POLICY "Users can view habit logs in their spaces"
  ON habit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.habits h
      WHERE h.id = habit_logs.habit_id
        AND public.is_space_member(h.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can insert habit logs in their spaces"
  ON habit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.habits h
      WHERE h.id = habit_logs.habit_id
        AND public.is_space_member(h.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can update habit logs in their spaces"
  ON habit_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.habits h
      WHERE h.id = habit_logs.habit_id
        AND public.is_space_member(h.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can delete habit logs in their spaces"
  ON habit_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.habits h
      WHERE h.id = habit_logs.habit_id
        AND public.is_space_member(h.space_id, (SELECT auth.uid()))
    )
  );

-- ============================================================
-- 9. Book Library: Books & Reading Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  cover_url TEXT,
  total_pages INTEGER,
  current_page INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'want_to_read' CHECK (status IN ('reading', 'completed', 'want_to_read')),
  start_date DATE,
  end_date DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  genres TEXT[] DEFAULT '{}',
  review TEXT,
  insights TEXT,
  quotes TEXT,
  recommended_by VARCHAR(255),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  pages_read INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Book Library
CREATE INDEX IF NOT EXISTS idx_books_space_id ON books(space_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(space_id, status);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(space_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_logs_book_id ON reading_logs(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_logs_date ON reading_logs(date DESC);

-- RLS for Book Library
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view books in their spaces" ON books;
DROP POLICY IF EXISTS "Users can insert books in their spaces" ON books;
DROP POLICY IF EXISTS "Users can update books in their spaces" ON books;
DROP POLICY IF EXISTS "Users can delete books in their spaces" ON books;

CREATE POLICY "Users can view books in their spaces"
  ON books FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert books in their spaces"
  ON books FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update books in their spaces"
  ON books FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete books in their spaces"
  ON books FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can view reading logs in their spaces" ON reading_logs;
DROP POLICY IF EXISTS "Users can insert reading logs in their spaces" ON reading_logs;
DROP POLICY IF EXISTS "Users can update reading logs in their spaces" ON reading_logs;
DROP POLICY IF EXISTS "Users can delete reading logs in their spaces" ON reading_logs;

CREATE POLICY "Users can view reading logs in their spaces"
  ON reading_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = reading_logs.book_id
        AND public.is_space_member(b.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can insert reading logs in their spaces"
  ON reading_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = reading_logs.book_id
        AND public.is_space_member(b.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can update reading logs in their spaces"
  ON reading_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = reading_logs.book_id
        AND public.is_space_member(b.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can delete reading logs in their spaces"
  ON reading_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = reading_logs.book_id
        AND public.is_space_member(b.space_id, (SELECT auth.uid()))
    )
  );

-- ============================================================
-- 10. Event Tracker: Events, Attachments & Reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'registered', 'attending', 'completed')),
  cost DECIMAL(10,2),
  notes TEXT,
  reminder_days INTEGER[] DEFAULT '{1}', -- [1, 3, 7]
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  what_learned TEXT,
  takeaways TEXT,
  contacts_made TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  would_attend_again BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Events
CREATE INDEX IF NOT EXISTS idx_events_space_id ON events(space_id);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(space_id, start_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(space_id, status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(space_id, category);
CREATE INDEX IF NOT EXISTS idx_event_attachments_event_id ON event_attachments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_event_id ON event_reviews(event_id);

-- RLS for Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view events in their spaces" ON events;
DROP POLICY IF EXISTS "Users can insert events in their spaces" ON events;
DROP POLICY IF EXISTS "Users can update events in their spaces" ON events;
DROP POLICY IF EXISTS "Users can delete events in their spaces" ON events;

CREATE POLICY "Users can view events in their spaces"
  ON events FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert events in their spaces"
  ON events FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update events in their spaces"
  ON events FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete events in their spaces"
  ON events FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can view event attachments in their spaces" ON event_attachments;
DROP POLICY IF EXISTS "Users can insert event attachments in their spaces" ON event_attachments;
DROP POLICY IF EXISTS "Users can update event attachments in their spaces" ON event_attachments;
DROP POLICY IF EXISTS "Users can delete event attachments in their spaces" ON event_attachments;

CREATE POLICY "Users can view event attachments in their spaces"
  ON event_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_attachments.event_id
        AND public.is_space_member(e.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can insert event attachments in their spaces"
  ON event_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_attachments.event_id
        AND public.is_space_member(e.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can update event attachments in their spaces"
  ON event_attachments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_attachments.event_id
        AND public.is_space_member(e.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can delete event attachments in their spaces"
  ON event_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_attachments.event_id
        AND public.is_space_member(e.space_id, (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can view event reviews in their spaces" ON event_reviews;
DROP POLICY IF EXISTS "Users can insert event reviews in their spaces" ON event_reviews;
DROP POLICY IF EXISTS "Users can update event reviews in their spaces" ON event_reviews;
DROP POLICY IF EXISTS "Users can delete event reviews in their spaces" ON event_reviews;

CREATE POLICY "Users can view event reviews in their spaces"
  ON event_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_reviews.event_id
        AND public.is_space_member(e.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can insert event reviews in their spaces"
  ON event_reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_reviews.event_id
        AND public.is_space_member(e.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can update event reviews in their spaces"
  ON event_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_reviews.event_id
        AND public.is_space_member(e.space_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can delete event reviews in their spaces"
  ON event_reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_reviews.event_id
        AND public.is_space_member(e.space_id, (SELECT auth.uid()))
    )
  );

-- ============================================================
-- 11. Guru Les (Teacher Space): Students, Lessons, Plans, Materials, Payments
-- ============================================================

-- 11.1 Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  grade VARCHAR(50),
  subjects TEXT[] DEFAULT '{}',
  parent_contact JSONB DEFAULT '{}'::jsonb, -- {phone, email, name}
  schedule JSONB DEFAULT '[]'::jsonb, -- [{day, start_time, end_time, duration}]
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'Transfer',
  payment_due_date INTEGER DEFAULT 5, -- day of month (1-31)
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'graduated')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11.2 Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  topic VARCHAR(255),
  material_covered TEXT,
  activities TEXT,
  homework TEXT,
  performance VARCHAR(30) DEFAULT 'Good' CHECK (performance IN ('Excellent', 'Good', 'Needs Improvement')),
  next_lesson_notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11.3 Lesson Plans Table
CREATE TABLE IF NOT EXISTS lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  grade VARCHAR(50),
  duration_minutes INTEGER DEFAULT 60,
  objectives TEXT,
  materials TEXT,
  activities TEXT,
  assessment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11.4 Materials Table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  grade VARCHAR(50),
  type VARCHAR(50) NOT NULL DEFAULT 'Worksheet' CHECK (type IN ('Worksheet', 'Slides', 'Video', 'Quiz', 'Notes')),
  file_url TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11.5 Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  paid_date DATE,
  payment_method VARCHAR(50) DEFAULT 'Transfer',
  category VARCHAR(50) DEFAULT 'Les Income', -- 'Les Income', 'Material Sales', 'Bonus/Extra Classes'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, month, year, category)
);

-- Indexes for Teacher Management
CREATE INDEX IF NOT EXISTS idx_students_space_id ON students(space_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(space_id, status);
CREATE INDEX IF NOT EXISTS idx_lessons_space_id ON lessons(space_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_datetime ON lessons(space_id, datetime DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_space_id ON lesson_plans(space_id);
CREATE INDEX IF NOT EXISTS idx_materials_space_id ON materials(space_id);
CREATE INDEX IF NOT EXISTS idx_payments_space_id ON payments(space_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_period ON payments(space_id, year, month);

-- RLS for Teacher Management
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Students Policies
DROP POLICY IF EXISTS "Users can view students in their spaces" ON students;
DROP POLICY IF EXISTS "Users can insert students in their spaces" ON students;
DROP POLICY IF EXISTS "Users can update students in their spaces" ON students;
DROP POLICY IF EXISTS "Users can delete students in their spaces" ON students;

CREATE POLICY "Users can view students in their spaces"
  ON students FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert students in their spaces"
  ON students FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update students in their spaces"
  ON students FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete students in their spaces"
  ON students FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- Lessons Policies
DROP POLICY IF EXISTS "Users can view lessons in their spaces" ON lessons;
DROP POLICY IF EXISTS "Users can insert lessons in their spaces" ON lessons;
DROP POLICY IF EXISTS "Users can update lessons in their spaces" ON lessons;
DROP POLICY IF EXISTS "Users can delete lessons in their spaces" ON lessons;

CREATE POLICY "Users can view lessons in their spaces"
  ON lessons FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert lessons in their spaces"
  ON lessons FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update lessons in their spaces"
  ON lessons FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete lessons in their spaces"
  ON lessons FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- Lesson Plans Policies
DROP POLICY IF EXISTS "Users can view lesson plans in their spaces" ON lesson_plans;
DROP POLICY IF EXISTS "Users can insert lesson plans in their spaces" ON lesson_plans;
DROP POLICY IF EXISTS "Users can update lesson plans in their spaces" ON lesson_plans;
DROP POLICY IF EXISTS "Users can delete lesson plans in their spaces" ON lesson_plans;

CREATE POLICY "Users can view lesson plans in their spaces"
  ON lesson_plans FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert lesson plans in their spaces"
  ON lesson_plans FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update lesson plans in their spaces"
  ON lesson_plans FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete lesson plans in their spaces"
  ON lesson_plans FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- Materials Policies
DROP POLICY IF EXISTS "Users can view materials in their spaces" ON materials;
DROP POLICY IF EXISTS "Users can insert materials in their spaces" ON materials;
DROP POLICY IF EXISTS "Users can update materials in their spaces" ON materials;
DROP POLICY IF EXISTS "Users can delete materials in their spaces" ON materials;

CREATE POLICY "Users can view materials in their spaces"
  ON materials FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert materials in their spaces"
  ON materials FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update materials in their spaces"
  ON materials FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete materials in their spaces"
  ON materials FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- Payments Policies
DROP POLICY IF EXISTS "Users can view payments in their spaces" ON payments;
DROP POLICY IF EXISTS "Users can insert payments in their spaces" ON payments;
DROP POLICY IF EXISTS "Users can update payments in their spaces" ON payments;
DROP POLICY IF EXISTS "Users can delete payments in their spaces" ON payments;

CREATE POLICY "Users can view payments in their spaces"
  ON payments FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert payments in their spaces"
  ON payments FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update payments in their spaces"
  ON payments FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete payments in their spaces"
  ON payments FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- ============================================================
-- 12. Couple Space: Albums, Photos, Journals, Calendar, Love Notes
-- ============================================================

-- 12.1 Albums Table
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_photo_id UUID,
  cover_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.2 Photos Table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  location VARCHAR(255),
  tagged_partner BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.3 Photo Reactions Table
CREATE TABLE IF NOT EXISTS photo_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction VARCHAR(10) NOT NULL DEFAULT '❤️',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(photo_id, user_id)
);

-- 12.4 Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  mood VARCHAR(50) DEFAULT 'Happy',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.5 Journal Comments Table
CREATE TABLE IF NOT EXISTS journal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES journal_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.6 Journal Reactions Table
CREATE TABLE IF NOT EXISTS journal_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL DEFAULT '❤️',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entry_id, user_id)
);

-- 12.7 Couple Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  location VARCHAR(255),
  category VARCHAR(50) NOT NULL DEFAULT 'Date Night',
  color VARCHAR(20) DEFAULT '#f43f5e',
  reminder_minutes INTEGER[] DEFAULT '{15}',
  repeat_rule VARCHAR(50) DEFAULT 'none',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.8 Event Attendees Table
CREATE TABLE IF NOT EXISTS event_attendees (
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- 12.9 Love Notes Table
CREATE TABLE IF NOT EXISTS love_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  from_user UUID REFERENCES profiles(id) ON DELETE SET NULL,
  to_user UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  color VARCHAR(20) DEFAULT 'yellow',
  is_read BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Couple Space
CREATE INDEX IF NOT EXISTS idx_albums_space_id ON albums(space_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_space_id ON photos(space_id);
CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(space_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_reactions_photo_id ON photo_reactions(photo_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_space_id ON journal_entries(space_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_published_at ON journal_entries(space_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_comments_entry_id ON journal_comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_space_id ON calendar_events(space_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(space_id, start_time ASC);
CREATE INDEX IF NOT EXISTS idx_love_notes_space_id ON love_notes(space_id);

-- Enable RLS for Couple Tables
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_notes ENABLE ROW LEVEL SECURITY;

-- Albums RLS Policies
DROP POLICY IF EXISTS "Users can view albums in their spaces" ON albums;
DROP POLICY IF EXISTS "Users can insert albums in their spaces" ON albums;
DROP POLICY IF EXISTS "Users can update albums in their spaces" ON albums;
DROP POLICY IF EXISTS "Users can delete albums in their spaces" ON albums;

CREATE POLICY "Users can view albums in their spaces"
  ON albums FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert albums in their spaces"
  ON albums FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update albums in their spaces"
  ON albums FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete albums in their spaces"
  ON albums FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- Photos RLS Policies
DROP POLICY IF EXISTS "Users can view photos in their spaces" ON photos;
DROP POLICY IF EXISTS "Users can insert photos in their spaces" ON photos;
DROP POLICY IF EXISTS "Users can update photos in their spaces" ON photos;
DROP POLICY IF EXISTS "Users can delete photos in their spaces" ON photos;

CREATE POLICY "Users can view photos in their spaces"
  ON photos FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert photos in their spaces"
  ON photos FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update photos in their spaces"
  ON photos FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete photos in their spaces"
  ON photos FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- Photo Reactions RLS
DROP POLICY IF EXISTS "Users can view photo reactions in their spaces" ON photo_reactions;
DROP POLICY IF EXISTS "Users can insert photo reactions in their spaces" ON photo_reactions;
DROP POLICY IF EXISTS "Users can delete photo reactions in their spaces" ON photo_reactions;

CREATE POLICY "Users can view photo reactions in their spaces"
  ON photo_reactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM photos p WHERE p.id = photo_reactions.photo_id AND public.is_space_member(p.space_id, (SELECT auth.uid()))));

CREATE POLICY "Users can insert photo reactions in their spaces"
  ON photo_reactions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM photos p WHERE p.id = photo_reactions.photo_id AND public.is_space_member(p.space_id, (SELECT auth.uid()))));

CREATE POLICY "Users can delete photo reactions in their spaces"
  ON photo_reactions FOR DELETE
  USING (EXISTS (SELECT 1 FROM photos p WHERE p.id = photo_reactions.photo_id AND public.is_space_member(p.space_id, (SELECT auth.uid()))));

-- Journal Entries RLS
DROP POLICY IF EXISTS "Users can view journal entries in their spaces" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert journal entries in their spaces" ON journal_entries;
DROP POLICY IF EXISTS "Users can update journal entries in their spaces" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete journal entries in their spaces" ON journal_entries;

CREATE POLICY "Users can view journal entries in their spaces"
  ON journal_entries FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert journal entries in their spaces"
  ON journal_entries FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update journal entries in their spaces"
  ON journal_entries FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete journal entries in their spaces"
  ON journal_entries FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- Journal Comments RLS
DROP POLICY IF EXISTS "Users can view journal comments in their spaces" ON journal_comments;
DROP POLICY IF EXISTS "Users can insert journal comments in their spaces" ON journal_comments;
DROP POLICY IF EXISTS "Users can delete journal comments in their spaces" ON journal_comments;

CREATE POLICY "Users can view journal comments in their spaces"
  ON journal_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM journal_entries j WHERE j.id = journal_comments.entry_id AND public.is_space_member(j.space_id, (SELECT auth.uid()))));

CREATE POLICY "Users can insert journal comments in their spaces"
  ON journal_comments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM journal_entries j WHERE j.id = journal_comments.entry_id AND public.is_space_member(j.space_id, (SELECT auth.uid()))));

CREATE POLICY "Users can delete journal comments in their spaces"
  ON journal_comments FOR DELETE
  USING (EXISTS (SELECT 1 FROM journal_entries j WHERE j.id = journal_comments.entry_id AND public.is_space_member(j.space_id, (SELECT auth.uid()))));

-- Journal Reactions RLS
DROP POLICY IF EXISTS "Users can view journal reactions in their spaces" ON journal_reactions;
DROP POLICY IF EXISTS "Users can insert journal reactions in their spaces" ON journal_reactions;
DROP POLICY IF EXISTS "Users can delete journal reactions in their spaces" ON journal_reactions;

CREATE POLICY "Users can view journal reactions in their spaces"
  ON journal_reactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM journal_entries j WHERE j.id = journal_reactions.entry_id AND public.is_space_member(j.space_id, (SELECT auth.uid()))));

CREATE POLICY "Users can insert journal reactions in their spaces"
  ON journal_reactions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM journal_entries j WHERE j.id = journal_reactions.entry_id AND public.is_space_member(j.space_id, (SELECT auth.uid()))));

CREATE POLICY "Users can delete journal reactions in their spaces"
  ON journal_reactions FOR DELETE
  USING (EXISTS (SELECT 1 FROM journal_entries j WHERE j.id = journal_reactions.entry_id AND public.is_space_member(j.space_id, (SELECT auth.uid()))));

-- Calendar Events RLS
DROP POLICY IF EXISTS "Users can view calendar events in their spaces" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert calendar events in their spaces" ON calendar_events;
DROP POLICY IF EXISTS "Users can update calendar events in their spaces" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete calendar events in their spaces" ON calendar_events;

CREATE POLICY "Users can view calendar events in their spaces"
  ON calendar_events FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert calendar events in their spaces"
  ON calendar_events FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update calendar events in their spaces"
  ON calendar_events FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete calendar events in their spaces"
  ON calendar_events FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

-- Event Attendees RLS
DROP POLICY IF EXISTS "Users can view event attendees in their spaces" ON event_attendees;
DROP POLICY IF EXISTS "Users can manage event attendees in their spaces" ON event_attendees;

CREATE POLICY "Users can view event attendees in their spaces"
  ON event_attendees FOR SELECT
  USING (EXISTS (SELECT 1 FROM calendar_events e WHERE e.id = event_attendees.event_id AND public.is_space_member(e.space_id, (SELECT auth.uid()))));

CREATE POLICY "Users can manage event attendees in their spaces"
  ON event_attendees FOR ALL
  USING (EXISTS (SELECT 1 FROM calendar_events e WHERE e.id = event_attendees.event_id AND public.is_space_member(e.space_id, (SELECT auth.uid()))));

-- Love Notes RLS
DROP POLICY IF EXISTS "Users can view love notes in their spaces" ON love_notes;
DROP POLICY IF EXISTS "Users can insert love notes in their spaces" ON love_notes;
DROP POLICY IF EXISTS "Users can update love notes in their spaces" ON love_notes;
DROP POLICY IF EXISTS "Users can delete love notes in their spaces" ON love_notes;

CREATE POLICY "Users can view love notes in their spaces"
  ON love_notes FOR SELECT
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can insert love notes in their spaces"
  ON love_notes FOR INSERT
  WITH CHECK (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can update love notes in their spaces"
  ON love_notes FOR UPDATE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));

CREATE POLICY "Users can delete love notes in their spaces"
  ON love_notes FOR DELETE
  USING (public.is_space_member(space_id, (SELECT auth.uid())));





