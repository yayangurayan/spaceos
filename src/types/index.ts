/**
 * Common TypeScript interfaces for SpaceOS
 */

/* ============================
   User & Auth
   ============================ */

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  created_at: string
}

/* ============================
   Spaces
   ============================ */

export type SpaceType = 'personal' | 'couple'
export type SpaceCategory = 'trader' | 'teacher' | 'general'
export type SpaceRole = 'owner' | 'admin' | 'member'

export interface Space {
  id: string
  name: string
  type: SpaceType
  category?: SpaceCategory
  icon: string | null
  owner_id: string
  created_at: string
}

export interface SpaceMember {
  space_id: string
  user_id: string
  role: SpaceRole
  joined_at: string
}

export interface SpaceWithMeta extends Space {
  role: SpaceRole
  last_accessed: string | null
  member_count?: number
}

export interface UserSession {
  user_id: string
  current_space_id: string | null
  last_accessed: string
}

/* ============================
   API & Pagination
   ============================ */

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

/* ============================
   UI
   ============================ */

export interface NavItem {
  label: string
  to: string
  icon: string
  badge?: string | number
  children?: NavItem[]
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

/* ============================
   Trading Journal
   ============================ */

export type TradePosition = 'BUY' | 'SELL'
export type TradeStatus = 'Win' | 'Loss' | 'Breakeven' | 'Open'
export type TradeAccountType = 'Real' | 'Funded' | 'Demo'

export type EmotionTag =
  | 'FOMO'
  | 'Confident'
  | 'Greedy'
  | 'Fearful'
  | 'Disciplined'
  | 'Revenge'
  | 'Patient'

export type MistakeTag =
  | 'Overleveraged'
  | 'No SL'
  | 'Moved SL'
  | 'Early Exit'
  | 'Late Entry'
  | 'Chasing Price'
  | 'Overtrading'

export interface Trade {
  id: string
  space_id: string
  user_id: string
  date: string
  pair: string
  position: TradePosition
  entry_price: number
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  lot_size: number
  pnl: number | null
  rr_ratio: number | null
  pips: number | null
  account_type: TradeAccountType
  setup: string | null
  entry_reason: string | null
  exit_reason: string | null
  what_went_well: string | null
  improvements: string | null
  emotions: EmotionTag[]
  pre_mood: string | null
  post_mood: string | null
  mistakes: MistakeTag[]
  screenshot_urls: string[]
  status: TradeStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TradeFormData {
  date: string
  pair: string
  position: TradePosition
  account_type: TradeAccountType
  entry_price: number | null
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  lot_size: number | null
  setup: string
  entry_reason: string
  exit_reason: string
  what_went_well: string
  improvements: string
  emotions: EmotionTag[]
  pre_mood: string
  post_mood: string
  mistakes: MistakeTag[]
  screenshot_urls: string[]
  notes: string
  // Calculated / overrides
  pnl?: number | null
  rr_ratio?: number | null
  pips?: number | null
  status?: TradeStatus
}

export interface TradeFilters {
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'custom'
  startDate?: string
  endDate?: string
  accountType: 'all' | TradeAccountType
  pair: string
  status: 'all' | TradeStatus
  search?: string
}

export interface TradeJournalStats {
  totalTrades: number
  winTrades: number
  lossTrades: number
  breakevenTrades: number
  openTrades: number
  winRate: number
  totalPnl: number
  bestTrade: number
  worstTrade: number
  avgRrRatio: number
  profitFactor: number
  totalPips: number
}

/* ============================
   Finance Tracker
   ============================ */

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  space_id: string
  user_id?: string
  type: TransactionType
  amount: number
  category: string
  description: string | null
  date: string
  wallet: string
  receipt_url: string | null
  created_at: string
  updated_at?: string
}

export interface TransactionFormData {
  type: TransactionType
  amount: number | null
  category: string
  description: string
  date: string
  wallet: string
  receipt_url?: string | null
}

export interface TransactionFilters {
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'last_30_days' | 'custom'
  startDate?: string
  endDate?: string
  category: string
  type: 'all' | TransactionType
  wallet: string
  search?: string
}

export interface Budget {
  id: string
  space_id: string
  category: string
  monthly_limit: number
  month: number
  year: number
  created_at?: string
  updated_at?: string
}

export interface BudgetCategoryProgress {
  category: string
  monthly_limit: number
  actual_spent: number
  percentage: number
  isOverBudget: boolean
  isNearLimit: boolean // > 80%
  remaining: number
}

export interface FinanceOverviewStats {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  netSavings: number
  savingsRate: number
  topExpenseCategory: string
  transactionCount: number
}

/* ============================
   Habit Tracker
   ============================ */

export type HabitFrequency = 'daily' | 'weekly' | 'custom'
export type HabitCategory = 'Health' | 'Learning' | 'Trading' | 'Teaching' | 'Spiritual' | 'Social' | 'General'

export interface Habit {
  id: string
  space_id: string
  user_id?: string
  name: string
  icon: string
  frequency: HabitFrequency
  frequency_days: string[] // e.g. ['monday', 'wednesday', 'friday']
  reminder_time: string | null
  target: string | null
  category: HabitCategory
  is_active: boolean
  sort_order?: number
  created_at: string
  updated_at?: string
}

export interface HabitLog {
  id: string
  habit_id: string
  date: string // YYYY-MM-DD
  completed: boolean
  notes: string | null
  created_at?: string
}

export interface HabitFormData {
  name: string
  icon: string
  frequency: HabitFrequency
  frequency_days: string[]
  reminder_time: string
  target: string
  category: HabitCategory
}

export interface HabitWithStats extends Habit {
  currentStreak: number
  bestStreak: number
  totalCompletions: number
  completionRate: number // 0 - 100
  isCompletedToday: boolean
  lastCompletedDate: string | null
  logs: Record<string, boolean> // dateString (YYYY-MM-DD) -> boolean
}

export interface HabitStreakOverview {
  totalActiveHabits: number
  completedTodayCount: number
  todayCompletionRate: number
  averageCompletionRate: number
  longestStreak: number
  heatmapData: { date: string; count: number; level: number }[]
}

/* ============================
   Book Library
   ============================ */

export type BookShelfStatus = 'reading' | 'completed' | 'want_to_read'
export type BookShelfTab = 'reading' | 'completed' | 'want_to_read' | 'favorites'

export interface Book {
  id: string
  space_id: string
  user_id?: string | null
  title: string
  author: string
  cover_url: string | null
  total_pages: number | null
  current_page: number
  status: BookShelfStatus
  start_date: string | null
  end_date: string | null
  rating: number | null
  genres: string[]
  review: string | null
  insights: string | null
  quotes: string | null
  recommended_by: string | null
  is_favorite: boolean
  created_at: string
  updated_at?: string
}

export interface ReadingLog {
  id: string
  book_id: string
  date: string // YYYY-MM-DD
  pages_read: number
  notes: string | null
  created_at?: string
}

export interface BookFormData {
  title: string
  author: string
  cover_url?: string | null
  total_pages: number | null
  current_page: number
  status: BookShelfStatus
  start_date: string
  end_date: string
  rating: number | null
  genres: string[]
  review: string
  insights: string
  quotes: string
  recommended_by: string
  is_favorite: boolean
}

export interface BookLibraryStats {
  totalRead: number
  currentlyReading: number
  booksThisYear: number
  readingStreak: number
  pagesReadThisMonth: number
  averageRating: number
}

export interface GenreStat {
  genre: string
  count: number
  percentage: number
}

export interface ReadingHeatmapDay {
  date: string
  pages: number
  count: number
  level: number // 0-4
}

/* ============================
   Event Tracker
   ============================ */

export type EventCategory =
  | 'Trading Event'
  | 'Seminar'
  | 'Workshop'
  | 'Competition'
  | 'Networking'
  | 'Personal'

export type EventStatus = 'planning' | 'registered' | 'attending' | 'completed'

export interface EventChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface EventAttachment {
  id: string
  event_id: string
  file_url: string
  file_name: string
  file_type: string
  created_at?: string
}

export interface EventReview {
  id: string
  event_id: string
  what_learned: string | null
  takeaways: string | null
  contacts_made: string | null
  rating: number | null
  would_attend_again: boolean
  created_at?: string
}

export interface EventItem {
  id: string
  space_id: string
  user_id?: string | null
  title: string
  start_datetime: string
  end_datetime: string | null
  location: string | null
  category: EventCategory
  description: string | null
  status: EventStatus
  cost: number | null
  notes: string | null
  reminder_days: number[] // e.g. [1, 3, 7]
  checklist: EventChecklistItem[]
  attachments?: EventAttachment[]
  review?: EventReview | null
  created_at: string
  updated_at?: string
}

export interface EventFormData {
  title: string
  start_datetime: string
  end_datetime: string
  location: string
  category: EventCategory
  status: EventStatus
  cost: number | null
  description: string
  reminder_days: number[]
  checklist: EventChecklistItem[]
  notes: string
}

export interface EventReviewFormData {
  what_learned: string
  takeaways: string
  contacts_made: string
  rating: number | null
  would_attend_again: boolean
}

export interface EventTrackerStats {
  upcomingCount: number
  thisMonthCount: number
  completedCount: number
  totalBudget: number
}



