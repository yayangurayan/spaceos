<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">👥</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Data Siswa Bimbingan
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Kelola profil siswa, mata pelajaran, jadwal bimbingan rutin, dan riwayat SPP.
        </p>
      </div>

      <!-- Header Action -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="openAddModal"
          class="btn-primary flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <Icon name="plus" :size="16" />
          <span>Tambah Siswa Baru</span>
        </button>
      </div>
    </div>

    <!-- 2. Overview Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Students -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">👨‍🎓</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Total</span>
        </div>
        <p class="text-2xl font-bold font-mono text-white">
          <AnimatedNumber :value="teacherStats.totalStudents" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Semua Siswa Terdaftar</p>
      </div>

      <!-- Active Students -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">🟢</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Aktif</span>
        </div>
        <p class="text-2xl font-bold font-mono text-emerald-400">
          <AnimatedNumber :value="teacherStats.activeStudents" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Siswa Sedang Bimbingan</p>
      </div>

      <!-- Lessons This Week -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">📚</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">Minggu Ini</span>
        </div>
        <p class="text-2xl font-bold font-mono text-cyan-300">
          <AnimatedNumber :value="teacherStats.lessonsThisWeek" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Total Sesi Terjadwal</p>
      </div>

      <!-- Potential Monthly Revenue -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">💰</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Potensi SPP</span>
        </div>
        <p class="text-lg sm:text-xl font-bold font-mono text-accent truncate">
          {{ formatCompactCurrency(potentialMonthlyRevenue) }}
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Estimasi Pendapatan/Bulan</p>
      </div>
    </div>

    <!-- 3. Search, Filter & Sort Toolbar -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <!-- Status Filter -->
        <select
          v-model="selectedStatus"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Status</option>
          <option value="active">🟢 Aktif</option>
          <option value="paused">⏸️ Cuti</option>
          <option value="graduated">🎓 Lulus</option>
        </select>

        <!-- Subject Filter -->
        <select
          v-model="selectedSubject"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Mapel</option>
          <option v-for="sub in availableSubjects" :key="sub" :value="sub">{{ sub }}</option>
        </select>

        <!-- Grade Filter -->
        <select
          v-model="selectedGrade"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Jenjang</option>
          <option v-for="g in availableGrades" :key="g" :value="g">{{ g }}</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="name_asc">Nama (A - Z)</option>
          <option value="fee_desc">SPP Tertinggi</option>
          <option value="recent">Terbaru Ditambahkan</option>
        </select>
      </div>

      <!-- Search Bar -->
      <div class="relative w-full md:w-64">
        <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama siswa, orang tua, no HP..."
          class="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
        />
      </div>
    </div>

    <!-- 4. Students Cards Grid -->
    <div v-if="sortedStudents.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block mb-1">👨‍🎓</span>
      <h3 class="text-base font-bold text-white">Tidak ada data siswa yang cocok</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        Coba sesuaikan kata kunci pencarian atau filter mata pelajaran kamu.
      </p>
      <button
        type="button"
        @click="openAddModal"
        class="btn-primary mt-2 px-5 py-2 text-xs font-bold rounded-xl"
      >
        + Daftarkan Siswa Baru
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <StudentCard
        v-for="st in sortedStudents"
        :key="st.id"
        :student="st"
        @view-detail="navigateToDetail"
        @edit="openEditModal"
        @schedule-lesson="openScheduleLessonModal"
        @delete="confirmDelete"
      />
    </div>

    <!-- Modals -->
    <!-- 1. Add / Edit Student Modal -->
    <StudentFormModal
      v-if="showStudentModal"
      :student="selectedStudent"
      @close="closeStudentModal"
      @save="handleSaveStudent"
    />

    <!-- 2. Schedule Lesson Modal -->
    <RecordLessonModal
      v-if="showLessonModal"
      :lesson="null"
      :students="students"
      :preselected-student-id="scheduleStudentId"
      @close="closeLessonModal"
      @save="handleSaveLesson"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import Icon from '@/components/ui/Icon.vue'
import StudentCard from '@/components/teacher/StudentCard.vue'
import StudentFormModal from '@/components/teacher/StudentFormModal.vue'
import RecordLessonModal from '@/components/teacher/RecordLessonModal.vue'
import { useTeacher, TEACHER_SUBJECTS, GRADE_LEVELS } from '@/composables/useTeacher'
import type { Student, StudentFormData, LessonFormData } from '@/types'

const router = useRouter()

const {
  students,
  filteredStudents,
  teacherStats,
  searchQuery,
  selectedSubject,
  selectedGrade,
  selectedStatus,
  fetchTeacherData,
  createStudent,
  updateStudent,
  deleteStudent,
  createLesson,
} = useTeacher()

const availableSubjects = TEACHER_SUBJECTS
const availableGrades = GRADE_LEVELS
const sortBy = ref<'name_asc' | 'fee_desc' | 'recent'>('name_asc')

// Modal States
const showStudentModal = ref(false)
const selectedStudent = ref<Student | null>(null)

const showLessonModal = ref(false)
const scheduleStudentId = ref<string>('')

const potentialMonthlyRevenue = computed(() => {
  return students.value
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (Number(s.monthly_fee) || 0), 0)
})

const sortedStudents = computed(() => {
  const list = [...filteredStudents.value]
  if (sortBy.value === 'name_asc') {
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }
  if (sortBy.value === 'fee_desc') {
    return list.sort((a, b) => (b.monthly_fee || 0) - (a.monthly_fee || 0))
  }
  if (sortBy.value === 'recent') {
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  return list
})

function openAddModal() {
  selectedStudent.value = null
  showStudentModal.value = true
}

function openEditModal(st: Student) {
  selectedStudent.value = st
  showStudentModal.value = true
}

function closeStudentModal() {
  showStudentModal.value = false
  selectedStudent.value = null
}

async function handleSaveStudent(formData: StudentFormData) {
  if (selectedStudent.value) {
    const res = await updateStudent(selectedStudent.value.id, formData)
    if (res.success) closeStudentModal()
  } else {
    const res = await createStudent(formData)
    if (res.success) closeStudentModal()
  }
}

function openScheduleLessonModal(st: Student) {
  scheduleStudentId.value = st.id
  showLessonModal.value = true
}

function closeLessonModal() {
  showLessonModal.value = false
  scheduleStudentId.value = ''
}

async function handleSaveLesson(formData: LessonFormData) {
  const res = await createLesson(formData)
  if (res.success) closeLessonModal()
}

function navigateToDetail(st: Student) {
  router.push(`/students/${st.id}`)
}

async function confirmDelete(id: string) {
  const st = students.value.find(s => s.id === id)
  if (confirm(`Hapus data siswa "${st?.name || 'ini'}" beserta seluruh riwayatnya?`)) {
    await deleteStudent(id)
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
  fetchTeacherData()
})
</script>
