<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Icon name="flame" :size="20" />
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ t('habit_tracker_title') }}
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ t('habit_tracker_desc') }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="openAddModal"
          class="btn-primary flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
        >
          <Icon name="plus" :size="16" />
          <span>{{ t('new_habit') }}</span>
        </button>
      </div>
    </div>

    <!-- 1. Stats Overview Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Habits -->
      <div class="surface-card rounded-xl p-4 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Icon name="target" :size="16" />
          </span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Total</span>
        </div>
        <p class="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
          <AnimatedNumber :value="streakOverview.totalActiveHabits" />
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ t('habit_active_count') }}</p>
      </div>

      <!-- Today's Completion -->
      <div class="surface-card rounded-xl p-4 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Icon name="check" :size="16" />
          </span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">{{ t('habit_today_label') }}</span>
        </div>
        <p class="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
          <AnimatedNumber :value="streakOverview.todayCompletionRate" suffix="%" />
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {{ streakOverview.completedTodayCount }} / {{ streakOverview.totalActiveHabits }} {{ t('today_completion_label') }}
        </p>
      </div>

      <!-- Longest Streak -->
      <div class="surface-card rounded-xl p-4 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Icon name="flame" :size="16" />
          </span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">{{ t('habit_streak_record') }}</span>
        </div>
        <p class="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
          <AnimatedNumber :value="streakOverview.longestStreak" :suffix="t('days_suffix')" />
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ t('streak_record_label') }}</p>
      </div>

      <!-- 30-Day Average Rate -->
      <div class="surface-card rounded-xl p-4 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Icon name="activity" :size="16" />
          </span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-300">{{ t('habit_30d_label') }}</span>
        </div>
        <p class="text-2xl font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400">
          <AnimatedNumber :value="streakOverview.averageCompletionRate" suffix="%" />
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ t('consistency_30d_label') }}</p>
      </div>
    </div>

    <!-- 2. GitHub-style Contribution Heatmap -->
    <HabitHeatmap
      :overview="streakOverview"
      @select-date="handleSelectHeatmapDate"
    />

    <!-- 3. Habit Cards Grid Section Header -->
    <div class="flex items-center justify-between gap-4 pb-1">
      <div class="flex items-center gap-2">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon name="clipboard" :size="18" class="text-sky-500" />
          <span>{{ t('habit_list_title') }}</span>
        </h2>
      </div>
      <span class="text-xs text-slate-500 dark:text-slate-400">
        {{ habitsWithStats.length }} habit aktif
      </span>
    </div>

    <!-- 4. HABIT CARDS GRID -->
    <div>
      <div v-if="habitsWithStats.length === 0" class="surface-card rounded-xl p-12 text-center text-slate-500 space-y-3">
        <span class="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 mx-auto flex items-center justify-center">
          <Icon name="target" :size="24" />
        </span>
        <h4 class="text-base font-bold text-slate-900 dark:text-white">{{ t('no_habits_yet') }}</h4>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          {{ t('no_habits_desc') }}
        </p>
        <button
          type="button"
          @click="openAddModal"
          class="btn-primary mt-2 px-5 py-2 text-xs font-bold rounded-xl"
        >
          {{ t('create_habit_now') }}
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
import HabitForm from '@/components/habits/HabitForm.vue'
import Icon from '@/components/ui/Icon.vue'
import { useHabits } from '@/composables/useHabits'
import { useI18n } from '@/composables/useI18n'
import type { Habit, HabitWithStats, HabitFormData } from '@/types'

const { t } = useI18n()

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
  if (confirm(t('confirm_delete_habit', { name: h?.name || '' }))) {
    await deleteHabit(habitId)
  }
}

function handleSelectHeatmapDate(date: string) {
  selectedDate.value = date
}

onMounted(() => {
  fetchHabitsData()
})
</script>

