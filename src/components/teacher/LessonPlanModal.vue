<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ isEdit ? '✏️' : '📋' }}</span>
          <div>
            <h2 class="text-lg font-bold text-white">
              {{ isEdit ? 'Edit Rencana Pembelajaran' : 'Buat Rencana Pembelajaran (Lesson Plan)' }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ isEdit ? 'Perbarui silabus, tujuan, atau alur aktivitas materi ini.' : 'Simpan template bimbingan terstruktur yang dapat digunakan berulang kali.' }}
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
        <!-- 1. Title & Subject -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Title -->
          <div class="space-y-1.5 sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-300">
              Judul Modul / Materi <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="e.g. Trigonometri & Aturan Sinus, Hukum Newton II"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Subject -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Mata Pelajaran <span class="text-rose-400">*</span>
            </label>
            <select
              v-model="form.subject"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option v-for="sub in availableSubjects" :key="sub" :value="sub">
                {{ sub }}
              </option>
            </select>
          </div>
        </div>

        <!-- 2. Grade & Duration -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Grade -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Target Jenjang / Kelas
            </label>
            <select
              v-model="form.grade"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              <option v-for="g in availableGrades" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <!-- Duration -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Estimasi Durasi (Menit)
            </label>
            <input
              v-model.number="form.duration_minutes"
              type="number"
              min="15"
              step="15"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <!-- 3. Objectives -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Tujuan Pembelajaran (Learning Objectives)
          </label>
          <textarea
            v-model="form.objectives"
            rows="3"
            placeholder="1. Siswa mampu memahami...&#10;2. Siswa mampu menyelesaikan soal..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent font-mono text-[11px]"
          ></textarea>
        </div>

        <!-- 4. Materials Needed -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Bahan & Alat yang Dibutuhkan
          </label>
          <input
            v-model="form.materials"
            type="text"
            placeholder="e.g. Modul Bab 3, Geogebra, Lembar Soal Tantangan"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />
        </div>

        <!-- 5. Step-by-Step Activities -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Alur Langkah Kegiatan Bimbingan
          </label>
          <textarea
            v-model="form.activities"
            rows="4"
            placeholder="1. Pembukaan & Review materi sebelumnya (10 mnt)&#10;2. Penjelasan konsep inti & demonstrasi soal (25 mnt)&#10;3. Latihan mandiri terpandu 5 nomor (40 mnt)&#10;4. Evaluasi & kesimpulan (15 mnt)"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent font-mono text-[11px]"
          ></textarea>
        </div>

        <!-- 6. Assessment Method -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Metode Penilaian & Kuis
          </label>
          <input
            v-model="form.assessment"
            type="text"
            placeholder="e.g. Kuis 3 soal cepat di akhir sesi + 5 nomor PR"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />
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
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Simpan Lesson Plan' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { TEACHER_SUBJECTS, GRADE_LEVELS } from '@/composables/useTeacher'
import type { LessonPlan, LessonPlanFormData } from '@/types'

const props = defineProps<{
  plan: LessonPlan | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: LessonPlanFormData): void
}>()

const isEdit = computed(() => Boolean(props.plan))
const availableSubjects = TEACHER_SUBJECTS
const availableGrades = GRADE_LEVELS

const form = reactive<LessonPlanFormData>({
  title: props.plan?.title || '',
  subject: props.plan?.subject || 'Matematika',
  grade: props.plan?.grade || 'SMA Kelas 10',
  duration_minutes: props.plan?.duration_minutes || 90,
  objectives: props.plan?.objectives || '',
  materials: props.plan?.materials || '',
  activities: props.plan?.activities || '',
  assessment: props.plan?.assessment || '',
})

function handleSubmit() {
  if (!form.title.trim()) return
  emit('save', { ...form })
}
</script>
