<template>
  <div
    class="glass rounded-xl p-4 border transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
    :class="habit.isCompletedToday
      ? 'border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/5'
      : 'border-slate-700/60 hover:border-slate-600'"
  >
    <!-- Top Row: Icon + Name + Category + Action menu -->
    <div>
      <div class="flex items-start justify-between gap-3 mb-2.5">
        <div class="flex items-center gap-3">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-transform"
            :class="habit.isCompletedToday ? 'bg-emerald-500/20 scale-105' : 'bg-slate-800'"
          >
            {{ habit.icon }}
          </div>
          <div>
            <h4 class="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
              <span>{{ habit.name }}</span>
            </h4>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {{ habit.category }}
              </span>
              <span v-if="habit.target" class="text-[10px] text-accent font-medium">
                🎯 {{ habit.target }}
              </span>
            </div>
          </div>
        </div>

        <!-- Edit/Delete buttons -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            @click="$emit('edit', habit)"
            class="p-1 rounded text-slate-500 hover:text-accent text-xs transition-colors"
            title="Edit Habit"
          >
            ✏️
          </button>
          <button
            type="button"
            @click="$emit('delete', habit.id)"
            class="p-1 rounded text-slate-500 hover:text-rose-400 text-xs transition-colors"
            title="Hapus Habit"
          >
            🗑️
          </button>
        </div>
      </div>

      <!-- Streaks & Metrics Row -->
      <div class="grid grid-cols-3 gap-2 py-2.5 my-2 border-y border-slate-700/40 text-center">
        <div>
          <span class="text-[10px] uppercase font-semibold text-slate-500 block">Streak</span>
          <span class="text-sm font-bold font-mono text-amber-400">
            🔥 {{ habit.currentStreak }} hari
          </span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-semibold text-slate-500 block">Best Streak</span>
          <span class="text-sm font-bold font-mono text-slate-300">
            ⭐ {{ habit.bestStreak }}
          </span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-semibold text-slate-500 block">30 Hari</span>
          <span
            class="text-sm font-bold font-mono"
            :class="habit.completionRate >= 70 ? 'text-emerald-400' : 'text-slate-300'"
          >
            {{ habit.completionRate }}%
          </span>
        </div>
      </div>

      <!-- Mini 7-Day History Dots -->
      <div class="flex items-center justify-between gap-1 mb-3 pt-1">
        <div
          v-for="day in last7Days"
          :key="day.date"
          class="flex flex-col items-center gap-1 flex-1"
        >
          <span class="text-[9px] text-slate-500 uppercase">{{ day.dayShort }}</span>
          <div
            class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all"
            :class="habit.logs[day.date]
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
              : day.isFuture
              ? 'bg-slate-800/40 text-slate-700'
              : 'bg-slate-800 text-slate-600'"
            :title="`${day.date}: ${habit.logs[day.date] ? 'Selesai' : 'Tidak'}`"
          >
            {{ habit.logs[day.date] ? '✓' : '·' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Check-in CTA Button for Today -->
    <button
      type="button"
      @click="$emit('toggle', habit.id, todayDateStr)"
      class="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
      :class="habit.isCompletedToday
        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
        : 'btn-primary'"
    >
      <span v-if="habit.isCompletedToday">✓ Selesai Hari Ini 🎉</span>
      <span v-else>○ Tandai Selesai Hari Ini</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HabitWithStats } from '@/types'

const props = defineProps<{
  habit: HabitWithStats
}>()

defineEmits<{
  (e: 'toggle', habitId: string, date: string): void
  (e: 'edit', habit: HabitWithStats): void
  (e: 'delete', habitId: string): void
}>()

const today = new Date()
const todayDateStr = today.toISOString().split('T')[0]

const last7Days = computed(() => {
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const days = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000)
    days.push({
      date: d.toISOString().split('T')[0],
      dayShort: dayNames[d.getDay()],
      isToday: i === 0,
      isFuture: false,
    })
  }

  return days
})
</script>
