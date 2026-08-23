<template>
  <div class="glass rounded-xl p-5 border border-slate-700/60 mb-6">
    <!-- Header: Title + Month Switcher -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-700/50">
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>📅</span>
          <span>Kalender Evaluasi Harian</span>
        </h3>
        <p class="text-xs text-slate-400">Klik tanggal untuk melihat dan mencatat habit pada hari tersebut</p>
      </div>

      <!-- Month Navigation Controls -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="prevMonth"
          class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
        >
          ←
        </button>
        <span class="text-xs font-bold text-white px-3 font-mono">
          {{ monthTitle }}
        </span>
        <button
          type="button"
          @click="nextMonth"
          class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
        >
          →
        </button>
        <button
          type="button"
          @click="goToToday"
          class="px-2.5 py-1 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 text-xs font-bold transition-colors ml-1"
        >
          Hari Ini
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-1.5 text-center mb-4">
      <!-- Day Header -->
      <div
        v-for="d in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']"
        :key="d"
        class="py-1 text-[11px] font-bold text-slate-500 uppercase"
      >
        {{ d }}
      </div>

      <!-- Days Cells -->
      <div
        v-for="(day, idx) in calendarDays"
        :key="idx"
        @click="selectDate(day.dateStr)"
        class="aspect-square p-1 sm:p-2 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer relative"
        :class="getDayClasses(day)"
      >
        <span class="text-xs font-semibold" :class="day.isToday ? 'text-accent font-bold' : day.isCurrentMonth ? 'text-slate-200' : 'text-slate-600'">
          {{ day.dayNum }}
        </span>

        <!-- Indicators / Dots -->
        <div v-if="day.isCurrentMonth && !day.isFuture" class="flex items-center justify-center gap-0.5">
          <span
            v-if="day.completedCount > 0 && day.completedCount === day.totalHabits"
            class="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"
            title="100% Selesai"
          ></span>
          <span
            v-else-if="day.completedCount > 0"
            class="w-2 h-2 rounded-full bg-cyan-400"
            :title="`${day.completedCount}/${day.totalHabits} Selesai`"
          ></span>
          <span
            v-else
            class="w-1.5 h-1.5 rounded-full bg-rose-500/60"
            title="Belum ada habit selesai"
          ></span>
        </div>
      </div>
    </div>

    <!-- Selected Date Details Drawer -->
    <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 mt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>🎯</span>
          <span>Habit untuk: {{ formatSelectedDateHeader(selectedDate) }}</span>
        </h4>
        <span class="text-xs font-mono font-bold text-accent">
          {{ selectedDayCompletedCount }} / {{ habits.length }} Selesai
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        <div
          v-for="habit in habits"
          :key="habit.id"
          @click="$emit('toggle', habit.id, selectedDate)"
          class="p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all hover:border-slate-500"
          :class="habit.logs[selectedDate]
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            : 'bg-dark border-slate-800 text-slate-300'"
        >
          <div class="flex items-center gap-2 truncate">
            <span class="text-lg">{{ habit.icon }}</span>
            <span class="text-xs font-medium truncate">{{ habit.name }}</span>
          </div>

          <div
            class="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
            :class="habit.logs[selectedDate] ? 'bg-emerald-500 text-dark' : 'border border-slate-700 text-slate-600'"
          >
            {{ habit.logs[selectedDate] ? '✓' : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { HabitWithStats } from '@/types'

const props = defineProps<{
  habits: HabitWithStats[]
  selectedDate: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedDate', date: string): void
  (e: 'toggle', habitId: string, date: string): void
}>()

const currentMonth = ref(new Date())

const monthTitle = computed(() => {
  return currentMonth.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const selectedDayCompletedCount = computed(() => {
  return props.habits.filter(h => h.logs[props.selectedDate]).length
})

interface CalendarDay {
  dateStr: string
  dayNum: number
  isCurrentMonth: boolean
  isToday: boolean
  isFuture: boolean
  completedCount: number
  totalHabits: number
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sun
  const pad = (n: number) => n.toString().padStart(2, '0')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const days: CalendarDay[] = []

  // Previous month filler days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const prevDate = new Date(year, month - 1, dayNum)
    const dateStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(dayNum)}`
    days.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: false,
      isFuture: prevDate > today,
      completedCount: 0,
      totalHabits: props.habits.length,
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(year, month, d)
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`
    const isFuture = thisDate > today

    const completed = props.habits.filter(h => h.logs[dateStr]).length

    days.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture,
      completedCount: completed,
      totalHabits: props.habits.length,
    })
  }

  // Next month filler days to complete 42 grid cells
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i)
    const dateStr = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(i)}`
    days.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false,
      isToday: false,
      isFuture: true,
      completedCount: 0,
      totalHabits: props.habits.length,
    })
  }

  return days
})

function getDayClasses(day: CalendarDay) {
  const isSelected = day.dateStr === props.selectedDate
  if (isSelected) {
    return 'border-accent bg-accent/15 shadow-md shadow-accent/10 ring-2 ring-accent'
  }
  if (!day.isCurrentMonth) {
    return 'border-slate-800/40 bg-slate-900/30 opacity-40'
  }
  if (day.isToday) {
    return 'border-cyan-500/50 bg-cyan-500/5'
  }
  return 'border-slate-800 bg-dark/60 hover:border-slate-700'
}

function selectDate(dateStr: string) {
  emit('update:selectedDate', dateStr)
}

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

function goToToday() {
  currentMonth.value = new Date()
  const today = new Date().toISOString().split('T')[0]
  emit('update:selectedDate', today)
}

function formatSelectedDateHeader(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
