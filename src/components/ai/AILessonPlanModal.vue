<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xl shadow-md">
            🤖
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-white tracking-tight">
              AI Lesson Plan Generator
            </h2>
            <p class="text-xs text-slate-400">
              Buat silabus dan alur kegiatan les terstruktur dalam hitungan detik.
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

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        <!-- Input Form -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Subject -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Mata Pelajaran</label>
            <input
              v-model="form.subject"
              type="text"
              placeholder="e.g. Matematika, Fisika"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Grade -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Jenjang / Kelas</label>
            <input
              v-model="form.grade"
              type="text"
              placeholder="e.g. SMP Kelas 8, SMA 11"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Duration -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Durasi (Menit)</label>
            <input
              v-model.number="form.duration"
              type="number"
              min="15"
              step="15"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <!-- Topic -->
        <div class="space-y-1">
          <label class="block text-xs font-semibold text-slate-300">Topik / Materi Pembelajaran</label>
          <div class="flex items-center gap-2">
            <input
              v-model="form.topic"
              type="text"
              placeholder="e.g. Persamaan Kuadrat, Hukum Newton, Tenses Bahasa Inggris"
              class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
              @keydown.enter.prevent="handleGenerate"
            />
            <button
              type="button"
              :disabled="!form.topic.trim() || isGenerating"
              @click="handleGenerate"
              class="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-md"
            >
              <span v-if="isGenerating">✨ Membuat...</span>
              <span v-else>✨ Buat Plan</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <AILoadingState
          v-if="isGenerating"
          title="AI Sedang Merancang Alur Pembelajaran Interaktif..."
        />

        <!-- Generated Plan Preview -->
        <div v-else-if="generatedPlan" class="space-y-4 pt-4 border-t border-slate-800 animate-fade-in">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📋</span>
              <span>{{ generatedPlan.title }}</span>
            </h3>
            <span class="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              ⏱️ {{ generatedPlan.duration_minutes }} Menit
            </span>
          </div>

          <!-- Objectives -->
          <div class="glass rounded-xl p-4 border border-slate-800 space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-accent">🎯 Tujuan Pembelajaran</h4>
            <p class="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{{ generatedPlan.objectives }}</p>
          </div>

          <!-- Materials Needed -->
          <div v-if="generatedPlan.materials" class="glass rounded-xl p-4 border border-slate-800 space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400">📦 Media & Alat Pembelajaran</h4>
            <p class="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{{ generatedPlan.materials }}</p>
          </div>

          <!-- Activities -->
          <div class="glass rounded-xl p-4 border border-slate-800 space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">⏱️ Alur Kegiatan Sesi Les</h4>
            <p class="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{{ generatedPlan.activities }}</p>
          </div>

          <!-- Assessment -->
          <div v-if="generatedPlan.assessment" class="glass rounded-xl p-4 border border-slate-800 space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400">📝 Evaluasi & Penilaian</h4>
            <p class="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{{ generatedPlan.assessment }}</p>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-slate-700/60 bg-surface/50">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Tutup
        </button>

        <button
          v-if="generatedPlan"
          type="button"
          @click="saveToLibrary"
          class="btn-primary px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20"
        >
          💾 Simpan ke Library Lesson Plans
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import AILoadingState from '@/components/ai/AILoadingState.vue'
import { useTeachingAI } from '@/composables/useTeachingAI'
import type { LessonPlanFormData } from '@/types'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', plan: LessonPlanFormData): void
}>()

const { isGenerating, generateLessonPlan } = useTeachingAI()

const form = reactive({
  subject: 'Matematika',
  grade: 'SMP Kelas 8',
  duration: 60,
  topic: 'Persamaan Linear Dua Variabel (SPLDV)',
})

const generatedPlan = ref<LessonPlanFormData | null>(null)

async function handleGenerate() {
  if (!form.topic.trim()) return
  const plan = await generateLessonPlan({
    subject: form.subject,
    grade: form.grade,
    topic: form.topic,
    durationMinutes: form.duration,
  })
  generatedPlan.value = plan
}

function saveToLibrary() {
  if (!generatedPlan.value) return
  emit('save', generatedPlan.value)
}
</script>
