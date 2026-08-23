<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ isEdit ? '✏️' : '📝' }}</span>
          <div>
            <h2 class="text-lg font-bold text-white">
              {{ isEdit ? 'Edit Catatan Lesson' : 'Catat / Jadwalkan Lesson' }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ isEdit ? 'Perbarui materi yang dibahas, evaluasi, atau PR siswa.' : 'Rekap kegiatan bimbingan belajar, pemahaman materi, dan evaluasi siswa.' }}
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

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        <!-- 1. Student Selector & Status -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Student -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Pilih Siswa <span class="text-rose-400">*</span>
            </label>
            <select
              v-model="form.student_id"
              required
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="" disabled>-- Pilih Siswa --</option>
              <option v-for="s in students" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.grade || s.subjects.join(', ') }})
              </option>
            </select>
          </div>

          <!-- Status -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Status Sesi
            </label>
            <select
              v-model="form.status"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="scheduled">⏳ Terjadwal (Upcoming)</option>
              <option value="completed">✅ Selesai (Completed)</option>
              <option value="cancelled">❌ Dibatalkan (Cancelled)</option>
            </select>
          </div>
        </div>

        <!-- 2. Date, Time & Duration -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- DateTime -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Tanggal & Waktu Les <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="datetimeInput"
              type="datetime-local"
              required
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Duration -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Durasi Sesi (Menit)
            </label>
            <select
              v-model.number="form.duration_minutes"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
            >
              <option :value="45">45 Menit</option>
              <option :value="60">60 Menit (1 Jam)</option>
              <option :value="75">75 Menit</option>
              <option :value="90">90 Menit (1.5 Jam)</option>
              <option :value="120">120 Menit (2 Jam)</option>
            </select>
          </div>
        </div>

        <!-- 3. Topic & Material Covered -->
        <div class="space-y-3">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Topik / Judul Pembahasan <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.topic"
              type="text"
              required
              placeholder="e.g. Persamaan Kuadrat, Hukum Newton II, Past Continuous Tense"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Materi & Aktivitas yang Dilakukan
            </label>
            <textarea
              v-model="form.material_covered"
              rows="3"
              placeholder="Tuliskan sub-bab materi, latihan soal yang dibahas, dan aktivitas pembelajaran..."
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            ></textarea>
          </div>
        </div>

        <!-- 4. Performance & Homework -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <!-- Student Performance Rating -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Evaluasi Pemahaman Siswa
            </label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="form.performance = 'Excellent'"
                class="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                :class="form.performance === 'Excellent'
                  ? 'bg-emerald-500 text-dark border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'"
              >
                🌟 Sangat Paham
              </button>
              <button
                type="button"
                @click="form.performance = 'Good'"
                class="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                :class="form.performance === 'Good'
                  ? 'bg-cyan-500 text-dark border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'"
              >
                👍 Cukup Baik
              </button>
              <button
                type="button"
                @click="form.performance = 'Needs Improvement'"
                class="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                :class="form.performance === 'Needs Improvement'
                  ? 'bg-amber-500 text-dark border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'"
              >
                ⚠️ Perlu Latihan
              </button>
            </div>
          </div>

          <!-- Homework -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Tugas Rumah / PR yang Diberikan
            </label>
            <input
              v-model="form.homework"
              type="text"
              placeholder="e.g. Buku Paket Hal 45 No 1-10"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <!-- 5. Notes for Next Lesson -->
        <div class="space-y-1.5 pt-2 border-t border-slate-800">
          <label class="block text-xs font-semibold text-slate-300">
            Catatan untuk Sesi Selanjutnya
          </label>
          <textarea
            v-model="form.next_lesson_notes"
            rows="2"
            placeholder="e.g. Cek PR terlebih dahulu, siapkan kuis bab berikutnya, drill rumus cepat..."
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
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Simpan Lesson' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { Student, Lesson, LessonFormData, LessonPerformance } from '@/types'

const props = defineProps<{
  lesson: Lesson | null
  students: Student[]
  preselectedStudentId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: LessonFormData): void
}>()

const isEdit = computed(() => Boolean(props.lesson))

function formatForDatetimeLocal(isoStr?: string) {
  const d = isoStr ? new Date(isoStr) : new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

const datetimeInput = ref(
  props.lesson?.datetime
    ? formatForDatetimeLocal(props.lesson.datetime)
    : formatForDatetimeLocal()
)

const form = reactive<LessonFormData>({
  student_id: props.lesson?.student_id || props.preselectedStudentId || (props.students[0]?.id || ''),
  datetime: props.lesson?.datetime || new Date().toISOString(),
  duration_minutes: props.lesson?.duration_minutes || 90,
  topic: props.lesson?.topic || '',
  material_covered: props.lesson?.material_covered || '',
  activities: props.lesson?.activities || '',
  homework: props.lesson?.homework || '',
  performance: (props.lesson?.performance as LessonPerformance) || 'Good',
  next_lesson_notes: props.lesson?.next_lesson_notes || '',
  status: props.lesson?.status || 'completed',
})

function handleSubmit() {
  if (!form.student_id || !form.topic.trim()) return
  form.datetime = new Date(datetimeInput.value).toISOString()
  emit('save', { ...form })
}
</script>
