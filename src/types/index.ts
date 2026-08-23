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

