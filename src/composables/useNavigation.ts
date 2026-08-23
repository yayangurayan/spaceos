import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
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
     Navigation Items by Space Type
     ============================ */
  const navigationSections = computed((): NavSection[] => {
    const space = currentSpace.value
    const spaceType = space?.type
    const category = space?.category

    if (spaceType === 'couple') {
      return [
        {
          title: 'Menu',
          items: [
            { label: 'Dashboard', to: '/', icon: 'home' },
            { label: 'Our Gallery', to: '/gallery', icon: 'images' },
            { label: 'Shared Journal', to: '/journal', icon: 'book-heart' },
            { label: 'Our Calendar', to: '/calendar', icon: 'calendar-heart' },
            { label: 'Love Notes', to: '/love-notes', icon: 'message-heart' },
          ],
        },
      ]
    }

    // Personal Space - Teacher / Guru Les
    if (category === 'teacher' || space?.name?.toLowerCase().includes('guru') || space?.name?.toLowerCase().includes('les') || space?.name?.toLowerCase().includes('tutor') || space?.name?.toLowerCase().includes('teacher')) {
      return [
        {
          title: 'Menu',
          items: [
            { label: 'Dashboard', to: '/', icon: 'home' },
            { label: 'Students', to: '/students', icon: 'users' },
            { label: 'Lessons', to: '/lessons', icon: 'graduation-cap' },
            { label: 'Lesson Plans', to: '/lesson-plans', icon: 'clipboard' },
            { label: 'Schedule', to: '/schedule', icon: 'calendar' },
            { label: 'Materials', to: '/materials', icon: 'folder' },
            { label: 'Income Tracker', to: '/income', icon: 'dollar-sign' },
          ],
        },
      ]
    }

    // Personal Space — Trader / General (default)
    return [
      {
        title: 'Menu',
        items: [
          { label: 'Dashboard', to: '/', icon: 'home' },
          { label: 'Trading Journal', to: '/trading', icon: 'chart-line' },
          { label: 'Finance Tracker', to: '/finance', icon: 'wallet' },
          { label: 'Habit Tracker', to: '/habits', icon: 'target' },
          { label: 'Book Library', to: '/books', icon: 'book' },
          { label: 'Event Tracker', to: '/events', icon: 'calendar' },
          { label: 'Weekly Review', to: '/review', icon: 'clipboard' },
        ],
      },
    ]
  })

  const footerItems = computed((): NavSection => ({
    items: [
      { label: 'Settings', to: '/settings', icon: 'settings' },
    ],
  }))

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
