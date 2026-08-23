<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white mb-1">{{ title }}</h1>
      <p class="text-slate-400 text-sm">{{ description }}</p>
    </div>

    <div class="glass rounded-xl p-12 text-center">
      <span class="text-5xl block mb-4">{{ icon }}</span>
      <h2 class="text-lg font-semibold text-white mb-2">{{ title }}</h2>
      <p class="text-sm text-slate-400 max-w-md mx-auto mb-6">
        This feature is coming soon. We're working hard to bring you the best experience.
      </p>
      <router-link to="/" class="btn-primary inline-flex items-center gap-2 text-sm">
        ← Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageMap: Record<string, { title: string; description: string; icon: string }> = {
  '/trading':     { title: 'Trading Journal',  description: 'Track and analyze your trades.',       icon: '📈' },
  '/finance':     { title: 'Finance Tracker',   description: 'Monitor your income and expenses.',   icon: '💰' },
  '/habits':      { title: 'Habit Tracker',     description: 'Build and maintain good habits.',     icon: '🎯' },
  '/books':       { title: 'Book Library',      description: 'Your reading list and notes.',        icon: '📚' },
  '/events':      { title: 'Event Tracker',     description: 'Track important events.',             icon: '📅' },
  '/review':      { title: 'Weekly Review',     description: 'Reflect on your weekly progress.',    icon: '📋' },
  // Guru Les / Teacher
  '/students':    { title: 'Students',          description: 'Manage student records and progress.', icon: '👥' },
  '/lessons':     { title: 'Lessons',           description: 'Lesson plans and teaching sessions.', icon: '🎓' },
  '/schedule':    { title: 'Schedule',          description: 'Class times and teaching schedule.',  icon: '📅' },
  '/materials':   { title: 'Materials',         description: 'Teaching slides, docs, and notes.',   icon: '📁' },
  '/income':      { title: 'Income Tracker',    description: 'Track lesson earnings and tuition.',  icon: '💵' },
  // Couple Space
  '/gallery':     { title: 'Our Gallery',       description: 'Shared photos and memories.',         icon: '📸' },
  '/journal':     { title: 'Shared Journal',    description: 'Write together, grow together.',      icon: '📖' },
  '/calendar':    { title: 'Our Calendar',      description: 'Shared events and plans.',            icon: '📅' },
  '/love-notes':  { title: 'Love Notes',        description: 'Sweet messages for each other.',      icon: '💌' },
  '/settings':    { title: 'Settings',          description: 'Manage your account and preferences.', icon: '⚙️' },
}

const pageData = computed(() => pageMap[route.path] || { title: 'Page', description: 'Coming soon.', icon: '🚧' })

const title = computed(() => pageData.value.title)
const description = computed(() => pageData.value.description)
const icon = computed(() => pageData.value.icon)
</script>
