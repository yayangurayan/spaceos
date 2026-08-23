<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">📸</span>
          <div>
            <h2 class="text-lg font-bold text-white">Unggah Foto Kenangan</h2>
            <p class="text-xs text-slate-400">
              Tambahkan satu atau beberapa foto kenangan ke dalam galeri bersama.
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
        <!-- 1. Select Target Album -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Pilih Album Tujuan <span class="text-rose-400">*</span>
          </label>
          <select
            v-model="targetAlbumId"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
          >
            <option value="">-- Tanpa Album (Foto Bebas) --</option>
            <option v-for="alb in albums" :key="alb.id" :value="alb.id">
              {{ alb.name }}
            </option>
          </select>
        </div>

        <!-- 2. Drop Zone & Upload Options -->
        <div
          class="border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer"
          :class="isDragging ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 hover:border-rose-500/40 bg-slate-900/40'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />

          <span class="text-3xl block mb-2">✨</span>
          <p class="text-sm font-bold text-white">Tarik & Lepas Foto di Sini</p>
          <p class="text-xs text-slate-400 mt-1">atau klik untuk memilih file dari galeri / perangkat kamu</p>
        </div>

        <!-- URL Quick Add -->
        <div class="flex items-center gap-2 pt-1">
          <input
            v-model="singleUrlInput"
            type="url"
            placeholder="Atau tempel URL gambar (https://...)"
            class="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            @keydown.enter.prevent="addFromUrl"
          />
          <button
            type="button"
            @click="addFromUrl"
            class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            + Tambah URL
          </button>
        </div>

        <!-- 3. Photo Items List with Captions -->
        <div v-if="photoItems.length > 0" class="space-y-3 pt-2 border-t border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daftar Foto yang Akan Diunggah ({{ photoItems.length }})
            </h3>
            <button
              type="button"
              @click="photoItems = []"
              class="text-xs text-rose-400 hover:underline"
            >
              Hapus Semua
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(item, idx) in photoItems"
              :key="idx"
              class="glass rounded-xl p-3.5 border border-slate-700/60 flex flex-col sm:flex-row gap-3 items-start"
            >
              <!-- Thumbnail -->
              <div class="w-full sm:w-28 aspect-video sm:aspect-square rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700">
                <img :src="item.image_url" alt="Thumbnail" class="w-full h-full object-cover" />
              </div>

              <!-- Metadata fields -->
              <div class="flex-1 space-y-2 w-full">
                <input
                  v-model="item.caption"
                  type="text"
                  placeholder="Beri caption romantis atau cerita singkat..."
                  class="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    v-model="item.location"
                    type="text"
                    placeholder="📍 Lokasi (e.g. Ubud, Bali)"
                    class="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />

                  <input
                    v-model="item.taken_at"
                    type="datetime-local"
                    class="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div class="flex items-center justify-between pt-1">
                  <label class="inline-flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      v-model="item.tagged_partner"
                      type="checkbox"
                      class="rounded text-rose-500 bg-slate-800 border-slate-700"
                    />
                    <span>Tag Pasangan 💕</span>
                  </label>

                  <button
                    type="button"
                    @click="removePhoto(idx)"
                    class="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Hapus foto ini"
                  >
                    <Icon name="trash" :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          :disabled="photoItems.length === 0"
          @click="handleUploadSubmit"
          class="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all"
        >
          <span>Unggah {{ photoItems.length }} Foto 💕</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { Album, PhotoFormData } from '@/types'

const props = defineProps<{
  albums: Album[]
  preselectedAlbumId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'upload', photos: PhotoFormData[]): void
}>()

const targetAlbumId = ref(props.preselectedAlbumId || (props.albums[0]?.id || ''))
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const singleUrlInput = ref('')

const photoItems = ref<Array<{
  image_url: string
  caption: string
  location: string
  taken_at: string
  tagged_partner: boolean
}>>([])

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) processFiles(Array.from(files))
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) processFiles(Array.from(files))
}

function processFiles(files: File[]) {
  const nowLocal = new Date().toISOString().slice(0, 16)
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      photoItems.value.push({
        image_url: reader.result as string,
        caption: '',
        location: '',
        taken_at: nowLocal,
        tagged_partner: true,
      })
    }
    reader.readAsDataURL(file)
  })
}

function addFromUrl() {
  if (!singleUrlInput.value.trim()) return
  const nowLocal = new Date().toISOString().slice(0, 16)
  photoItems.value.push({
    image_url: singleUrlInput.value.trim(),
    caption: '',
    location: '',
    taken_at: nowLocal,
    tagged_partner: true,
  })
  singleUrlInput.value = ''
}

function removePhoto(idx: number) {
  photoItems.value.splice(idx, 1)
}

function handleUploadSubmit() {
  if (photoItems.value.length === 0) return

  const payloads: PhotoFormData[] = photoItems.value.map(p => ({
    album_id: targetAlbumId.value || undefined,
    image_url: p.image_url,
    caption: p.caption,
    location: p.location,
    taken_at: p.taken_at ? new Date(p.taken_at).toISOString() : new Date().toISOString(),
    tagged_partner: p.tagged_partner,
  }))

  emit('upload', payloads)
}
</script>
