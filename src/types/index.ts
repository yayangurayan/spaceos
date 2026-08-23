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
export type SpaceRole = 'owner' | 'admin' | 'member' | 'partner'

export interface Space {
  id: string
  name: string
  type: SpaceType
  category?: SpaceCategory
  icon: string | null
  owner_id: string
  invite_code?: string
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

/* ============================
   Guru Les / Teacher Management
   ============================ */

export type StudentStatus = 'active' | 'paused' | 'graduated'

export interface ParentContact {
  name?: string
  phone?: string
  email?: string
  relationship?: string
}

export interface StudentScheduleItem {
  day: string // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
  start_time: string // '16:00'
  end_time: string // '17:30'
  duration?: number // in minutes
}

export interface Student {
  id: string
  space_id: string
  user_id?: string | null
  name: string
  grade?: string | null
  subjects: string[]
  parent_contact?: ParentContact
  schedule: StudentScheduleItem[]
  monthly_fee: number
  payment_method: string
  payment_due_date: number
  notes?: string | null
  status: StudentStatus
  start_date?: string | null
  end_date?: string | null
  created_at: string
  updated_at?: string
}

export interface StudentFormData {
  name: string
  grade: string
  subjects: string[]
  parent_name: string
  parent_phone: string
  parent_email: string
  schedule: StudentScheduleItem[]
  monthly_fee: number | null
  payment_method: string
  payment_due_date: number
  notes: string
  status: StudentStatus
  start_date: string
}

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled'
export type LessonPerformance = 'Excellent' | 'Good' | 'Needs Improvement'

export interface Lesson {
  id: string
  space_id: string
  student_id: string
  datetime: string
  duration_minutes: number
  topic?: string | null
  material_covered?: string | null
  activities?: string | null
  homework?: string | null
  performance?: LessonPerformance
  next_lesson_notes?: string | null
  attachments?: { name: string; url: string }[]
  status: LessonStatus
  created_at: string
  updated_at?: string
  student?: Student
}

export interface LessonFormData {
  student_id: string
  datetime: string
  duration_minutes: number
  topic: string
  material_covered: string
  activities: string
  homework: string
  performance: LessonPerformance
  next_lesson_notes: string
  status: LessonStatus
  attachments?: { name: string; url: string }[]
}

export interface LessonPlan {
  id: string
  space_id: string
  title: string
  subject: string
  grade?: string | null
  duration_minutes: number
  objectives?: string | null
  materials?: string | null
  activities?: string | null
  assessment?: string | null
  created_at: string
  updated_at?: string
}

export interface LessonPlanFormData {
  title: string
  subject: string
  grade: string
  duration_minutes: number
  objectives: string
  materials: string
  activities: string
  assessment: string
}

export type MaterialType = 'Worksheet' | 'Slides' | 'Video' | 'Quiz' | 'Notes'

export interface TeacherMaterial {
  id: string
  space_id: string
  title: string
  subject: string
  grade?: string | null
  type: MaterialType
  file_url: string
  description?: string | null
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at?: string
}

export interface MaterialFormData {
  title: string
  subject: string
  grade: string
  type: MaterialType
  file_url: string
  description: string
  tags: string[]
  is_favorite: boolean
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export interface TeacherPayment {
  id: string
  space_id: string
  student_id: string
  amount: number
  month: number
  year: number
  status: PaymentStatus
  paid_date?: string | null
  payment_method: string
  category: string
  notes?: string | null
  created_at: string
  updated_at?: string
  student?: Student
}

export interface PaymentFormData {
  student_id: string
  amount: number | null
  month: number
  year: number
  status: PaymentStatus
  paid_date: string
  payment_method: string
  category: string
  notes: string
}

export interface TeacherOverviewStats {
  totalStudents: number
  activeStudents: number
  monthlyIncomeCollected: number
  monthlyIncomePending: number
  lessonsThisWeek: number
  lessonsToday: number
}

/* ============================
   Couple Space: Gallery, Journal, Calendar, Love Notes
   ============================ */

export interface Album {
  id: string
  space_id: string
  name: string
  description?: string | null
  cover_photo_id?: string | null
  cover_url?: string | null
  tags?: string[]
  created_by?: string | null
  created_at: string
  updated_at?: string
  photo_count?: number
  date_range?: string
}

export interface AlbumFormData {
  name: string
  description: string
  cover_url?: string
  tags?: string[]
}

export interface Photo {
  id: string
  space_id: string
  album_id?: string | null
  image_url: string
  caption?: string | null
  taken_at?: string | null
  location?: string | null
  tagged_partner?: boolean
  created_by?: string | null
  created_at: string
  reactions?: { [emoji: string]: number }
  userReaction?: string | null
}

export interface PhotoFormData {
  album_id?: string
  image_url: string
  caption?: string
  taken_at?: string
  location?: string
  tagged_partner?: boolean
}

export interface PhotoReaction {
  id: string
  photo_id: string
  user_id: string
  reaction: string
  created_at?: string
}

export type JournalMood = 'Happy' | 'Neutral' | 'Sad' | 'Loving' | 'Excited' | 'Thoughtful'

export interface JournalComment {
  id: string
  entry_id: string
  author_id?: string | null
  author_name?: string
  author_avatar?: string
  content: string
  parent_id?: string | null
  created_at: string
  replies?: JournalComment[]
}

export interface JournalEntry {
  id: string
  space_id: string
  author_id?: string | null
  author_name?: string
  author_avatar?: string
  title?: string | null
  content: string
  mood: JournalMood
  tags?: string[]
  is_published: boolean
  published_at?: string | null
  created_at: string
  updated_at?: string
  comments?: JournalComment[]
  reactions?: { [emoji: string]: number }
  userReaction?: string | null
}

export interface JournalEntryFormData {
  title?: string
  content: string
  mood: JournalMood
  tags?: string[]
  is_published: boolean
}

export type CoupleEventCategory = 'Date Night' | 'Travel' | 'Anniversary' | 'Reminder' | 'Personal' | 'Together'

export interface EventAttendee {
  event_id: string
  user_id: string
  status: 'going' | 'maybe' | 'not_going'
}

export interface CoupleCalendarEvent {
  id: string
  space_id: string
  title: string
  description?: string | null
  start_time: string
  end_time?: string | null
  all_day?: boolean
  location?: string | null
  category: CoupleEventCategory
  color?: string
  reminder_minutes?: number[]
  repeat_rule?: string
  created_by?: string | null
  created_at: string
  updated_at?: string
  attendees?: EventAttendee[]
}

export interface CoupleEventFormData {
  title: string
  description?: string
  start_time: string
  end_time?: string
  all_day?: boolean
  location?: string
  category: CoupleEventCategory
  color?: string
  reminder_minutes?: number[]
  repeat_rule?: string
}

export type LoveNoteColor = 'yellow' | 'pink' | 'cyan' | 'purple' | 'peach' | 'mint'

export interface LoveNote {
  id: string
  space_id: string
  from_user?: string | null
  from_name?: string
  to_user?: string | null
  message: string
  color: LoveNoteColor
  is_read: boolean
  is_pinned: boolean
  created_at: string
}

export interface LoveNoteFormData {
  message: string
  color: LoveNoteColor
  is_pinned?: boolean
}





