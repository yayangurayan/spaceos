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
              {{ isEdit ? 'Edit Album Foto' : 'Buat Album Kenangan Baru' }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ isEdit ? 'Perbarui nama, deskripsi, atau sampul album ini.' : 'Kelompokkan foto kencan, liburan, dan momen spesial.' }}
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
        <!-- Album Name -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Nama Album <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. Liburan ke Bali 🌴, Kencan Pertama, Birthday Trip"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Deskripsi / Cerita Singkat
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Tuliskan cerita manis atau kesan momen di balik album ini..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          ></textarea>
        </div>

        <!-- Cover Photo URL / Upload -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-300">
            Foto Sampul (Cover URL)
          </label>
          <input
            v-model="form.cover_url"
            type="url"
            placeholder="https://..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />

          <div class="flex items-center gap-2">
            <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium transition-colors">
              <Icon name="upload" :size="13" />
              <span>Unggah Gambar Lokal (Base64)</span>
              <input type="file" accept="image/*" class="hidden" @change="handleCoverUpload" />
            </label>
          </div>

          <!-- Preview -->
          <div v-if="form.cover_url" class="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 mt-2">
            <img :src="form.cover_url" alt="Cover preview" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- Tags -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Tagar / Kategori (Pisahkan dengan koma)
          </label>
          <input
            v-model="tagsInput"
            type="text"
            placeholder="e.g. Liburan, Bali, DateNight, Cafe"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
          class="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all"
        >
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Buat Album 💕' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { Album, AlbumFormData } from '@/types'

const props = defineProps<{
  album: Album | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: AlbumFormData): void
}>()

const isEdit = computed(() => Boolean(props.album))
const tagsInput = ref(props.album?.tags ? props.album.tags.join(', ') : '')

const form = reactive<AlbumFormData>({
  name: props.album?.name || '',
  description: props.album?.description || '',
  cover_url: props.album?.cover_url || '',
  tags: props.album?.tags ? [...props.album.tags] : [],
})

function handleCoverUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.cover_url = reader.result as string
  }
  reader.readAsDataURL(file)
}

function handleSubmit() {
  if (!form.name.trim()) return
  form.tags = tagsInput.value
    .split(',')
    .map(t => t.trim().replace(/^#/, ''))
    .filter(Boolean)

  emit('save', { ...form })
}
</script>
