<template>
  <component :is="activeDashboard" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

import TraderDashboard from '@/pages/private/TraderDashboard.vue'
import TeacherDashboard from '@/pages/private/TeacherDashboard.vue'
import CoupleDashboard from '@/pages/shared/CoupleDashboard.vue'

const authStore = useAuthStore()
const { currentSpace } = storeToRefs(authStore)

/**
 * Resolve the correct dashboard component based on space type & category.
 *
 * Logic:
 *  - couple space → CoupleDashboard
 *  - personal space with teacher category (or name hint) → TeacherDashboard
 *  - everything else → TraderDashboard (default)
 */
const activeDashboard = computed(() => {
  const space = currentSpace.value

  if (!space) return TraderDashboard

  // Couple space
  if (space.type === 'couple') {
    return CoupleDashboard
  }

  // Teacher / Guru Les detection
  if (space.category === 'teacher') {
    return TeacherDashboard
  }

  // Name-based fallback detection for teacher
  const name = space.name?.toLowerCase() || ''
  if (name.includes('guru') || name.includes('les') || name.includes('tutor') || name.includes('teacher')) {
    return TeacherDashboard
  }

  // Default: Trader dashboard
  return TraderDashboard
})
</script>
