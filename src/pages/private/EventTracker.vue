<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">🗓️</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Event & Activity Tracker
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Pantau jadwal seminar, kompetisi trading, workshop, dan agenda networking kamu.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="openAddModal"
          class="btn-primary flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <Icon name="plus" :size="16" />
          <span>Buat Event Baru</span>
        </button>
      </div>
    </div>

    <!-- 2. Overview Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <!-- Upcoming Events -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">⏳</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">Mendatang</span>
        </div>
        <p class="text-2xl font-bold font-mono text-cyan-300">
          <AnimatedNumber :value="eventStats.upcomingCount" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Event Terjadwal</p>
      </div>

      <!-- This Month -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">📅</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">Bulan Ini</span>
        </div>
        <p class="text-2xl font-bold font-mono text-white">
          <AnimatedNumber :value="eventStats.thisMonthCount" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Agenda Bulan Ini</p>
      </div>

      <!-- Completed Events -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">✅</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Selesai</span>
        </div>
        <p class="text-2xl font-bold font-mono text-emerald-400">
          <AnimatedNumber :value="eventStats.completedCount" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Event Diikuti</p>
      </div>

      <!-- Total Budget / Cost -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">💰</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Investasi</span>
        </div>
        <p class="text-lg sm:text-xl font-bold font-mono text-accent truncate">
          {{ formatCompactCurrency(eventStats.totalBudget) }}
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Total Biaya Event</p>
      </div>
    </div>

    <!-- 3. Calendar View Mode (Month & Week) -->
    <EventCalendarView
      v-if="currentView === 'month' || currentView === 'week'"
      :events-by-date="eventsByDate"
      :view-mode="currentView"
      @update:view-mode="currentView = $event"
      @view-detail="openDetailModal"
    />

    <!-- 4. Filter Toolbar -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <!-- Category & Status Filters -->
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <!-- View Toggle for List Mode -->
        <div v-if="currentView === 'list'" class="flex bg-dark/80 p-1 rounded-xl border border-slate-700/60 text-xs mr-1">
          <button
            type="button"
            @click="currentView = 'month'"
            class="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white"
          >
            📅 Kalender
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg bg-accent text-dark font-bold shadow-sm"
          >
            📋 Daftar
          </button>
        </div>

        <!-- Category Dropdown -->
        <select
          v-model="selectedCategory"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Kategori</option>
          <option v-for="cat in availableCategories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>

        <!-- Status Dropdown -->
        <select
          v-model="selectedStatus"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Status</option>
          <option value="planning">Planning (Rencana)</option>
          <option value="registered">Registered (Terdaftar)</option>
          <option value="attending">Attending (Hadir)</option>
          <option value="completed">Completed (Selesai)</option>
        </select>
      </div>

      <!-- Search Bar -->
      <div class="relative w-full md:w-64">
        <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari event, lokasi, deskripsi..."
          class="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
        />
      </div>
    </div>

    <!-- 5. Events Content: Upcoming & Past Sections -->
    <div class="space-y-8">
      <!-- Section A: Upcoming Events -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">🚀</span>
            <h2 class="text-base sm:text-lg font-bold text-white">Event Mendatang (Upcoming)</h2>
          </div>
          <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            {{ upcomingEvents.length }} Acara
          </span>
        </div>

        <div v-if="upcomingEvents.length === 0" class="glass rounded-2xl p-8 text-center text-slate-400 space-y-2">
          <span class="text-3xl block">🎟️</span>
          <p class="text-sm font-bold text-white">Tidak ada event mendatang</p>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Semua agenda mendatang telah selesai atau belum ada event baru yang dibuat.
          </p>
          <button
            type="button"
            @click="openAddModal"
            class="btn-primary mt-2 px-4 py-1.5 text-xs font-bold rounded-xl"
          >
            + Jadwalkan Event
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <EventCard
            v-for="evt in upcomingEvents"
            :key="evt.id"
            :event="evt"
            @view-detail="openDetailModal"
            @edit="openEditModal"
            @delete="confirmDelete"
            @toggle-complete="handleToggleComplete"
          />
        </div>
      </div>

      <!-- Section B: Past Events -->
      <div class="space-y-4 pt-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">🏆</span>
            <h2 class="text-base sm:text-lg font-bold text-white">Riwayat Event Selesai (Past Events)</h2>
          </div>
          <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {{ pastEvents.length }} Selesai
          </span>
        </div>

        <div v-if="pastEvents.length === 0" class="glass rounded-2xl p-8 text-center text-slate-500 text-xs">
          Belum ada riwayat event yang telah diselesaikan.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <EventCard
            v-for="evt in pastEvents"
            :key="evt.id"
            :event="evt"
            @view-detail="openDetailModal"
            @edit="openEditModal"
            @delete="confirmDelete"
            @toggle-complete="handleToggleComplete"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- 1. Add / Edit Event Modal -->
    <EventFormModal
      v-if="showFormModal"
      :event="selectedEvent"
      @close="closeFormModal"
      @save="handleSaveEvent"
    />

    <!-- 2. Event Detail Modal -->
    <EventDetailModal
      v-if="showDetailModal && activeDetailEvent"
      :event="activeDetailEvent"
      @close="closeDetailModal"
      @edit="handleDetailEdit"
      @toggle-checklist="handleToggleChecklist"
      @save-review="handleSaveReview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import Icon from '@/components/ui/Icon.vue'
import EventCard from '@/components/events/EventCard.vue'
import EventCalendarView from '@/components/events/EventCalendarView.vue'
import EventFormModal from '@/components/events/EventFormModal.vue'
import EventDetailModal from '@/components/events/EventDetailModal.vue'
import { useEvents, EVENT_CATEGORIES } from '@/composables/useEvents'
import type { EventItem, EventFormData, EventReviewFormData } from '@/types'

const {
  events,
  upcomingEvents,
  pastEvents,
  eventsByDate,
  eventStats,
  currentView,
  selectedCategory,
  selectedStatus,
  searchQuery,
  fetchEventsData,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleComplete,
  toggleChecklistItem,
  saveEventReview,
} = useEvents()

const availableCategories = EVENT_CATEGORIES

// Modal States
const showFormModal = ref(false)
const selectedEvent = ref<EventItem | null>(null)

const showDetailModal = ref(false)
const activeDetailEvent = ref<EventItem | null>(null)

function openAddModal() {
  selectedEvent.value = null
  showFormModal.value = true
}

function openEditModal(event: EventItem) {
  selectedEvent.value = event
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  selectedEvent.value = null
}

async function handleSaveEvent(formData: EventFormData, attachments?: { file_name: string; file_url: string; file_type: string }[]) {
  if (selectedEvent.value) {
    const res = await updateEvent(selectedEvent.value.id, formData)
    if (res.success) closeFormModal()
  } else {
    const res = await createEvent(formData, attachments)
    if (res.success) closeFormModal()
  }
}

function openDetailModal(event: EventItem) {
  activeDetailEvent.value = event
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  activeDetailEvent.value = null
}

function handleDetailEdit(event: EventItem) {
  closeDetailModal()
  openEditModal(event)
}

async function handleToggleComplete(eventId: string) {
  await toggleComplete(eventId)
}

async function handleToggleChecklist(eventId: string, itemId: string) {
  await toggleChecklistItem(eventId, itemId)
  // refresh active detail item reference if open
  if (activeDetailEvent.value && activeDetailEvent.value.id === eventId) {
    const updated = events.value.find(e => e.id === eventId)
    if (updated) activeDetailEvent.value = updated
  }
}

async function handleSaveReview(eventId: string, reviewData: EventReviewFormData) {
  await saveEventReview(eventId, reviewData)
  if (activeDetailEvent.value && activeDetailEvent.value.id === eventId) {
    const updated = events.value.find(e => e.id === eventId)
    if (updated) activeDetailEvent.value = updated
  }
}

async function confirmDelete(eventId: string) {
  const e = events.value.find(item => item.id === eventId)
  if (confirm(`Hapus event "${e?.title || 'ini'}" dari jadwal kamu?`)) {
    await deleteEvent(eventId)
  }
}

function formatCompactCurrency(val: number) {
  if (!val) return 'Rp 0'
  if (val >= 1000000) {
    return `Rp ${(val / 1000000).toFixed(1)} Jt`
  }
  return `Rp ${(val / 1000).toFixed(0)} Rb`
}

onMounted(() => {
  fetchEventsData()
})
</script>
