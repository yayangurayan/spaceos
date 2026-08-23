<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">🔥</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Habit Tracker
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Bentuk konsistensi, jaga streak harian, dan pantau kemajuan kebiasaan kamu.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="openAddModal"
          class="btn-primary flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <span class="text-base leading-none">+</span>
          <span>Buat Habit Baru</span>
        </button>
      </div>
    </div>

    <!-- 1. Stats Overview Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Habits -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">🎯</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Total</span>
        </div>
        <p class="text-2xl font-bold font-mono text-white">
          <AnimatedNumber :value="streakOverview.totalActiveHabits" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Habit Aktif</p>
      </div>

      <!-- Today's Completion -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">✅</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Hari Ini</span>
        </div>
        <p class="text-2xl font-bold font-mono text-emerald-400">
          <AnimatedNumber :value="streakOverview.todayCompletionRate" suffix="%" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">
          {{ streakOverview.completedTodayCount }} / {{ streakOverview.totalActiveHabits }} Selesai
        </p>
      </div>

      <!-- Longest Streak -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">🔥</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Rekor</span>
        </div>
        <p class="text-2xl font-bold font-mono text-amber-400">
          <AnimatedNumber :value="streakOverview.longestStreak" suffix=" Hari" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Streak Terpanjang</p>
      </div>

      <!-- 30-Day Average Rate -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">📈</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300">30 Hari</span>
        </div>
        <p class="text-2xl font-bold font-mono text-accent">
          <AnimatedNumber :value="streakOverview.averageCompletionRate" suffix="%" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Rata-rata Konsistensi</p>
      </div>
    </div>

    <!-- 2. GitHub-style Contribution Heatmap -->
    <HabitHeatmap
      :overview="streakOverview"
      @select-date="handleSelectHeatmapDate"
    />

    <!-- 3. View Switcher: Habit Cards Grid vs Monthly Calendar -->
    <div class="flex items-center justify-between gap-4 pb-1">
      <div class="flex items-center gap-2">
        <h2 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span>📋</span>
          <span>Daftar Kebiasaan & Evaluasi</span>
        </h2>
      </div>

      <div class="flex bg-dark/80 p-1 rounded-lg border border-slate-700/60 text-xs">
        <button
          type="button"
          @click="activeView = 'cards'"
          class="px-3 py-1.5 rounded-md font-medium transition-all"
          :class="activeView === 'cards' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'"
        >
          🗂️ Kartu Habit
        </button>
        <button
          type="button"
          @click="activeView = 'calendar'"
          class="px-3 py-1.5 rounded-md font-medium transition-all"
          :class="activeView === 'calendar' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'"
        >
          📅 Kalender
        </button>
      </div>
    </div>

    <!-- 4. VIEW A: HABIT CARDS GRID -->
    <div v-if="activeView === 'cards'">
      <div v-if="habitsWithStats.length === 0" class="glass rounded-xl p-12 text-center text-slate-400 space-y-3">
        <span class="text-4xl block mb-1">🌱</span>
        <h4 class="text-base font-bold text-white">Belum ada habit yang dibuat</h4>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          Mulai bangun rutinitas positif dengan menambahkan kebiasaan pertama kamu.
        </p>
        <button
          type="button"
          @click="openAddModal"
          class="btn-primary mt-2 px-5 py-2 text-xs font-bold rounded-xl"
        >
          + Buat Habit Sekarang
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <HabitCard
          v-for="habit in habitsWithStats"
          :key="habit.id"
          :habit="habit"
          @toggle="handleToggle"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
      </div>
    </div>

    <!-- 5. VIEW B: MONTHLY CALENDAR -->
    <div v-else>
      <HabitCalendarView
        :habits="habitsWithStats"
        :selected-date="selectedDate"
        @update:selected-date="selectedDate = $event"
        @toggle="handleToggle"
      />
    </div>

    <!-- Modal Form -->
    <HabitForm
      v-if="showModal"
      :habit="selectedHabit"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import HabitCard from '@/components/habits/HabitCard.vue'
import HabitHeatmap from '@/components/habits/HabitHeatmap.vue'
import HabitCalendarView from '@/components/habits/HabitCalendarView.vue'
import HabitForm from '@/components/habits/HabitForm.vue'
import { useHabits } from '@/composables/useHabits'
import type { Habit, HabitWithStats, HabitFormData } from '@/types'

const {
  habitsWithStats,
  streakOverview,
  selectedDate,
  fetchHabitsData,
  toggleHabit,
  createHabit,
  updateHabit,
  deleteHabit,
} = useHabits()

const activeView = ref<'cards' | 'calendar'>('cards')
const showModal = ref(false)
const selectedHabit = ref<Habit | null>(null)

function openAddModal() {
  selectedHabit.value = null
  showModal.value = true
}

function openEditModal(habit: HabitWithStats) {
  selectedHabit.value = habit
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedHabit.value = null
}

async function handleSave(formData: HabitFormData) {
  if (selectedHabit.value) {
    const res = await updateHabit(selectedHabit.value.id, formData)
    if (res.success) closeModal()
  } else {
    const res = await createHabit(formData)
    if (res.success) closeModal()
  }
}

async function handleToggle(habitId: string, date: string) {
  await toggleHabit(habitId, date)
}

async function confirmDelete(habitId: string) {
  const h = habitsWithStats.value.find(item => item.id === habitId)
  if (confirm(`Hapus habit "${h?.name || 'ini'}" beserta riwayatnya?`)) {
    await deleteHabit(habitId)
  }
}

function handleSelectHeatmapDate(date: string) {
  selectedDate.value = date
  activeView.value = 'calendar'
}

onMounted(() => {
  fetchHabitsData()
})
</script>
