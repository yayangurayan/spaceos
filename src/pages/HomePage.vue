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
import PersonalDashboard from '@/pages/private/PersonalDashboard.vue'

const authStore = useAuthStore()
const { currentSpace } = storeToRefs(authStore)

const activeDashboard = computed(() => {
  const space = currentSpace.value

  if (!space) return PersonalDashboard

  // Couple space
  if (space.type === 'couple') {
    return CoupleDashboard
  }

  // Teacher Space
  const category = space.category
  const name = space.name?.toLowerCase() || ''
  if (category === 'teacher' || name.includes('guru') || name.includes('les') || name.includes('bimbel') || name.includes('tutor') || name.includes('teach') || space.id === 'space-teacher') {
    return TeacherDashboard
  }

  // Trading Space
  if (category === 'trading' || category === 'trader' || name.includes('trading') || name.includes('trader') || space.id === 'space-trading') {
    return TraderDashboard
  }

  // Personal Space (Default)
  if (category === 'personal' || category === 'private' || space.id === 'space-personal') {
    return PersonalDashboard
  }

  return PersonalDashboard
})
</script>
