<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center gap-2">
          <span>🎓</span>
          <span>{{ t('dashboard_teacher_title') }}</span>
        </h1>
        <p class="text-slate-400 text-xs sm:text-sm">{{ t('dashboard_teacher_desc') }}</p>
      </div>

      <router-link
        to="/students"
        class="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
      >
        <span>➕ {{ t('add_new_student') }}</span>
      </router-link>
    </div>

    <!-- Error State -->
    <div v-if="error" class="glass rounded-xl p-8 text-center animate-fade-in">
      <span class="text-4xl block mb-3">⚠️</span>
      <p class="text-white font-medium mb-1">{{ t('failed_load_data') }}</p>
      <p class="text-sm text-slate-400 mb-4">{{ error }}</p>
      <button class="btn-primary" @click="retry">{{ t('try_again') }}</button>
    </div>

    <template v-else>
      <!-- Stats Cards (Loading) -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SkeletonLoader v-for="i in 4" :key="i" type="card" />
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="👥"
          :value="stats.totalStudents"
          :label="t('total_students_active')"
          :change="stats.totalStudentsChange"
          :change-positive="true"
          :delay="0"
        />
        <StatCard
          icon="📚"
          :value="stats.lessonsThisWeek"
          :label="t('lessons_this_week')"
          :change="stats.lessonsThisWeekChange"
          :change-positive="true"
          :delay="100"
        />
        <StatCard
          icon="💰"
          :value="formatCurrency(stats.monthlyIncome)"
          :label="t('income_this_month')"
          :change="stats.monthlyIncomeChange"
          :change-positive="true"
          :delay="200"
        />
        <StatCard
          icon="📅"
          :value="stats.upcomingLessons"
          :label="t('lessons_today')"
          :change="stats.upcomingLabel"
          :change-positive="true"
          :delay="300"
        />
      </div>

      <!-- Today's Schedule + Recent Students -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <!-- Today's Schedule (3/5 width) -->
        <div class="lg:col-span-3 animate-fade-in" :style="{ animationDelay: '350ms', opacity: 0 }">
          <h2 class="text-lg font-semibold text-white mb-4">📅 {{ t('schedule_today') }}</h2>

          <SkeletonLoader v-if="isLoading" type="table" :rows="4" :columns="4" />

          <div v-else class="space-y-3">
            <div
              v-for="lesson in todaySchedule"
              :key="lesson.id"
              class="lesson-card glass rounded-xl p-4 flex items-center gap-4"
            >
              <!-- Time -->
              <div class="shrink-0 text-center">
                <span class="text-lg font-bold text-white font-mono block">{{ lesson.time }}</span>
                <span class="text-[10px] text-slate-500">{{ lesson.duration }}</span>
              </div>

              <!-- Divider -->
              <div
                class="w-0.5 h-10 rounded-full shrink-0"
                :class="{
                  'bg-emerald-500': lesson.status === 'done',
                  'bg-accent': lesson.status === 'in-progress',
                  'bg-slate-600': lesson.status === 'upcoming',
                }"
              />

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ lesson.studentName }}</p>
                <p class="text-xs text-slate-400 truncate">{{ lesson.subject }}</p>
              </div>

              <!-- Status / Action -->
              <div class="shrink-0">
                <span
                  v-if="lesson.status === 'done'"
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400"
                >
                  ✓ {{ t('completed') }}
                </span>
                <button
                  v-else-if="lesson.status === 'in-progress'"
                  class="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/20 text-accent animate-pulse"
                >
                  🔴 {{ t('in_progress') }}
                </button>
                <button
                  v-else
                  class="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/20 text-sky-400 hover:bg-primary/30 transition-colors"
                >
                  {{ t('start_lesson') }}
                </button>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="todaySchedule.length === 0" class="glass rounded-xl p-8 text-center">
              <span class="text-3xl block mb-2">🎉</span>
              <p class="text-sm text-slate-400">{{ t('no_schedule_today') }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Students Progress (2/5 width) -->
        <div class="lg:col-span-2 animate-fade-in" :style="{ animationDelay: '450ms', opacity: 0 }">
          <h2 class="text-lg font-semibold text-white mb-4">📈 {{ t('student_progress') }}</h2>

          <SkeletonLoader v-if="isLoading" type="circle" />

          <div v-else class="space-y-3">
            <div
              v-for="student in recentStudents"
              :key="student.id"
              class="student-card glass rounded-xl p-4"
            >
              <!-- Student header -->
              <div class="flex items-center gap-3 mb-3">
                <span class="text-2xl">{{ student.avatar }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-white truncate">{{ student.name }}</p>
                  <p class="text-[11px] text-slate-500">{{ student.subject }} · {{ formatDate(student.lastLesson) }}</p>
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
              <p class="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                {{ student.progressNote }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="animate-fade-in" :style="{ animationDelay: '550ms', opacity: 0 }">
        <h2 class="text-lg font-semibold text-white mb-4">{{ t('quick_actions') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <router-link
            to="/students"
            class="btn-primary flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-lg shadow-cyan-500/10"
          >
            <span class="text-lg">👤</span>
            <span>{{ t('manage_add_student') }}</span>
          </router-link>
          <router-link
            to="/lessons"
            class="glass rounded-lg py-3 px-5 text-sm font-medium text-slate-300 hover:text-white hover:border-accent/30 transition-all duration-150 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span class="text-lg">📅</span>
            <span>{{ t('schedule_lesson') }}</span>
          </router-link>
          <router-link
            to="/income"
            class="glass rounded-lg py-3 px-5 text-sm font-medium text-slate-300 hover:text-white hover:border-accent/30 transition-all duration-150 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span class="text-lg">💵</span>
            <span>{{ t('student_billing') }}</span>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
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
.lesson-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.lesson-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.25);
}

.student-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.25);
}
</style>
