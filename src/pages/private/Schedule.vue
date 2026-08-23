<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">🗓️</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Jadwal Mengajar Mingguan (Schedule)
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Atur jam kerja, pantau bentrok jadwal, dan jadwalkan sesi les siswa.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="showAvailabilityModal = true"
          class="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>⚙️ Pengaturan Jam & Libur</span>
        </button>

        <button
          type="button"
          @click="openAddLesson"
          class="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <Icon name="plus" :size="16" />
          <span>+ Jadwalkan Sesi</span>
        </button>
      </div>
    </div>

    <!-- 2. Conflict Warning Alert -->
    <div
      v-if="scheduleConflicts.length > 0"
      class="glass rounded-2xl p-4 border border-rose-500/50 bg-rose-500/10 space-y-2 animate-fade-in"
    >
      <div class="flex items-center gap-2 text-rose-400 font-bold text-sm">
        <span class="text-lg">⚠️</span>
        <span>Terdeteksi {{ scheduleConflicts.length }} Bentrok Jadwal (Schedule Conflict)</span>
      </div>
      <div class="space-y-1.5 pl-6">
        <div
          v-for="(cf, idx) in scheduleConflicts"
          :key="idx"
          class="text-xs text-rose-200 flex items-center justify-between"
        >
          <span>• {{ cf.message }}</span>
          <button
            type="button"
            @click="openEditLesson(cf.lessonB)"
            class="text-[11px] underline text-rose-300 hover:text-white ml-2"
          >
            Ubah Jadwal Siswa B
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Week Navigation Toolbar -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="prevWeek"
          class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <Icon name="chevron-left" :size="16" />
        </button>
        <button
          type="button"
          @click="nextWeek"
          class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <Icon name="chevron-right" :size="16" />
        </button>
        <button
          type="button"
          @click="resetToCurrentWeek"
          class="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white ml-1"
        >
          Minggu Ini
        </button>
      </div>

      <div class="text-xs sm:text-sm font-bold text-white">
        {{ formattedWeekRange }}
      </div>

      <!-- Buffer Info -->
      <div class="hidden sm:flex items-center gap-2 text-xs text-slate-400">
        <span>⏱️ Buffer Istirahat:</span>
        <span class="font-bold text-cyan-300">{{ bufferMinutes }} Menit</span>
      </div>
    </div>

    <!-- 4. Weekly Timetable Grid (Monday - Sunday, 08:00 - 22:00) -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 overflow-x-auto">
      <div class="min-w-[760px]">
        <!-- Days Header -->
        <div class="grid grid-cols-8 gap-2 pb-3 border-b border-slate-800 text-center">
          <div class="text-xs font-bold text-slate-500">Jam</div>
          <div
            v-for="day in weekDays"
            :key="day.dateStr"
            class="p-2 rounded-xl"
            :class="day.isToday ? 'bg-accent/15 border border-accent/30 text-accent font-bold' : 'text-slate-300'"
          >
            <p class="text-xs font-bold">{{ day.dayName }}</p>
            <p class="text-[10px] opacity-80">{{ day.dateNum }} {{ day.monthShort }}</p>
          </div>
        </div>

        <!-- Time Slots Rows -->
        <div class="space-y-1.5 pt-2">
          <div
            v-for="hour in timeHours"
            :key="hour"
            class="grid grid-cols-8 gap-2 items-start min-h-[58px]"
          >
            <!-- Hour Label -->
            <div class="text-[11px] font-mono text-slate-500 text-center pt-2">
              {{ String(hour).padStart(2, '0') }}:00
            </div>

            <!-- Day Columns -->
            <div
              v-for="day in weekDays"
              :key="day.dateStr"
              @click="handleSlotClick(day.dateStr, hour)"
              class="h-full rounded-xl p-1 bg-slate-900/40 border border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700 cursor-pointer transition-colors relative group"
            >
              <!-- Lessons in this slot -->
              <div
                v-for="l in getLessonsForSlot(day.dateStr, hour)"
                :key="l.id"
                @click.stop="openEditLesson(l)"
                class="p-1.5 rounded-lg text-[10px] mb-1 transition-transform hover:scale-102 border cursor-pointer"
                :class="getLessonColor(l.student?.subjects[0] || '')"
              >
                <div class="font-bold truncate">{{ l.student?.name || 'Siswa' }}</div>
                <div class="text-[9px] opacity-85 truncate">{{ l.topic }}</div>
                <div class="text-[8px] font-mono opacity-75 mt-0.5">
                  {{ formatTime(l.datetime) }} ({{ l.duration_minutes }}m)
                </div>
              </div>

              <!-- Hover Plus Indicator -->
              <div class="hidden group-hover:flex items-center justify-center h-full text-slate-600 text-xs font-bold">
                +
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Record / Edit Lesson Modal -->
    <RecordLessonModal
      v-if="showLessonModal"
      :lesson="selectedLesson"
      :students="students"
      @close="showLessonModal = false; selectedLesson = null"
      @save="handleSaveLesson"
    />

    <!-- Availability & Blockout Settings Modal -->
    <div
      v-if="showAvailabilityModal"
      class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      @click="showAvailabilityModal = false"
    >
      <div class="bg-surface border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4" @click.stop>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>Pengaturan Ketersediaan Guru</span>
        </h3>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-300 font-semibold mb-1">Jeda Waktu Antar Sesi (Buffer Time)</label>
            <select
              v-model.number="bufferMinutes"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option :value="0">0 Menit (Langsung)</option>
              <option :value="15">15 Menit (Standar)</option>
              <option :value="30">30 Menit (Istirahat Nyaman)</option>
            </select>
          </div>

          <div>
            <label class="block text-slate-300 font-semibold mb-1">Rentang Jam Kerja Mengajar</label>
            <div class="flex items-center gap-2">
              <input type="time" value="08:00" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <span>s/d</span>
              <input type="time" value="21:30" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
          </div>

          <div>
            <label class="block text-slate-300 font-semibold mb-1">Hari Libur Mingguan Tetap</label>
            <div class="flex flex-wrap gap-2 pt-1">
              <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Minggu</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            @click="showAvailabilityModal = false"
            class="btn-primary px-4 py-2 text-xs font-bold rounded-xl"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import RecordLessonModal from '@/components/teacher/RecordLessonModal.vue'
import { useTeacher } from '@/composables/useTeacher'
import type { Lesson, LessonFormData } from '@/types'

const {
  students,
  lessonsWithStudent,
  scheduleConflicts,
  fetchTeacherData,
  createLesson,
  updateLesson,
} = useTeacher()

const currentWeekOffset = ref(0)
const bufferMinutes = ref(15)
const timeHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]

// Modals
const showLessonModal = ref(false)
const selectedLesson = ref<Lesson | null>(null)
const showAvailabilityModal = ref(false)

const weekDays = computed(() => {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay // Start on Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset + (currentWeekOffset.value * 7))

  const daysNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  const todayStr = new Date().toISOString().split('T')[0]

  return daysNames.map((name, idx) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + idx)
    const dateStr = d.toISOString().split('T')[0]
    return {
      dayName: name,
      dateStr,
      dateNum: d.getDate(),
      monthShort: d.toLocaleDateString('id-ID', { month: 'short' }),
      isToday: dateStr === todayStr,
    }
  })
})

const formattedWeekRange = computed(() => {
  if (weekDays.value.length === 0) return ''
  const first = weekDays.value[0]
  const last = weekDays.value[6]
  return `${first.dateNum} ${first.monthShort} - ${last.dateNum} ${last.monthShort}`
})

function prevWeek() {
  currentWeekOffset.value--
}

function nextWeek() {
  currentWeekOffset.value++
}

function resetToCurrentWeek() {
  currentWeekOffset.value = 0
}

function getLessonsForSlot(dateStr: string, hour: number) {
  return lessonsWithStudent.value.filter(l => {
    if (!l.datetime.startsWith(dateStr)) return false
    const d = new Date(l.datetime)
    return d.getHours() === hour
  })
}

function getLessonColor(subject: string) {
  if (subject.includes('Matematika')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
  if (subject.includes('Fisika')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
  if (subject.includes('Kimia')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  if (subject.includes('Inggris')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
}

function handleSlotClick(dateStr: string, hour: number) {
  const d = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`)
  selectedLesson.value = {
    id: '',
    space_id: '',
    student_id: students.value[0]?.id || '',
    datetime: d.toISOString(),
    duration_minutes: 90,
    topic: '',
    status: 'scheduled',
    created_at: new Date().toISOString(),
  }
  showLessonModal.value = true
}

function openAddLesson() {
  selectedLesson.value = null
  showLessonModal.value = true
}

function openEditLesson(l: Lesson) {
  selectedLesson.value = l
  showLessonModal.value = true
}

async function handleSaveLesson(formData: LessonFormData) {
  if (selectedLesson.value && selectedLesson.value.id) {
    await updateLesson(selectedLesson.value.id, formData)
  } else {
    await createLesson(formData)
  }
  showLessonModal.value = false
  selectedLesson.value = null
}

function formatTime(datetimeStr: string) {
  const d = new Date(datetimeStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchTeacherData()
})
</script>
