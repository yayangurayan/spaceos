<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Back Button -->
    <div>
      <router-link
        to="/students"
        class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <Icon name="arrow-left" :size="16" />
        <span>Kembali ke Daftar Siswa</span>
      </router-link>
    </div>

    <!-- Loading / Not Found State -->
    <div v-if="!student && !isLoading" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block">🔍</span>
      <h3 class="text-base font-bold text-white">Siswa tidak ditemukan</h3>
      <p class="text-xs text-slate-500">
        Data siswa mungkin telah dihapus atau URL tidak valid.
      </p>
      <router-link to="/students" class="btn-primary inline-block px-5 py-2 text-xs font-bold rounded-xl mt-2">
        Lihat Semua Siswa
      </router-link>
    </div>

    <template v-else-if="student">
      <!-- 1. Header Profile Banner -->
      <div class="glass rounded-2xl p-6 border border-slate-700/60 bg-gradient-to-r from-slate-900/80 to-slate-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <!-- Student Info -->
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-xl border border-white/10 flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-700 text-white"
          >
            {{ getInitials(student.name) }}
          </div>

          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-xl sm:text-2xl font-extrabold text-white">
                {{ student.name }}
              </h1>
              <span
                class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize"
                :class="statusBadgeClasses"
              >
                {{ student.status }}
              </span>
            </div>

            <p class="text-xs text-slate-300 mt-1">
              {{ student.grade || 'Umum / Les Privat' }} · Bergabung sejak {{ formatDate(student.start_date) }}
            </p>

            <div class="flex flex-wrap gap-1.5 mt-2.5">
              <span
                v-for="sub in student.subjects"
                :key="sub"
                class="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700/60"
              >
                {{ sub }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Header Actions -->
        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            @click="openRecordLesson"
            class="btn-primary flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/10"
          >
            <Icon name="plus" :size="14" />
            <span>Catat / Jadwal Lesson</span>
          </button>

          <button
            type="button"
            @click="openRecordPayment"
            class="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>💰 Catat SPP</span>
          </button>

          <button
            v-if="student.parent_contact?.phone"
            type="button"
            @click="openWhatsApp"
            class="px-3 py-2 rounded-xl bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            title="Kirim pesan WhatsApp ke orang tua"
          >
            <span>💬 WA Ortu</span>
          </button>

          <button
            type="button"
            @click="openEditStudent"
            class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Edit Profil Siswa"
          >
            <Icon name="edit" :size="16" />
          </button>
        </div>
      </div>

      <!-- 2. Mini Stats Row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div class="glass rounded-xl p-4 border border-slate-700/60">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Total Sesi Selesai</span>
          <span class="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {{ completedStudentLessons.length }} Sesi
          </span>
        </div>

        <div class="glass rounded-xl p-4 border border-slate-700/60">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Biaya SPP / Bulan</span>
          <span class="text-xl font-bold font-mono text-white mt-1 block">
            {{ formatCurrency(student.monthly_fee) }}
          </span>
        </div>

        <div class="glass rounded-xl p-4 border border-slate-700/60">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Jadwal Terdekat</span>
          <span class="text-xs font-semibold text-cyan-300 mt-2 block truncate">
            {{ nextLessonFormatted }}
          </span>
        </div>

        <div class="glass rounded-xl p-4 border border-slate-700/60">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Status SPP Bulan Ini</span>
          <span
            class="text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-2"
            :class="currentMonthPaymentStatusClasses"
          >
            {{ currentMonthPaymentStatus }}
          </span>
        </div>
      </div>

      <!-- 3. Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          @click="activeTab = 'overview'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
          :class="activeTab === 'overview'
            ? 'bg-accent text-dark font-bold shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>👤</span>
          <span>Overview</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'lessons'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
          :class="activeTab === 'lessons'
            ? 'bg-accent text-dark font-bold shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>📚</span>
          <span>Riwayat Lesson ({{ studentLessons.length }})</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'progress'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
          :class="activeTab === 'progress'
            ? 'bg-accent text-dark font-bold shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>📈</span>
          <span>Progress & Evaluasi</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'payments'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
          :class="activeTab === 'payments'
            ? 'bg-accent text-dark font-bold shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>💵</span>
          <span>Tagihan & SPP ({{ studentPayments.length }})</span>
        </button>
      </div>

      <!-- 4. TAB CONTENTS -->
      <!-- TAB A: OVERVIEW -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        <!-- Recurring Schedule -->
        <div class="glass rounded-2xl p-5 border border-slate-700/60 space-y-3">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <span>🗓️</span>
            <span>Jadwal Bimbingan Tetap</span>
          </h3>

          <div v-if="!student.schedule || student.schedule.length === 0" class="text-xs text-slate-500 italic p-3">
            Belum ada jadwal tetap yang diatur.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(slot, idx) in student.schedule"
              :key="idx"
              class="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
            >
              <span class="font-bold text-white">{{ slot.day }}</span>
              <span class="font-mono text-cyan-300">{{ slot.start_time }} - {{ slot.end_time }} ({{ slot.duration || 90 }} mnt)</span>
            </div>
          </div>
        </div>

        <!-- Parent Contact Info -->
        <div class="glass rounded-2xl p-5 border border-slate-700/60 space-y-3">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <span>👨‍👩‍👦</span>
            <span>Kontak Orang Tua / Wali</span>
          </h3>

          <div class="space-y-2.5 text-xs">
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-slate-400">Nama Wali:</span>
              <span class="font-bold text-white">{{ student.parent_contact?.name || '-' }}</span>
            </div>

            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-slate-400">No. WhatsApp / HP:</span>
              <span class="font-mono font-bold text-cyan-400">{{ student.parent_contact?.phone || '-' }}</span>
            </div>

            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-slate-400">Email:</span>
              <span class="text-slate-300">{{ student.parent_contact?.email || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Learning Style & Notes -->
        <div class="glass rounded-2xl p-5 border border-slate-700/60 space-y-3 md:col-span-2">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <span>📝</span>
            <span>Catatan Pembelajaran & Karakter Siswa</span>
          </h3>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            {{ student.notes || 'Belum ada catatan khusus untuk siswa ini.' }}
          </div>
        </div>
      </div>

      <!-- TAB B: LESSONS HISTORY -->
      <div v-else-if="activeTab === 'lessons'" class="space-y-4 animate-fade-in">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white">Daftar Sesi Pembelajaran</h3>
          <button
            type="button"
            @click="openRecordLesson"
            class="btn-primary px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Icon name="plus" :size="13" />
            <span>+ Jadwalkan Lesson</span>
          </button>
        </div>

        <div v-if="studentLessons.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <span class="text-3xl block">📚</span>
          <p class="text-sm font-bold text-white">Belum ada riwayat sesi les</p>
          <p class="text-xs text-slate-500">Mulai jadwalkan sesi pertama untuk siswa ini.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="lesson in studentLessons"
            :key="lesson.id"
            class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                  :class="lesson.status === 'completed'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'"
                >
                  {{ lesson.status === 'completed' ? '✓ Selesai' : '⏳ Terjadwal' }}
                </span>
                <span class="text-xs text-slate-400 font-mono">{{ formatDateTime(lesson.datetime) }}</span>
                <span class="text-xs text-slate-500 font-mono">({{ lesson.duration_minutes }} menit)</span>
              </div>

              <h4 class="text-sm font-bold text-white">{{ lesson.topic }}</h4>
              <p v-if="lesson.material_covered" class="text-xs text-slate-300">{{ lesson.material_covered }}</p>
              <p v-if="lesson.homework" class="text-[11px] text-amber-300">
                📝 PR: {{ lesson.homework }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 self-end md:self-center">
              <button
                type="button"
                @click="openEditLesson(lesson)"
                class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                @click="confirmDeleteLesson(lesson.id)"
                class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                title="Hapus sesi ini"
              >
                <Icon name="trash" :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB C: PROGRESS & ACHIEVEMENTS -->
      <div v-else-if="activeTab === 'progress'" class="space-y-4 animate-fade-in">
        <div class="glass rounded-2xl p-5 border border-slate-700/60 space-y-4">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <span>🌟</span>
            <span>Evaluasi Pemahaman per Sesi</span>
          </h3>

          <div v-if="completedStudentLessons.length === 0" class="text-xs text-slate-500 italic p-4 text-center">
            Belum ada sesi selesai yang dievaluasi.
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="lesson in completedStudentLessons"
              :key="lesson.id"
              class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-white">{{ lesson.topic }}</span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="lesson.performance === 'Excellent'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : lesson.performance === 'Good'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-amber-500/20 text-amber-300'"
                >
                  {{ lesson.performance }}
                </span>
              </div>
              <p v-if="lesson.next_lesson_notes" class="text-slate-400 text-[11px]">
                💡 Catatan tindak lanjut: {{ lesson.next_lesson_notes }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB D: PAYMENTS & SPP -->
      <div v-else-if="activeTab === 'payments'" class="space-y-4 animate-fade-in">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white">Riwayat Tagihan & Pembayaran SPP</h3>
          <button
            type="button"
            @click="openRecordPayment"
            class="btn-primary px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <span>+ Catat Pembayaran</span>
          </button>
        </div>

        <div v-if="studentPayments.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <span class="text-3xl block">💵</span>
          <p class="text-sm font-bold text-white">Belum ada catatan tagihan atau pembayaran</p>
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="pay in studentPayments"
            :key="pay.id"
            class="glass rounded-xl p-4 border border-slate-700/60 flex items-center justify-between gap-4"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm">
                  Periode {{ getMonthName(pay.month) }} {{ pay.year }}
                </span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                  :class="pay.status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : pay.status === 'overdue'
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'bg-amber-500/20 text-amber-400'"
                >
                  {{ pay.status }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ pay.category }} · {{ pay.payment_method }}
                <span v-if="pay.paid_date" class="text-emerald-400 ml-2">Lunas tgl {{ formatDate(pay.paid_date) }}</span>
              </p>
            </div>

            <div class="flex items-center gap-3">
              <span class="font-mono font-bold text-emerald-400 text-sm">
                {{ formatCurrency(pay.amount) }}
              </span>

              <button
                type="button"
                @click="openEditPayment(pay)"
                class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <StudentFormModal
      v-if="showEditModal && student"
      :student="student"
      @close="showEditModal = false"
      @save="handleSaveStudent"
    />

    <RecordLessonModal
      v-if="showLessonModal && student"
      :lesson="selectedLesson"
      :students="students"
      :preselected-student-id="student.id"
      @close="showLessonModal = false; selectedLesson = null"
      @save="handleSaveLesson"
    />

    <RecordPaymentModal
      v-if="showPaymentModal && student"
      :payment="selectedPayment"
      :students="students"
      :preselected-student-id="student.id"
      @close="showPaymentModal = false; selectedPayment = null"
      @save="handleSavePayment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import StudentFormModal from '@/components/teacher/StudentFormModal.vue'
import RecordLessonModal from '@/components/teacher/RecordLessonModal.vue'
import RecordPaymentModal from '@/components/teacher/RecordPaymentModal.vue'
import { useTeacher } from '@/composables/useTeacher'
import type { StudentFormData, Lesson, LessonFormData, TeacherPayment, PaymentFormData } from '@/types'

const route = useRoute()
const studentId = computed(() => route.params.id as string)

const {
  students,
  lessons,
  payments,
  isLoading,
  fetchTeacherData,
  updateStudent,
  createLesson,
  updateLesson,
  deleteLesson,
  createPayment,
  updatePayment,
  generateWhatsAppReminder,
} = useTeacher()

const activeTab = ref<'overview' | 'lessons' | 'progress' | 'payments'>('overview')

const student = computed(() => {
  return students.value.find(s => s.id === studentId.value)
})

const studentLessons = computed(() => {
  return lessons.value
    .filter(l => l.student_id === studentId.value)
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
})

const completedStudentLessons = computed(() => {
  return studentLessons.value.filter(l => l.status === 'completed')
})

const studentPayments = computed(() => {
  return payments.value.filter(p => p.student_id === studentId.value)
})

const nextLessonFormatted = computed(() => {
  const now = new Date().toISOString()
  const up = studentLessons.value
    .filter(l => l.status === 'scheduled' && l.datetime >= now)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0]

  return up ? formatDateTime(up.datetime) : 'Belum dijadwalkan'
})

const currentMonthPaymentStatus = computed(() => {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const p = studentPayments.value.find(pay => pay.month === currentMonth && pay.year === currentYear)
  if (!p) return 'Belum Ditagih'
  if (p.status === 'paid') return 'Lunas'
  if (p.status === 'overdue') return 'Terlambat'
  return 'Menunggu Pembayaran'
})

const currentMonthPaymentStatusClasses = computed(() => {
  switch (currentMonthPaymentStatus.value) {
    case 'Lunas': return 'bg-emerald-500/20 text-emerald-400'
    case 'Terlambat': return 'bg-rose-500/20 text-rose-400'
    default: return 'bg-amber-500/20 text-amber-400'
  }
})

const statusBadgeClasses = computed(() => {
  switch (student.value?.status) {
    case 'active': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    case 'paused': return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    default: return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
  }
})

// Modals
const showEditModal = ref(false)
const showLessonModal = ref(false)
const selectedLesson = ref<Lesson | null>(null)

const showPaymentModal = ref(false)
const selectedPayment = ref<TeacherPayment | null>(null)

function openEditStudent() {
  showEditModal.value = true
}

async function handleSaveStudent(formData: StudentFormData) {
  if (!student.value) return
  await updateStudent(student.value.id, formData)
  showEditModal.value = false
}

function openRecordLesson() {
  selectedLesson.value = null
  showLessonModal.value = true
}

function openEditLesson(l: Lesson) {
  selectedLesson.value = l
  showLessonModal.value = true
}

async function handleSaveLesson(formData: LessonFormData) {
  if (selectedLesson.value) {
    await updateLesson(selectedLesson.value.id, formData)
  } else {
    await createLesson(formData)
  }
  showLessonModal.value = false
  selectedLesson.value = null
}

async function confirmDeleteLesson(id: string) {
  if (confirm('Hapus sesi les ini?')) {
    await deleteLesson(id)
  }
}

function openRecordPayment() {
  selectedPayment.value = null
  showPaymentModal.value = true
}

function openEditPayment(p: TeacherPayment) {
  selectedPayment.value = p
  showPaymentModal.value = true
}

async function handleSavePayment(formData: PaymentFormData) {
  if (selectedPayment.value) {
    await updatePayment(selectedPayment.value.id, formData)
  } else {
    await createPayment(formData)
  }
  showPaymentModal.value = false
  selectedPayment.value = null
}

function openWhatsApp() {
  if (!student.value?.parent_contact?.phone) return
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const msg = generateWhatsAppReminder(student.value.id, currentMonth, currentYear)
  const cleanPhone = student.value.parent_contact.phone.replace(/[^0-9]/g, '')
  const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone
  window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, '_blank')
}

function getInitials(name: string) {
  if (!name) return 'S'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(datetimeStr: string) {
  if (!datetimeStr) return '-'
  const d = new Date(datetimeStr)
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getMonthName(m: number) {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[m - 1] || ''
}

onMounted(() => {
  fetchTeacherData()
})
</script>
