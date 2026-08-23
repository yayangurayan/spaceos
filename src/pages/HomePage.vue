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

const activeDashboard = computed(() => {
  const space = currentSpace.value

  if (!space) return TraderDashboard

  // Couple space
  if (space.type === 'couple') {
    return CoupleDashboard
  }

  // Teacher / Guru Les Space
  const category = space.category
  const name = space.name?.toLowerCase() || ''
  if (category === 'teacher' || name.includes('guru') || name.includes('les') || name.includes('bimbel') || name.includes('tutor') || name.includes('teach') || space.id === 'space-teacher') {
    return TeacherDashboard
  }

  // Default: Trader dashboard
  return TraderDashboard
})
</script>
