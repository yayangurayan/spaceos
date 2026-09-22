<template>
  <div v-if="gdriveInfo.isGDrive || isDirectImage" class="gdrive-preview-wrapper inline-block">
    <!-- Thumbnail Container -->
    <div
      class="group relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/60 cursor-pointer transition-all duration-200 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
      :class="thumbnailClass || 'w-24 h-24 sm:w-28 sm:h-28'"
      @click="openLightbox"
      :title="title || 'Klik untuk perbesar preview gambar'"
    >
      <!-- Image Element -->
      <img
        :src="displayThumbnailUrl"
        :alt="alt || 'Google Drive Preview'"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        @error="onImageError"
      />

      <!-- Hover / Tap Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
        <span class="text-[10px] font-bold text-cyan-300 bg-slate-900/80 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
          <span>🔍</span>
          <span class="hidden sm:inline">Zoom</span>
        </span>
        <span v-if="gdriveInfo.isGDrive" class="text-[10px] text-slate-300 bg-slate-900/80 px-1 py-0.5 rounded">
          GDrive
        </span>
      </div>

      <!-- Fallback Error Badge -->
      <div v-if="hasError" class="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-2 text-center text-slate-400">
        <span class="text-xl mb-1">🖼️</span>
        <span class="text-[9px] text-slate-400 leading-tight">Buka Link Eksternal</span>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="isLightboxOpen"
          class="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
          @click.self="closeLightbox"
        >
          <!-- Close Button -->
          <button
            type="button"
            class="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
            @click="closeLightbox"
            title="Tutup (Esc)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Lightbox Content -->
          <div class="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center animate-slide-in">
            <!-- Full Image / Embed Frame -->
            <div class="relative max-h-[82vh] overflow-hidden rounded-2xl border border-slate-700/60 shadow-2xl bg-slate-950 flex items-center justify-center">
              <img
                v-if="!useIframePreview"
                :src="displayFullUrl"
                :alt="alt || 'Preview Gambar'"
                class="max-h-[80vh] max-w-full object-contain select-none"
                @error="onFullImageError"
              />
              <iframe
                v-else
                :src="gdriveInfo.previewUrl || ''"
                class="w-[85vw] sm:w-[75vw] md:w-[65vw] h-[75vh] border-0"
                allow="autoplay"
              ></iframe>
            </div>

            <!-- Toolbar & Link Actions -->
            <div class="mt-3 flex flex-wrap items-center justify-center gap-3">
              <a
                :href="url"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600/90 hover:bg-cyan-500 transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                <span>🔗</span>
                <span>Buka di Google Drive</span>
              </a>

              <button
                v-if="gdriveInfo.isGDrive && !useIframePreview"
                type="button"
                @click="useIframePreview = true"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                Gunakan Embedded Viewer
              </button>

              <button
                type="button"
                @click="closeLightbox"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { parseGoogleDriveUrl, isImageUrl } from '@/utils/gdrive'

const props = defineProps<{
  url: string
  title?: string
  alt?: string
  thumbnailClass?: string
}>()

const isLightboxOpen = ref(false)
const hasError = ref(false)
const useIframePreview = ref(false)

const gdriveInfo = computed(() => parseGoogleDriveUrl(props.url))
const isDirectImage = computed(() => isImageUrl(props.url))

const displayThumbnailUrl = computed(() => {
  if (gdriveInfo.value.thumbnailUrl) {
    return gdriveInfo.value.thumbnailUrl
  }
  return props.url
})

const displayFullUrl = computed(() => {
  if (gdriveInfo.value.thumbnailUrl) {
    // High-resolution version for modal
    return `https://drive.google.com/thumbnail?id=${gdriveInfo.value.fileId}&sz=w1920`
  }
  return props.url
})

function onImageError() {
  hasError.value = true
}

function onFullImageError() {
  if (gdriveInfo.value.isGDrive) {
    useIframePreview.value = true
  }
}

function openLightbox() {
  hasError.value = false
  useIframePreview.value = false
  isLightboxOpen.value = true
}

function closeLightbox() {
  isLightboxOpen.value = false
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isLightboxOpen.value) {
    closeLightbox()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
