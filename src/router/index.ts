import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  /* ============================
     Auth Routes (public)
     ============================ */
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/pages/auth/Login.vue'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/pages/auth/Register.vue'),
      },
    ],
  },

  /* ============================
     Space Selector (requires auth, no space needed)
     ============================ */
  {
    path: '/space-selector',
    name: 'SpaceSelector',
    component: () => import('@/pages/auth/SpaceSelector.vue'),
    meta: { requiresAuth: true },
  },

  /* ============================
     App Routes (requires auth + space)
     ============================ */
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true, requiresSpace: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/pages/HomePage.vue'),
      },
      // Personal Space (Trader) routes
      {
        path: 'trading',
        name: 'Trading',
        component: () => import('@/pages/private/TradingJournal.vue'),
      },
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'habits',
        name: 'Habits',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'books',
        name: 'Books',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'events',
        name: 'Events',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'review',
        name: 'Review',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      // Personal Space (Guru Les / Teacher) routes
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'lessons',
        name: 'Lessons',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'schedule',
        name: 'Schedule',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'materials',
        name: 'Materials',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'income',
        name: 'Income',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      // Couple Space routes
      {
        path: 'gallery',
        name: 'Gallery',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'journal',
        name: 'Journal',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      {
        path: 'love-notes',
        name: 'LoveNotes',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
      // Shared routes
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/PlaceholderPage.vue'),
      },
    ],
  },

  /* ============================
     Auth Callback (OAuth redirect)
     ============================ */
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/pages/auth/AuthCallback.vue'),
  },

  /* ============================
     Catch-all 404
     ============================ */
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

/* ============================
   Navigation Guards
   ============================ */
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization on first load
  if (!authStore._initialized) {
    await authStore.initialize()
    authStore._initialized = true
  }

  const isAuthenticated = authStore.isAuthenticated
  const hasSpace = authStore.hasSelectedSpace

  // requiresAuth: redirect to login if not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // requiresGuest: redirect to space selector if already authenticated
  if (to.meta.requiresGuest && isAuthenticated) {
    return next(hasSpace ? { name: 'Home' } : { name: 'SpaceSelector' })
  }

  // requiresSpace: redirect to space selector if no space selected
  if (to.meta.requiresSpace && isAuthenticated && !hasSpace) {
    return next({ name: 'SpaceSelector' })
  }

  next()
})

export default router
