<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📚</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manajemen Sesi Pembelajaran (Lessons)
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Pantau jadwal bimbingan, catat hasil belajar, tugas rumah, dan rekam pemahaman siswa.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <router-link
          to="/lesson-plans"
          class="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>📋 Template Lesson Plan</span>
        </router-link>

        <button
          type="button"
          @click="openAddLesson"
          class="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <Icon name="plus" :size="16" />
          <span>+ Catat Lesson</span>
        </button>
      </div>
    </div>

    <!-- 2. Overview Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div class="glass rounded-xl p-4 border border-slate-700/60">
        <span class="text-xl block mb-1">📅</span>
        <p class="text-2xl font-bold font-mono text-cyan-300">
          <AnimatedNumber :value="upcomingLessons.length" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Sesi Mendatang</p>
      </div>

      <div class="glass rounded-xl p-4 border border-slate-700/60">
        <span class="text-xl block mb-1">✅</span>
        <p class="text-2xl font-bold font-mono text-emerald-400">
          <AnimatedNumber :value="pastLessons.length" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Sesi Selesai</p>
      </div>

      <div class="glass rounded-xl p-4 border border-slate-700/60">
        <span class="text-xl block mb-1">⏰</span>
        <p class="text-2xl font-bold font-mono text-white">
          <AnimatedNumber :value="todayLessons.length" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Jadwal Hari Ini</p>
      </div>

      <div class="glass rounded-xl p-4 border border-slate-700/60">
        <span class="text-xl block mb-1">👥</span>
        <p class="text-2xl font-bold font-mono text-accent">
          <AnimatedNumber :value="students.length" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Total Siswa Aktif</p>
      </div>
    </div>

    <!-- 3. Filter Toolbar & View Switcher -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <!-- View Switcher -->
        <div class="flex bg-dark/80 p-1 rounded-xl border border-slate-700/60 text-xs mr-2">
          <button
            type="button"
            @click="viewMode = 'list'"
            class="px-3 py-1.5 rounded-lg transition-all"
            :class="viewMode === 'list' ? 'bg-accent text-dark font-bold' : 'text-slate-400 hover:text-white'"
          >
            📋 Daftar
          </button>
          <button
            type="button"
            @click="viewMode = 'calendar'"
            class="px-3 py-1.5 rounded-lg transition-all"
            :class="viewMode === 'calendar' ? 'bg-accent text-dark font-bold' : 'text-slate-400 hover:text-white'"
          >
            📅 Kalender
          </button>
        </div>

        <!-- Student Filter -->
        <select
          v-model="filterStudentId"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Siswa</option>
          <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>

        <!-- Status Filter -->
        <select
          v-model="filterStatus"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Status</option>
          <option value="scheduled">⏳ Terjadwal</option>
          <option value="completed">✅ Selesai</option>
        </select>
      </div>

      <!-- Search -->
      <div class="relative w-full md:w-64">
        <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Cari materi, topik, siswa..."
          class="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
        />
      </div>
    </div>

    <!-- 4. VIEW MODE: CALENDAR -->
    <div v-if="viewMode === 'calendar'" class="glass rounded-2xl p-5 border border-slate-700/60 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span>📅</span>
          <span>Kalender Sesi Bimbingan</span>
        </h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-7 gap-2">
        <div
          v-for="(dayName, idx) in daysOfWeek"
          :key="dayName"
          class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs min-h-[140px] space-y-2"
        >
          <div class="font-bold text-slate-300 pb-1 border-b border-slate-800 text-center">
            {{ dayName }}
          </div>

          <!-- Lessons occurring on this day of week -->
          <div class="space-y-1.5">
            <div
              v-for="lesson in getLessonsForDay(idx)"
              :key="lesson.id"
              @click="openEditLesson(lesson)"
              class="p-2 rounded-lg text-[11px] cursor-pointer transition-transform hover:-translate-y-0.5 border"
              :class="getLessonColor(lesson.student?.subjects[0] || '')"
            >
              <p class="font-bold truncate">{{ lesson.student?.name || 'Siswa' }}</p>
              <p class="text-[10px] opacity-80 truncate">{{ lesson.topic }}</p>
              <span class="font-mono text-[9px] opacity-70 block mt-0.5">
                {{ formatTime(lesson.datetime) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. VIEW MODE: LIST -->
    <div v-else class="space-y-8">
      <!-- Section: Upcoming Lessons -->
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">⏳</span>
            <h2 class="text-base font-bold text-white">Sesi Mendatang (Upcoming)</h2>
          </div>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300">
            {{ filteredUpcoming.length }} Sesi
          </span>
        </div>

        <div v-if="filteredUpcoming.length === 0" class="glass rounded-xl p-8 text-center text-slate-500 text-xs">
          Tidak ada sesi mendatang yang sesuai dengan filter.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="lesson in filteredUpcoming"
            :key="lesson.id"
            class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between gap-3 transition-all hover:border-accent/40"
          >
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-cyan-300 font-mono">
                  {{ formatDateTime(lesson.datetime) }} ({{ lesson.duration_minutes }} mnt)
                </span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {{ lesson.student?.grade || 'Privat' }}
                </span>
              </div>

              <h3 class="text-base font-bold text-white">{{ lesson.student?.name }}</h3>
              <p class="text-xs font-semibold text-accent">{{ lesson.topic }}</p>
              <p v-if="lesson.material_covered" class="text-xs text-slate-300 leading-relaxed">
                {{ lesson.material_covered }}
              </p>
            </div>

            <!-- Card Bottom -->
            <div class="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span class="text-[11px] text-slate-400">
                Mapel: <strong class="text-white">{{ lesson.student?.subjects.join(', ') }}</strong>
              </span>

              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="openCompleteLesson(lesson)"
                  class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition-colors"
                >
                  ✓ Catat Selesai
                </button>
                <button
                  type="button"
                  @click="openEditLesson(lesson)"
                  class="p-1.5 text-slate-400 hover:text-white"
                  title="Edit Sesi"
                >
                  <Icon name="edit" :size="14" />
                </button>
                <button
                  type="button"
                  @click="confirmDelete(lesson.id)"
                  class="p-1.5 text-slate-500 hover:text-rose-400"
                  title="Hapus Sesi"
                >
                  <Icon name="trash" :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Past Completed Lessons -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">✅</span>
            <h2 class="text-base font-bold text-white">Riwayat Selesai (Past Lessons)</h2>
          </div>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
            {{ filteredPast.length }} Sesi
          </span>
        </div>

        <div v-if="filteredPast.length === 0" class="glass rounded-xl p-8 text-center text-slate-500 text-xs">
          Belum ada riwayat sesi selesai.
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="lesson in filteredPast"
            :key="lesson.id"
            class="glass rounded-xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm">{{ lesson.student?.name }}</span>
                <span class="text-xs text-slate-400 font-mono">{{ formatDateTime(lesson.datetime) }}</span>
                <span
                  v-if="lesson.performance"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300"
                >
                  🌟 {{ lesson.performance }}
                </span>
              </div>

              <p class="text-xs text-cyan-300 font-medium">{{ lesson.topic }}</p>
              <p v-if="lesson.homework" class="text-[11px] text-amber-300">
                📝 PR: {{ lesson.homework }}
              </p>
            </div>

            <div class="flex items-center gap-2 self-end md:self-center">
              <button
                type="button"
                @click="openEditLesson(lesson)"
                class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Edit Catatan
              </button>
              <button
                type="button"
                @click="confirmDelete(lesson.id)"
                class="p-1.5 text-slate-500 hover:text-rose-400"
              >
                <Icon name="trash" :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Record / Edit Lesson -->
    <RecordLessonModal
      v-if="showModal"
      :lesson="selectedLesson"
      :students="students"
      @close="showModal = false; selectedLesson = null"
      @save="handleSaveLesson"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import Icon from '@/components/ui/Icon.vue'
import RecordLessonModal from '@/components/teacher/RecordLessonModal.vue'
import { useTeacher } from '@/composables/useTeacher'
import type { Lesson, LessonFormData } from '@/types'

const {
  students,
  lessonsWithStudent,
  upcomingLessons,
  todayLessons,
  pastLessons,
  fetchTeacherData,
  createLesson,
  updateLesson,
  deleteLesson,
} = useTeacher()

const viewMode = ref<'list' | 'calendar'>('list')
const filterStudentId = ref('all')
const filterStatus = ref('all')
const searchKeyword = ref('')

const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

// Modals
const showModal = ref(false)
const selectedLesson = ref<Lesson | null>(null)

const filteredLessons = computed(() => {
  return lessonsWithStudent.value.filter(l => {
    if (filterStudentId.value !== 'all' && l.student_id !== filterStudentId.value) return false
    if (filterStatus.value !== 'all' && l.status !== filterStatus.value) return false
    if (searchKeyword.value.trim()) {
      const q = searchKeyword.value.toLowerCase().trim()
      const matchTopic = l.topic?.toLowerCase().includes(q)
      const matchStudent = l.student?.name.toLowerCase().includes(q)
      const matchCovered = l.material_covered?.toLowerCase().includes(q)
      if (!matchTopic && !matchStudent && !matchCovered) return false
    }
    return true
  })
})

const filteredUpcoming = computed(() => {
  const now = new Date().toISOString()
  return filteredLessons.value
    .filter(l => l.status === 'scheduled' && l.datetime >= now)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
})

const filteredPast = computed(() => {
  const now = new Date().toISOString()
  return filteredLessons.value
    .filter(l => l.status === 'completed' || l.datetime < now)
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
})

function getLessonsForDay(dayIndex: number) {
  return lessonsWithStudent.value.filter(l => {
    const d = new Date(l.datetime)
    return d.getDay() === dayIndex
  })
}

function getLessonColor(subject: string) {
  if (subject.includes('Matematika')) return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
  if (subject.includes('Fisika')) return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
  if (subject.includes('Kimia')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  if (subject.includes('Inggris')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  return 'bg-purple-500/15 text-purple-300 border-purple-500/30'
}

function openAddLesson() {
  selectedLesson.value = null
  showModal.value = true
}

function openEditLesson(l: Lesson) {
  selectedLesson.value = l
  showModal.value = true
}

function openCompleteLesson(l: Lesson) {
  selectedLesson.value = { ...l, status: 'completed' }
  showModal.value = true
}

async function handleSaveLesson(formData: LessonFormData) {
  if (selectedLesson.value) {
    await updateLesson(selectedLesson.value.id, formData)
  } else {
    await createLesson(formData)
  }
  showModal.value = false
  selectedLesson.value = null
}

async function confirmDelete(id: string) {
  if (confirm('Hapus sesi pembelajaran ini?')) {
    await deleteLesson(id)
  }
}

function formatDateTime(datetimeStr: string) {
  const d = new Date(datetimeStr)
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(datetimeStr: string) {
  const d = new Date(datetimeStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchTeacherData()
})
</script>
