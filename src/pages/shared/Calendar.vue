<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header & Anniversary Counter Banner -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">🗓️</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Kalender Bersama (Our Calendar)
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Jadwal kencan, liburan bareng, pengingat ulang tahun, dan agenda spesial berdua.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="exportToICS(calendarEvents)"
          class="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
          title="Ekspor ke Google Calendar / Apple Calendar"
        >
          <span>📥 Ekspor (.ICS)</span>
        </button>

        <button
          type="button"
          @click="openAddEvent()"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Icon name="plus" :size="16" />
          <span>+ Buat Agenda</span>
        </button>
      </div>
    </div>

    <!-- 2. Special Dates / Anniversary Counter Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Days Together -->
      <div class="glass rounded-2xl p-4 border border-rose-500/30 bg-gradient-to-br from-rose-950/30 to-slate-900 flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center text-2xl shrink-0">
          💕
        </div>
        <div>
          <p class="text-2xl font-bold font-mono text-white">775 Hari</p>
          <p class="text-xs text-rose-300/80">Hari Bahagia Bersama</p>
        </div>
      </div>

      <!-- Next Anniversary -->
      <div class="glass rounded-2xl p-4 border border-pink-500/30 bg-gradient-to-br from-pink-950/30 to-slate-900 flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-2xl shrink-0">
          🎂
        </div>
        <div>
          <p class="text-2xl font-bold font-mono text-pink-400">331 Hari</p>
          <p class="text-xs text-slate-400">Menuju Anniversary ke-3</p>
        </div>
      </div>

      <!-- Events this month -->
      <div class="glass rounded-2xl p-4 border border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-slate-900 flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl shrink-0">
          ✨
        </div>
        <div>
          <p class="text-2xl font-bold font-mono text-cyan-300">
            {{ calendarEvents.length }} Agenda
          </p>
          <p class="text-xs text-slate-400">Total Rencana Terjadwal</p>
        </div>
      </div>
    </div>

    <!-- 3. Calendar View Switcher & Month Navigation -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <!-- Navigation Controls -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="prevMonth"
          class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <Icon name="chevron-left" :size="16" />
        </button>
        <button
          type="button"
          @click="nextMonth"
          class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <Icon name="chevron-right" :size="16" />
        </button>
        <button
          type="button"
          @click="resetToCurrentMonth"
          class="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white ml-1"
        >
          Bulan Ini
        </button>
        <span class="text-sm font-bold text-white ml-2">
          {{ formattedCurrentMonthYear }}
        </span>
      </div>

      <!-- View Switcher Tabs -->
      <div class="flex bg-dark/80 p-1 rounded-xl border border-slate-700/60 text-xs">
        <button
          type="button"
          @click="currentView = 'month'"
          class="px-3 py-1.5 rounded-lg transition-all"
          :class="currentView === 'month' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
        >
          📅 Bulanan
        </button>
        <button
          type="button"
          @click="currentView = 'list'"
          class="px-3 py-1.5 rounded-lg transition-all"
          :class="currentView === 'list' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
        >
          📋 Agenda List
        </button>
      </div>
    </div>

    <!-- 4. VIEW MODE A: MONTHLY MATRIX -->
    <div v-if="currentView === 'month'" class="glass rounded-2xl p-4 border border-slate-700/60 overflow-hidden">
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 gap-1 sm:gap-2 pb-2 text-center text-xs font-bold text-slate-400 border-b border-slate-800">
        <div v-for="d in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']" :key="d" class="py-1">
          {{ d }}
        </div>
      </div>

      <!-- 42 Calendar Cells Matrix -->
      <div class="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
        <div
          v-for="(cell, idx) in monthCells"
          :key="idx"
          @click="openAddEvent(cell.dateStr)"
          class="min-h-[85px] sm:min-h-[105px] rounded-xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col justify-between group"
          :class="[
            cell.isCurrentMonth ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-950/40 border-slate-900/60 opacity-40',
            cell.isToday ? 'ring-2 ring-rose-500/80 bg-rose-500/5' : 'hover:border-slate-700'
          ]"
        >
          <!-- Date Number -->
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-mono font-bold"
              :class="cell.isToday ? 'text-rose-400 px-1.5 py-0.5 rounded-md bg-rose-500/20' : cell.isCurrentMonth ? 'text-slate-200' : 'text-slate-600'"
            >
              {{ cell.dayNum }}
            </span>
          </div>

          <!-- Events in this cell -->
          <div class="space-y-1 my-1 flex-1 overflow-y-auto max-h-[60px] custom-scrollbar">
            <div
              v-for="evt in cell.events"
              :key="evt.id"
              @click.stop="openEditEvent(evt)"
              class="px-1.5 py-0.5 rounded text-[10px] font-medium truncate text-white border transition-transform hover:scale-102"
              :style="{ backgroundColor: evt.color ? evt.color + '33' : '#f43f5e33', borderColor: evt.color || '#f43f5e' }"
            >
              {{ evt.title }}
            </div>
          </div>

          <!-- Plus on hover -->
          <div class="hidden group-hover:block text-[10px] text-slate-500 text-center">
            + Tambah
          </div>
        </div>
      </div>
    </div>

    <!-- 5. VIEW MODE B: AGENDA LIST -->
    <div v-else class="space-y-4">
      <div v-if="calendarEvents.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-2">
        <span class="text-3xl block">🗓️</span>
        <p class="text-base font-bold text-white">Belum ada agenda acara</p>
        <p class="text-xs text-slate-500">Mulai jadwalkan kencan atau liburan bersama pasanganmu.</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="evt in calendarEvents"
          :key="evt.id"
          class="glass rounded-2xl p-5 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-rose-500/40"
        >
          <div class="flex items-start gap-4">
            <!-- Category Icon & Color Indicator -->
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-md"
              :style="{ backgroundColor: evt.color ? evt.color + '22' : '#f43f5e22', color: evt.color || '#f43f5e' }"
            >
              {{ getCategoryIcon(evt.category) }}
            </div>

            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                  :style="{ backgroundColor: evt.color ? evt.color + '20' : '#f43f5e20', color: evt.color || '#f43f5e', borderColor: evt.color || '#f43f5e' }"
                >
                  {{ evt.category }}
                </span>
                <span class="text-xs font-mono text-slate-400">
                  {{ formatDateTime(evt.start_time) }}
                </span>
              </div>

              <h3 class="text-base font-bold text-white">{{ evt.title }}</h3>
              <p v-if="evt.description" class="text-xs text-slate-300 leading-relaxed">{{ evt.description }}</p>
              <p v-if="evt.location" class="text-[11px] text-slate-400">📍 {{ evt.location }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 self-end md:self-center">
            <button
              type="button"
              @click="openEditEvent(evt)"
              class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              @click="confirmDelete(evt.id)"
              class="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Hapus Agenda"
            >
              <Icon name="trash" :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add / Edit Event -->
    <CoupleEventModal
      v-if="showEventModal"
      :event="selectedEvent"
      :initial-date="selectedDate"
      @close="showEventModal = false; selectedEvent = null"
      @save="handleSaveEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import CoupleEventModal from '@/components/calendar/CoupleEventModal.vue'
import { useCouple } from '@/composables/useCouple'
import type { CoupleCalendarEvent, CoupleEventFormData } from '@/types'

const {
  calendarEvents,
  fetchCoupleData,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  exportToICS,
} = useCouple()

const currentView = ref<'month' | 'list'>('month')
const currentDate = ref(new Date())

// Modal
const showEventModal = ref(false)
const selectedEvent = ref<CoupleCalendarEvent | null>(null)
const selectedDate = ref('')

const formattedCurrentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function resetToCurrentMonth() {
  currentDate.value = new Date()
}

// 42-cell Month Matrix
const monthCells = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const todayStr = new Date().toISOString().split('T')[0]

  const cells = []

  // Prev Month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const prevMonthNum = month === 0 ? 12 : month
    const prevYear = month === 0 ? year - 1 : year
    const dateStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: getEventsForDate(dateStr),
    })
  }

  // Current Month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      events: getEventsForDate(dateStr),
    })
  }

  // Next Month
  const remaining = (7 - (cells.length % 7)) % 7
  for (let d = 1; d <= remaining; d++) {
    const nextMonthNum = month + 2 > 12 ? 1 : month + 2
    const nextYear = month + 2 > 12 ? year + 1 : year
    const dateStr = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: getEventsForDate(dateStr),
    })
  }

  return cells
})

function getEventsForDate(dateStr: string) {
  return calendarEvents.value.filter(e => e.start_time.startsWith(dateStr))
}

function getCategoryIcon(cat: string) {
  switch (cat) {
    case 'Date Night': return '🍷'
    case 'Travel': return '✈️'
    case 'Anniversary': return '🎂'
    case 'Reminder': return '⏰'
    case 'Personal': return '👤'
    default: return '💕'
  }
}

function openAddEvent(dateStr?: string) {
  selectedEvent.value = null
  selectedDate.value = dateStr || new Date().toISOString()
  showEventModal.value = true
}

function openEditEvent(evt: CoupleCalendarEvent) {
  selectedEvent.value = evt
  showEventModal.value = true
}

async function handleSaveEvent(formData: CoupleEventFormData) {
  if (selectedEvent.value) {
    await updateCalendarEvent(selectedEvent.value.id, formData)
  } else {
    await createCalendarEvent(formData)
  }
  showEventModal.value = false
  selectedEvent.value = null
}

async function confirmDelete(id: string) {
  if (confirm('Hapus jadwal acara ini?')) {
    await deleteCalendarEvent(id)
  }
}

function formatDateTime(datetimeStr: string) {
  const d = new Date(datetimeStr)
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchCoupleData()
})
</script>
