<template>
  <div class="surface-card p-4 sm:p-5 mb-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon name="activity" :size="16" class="text-emerald-500" />
          <span>Konsistensi Habit (12 Minggu Terakhir)</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Pola frekuensi eksekusi kebiasaan harian ala GitHub heatmap</p>
      </div>

      <!-- Level Legend -->
      <div class="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 self-end sm:self-center">
        <span>Kurang</span>
        <span class="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"></span>
        <span class="w-3 h-3 rounded-sm bg-sky-900/60 border border-sky-800"></span>
        <span class="w-3 h-3 rounded-sm bg-sky-600"></span>
        <span class="w-3 h-3 rounded-sm bg-emerald-500"></span>
        <span class="w-3 h-3 rounded-sm bg-emerald-400"></span>
        <span>Sering</span>
      </div>
    </div>

    <!-- Heatmap Grid Container (Horizontal scroll on mobile) -->
    <div class="overflow-x-auto pb-2 custom-scrollbar">
      <div class="min-w-[560px] sm:min-w-[640px]">
        <!-- Days of week labels on left + Columns of 7 days -->
        <div class="flex gap-1.5 items-start">
          <div class="flex flex-col gap-1 text-[9px] text-slate-400 dark:text-slate-500 font-semibold pr-1">
            <span class="h-3.5">Min</span>
            <span class="h-3.5">Sen</span>
            <span class="h-3.5">Sel</span>
            <span class="h-3.5">Rab</span>
            <span class="h-3.5">Kam</span>
            <span class="h-3.5">Jum</span>
            <span class="h-3.5">Sab</span>
          </div>

          <!-- Weeks Grid -->
          <div class="grid grid-flow-col grid-rows-7 gap-1 flex-1">
            <div
              v-for="cell in overview.heatmapData"
              :key="cell.date"
              class="w-3.5 h-3.5 rounded-sm transition-all duration-150 cursor-pointer hover:scale-125"
              :class="getCellColor(cell.level)"
              :title="`${formatDate(cell.date)}: ${cell.count} habit selesai`"
              @click="$emit('select-date', cell.date)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'
import type { HabitStreakOverview } from '@/types'

defineProps<{
  overview: HabitStreakOverview
}>()

defineEmits<{
  (e: 'select-date', date: string): void
}>()

function formatDate(dStr: string): string {
  const d = new Date(dStr)
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getCellColor(level: number): string {
  switch (level) {
    case 1:
      return 'bg-cyan-900 border border-cyan-800/80'
    case 2:
      return 'bg-cyan-600'
    case 3:
      return 'bg-emerald-500'
    case 4:
      return 'bg-emerald-400 shadow-sm shadow-emerald-400/30'
    case 0:
    default:
      return 'bg-slate-800/80 border border-slate-700/40'
  }
}
</script>
