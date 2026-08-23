<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ isEdit ? '✏️' : '👨‍🎓' }}</span>
          <div>
            <h2 class="text-lg font-bold text-white">
              {{ isEdit ? 'Edit Data Siswa' : 'Daftarkan Siswa Baru' }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ isEdit ? 'Perbarui jadwal, mata pelajaran, atau informasi kontak siswa.' : 'Catat profil siswa les, jadwal bimbingan, dan biaya bulanan.' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Icon name="x" :size="18" />
        </button>
      </div>

      <!-- Form Body (Scrollable) -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        <!-- 1. Identitas Siswa -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Full Name -->
          <div class="space-y-1.5 sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-300">
              Nama Lengkap Siswa <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Anisa Rahmawati, Budi Santoso"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Grade / Level -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Kelas / Jenjang
            </label>
            <select
              v-model="form.grade"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option v-for="grade in availableGrades" :key="grade" :value="grade">
                {{ grade }}
              </option>
            </select>
          </div>

          <!-- Status -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Status Bimbingan
            </label>
            <select
              v-model="form.status"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="active">🟢 Active (Aktif Les)</option>
              <option value="paused">⏸️ Paused (Cuti / Istirahat)</option>
              <option value="graduated">🎓 Graduated (Lulus / Selesai)</option>
            </select>
          </div>
        </div>

        <!-- 2. Mata Pelajaran (Multi-select) -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-300">
            Mata Pelajaran yang Diambil <span class="text-rose-400">*</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="sub in availableSubjects"
              :key="sub"
              type="button"
              @click="toggleSubject(sub)"
              class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              :class="form.subjects.includes(sub)
                ? 'bg-accent text-dark font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'"
            >
              {{ sub }}
            </button>
          </div>
        </div>

        <!-- 3. Kontak Orang Tua / Wali -->
        <div class="space-y-3 pt-2 border-t border-slate-800">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>👨‍👩‍👦</span>
            <span>Kontak Orang Tua / Wali</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="block text-[11px] text-slate-400">Nama Orang Tua</label>
              <input
                v-model="form.parent_name"
                type="text"
                placeholder="e.g. Ibu Ratna"
                class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-[11px] text-slate-400">No. WhatsApp / HP</label>
              <input
                v-model="form.parent_phone"
                type="tel"
                placeholder="e.g. 08123456789"
                class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-[11px] text-slate-400">Email (Opsional)</label>
              <input
                v-model="form.parent_email"
                type="email"
                placeholder="e.g. orangtua@gmail.com"
                class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        <!-- 4. Jadwal Rutin Mingguan -->
        <div class="space-y-3 pt-2 border-t border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🗓️</span>
              <span>Jadwal Bimbingan Rutin</span>
            </h3>

            <button
              type="button"
              @click="addScheduleSlot"
              class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              + Tambah Hari
            </button>
          </div>

          <div v-if="form.schedule.length === 0" class="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            Belum ada jadwal tetap. Klik "+ Tambah Hari" untuk mengatur hari dan jam les.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(slot, idx) in form.schedule"
              :key="idx"
              class="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"
            >
              <!-- Day -->
              <select
                v-model="slot.day"
                class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option v-for="d in availableDays" :key="d" :value="d">{{ d }}</option>
              </select>

              <!-- Start Time -->
              <div class="flex items-center gap-1 text-xs text-slate-400">
                <span>Jam:</span>
                <input
                  v-model="slot.start_time"
                  type="time"
                  class="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
                <span>s/d</span>
                <input
                  v-model="slot.end_time"
                  type="time"
                  class="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>

              <!-- Delete slot -->
              <button
                type="button"
                @click="removeScheduleSlot(idx)"
                class="p-1 text-slate-500 hover:text-rose-400 ml-auto"
                title="Hapus slot jadwal ini"
              >
                <Icon name="trash" :size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- 5. Biaya & Pembayaran (SPP) -->
        <div class="space-y-3 pt-2 border-t border-slate-800">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>💰</span>
            <span>Biaya Bimbingan & SPP</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Monthly Fee -->
            <div class="space-y-1">
              <label class="block text-[11px] text-slate-400">SPP Bulanan (IDR)</label>
              <input
                v-model.number="form.monthly_fee"
                type="number"
                min="0"
                step="50000"
                placeholder="e.g. 800000"
                class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-accent"
              />
            </div>

            <!-- Payment Method -->
            <div class="space-y-1">
              <label class="block text-[11px] text-slate-400">Metode Pembayaran</label>
              <select
                v-model="form.payment_method"
                class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="Transfer">Bank Transfer (BCA/Mandiri/dsb)</option>
                <option value="Cash">Cash (Tunai)</option>
                <option value="E-wallet">E-Wallet (GoPay/OVO/ShopeePay)</option>
              </select>
            </div>

            <!-- Due Date -->
            <div class="space-y-1">
              <label class="block text-[11px] text-slate-400">Jatuh Tempo (Tiap Tanggal)</label>
              <select
                v-model.number="form.payment_due_date"
                class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option v-for="d in 31" :key="d" :value="d">Tanggal {{ d }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 6. Catatan Pembelajaran -->
        <div class="space-y-1.5 pt-2 border-t border-slate-800">
          <label class="block text-xs font-semibold text-slate-300">
            Catatan Karakter & Gaya Belajar Siswa
          </label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Tuliskan learning style (auditori/visual), materi yang sudah dikuasai, atau kelemahan yang perlu perhatian khusus..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          ></textarea>
        </div>
      </form>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/60 bg-surface/50">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSubmit"
          class="btn-primary px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 flex items-center gap-2"
        >
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Daftarkan Siswa' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { TEACHER_SUBJECTS, GRADE_LEVELS, DAYS_OF_WEEK } from '@/composables/useTeacher'
import type { Student, StudentFormData } from '@/types'

const props = defineProps<{
  student: Student | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: StudentFormData): void
}>()

const isEdit = computed(() => Boolean(props.student))
const availableSubjects = TEACHER_SUBJECTS
const availableGrades = GRADE_LEVELS
const availableDays = DAYS_OF_WEEK

const form = reactive<StudentFormData>({
  name: props.student?.name || '',
  grade: props.student?.grade || 'SMA Kelas 10',
  subjects: props.student?.subjects ? [...props.student.subjects] : ['Matematika'],
  parent_name: props.student?.parent_contact?.name || '',
  parent_phone: props.student?.parent_contact?.phone || '',
  parent_email: props.student?.parent_contact?.email || '',
  schedule: props.student?.schedule ? JSON.parse(JSON.stringify(props.student.schedule)) : [
    { day: 'Senin', start_time: '16:00', end_time: '17:30', duration: 90 },
  ],
  monthly_fee: props.student?.monthly_fee ?? 800000,
  payment_method: props.student?.payment_method || 'Transfer',
  payment_due_date: props.student?.payment_due_date || 5,
  notes: props.student?.notes || '',
  status: props.student?.status || 'active',
  start_date: props.student?.start_date || new Date().toISOString().split('T')[0],
})

function toggleSubject(sub: string) {
  const idx = form.subjects.indexOf(sub)
  if (idx > -1) {
    if (form.subjects.length > 1) form.subjects.splice(idx, 1)
  } else {
    form.subjects.push(sub)
  }
}

function addScheduleSlot() {
  form.schedule.push({
    day: 'Selasa',
    start_time: '16:00',
    end_time: '17:30',
    duration: 90,
  })
}

function removeScheduleSlot(idx: number) {
  form.schedule.splice(idx, 1)
}

function handleSubmit() {
  if (!form.name.trim()) return
  emit('save', { ...form })
}
</script>
