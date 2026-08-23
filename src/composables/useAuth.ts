import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'vue-router'

/**
 * Composable wrapper for auth store with additional session management logic
 */
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const {
    user,
    currentSpace,
    spaces,
    isLoading,
    error,
    isAuthenticated,
    hasSelectedSpace,
    userName,
  } = storeToRefs(authStore)

  // Listen for auth state changes (session refresh, login, logout)
  let authListener: { subscription: { unsubscribe: () => void } } | null = null

  function setupAuthListener() {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await authStore.fetchProfile(session.user.id)
        await authStore.fetchSpaces()
        await authStore.getCurrentSpace()
      }

      if (event === 'SIGNED_OUT') {
        authStore.user = null
        authStore.currentSpace = null
        authStore.spaces = []
        router.push({ name: 'Login' })
      }

      if (event === 'TOKEN_REFRESHED') {
        // Session was refreshed automatically - no action needed
        console.debug('[SpaceOS] Session token refreshed')
      }
    })

    authListener = data
  }

  function teardownAuthListener() {
    authListener?.subscription?.unsubscribe()
    authListener = null
  }

  /**
   * Check if user has access to a specific space
   */
  const hasSpaceAccess = computed(() => {
    return (spaceId: string) => spaces.value.some(s => s.id === spaceId)
  })

  /**
   * Logout and redirect to login
   */
  async function logoutAndRedirect() {
    await authStore.logout()
    router.push({ name: 'Login' })
  }

  /**
   * Select space and redirect to home
   */
  async function selectSpaceAndRedirect(spaceId: string) {
    const result = await authStore.selectSpace(spaceId)
    if (result?.success) {
      router.push({ name: 'Home' })
    }
    return result
  }

  // Setup / teardown the Supabase auth listener
  onMounted(() => {
    setupAuthListener()
  })

  onUnmounted(() => {
    teardownAuthListener()
  })

  return {
    // Reactive state
    user,
    currentSpace,
    spaces,
    isLoading,
    error,
    isAuthenticated,
    hasSelectedSpace,
    userName,
    hasSpaceAccess,
    // Actions
    login: authStore.login,
    register: authStore.register,
    loginWithProvider: authStore.loginWithProvider,
    logout: logoutAndRedirect,
    fetchSpaces: authStore.fetchSpaces,
    selectSpace: selectSpaceAndRedirect,
    initialize: authStore.initialize,
    clearError: authStore.clearError,
  }
}
