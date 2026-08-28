import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Profile, SpaceWithMeta } from '@/types'

const DEFAULT_SPACES: SpaceWithMeta[] = [
  {
    id: 'space-trader',
    name: 'Personal — Trading & Habits',
    type: 'personal',
    category: 'trader',
    icon: '📈',
    owner_id: 'demo-user',
    role: 'owner',
    last_accessed: new Date().toISOString(),
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'space-teacher',
    name: 'Personal — Guru Les & Bimbel',
    type: 'personal',
    category: 'teacher',
    icon: '🎓',
    owner_id: 'demo-user',
    role: 'owner',
    last_accessed: new Date().toISOString(),
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'space-couple',
    name: 'Our Romantic Space 💕',
    type: 'couple',
    category: 'general',
    icon: '💑',
    owner_id: 'demo-user',
    role: 'owner',
    last_accessed: new Date().toISOString(),
    created_at: '2026-01-01T00:00:00.000Z',
  },
]

const DEFAULT_DEMO_USER: Profile = {
  id: 'demo-user-123',
  email: 'alex.morgan@spaceos.app',
  full_name: 'Alex Morgan',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  created_at: '2026-01-01T00:00:00.000Z',
}

export const useAuthStore = defineStore('auth', () => {
  /* ============================
     State
     ============================ */
  const user = ref<Profile | null>(null)
  const currentSpace = ref<SpaceWithMeta | null>(null)
  const spaces = ref<SpaceWithMeta[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const _initialized = ref(false)

  /* ============================
     Getters
     ============================ */
  const isAuthenticated = computed(() => !!user.value)
  const hasSelectedSpace = computed(() => !!currentSpace.value)
  const userName = computed(() => user.value?.full_name || user.value?.email || 'Alex Morgan')
  const isPersonalSpace = computed(() => currentSpace.value?.type === 'personal')
  const currentPersonalMode = computed<'trading' | 'teacher'>(() => {
    if (!currentSpace.value) return 'trading'
    if (currentSpace.value.category === 'teacher' || currentSpace.value.id === 'space-teacher' || currentSpace.value.name.toLowerCase().includes('guru') || currentSpace.value.name.toLowerCase().includes('les')) {
      return 'teacher'
    }
    return 'trading'
  })

  /* ============================
     Actions
     ============================ */

  /**
   * Initialize and restore state from local cache or Supabase
   */
  async function initialize() {
    isLoading.value = true
    try {
      // 1. Check active Supabase session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await fetchProfile(session.user.id)
        await fetchSpaces()
        await getCurrentSpace()
      } else {
        // 2. Demo / Offline fallback session
        const cachedUserStr = localStorage.getItem('spaceos_auth_user')
        if (cachedUserStr) {
          try {
            user.value = JSON.parse(cachedUserStr)
          } catch {
            user.value = { ...DEFAULT_DEMO_USER }
          }
        } else {
          user.value = { ...DEFAULT_DEMO_USER }
          localStorage.setItem('spaceos_auth_user', JSON.stringify(user.value))
        }

        // Load custom or default spaces
        const customSpacesStr = localStorage.getItem('spaceos_spaces')
        if (customSpacesStr) {
          try {
            spaces.value = JSON.parse(customSpacesStr)
          } catch {
            spaces.value = [...DEFAULT_SPACES]
          }
        } else {
          spaces.value = [...DEFAULT_SPACES]
          localStorage.setItem('spaceos_spaces', JSON.stringify(spaces.value))
        }

        // Restore active space from cache or default to space-trader
        const cachedSpaceId = localStorage.getItem('spaceos_current_space_id')
        const matched = spaces.value.find(s => s.id === cachedSpaceId)
        if (matched) {
          currentSpace.value = matched
        } else {
          currentSpace.value = spaces.value[0] || DEFAULT_SPACES[0]
          localStorage.setItem('spaceos_current_space_id', currentSpace.value.id)
        }
      }
    } catch (err) {
      console.warn('Auth initialization fallback note:', err)
      user.value = { ...DEFAULT_DEMO_USER }
      const cachedSpaces = localStorage.getItem('spaceos_spaces')
      spaces.value = cachedSpaces ? JSON.parse(cachedSpaces) : [...DEFAULT_SPACES]
      const cachedSpaceId = localStorage.getItem('spaceos_current_space_id')
      currentSpace.value = spaces.value.find(space => space.id === cachedSpaceId) || spaces.value[0] || null
    } finally {
      _initialized.value = true
      isLoading.value = false
    }
  }

  /**
   * Switch between Personal Trader and Personal Teacher mode
   */
  async function switchPersonalMode(mode: 'trading' | 'teacher') {
    const targetSpaceId = mode === 'teacher' ? 'space-teacher' : 'space-trader'
    
    // Check if target space exists in user's spaces
    let target = spaces.value.find(s => s.id === targetSpaceId || (mode === 'teacher' && (s.category === 'teacher' || s.name.toLowerCase().includes('guru'))))
    
    if (!target) {
      target = mode === 'teacher' ? DEFAULT_SPACES[1] : DEFAULT_SPACES[0]
      spaces.value.unshift(target)
      localStorage.setItem('spaceos_spaces', JSON.stringify(spaces.value))
    }

    await selectSpace(target.id)
  }

  /**
   * Select a space and persist to localStorage + user_sessions
   */
  async function selectSpace(spaceId: string) {
    isLoading.value = true
    error.value = null

    try {
      const now = new Date().toISOString()

      // Find selected space
      const selected = spaces.value.find(s => s.id === spaceId)
      if (selected) {
        currentSpace.value = { ...selected, last_accessed: now }
        localStorage.setItem('spaceos_current_space_id', spaceId)
      }

      // If online authenticated Supabase user, sync to user_sessions
      if (user.value && user.value.id !== 'demo-user-123') {
        try {
          await supabase
            .from('user_sessions')
            .upsert(
              {
                user_id: user.value.id,
                current_space_id: spaceId,
                last_accessed: now,
              },
              { onConflict: 'user_id' }
            )
        } catch (e) {
          console.warn('Supabase session sync note:', e)
        }
      }

      return { success: true }
    } catch (err: any) {
      error.value = err?.message || 'Failed to select space.'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch user profile from profiles table
   */
  async function fetchProfile(userId: string) {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError
      user.value = data as Profile
      localStorage.setItem('spaceos_auth_user', JSON.stringify(user.value))
    } catch {
      if (!user.value) {
        user.value = { ...DEFAULT_DEMO_USER, id: userId }
      }
    }
  }

  /**
   * Fetch spaces
   */
  async function fetchSpaces() {
    if (!user.value) return

    isLoading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('space_members')
        .select(`
          role,
          joined_at,
          spaces (
            id,
            name,
            type,
            icon,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', user.value.id)

      if (fetchError || !data || data.length === 0) {
        // Fallback to local spaces
        const customSpacesStr = localStorage.getItem('spaceos_spaces')
        spaces.value = customSpacesStr ? JSON.parse(customSpacesStr) : [...DEFAULT_SPACES]
      } else {
        const remoteSpaces = data.map((item: any) => ({
          ...item.spaces,
          role: item.role,
          last_accessed: new Date().toISOString(),
        }))
        const pendingSpaces = JSON.parse(localStorage.getItem('spaceos_pending_spaces') || '[]') as SpaceWithMeta[]
        spaces.value = [...remoteSpaces, ...pendingSpaces.filter(space => !remoteSpaces.some(remote => remote.id === space.id))]
        localStorage.setItem('spaceos_spaces', JSON.stringify(spaces.value))
      }
    } catch {
      const cachedSpaces = localStorage.getItem('spaceos_spaces')
      spaces.value = cachedSpaces ? JSON.parse(cachedSpaces) : [...DEFAULT_SPACES]
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get current space from session
   */
  async function getCurrentSpace() {
    const cached = localStorage.getItem('spaceos_current_space_id')
    if (cached) {
      const found = spaces.value.find(s => s.id === cached)
      if (found) {
        currentSpace.value = found
        return
      }
    }
    if (spaces.value.length > 0) {
      currentSpace.value = spaces.value[0]
      localStorage.setItem('spaceos_current_space_id', currentSpace.value.id)
    }
  }

  /**
   * Login
   */
  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        await fetchProfile(data.user.id)
        await fetchSpaces()
        await getCurrentSpace()
      }

      return { success: true }
    } catch (err: any) {
      // Allow demo login fallback if offline
      if (email && password) {
        user.value = {
          id: 'demo-user-123',
          email,
          full_name: email.split('@')[0],
          avatar_url: DEFAULT_DEMO_USER.avatar_url,
          created_at: new Date().toISOString(),
        }
        localStorage.setItem('spaceos_auth_user', JSON.stringify(user.value))
        spaces.value = [...DEFAULT_SPACES]
        currentSpace.value = DEFAULT_SPACES[0]
        localStorage.setItem('spaceos_current_space_id', currentSpace.value.id)
        return { success: true }
      }
      const message = err?.message || 'Login failed.'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register
   */
  async function register(email: string, password: string, fullName: string): Promise<{ success: boolean; needsConfirmation?: boolean; message?: string; error?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })

      if (authError) throw authError

      if (data.user && !data.session) {
        return {
          success: true,
          needsConfirmation: true,
          message: 'Silakan periksa email Anda untuk mengonfirmasi pendaftaran akun.',
        }
      }

      if (data.user) {
        await fetchProfile(data.user.id)
        await fetchSpaces()
      }

      return { success: true, needsConfirmation: false }
    } catch (err: any) {
      user.value = {
        id: 'demo-user-' + Date.now(),
        email,
        full_name: fullName,
        avatar_url: DEFAULT_DEMO_USER.avatar_url,
        created_at: new Date().toISOString(),
      }
      localStorage.setItem('spaceos_auth_user', JSON.stringify(user.value))
      spaces.value = [...DEFAULT_SPACES]
      currentSpace.value = DEFAULT_SPACES[0]
      return { success: true, needsConfirmation: false, message: 'Akun siap digunakan dalam mode demo offline.' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with OAuth
   */
  async function loginWithProvider(provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (authError) throw authError
      return { success: true }
    } catch (err: any) {
      user.value = { ...DEFAULT_DEMO_USER }
      spaces.value = [...DEFAULT_SPACES]
      currentSpace.value = DEFAULT_SPACES[0]
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout
   */
  async function logout() {
    isLoading.value = true
    try {
      await supabase.auth.signOut().catch(() => {})
      user.value = null
      currentSpace.value = null
      localStorage.removeItem('spaceos_auth_user')
      localStorage.removeItem('spaceos_current_space_id')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Join a space using an invite code (for Couple / Shared Spaces)
   */
  async function joinSpaceWithInviteCode(code: string): Promise<{ success: boolean; error?: string; space?: SpaceWithMeta }> {
    isLoading.value = true
    const normalized = code.trim().toUpperCase()

    try {
      // 1. Check local/demo spaces
      let targetSpace = spaces.value.find(s => (s as any).invite_code === normalized || s.id.toUpperCase() === normalized)

      if (!targetSpace) {
        // Check default couple space
        const defaultCouple = DEFAULT_SPACES.find(s => s.type === 'couple')
        if (normalized === 'COUPLE-8888' || normalized === 'COUPLE' || normalized.includes('COUPLE')) {
          targetSpace = defaultCouple
        }
      }

      // 2. Also try Supabase query if available
      if (!targetSpace && user.value?.id) {
        const { data } = await supabase
          .from('spaces')
          .select('*')
          .or(`invite_code.eq.${normalized},id.eq.${normalized}`)
          .single()
        if (data) targetSpace = { ...data, role: 'partner', last_accessed: new Date().toISOString() }
      }

      if (!targetSpace) {
        return { success: false, error: 'Kode undangan tidak ditemukan. Periksa kembali kode dari pasangan Anda.' }
      }

      // Add to user spaces list if not already present
      if (!spaces.value.some(s => s.id === targetSpace!.id)) {
        spaces.value.unshift({
          ...targetSpace,
          role: 'partner',
          last_accessed: new Date().toISOString(),
        })
        localStorage.setItem('spaceos_spaces', JSON.stringify(spaces.value))
      }

      await selectSpace(targetSpace.id)
      return { success: true, space: targetSpace }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Gagal bergabung ke space.' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Switch between partner accounts for simulation / testing
   */
  function switchPartnerAccount() {
    if (user.value?.email === 'sarah.parker@spaceos.app') {
      user.value = { ...DEFAULT_DEMO_USER }
    } else {
      user.value = {
        id: 'partner-user-456',
        email: 'sarah.parker@spaceos.app',
        full_name: 'Sarah Parker',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-01-01T00:00:00.000Z',
      }
    }
    localStorage.setItem('spaceos_auth_user', JSON.stringify(user.value))
    return user.value
  }

  /**
   * Delete a space and purge its local storage and remote records
   */
  async function deleteSpace(spaceId: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    try {
      if (spaces.value.length <= 1) {
        return { success: false, error: 'cannot_delete_last_space' }
      }

      const targetIndex = spaces.value.findIndex(s => s.id === spaceId)
      if (targetIndex === -1) {
        return { success: false, error: 'Space not found' }
      }

      // Purge remote data first so a failed request cannot leave local state misleadingly deleted.
      if (user.value && user.value.id !== 'demo-user-123') {
        const { error: deleteError } = await supabase.from('spaces').delete().eq('id', spaceId)
        if (deleteError) return { success: false, error: deleteError.message }
      }

      spaces.value.splice(targetIndex, 1)
      localStorage.setItem('spaceos_spaces', JSON.stringify(spaces.value))

      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        const isSpaceKey = key?.endsWith(`_${spaceId}`)
        const isLegacyCoupleKey = spaceId === 'space-couple' && !!key?.match(/^spaceos_couple_(albums|photos|journals|events|notes)$/)
        if (key && (isSpaceKey || isLegacyCoupleKey || (key === 'spaceos_current_space_id' && localStorage.getItem(key) === spaceId))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))

      // 4. If current space was deleted, select another remaining space
      if (currentSpace.value?.id === spaceId) {
        if (spaces.value.length > 0) {
          await selectSpace(spaces.value[0].id)
        } else {
          currentSpace.value = null
          localStorage.removeItem('spaceos_current_space_id')
        }
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete space' }
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    currentSpace,
    spaces,
    isLoading,
    error,
    _initialized,
    isAuthenticated,
    hasSelectedSpace,
    userName,
    isPersonalSpace,
    currentPersonalMode,
    initialize,
    switchPersonalMode,
    selectSpace,
    deleteSpace,
    fetchProfile,
    fetchSpaces,
    getCurrentSpace,
    login,
    register,
    loginWithProvider,
    logout,
    joinSpaceWithInviteCode,
    switchPartnerAccount,
    clearError,
  }
})
