import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useI18n } from '@/composables/useI18n'
import type { NavSection } from '@/types'

/**
 * Navigation composable
 * - Generates nav items based on current space type
 * - Tracks active route
 * - Manages mobile sidebar state
 */
export function useNavigation() {
  const route = useRoute()
  const authStore = useAuthStore()
  const { currentSpace } = storeToRefs(authStore)
  const { t, currentLang } = useI18n()

  /* ============================
     Mobile Sidebar
     ============================ */
  const isMobileSidebarOpen = ref(false)
  const isMobile = ref(false)

  function checkMobile() {
    isMobile.value = window.innerWidth < 1024
  }

  function openMobileSidebar() {
    isMobileSidebarOpen.value = true
  }

  function closeMobileSidebar() {
    isMobileSidebarOpen.value = false
  }

  function toggleMobileSidebar() {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }

  // Close mobile sidebar on route change
  watch(() => route.path, () => {
    if (isMobile.value) {
      isMobileSidebarOpen.value = false
    }
  })

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  /* ============================
     Active Route
     ============================ */
  const currentPath = computed(() => route.path)

  function isActive(path: string): boolean {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
  }

  /* ============================
     Navigation Items by Space Type & Category
     ============================ */
  const navigationSections = computed((): NavSection[] => {
    // Reference currentLang to ensure reactivity upon language switch
    void currentLang.value
    const space = currentSpace.value
    const spaceType = space?.type
    const category = space?.category
    const name = space?.name?.toLowerCase() || ''

    if (spaceType === 'couple') {
      return [
        {
          title: t('menu_couple_hub'),
          items: [
            { label: t('dashboard_couple'), to: '/', icon: 'home' },
            { label: t('our_gallery'), to: '/gallery', icon: 'images' },
            { label: t('shared_journal'), to: '/journal', icon: 'book-heart' },
            { label: t('our_calendar'), to: '/calendar', icon: 'calendar-heart' },
            { label: t('love_notes'), to: '/love-notes', icon: 'message-heart' },
          ],
        },
      ]
    }

    // Teacher / Guru Les Space
    if (category === 'teacher' || name.includes('guru') || name.includes('les') || name.includes('bimbel') || name.includes('tutor') || name.includes('teach') || space?.id === 'space-teacher') {
      return [
        {
          title: t('menu_teacher'),
          items: [
            { label: t('dashboard_tutor'), to: '/', icon: 'home' },
            { label: t('students'), to: '/students', icon: 'users' },
            { label: t('lessons'), to: '/lessons', icon: 'graduation-cap' },
            { label: t('lesson_plans'), to: '/lesson-plans', icon: 'clipboard' },
            { label: t('schedule'), to: '/schedule', icon: 'calendar' },
            { label: t('materials'), to: '/materials', icon: 'folder' },
            { label: t('income_tracker'), to: '/income', icon: 'dollar-sign' },
          ],
        },
      ]
    }

    // Trader Space & General (default)
    return [
      {
        title: t('menu_trader'),
        items: [
          { label: t('dashboard_trading'), to: '/', icon: 'home' },
          { label: t('trading_journal'), to: '/trading', icon: 'chart-line' },
          { label: t('finance_tracker'), to: '/finance', icon: 'wallet' },
          { label: t('habit_tracker'), to: '/habits', icon: 'target' },
          { label: t('book_library'), to: '/books', icon: 'book' },
          { label: t('event_tracker'), to: '/events', icon: 'calendar' },
          { label: t('weekly_review'), to: '/review', icon: 'clipboard' },
        ],
      },
    ]
  })

  const footerItems = computed((): NavSection => {
    void currentLang.value
    return {
      items: [
        { label: t('settings'), to: '/settings', icon: 'settings' },
      ],
    }
  })

  return {
    // Mobile
    isMobile,
    isMobileSidebarOpen,
    openMobileSidebar,
    closeMobileSidebar,
    toggleMobileSidebar,
    // Route
    currentPath,
    isActive,
    // Navigation
    navigationSections,
    footerItems,
  }
}
