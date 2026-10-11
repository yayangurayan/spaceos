<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-1 flex items-center gap-2.5">
          <Icon name="graduation-cap" size="26" class="text-accent" />
          <span>{{ t('dashboard_teacher_title') }}</span>
        </h1>
        <p class="text-text-tertiary text-xs sm:text-sm">{{ t('dashboard_teacher_desc') }}</p>
      </div>

      <router-link
        to="/students"
        class="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-98"
      >
        <Icon name="plus" size="14" />
        <span>{{ t('add_new_student') }}</span>
      </router-link>
    </div>

    <!-- Error State -->
    <div v-if="error" class="surface-card p-8 text-center animate-fade-in border border-rose-500/30">
      <div class="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">
        <Icon name="alert-triangle" size="24" />
      </div>
      <p class="text-text-primary font-semibold mb-1">{{ t('failed_load_data') }}</p>
      <p class="text-xs text-text-tertiary mb-4">{{ error }}</p>
      <button class="btn-primary" @click="retry">{{ t('try_again') }}</button>
    </div>

    <template v-else>
      <!-- Stats Cards (Loading) -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonLoader v-for="i in 4" :key="i" type="card" />
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="users"
          :value="stats.totalStudents"
          :label="t('total_students_active')"
          :change="stats.totalStudentsChange"
          :change-positive="true"
          :delay="0"
        />
        <StatCard
          icon="book-open"
          :value="stats.lessonsThisWeek"
          :label="t('lessons_this_week')"
          :change="stats.lessonsThisWeekChange"
          :change-positive="true"
          :delay="100"
        />
        <StatCard
          icon="wallet"
          :value="formatCurrency(stats.monthlyIncome)"
          :label="t('income_this_month')"
          :change="stats.monthlyIncomeChange"
          :change-positive="true"
          :delay="200"
        />
        <StatCard
          icon="calendar"
          :value="stats.upcomingLessons"
          :label="t('lessons_today')"
          :change="stats.upcomingLabel"
          :change-positive="true"
          :delay="300"
        />
      </div>

      <!-- Today's Schedule + Recent Students -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Today's Schedule (3/5 width) -->
        <div class="lg:col-span-3 animate-fade-in" :style="{ animationDelay: '250ms', opacity: 0 }">
          <div class="flex items-center gap-2 mb-3.5">
            <Icon name="calendar" size="18" class="text-accent" />
            <h2 class="text-sm font-bold text-text-primary uppercase tracking-wider">{{ t('schedule_today') }}</h2>
          </div>

          <SkeletonLoader v-if="isLoading" type="table" :rows="4" :columns="4" />

          <div v-else class="space-y-3">
            <div
              v-for="lesson in todaySchedule"
              :key="lesson.id"
              class="lesson-card surface-card p-4 flex items-center gap-4 transition-all"
            >
              <!-- Time -->
              <div class="shrink-0 text-center min-w-[56px]">
                <span class="text-base font-bold text-text-primary font-mono tabular-nums block">{{ lesson.time }}</span>
                <span class="text-[10px] text-text-tertiary">{{ lesson.duration }}</span>
              </div>

              <!-- Divider -->
              <div
                class="w-0.5 h-10 rounded-full shrink-0"
                :class="{
                  'bg-profit': lesson.status === 'done',
                  'bg-accent': lesson.status === 'in-progress',
                  'bg-border-default': lesson.status === 'upcoming',
                }"
              />

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-text-primary truncate">{{ lesson.studentName }}</p>
                <p class="text-xs text-text-tertiary truncate">{{ lesson.subject }}</p>
              </div>

              <!-- Status / Action -->
              <div class="shrink-0">
                <span
                  v-if="lesson.status === 'done'"
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-profit/15 text-profit"
                >
                  {{ t('completed') }}
                </span>
                <span
                  v-else-if="lesson.status === 'in-progress'"
                  class="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/20 text-accent animate-pulse"
                >
                  {{ t('in_progress') }}
                </span>
                <button
                  v-else
                  class="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
                >
                  {{ t('start_lesson') }}
                </button>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="todaySchedule.length === 0" class="surface-card p-8 text-center">
              <Icon name="calendar" size="32" class="text-text-tertiary mx-auto mb-2 opacity-50" />
              <p class="text-sm text-text-secondary">{{ t('no_schedule_today') }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Students Progress (2/5 width) -->
        <div class="lg:col-span-2 animate-fade-in" :style="{ animationDelay: '350ms', opacity: 0 }">
          <div class="flex items-center gap-2 mb-3.5">
            <Icon name="trending-up" size="18" class="text-accent" />
            <h2 class="text-sm font-bold text-text-primary uppercase tracking-wider">{{ t('student_progress') }}</h2>
          </div>

          <SkeletonLoader v-if="isLoading" type="circle" />

          <div v-else class="space-y-3">
            <div
              v-for="student in recentStudents"
              :key="student.id"
              class="student-card surface-card p-4 transition-all"
            >
              <!-- Student header -->
              <div class="flex items-center gap-3 mb-3">
                <div class="w-9 h-9 rounded-xl bg-accent/10 text-accent font-bold text-xs flex items-center justify-center shrink-0 border border-accent/20">
                  {{ student.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-text-primary truncate">{{ student.name }}</p>
                  <p class="text-[11px] text-text-tertiary">{{ student.subject }} · {{ formatDate(student.lastLesson) }}</p>
                </div>
              </div>

              <!-- Progress bar -->
              <ProgressBar
                :value="student.overallProgress"
                :color="student.overallProgress >= 70 ? 'green' : student.overallProgress >= 50 ? 'amber' : 'red'"
                :height="4"
                :show-value="true"
                label="Progress keseluruhan"
              />

              <!-- Note -->
              <p class="text-[11px] text-text-tertiary mt-2.5 leading-relaxed">
                {{ student.progressNote }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="surface-card p-5 animate-fade-in" :style="{ animationDelay: '450ms', opacity: 0 }">
        <h2 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-3.5">{{ t('quick_actions') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <router-link
            to="/students"
            class="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold"
          >
            <Icon name="users" size="15" />
            <span>{{ t('manage_add_student') }}</span>
          </router-link>
          <router-link
            to="/lessons"
            class="btn-secondary flex items-center justify-center gap-2 py-2.5 text-xs font-medium"
          >
            <Icon name="calendar" size="15" />
            <span>{{ t('schedule_lesson') }}</span>
          </router-link>
          <router-link
            to="/income"
            class="btn-secondary flex items-center justify-center gap-2 py-2.5 text-xs font-medium"
          >
            <Icon name="wallet" size="15" />
            <span>{{ t('student_billing') }}</span>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'
import StatCard from '@/components/ui/StatCard.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { useTeacherDashboard } from '@/composables/useTeacherDashboard'
import { useI18n } from '@/composables/useI18n'

const { currentLang, t } = useI18n()

const {
  isLoading,
  error,
  stats,
  todaySchedule,
  recentStudents,
  retry,
} = useTeacherDashboard()

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(currentLang.value === 'de' ? 'de-DE' : 'id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(currentLang.value === 'de' ? 'de-DE' : 'id-ID', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.lesson-card:hover,
.student-card:hover {
  transform: translateY(-2px);
}
</style>
