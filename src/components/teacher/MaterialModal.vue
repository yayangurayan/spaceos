<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-lg bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ isEdit ? '✏️' : '📁' }}</span>
          <div>
            <h2 class="text-lg font-bold text-white">
              {{ isEdit ? 'Edit Materi Bimbingan' : 'Unggah Materi Baru' }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ isEdit ? 'Perbarui informasi modul atau berkas materi.' : 'Simpan modul PDF, lembar soal, atau slide presentasi.' }}
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
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <!-- Title -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Judul Modul / Materi <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="e.g. Bank Soal Latihan Aljabar SMA 10"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />
        </div>

        <!-- Subject & Grade -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Mata Pelajaran <span class="text-rose-400">*</span>
            </label>
            <select
              v-model="form.subject"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              <option v-for="sub in availableSubjects" :key="sub" :value="sub">{{ sub }}</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Jenjang / Kelas
            </label>
            <select
              v-model="form.grade"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              <option v-for="g in availableGrades" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>
        </div>

        <!-- Type -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Jenis Materi
          </label>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            <button
              v-for="t in ['Worksheet', 'Slides', 'Video', 'Quiz', 'Notes']"
              :key="t"
              type="button"
              @click="form.type = t as any"
              class="py-1.5 rounded-lg text-xs font-bold border transition-all"
              :class="form.type === t
                ? 'bg-accent text-dark border-accent shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <!-- File URL or Upload -->
        <div class="space-y-2 pt-1">
          <label class="block text-xs font-semibold text-slate-300">
            Tautan Berkas / File URL <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="form.file_url"
            type="url"
            required
            placeholder="https://..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />

          <div class="flex items-center gap-2">
            <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium transition-colors">
              <Icon name="upload" :size="13" />
              <span>Pilih File Lokal (Base64)</span>
              <input type="file" class="hidden" @change="handleFileUpload" />
            </label>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Deskripsi / Catatan Materi
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Ringkasan isi modul, target pemahaman..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          ></textarea>
        </div>

        <!-- Tags -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Tagar / Label (Pisahkan dengan koma)
          </label>
          <input
            v-model="tagsInput"
            type="text"
            placeholder="e.g. Aljabar, Latihan Mandiri, PDF, UTBK"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />
        </div>

        <!-- Favorite Checkbox -->
        <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <input
            id="mat-fav"
            v-model="form.is_favorite"
            type="checkbox"
            class="w-4 h-4 rounded text-accent bg-slate-800 border-slate-700 focus:ring-accent"
          />
          <label for="mat-fav" class="text-xs text-slate-300 font-medium cursor-pointer">
            ⭐ Tambahkan ke <strong>Materi Favorit</strong> (Akses Cepat)
          </label>
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
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Unggah Materi' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { TEACHER_SUBJECTS, GRADE_LEVELS } from '@/composables/useTeacher'
import type { TeacherMaterial, MaterialFormData, MaterialType } from '@/types'

const props = defineProps<{
  material: TeacherMaterial | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: MaterialFormData): void
}>()

const isEdit = computed(() => Boolean(props.material))
const availableSubjects = TEACHER_SUBJECTS
const availableGrades = GRADE_LEVELS

const tagsInput = ref(props.material?.tags ? props.material.tags.join(', ') : '')

const form = reactive<MaterialFormData>({
  title: props.material?.title || '',
  subject: props.material?.subject || 'Matematika',
  grade: props.material?.grade || 'SMA Kelas 10',
  type: (props.material?.type as MaterialType) || 'Worksheet',
  file_url: props.material?.file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  description: props.material?.description || '',
  tags: props.material?.tags ? [...props.material.tags] : [],
  is_favorite: props.material?.is_favorite || false,
})

function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.file_url = reader.result as string
  }
  reader.readAsDataURL(file)
}

function handleSubmit() {
  if (!form.title.trim() || !form.file_url.trim()) return

  form.tags = tagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  emit('save', { ...form })
}
</script>
