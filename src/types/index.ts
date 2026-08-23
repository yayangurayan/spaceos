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
