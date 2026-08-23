<template>
  <div class="glass rounded-2xl p-4 sm:p-6 border border-slate-700/60 space-y-5">
    <!-- Top Header: Month Switcher & View Mode Toggle -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <!-- Month Navigation -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
          <button
            type="button"
            @click="prevMonth"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Icon name="chevron-left" :size="16" />
          </button>
          <button
            type="button"
            @click="goToToday"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Hari Ini
          </button>
          <button
            type="button"
            @click="nextMonth"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Icon name="chevron-right" :size="16" />
          </button>
        </div>

        <h2 class="text-base sm:text-lg font-bold text-white tracking-tight">
          {{ monthYearTitle }}
        </h2>
      </div>

      <!-- View Switcher Tabs: Month vs Week vs List -->
      <div class="flex bg-dark/80 p-1 rounded-xl border border-slate-700/60 text-xs">
        <button
          type="button"
          @click="$emit('update:viewMode', 'month')"
          class="px-3 py-1.5 rounded-lg font-medium transition-all"
          :class="viewMode === 'month' ? 'bg-accent text-dark font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'"
        >
          📅 Bulanan
        </button>
        <button
          type="button"
          @click="$emit('update:viewMode', 'week')"
          class="px-3 py-1.5 rounded-lg font-medium transition-all"
          :class="viewMode === 'week' ? 'bg-accent text-dark font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'"
        >
          📆 Mingguan
        </button>
        <button
          type="button"
          @click="$emit('update:viewMode', 'list')"
          class="px-3 py-1.5 rounded-lg font-medium transition-all"
          :class="viewMode === 'list' ? 'bg-accent text-dark font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'"
        >
          📋 Daftar
        </button>
      </div>
    </div>

    <!-- Category Color Legend -->
    <div class="flex flex-wrap items-center gap-2 text-[11px] pt-1">
      <span class="text-slate-500 font-medium">Kategori:</span>
      <span
        v-for="cat in availableCategories"
        :key="cat"
        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border"
        :class="getCategoryClasses(cat)"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
        <span>{{ cat }}</span>
      </span>
    </div>

    <!-- 1. MONTH VIEW -->
    <div v-if="viewMode === 'month'" class="space-y-2">
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-400 py-1 border-b border-slate-800">
        <span v-for="d in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']" :key="d">
          {{ d }}
        </span>
      </div>

      <!-- Calendar Matrix -->
      <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
        <div
          v-for="(cell, idx) in monthCells"
          :key="idx"
          @click="selectDate(cell.dateStr)"
          class="min-h-[75px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer"
          :class="[
            cell.isCurrentMonth ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-600' : 'bg-dark/30 border-slate-800/30 opacity-40',
            cell.dateStr === selectedDate ? 'ring-2 ring-accent border-accent bg-slate-900/90' : '',
            cell.isToday ? 'border-accent/60 bg-cyan-950/20' : '',
          ]"
        >
          <!-- Date Number -->
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-bold font-mono"
              :class="cell.isToday ? 'text-accent bg-accent/20 px-1.5 py-0.5 rounded-md' : 'text-slate-300'"
            >
              {{ cell.dayNum }}
            </span>
            <span v-if="cell.events.length > 0" class="text-[9px] font-mono text-slate-400">
              {{ cell.events.length }}
            </span>
          </div>

          <!-- Events Pills (Max 2 shown, pop-in animation) -->
          <div class="space-y-1 mt-1">
            <div
              v-for="evt in cell.events.slice(0, 2)"
              :key="evt.id"
              @click.stop="$emit('view-detail', evt)"
              class="px-1.5 py-0.5 rounded text-[10px] font-medium truncate border transition-transform hover:scale-105 animate-fade-in"
              :class="getCategoryClasses(evt.category)"
              :title="evt.title"
            >
              {{ evt.title }}
            </div>
            <div
              v-if="cell.events.length > 2"
              class="text-[9px] text-slate-400 text-center font-bold"
            >
              +{{ cell.events.length - 2 }} lainnya
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. WEEK VIEW -->
    <div v-else-if="viewMode === 'week'" class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-7 gap-3">
        <div
          v-for="day in weekDays"
          :key="day.dateStr"
          @click="selectDate(day.dateStr)"
          class="glass rounded-xl p-3 border border-slate-800 flex flex-col justify-between cursor-pointer min-h-[140px]"
          :class="[
            day.dateStr === selectedDate ? 'ring-2 ring-accent border-accent' : '',
            day.isToday ? 'bg-cyan-950/20 border-accent/40' : '',
          ]"
        >
          <div>
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span class="text-xs font-bold text-slate-400">{{ day.dayName }}</span>
              <span
                class="text-xs font-mono font-bold"
                :class="day.isToday ? 'text-accent bg-accent/20 px-1.5 py-0.5 rounded' : 'text-white'"
              >
                {{ day.dayNum }}
              </span>
            </div>

            <!-- Day's events -->
            <div class="space-y-1.5">
              <div
                v-for="evt in day.events"
                :key="evt.id"
                @click.stop="$emit('view-detail', evt)"
                class="p-1.5 rounded-lg text-xs font-medium border truncate transition-transform hover:scale-105"
                :class="getCategoryClasses(evt.category)"
              >
                <div class="font-bold truncate">{{ evt.title }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ formatTime(evt.start_datetime) }}</div>
              </div>

              <div v-if="day.events.length === 0" class="text-[10px] text-slate-600 text-center py-4">
                Tidak ada agenda
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Selected Date Inspector (Below Calendar) -->
    <div v-if="selectedDateEvents.length > 0" class="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-3 animate-fade-in">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold text-white flex items-center gap-2">
          <span>📌</span>
          <span>Agenda pada {{ formatSelectedDate(selectedDate) }} ({{ selectedDateEvents.length }} Event)</span>
        </h4>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="evt in selectedDateEvents"
          :key="evt.id"
          @click="$emit('view-detail', evt)"
          class="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-accent/40 cursor-pointer flex items-center justify-between gap-3 transition-colors"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded border" :class="getCategoryClasses(evt.category)">
                {{ evt.category }}
              </span>
              <span class="text-xs text-slate-400 font-mono">{{ formatTime(evt.start_datetime) }}</span>
            </div>
            <h5 class="text-xs font-bold text-white mt-1 truncate">{{ evt.title }}</h5>
            <p v-if="evt.location" class="text-[11px] text-slate-400 truncate mt-0.5">📍 {{ evt.location }}</p>
          </div>

          <button
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-700 text-slate-200 hover:bg-slate-600"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { EVENT_CATEGORIES, CATEGORY_COLORS } from '@/composables/useEvents'
import type { EventItem } from '@/types'

const props = defineProps<{
  eventsByDate: Record<string, EventItem[]>
  viewMode: 'month' | 'week' | 'list'
}>()

defineEmits<{
  (e: 'update:viewMode', mode: 'month' | 'week' | 'list'): void
  (e: 'view-detail', event: EventItem): void
}>()

const availableCategories = EVENT_CATEGORIES
const currentDate = ref(new Date())
const selectedDate = ref(new Date().toISOString().split('T')[0])

const monthYearTitle = computed(() => {
  return currentDate.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const selectedDateEvents = computed(() => {
  return props.eventsByDate[selectedDate.value] || []
})

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function goToToday() {
  currentDate.value = new Date()
  selectedDate.value = new Date().toISOString().split('T')[0]
}

function selectDate(dateStr: string) {
  selectedDate.value = dateStr
}

function getCategoryClasses(cat: string) {
  const c = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS['Personal']
  return c.badge
}

function formatTime(dt: string) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatSelectedDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// 42-cell Month Matrix Calculation
const monthCells = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const todayStr = new Date().toISOString().split('T')[0]
  const cells = []

  // Prev Month Days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const date = new Date(year, month - 1, d)
    const dateStr = date.toISOString().split('T')[0]
    cells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: props.eventsByDate[dateStr] || [],
    })
  }

  // Current Month Days
  for (let d = 1; d <= daysInMonth; d++) {
    // Avoid UTC timezone off-by-one
    const yyyy = year
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    cells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      events: props.eventsByDate[dateStr] || [],
    })
  }

  // Next Month Days (to reach total multiple of 7, up to 35 or 42)
  const remaining = (7 - (cells.length % 7)) % 7
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month + 2 > 12 ? 1 : month + 2
    const nextYear = month + 2 > 12 ? year + 1 : year
    const yyyy = nextYear
    const mm = String(nextMonth).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    cells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: props.eventsByDate[dateStr] || [],
    })
  }

  return cells
})

// Week View Days Calculation (7 days of selected week)
const weekDays = computed(() => {
  const current = new Date(selectedDate.value || new Date())
  const dayOfWeek = current.getDay() // 0 is Sunday
  const sunday = new Date(current)
  sunday.setDate(sunday.getDate() - dayOfWeek)

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const todayStr = new Date().toISOString().split('T')[0]

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday)
    d.setDate(d.getDate() + i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    days.push({
      dayName: dayNames[i],
      dayNum: d.getDate(),
      dateStr,
      isToday: dateStr === todayStr,
      events: props.eventsByDate[dateStr] || [],
    })
  }
  return days
})
</script>
