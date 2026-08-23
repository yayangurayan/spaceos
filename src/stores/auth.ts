import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Profile, SpaceWithMeta } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  /* ============================
     State
     ============================ */
  const user = ref<Profile | null>(null)
  const currentSpace = ref<SpaceWithMeta | null>(null)
  const spaces = ref<SpaceWithMeta[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let _initialized = false

  /* ============================
     Getters
     ============================ */
  const isAuthenticated = computed(() => !!user.value)
  const hasSelectedSpace = computed(() => !!currentSpace.value)
  const userName = computed(() => user.value?.full_name || user.value?.email || 'User')

  /* ============================
     Actions
     ============================ */

  /**
   * Login with email and password
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
      }

      return { success: true }
    } catch (err: any) {
      const message = err?.message || 'Login failed. Please try again.'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register with email, password, and full name
   */
  async function register(email: string, password: string, fullName: string) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) throw authError

      // If email confirmation is required, data.user will exist but session may not
      if (data.user && !data.session) {
        return {
          success: true,
          needsConfirmation: true,
          message: 'Please check your email to confirm your account.',
        }
      }

      if (data.user) {
        await fetchProfile(data.user.id)
      }

      return { success: true, needsConfirmation: false }
    } catch (err: any) {
      const message = err?.message || 'Registration failed. Please try again.'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with OAuth provider (Google, GitHub)
   */
  async function loginWithProvider(provider: 'google' | 'github') {
    isLoading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError
      return { success: true }
    } catch (err: any) {
      const message = err?.message || `${provider} login failed.`
      error.value = message
      return { success: false, error: message }
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
      await supabase.auth.signOut()
      user.value = null
      currentSpace.value = null
      spaces.value = []
      error.value = null
    } catch (err: any) {
      console.error('Logout error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch user profile from profiles table
   */
  async function fetchProfile(userId: string) {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Failed to fetch profile:', fetchError)
      return
    }

    user.value = data as Profile
  }

  /**
   * Fetch all spaces the user has access to
   */
  async function fetchSpaces() {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      // Fetch spaces through space_members join
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

      if (fetchError) throw fetchError

      // Get user_sessions for last_accessed times
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('current_space_id, last_accessed')
        .eq('user_id', user.value.id)
        .single()

      // Map to SpaceWithMeta
      spaces.value = (data || []).map((item: any) => ({
        ...item.spaces,
        role: item.role,
        last_accessed: sessions?.current_space_id === item.spaces.id
          ? (sessions?.last_accessed ?? null)
          : null,
      }))
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch spaces.'
      console.error('fetchSpaces error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Select a space and persist to user_sessions
   */
  async function selectSpace(spaceId: string) {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      const now = new Date().toISOString()

      // Upsert user_sessions
      const { error: upsertError } = await supabase
        .from('user_sessions')
        .upsert(
          {
            user_id: user.value.id,
            current_space_id: spaceId,
            last_accessed: now,
          },
          { onConflict: 'user_id' }
        )

      if (upsertError) throw upsertError

      // Set current space
      const selected = spaces.value.find(s => s.id === spaceId)
      if (selected) {
        currentSpace.value = { ...selected, last_accessed: now }
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
   * Get current space from user_sessions (on app load)
   */
  async function getCurrentSpace() {
    if (!user.value) return

    try {
      const { data, error: fetchError } = await supabase
        .from('user_sessions')
        .select('current_space_id, last_accessed')
        .eq('user_id', user.value.id)
        .single()

      if (fetchError || !data?.current_space_id) return

      // Ensure spaces are loaded
      if (spaces.value.length === 0) {
        await fetchSpaces()
      }

      const found = spaces.value.find(s => s.id === data.current_space_id)
      if (found) {
        currentSpace.value = { ...found, last_accessed: data.last_accessed }
      }
    } catch (err) {
      console.error('getCurrentSpace error:', err)
    }
  }

  /**
   * Initialize auth state from existing session
   */
  async function initialize() {
    isLoading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await fetchProfile(session.user.id)
        await fetchSpaces()
        await getCurrentSpace()
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    currentSpace,
    spaces,
    isLoading,
    error,
    _initialized,
    // Getters
    isAuthenticated,
    hasSelectedSpace,
    userName,
    // Actions
    login,
    register,
    loginWithProvider,
    logout,
    fetchProfile,
    fetchSpaces,
    selectSpace,
    getCurrentSpace,
    initialize,
    clearError,
  }
})
