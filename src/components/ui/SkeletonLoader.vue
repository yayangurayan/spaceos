<template>
  <!-- Card skeleton -->
  <div v-if="type === 'card'" class="skeleton-card glass rounded-xl p-5">
    <div class="flex items-center justify-between mb-3">
      <div class="skeleton-bone w-10 h-10 rounded-lg" />
      <div class="skeleton-bone w-12 h-5 rounded-full" />
    </div>
    <div class="skeleton-bone w-24 h-7 rounded mb-1.5" />
    <div class="skeleton-bone w-32 h-3 rounded" />
  </div>

  <!-- Table skeleton -->
  <div v-else-if="type === 'table'" class="glass rounded-xl overflow-hidden">
    <!-- Table header -->
    <div class="flex items-center gap-4 px-5 py-3 border-b border-slate-700/50">
      <div v-for="i in columns" :key="i" class="skeleton-bone h-3 rounded flex-1" />
    </div>
    <!-- Table rows -->
    <div
      v-for="row in rows"
      :key="row"
      class="flex items-center gap-4 px-5 py-4 border-b border-slate-700/30 last:border-0"
    >
      <div v-for="i in columns" :key="i" class="skeleton-bone h-3 rounded flex-1" />
    </div>
  </div>

  <!-- Text skeleton -->
  <div v-else-if="type === 'text'" class="space-y-2">
    <div class="skeleton-bone h-3 rounded w-full" />
    <div class="skeleton-bone h-3 rounded w-4/5" />
    <div class="skeleton-bone h-3 rounded w-3/5" />
  </div>

  <!-- Circle skeleton -->
  <div v-else-if="type === 'circle'" class="flex items-center gap-3">
    <div class="skeleton-bone w-10 h-10 rounded-full shrink-0" />
    <div class="flex-1 space-y-1.5">
      <div class="skeleton-bone h-3 rounded w-3/4" />
      <div class="skeleton-bone h-2.5 rounded w-1/2" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'card' | 'table' | 'text' | 'circle'
  rows?: number
  columns?: number
}>(), {
  type: 'card',
  rows: 5,
  columns: 5,
})
</script>

<style scoped>
.skeleton-bone {
  background: linear-gradient(
    90deg,
    rgba(51, 65, 85, 0.4) 25%,
    rgba(71, 85, 105, 0.5) 50%,
    rgba(51, 65, 85, 0.4) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
