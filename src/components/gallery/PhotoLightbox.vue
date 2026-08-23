<template>
  <div
    class="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
    @keydown.left="prevPhoto"
    @keydown.right="nextPhoto"
    @keydown.esc="$emit('close')"
    tabindex="0"
    ref="lightboxContainer"
  >
    <!-- Top Bar: Title / Counter & Action Controls -->
    <div class="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-20">
      <div class="flex items-center gap-3 text-white text-xs sm:text-sm font-mono">
        <span class="font-bold text-rose-400">
          {{ currentIndex + 1 }} / {{ photos.length }}
        </span>
        <span v-if="currentPhoto?.location" class="hidden sm:inline text-slate-400">
          📍 {{ currentPhoto.location }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Slideshow Toggle -->
        <button
          type="button"
          @click="toggleSlideshow"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
          :class="isSlideshowActive
            ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
            : 'bg-white/10 text-white hover:bg-white/20 border-white/10'"
          title="Mulai / Berhenti Slideshow"
        >
          <span>{{ isSlideshowActive ? '⏸️ Jeda' : '▶️ Slideshow' }}</span>
        </button>

        <!-- Zoom Controls -->
        <button
          type="button"
          @click="zoomOut"
          class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Zoom Out (-)"
        >
          <span class="text-sm font-bold">🔍 -</span>
        </button>
        <button
          type="button"
          @click="zoomIn"
          class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Zoom In (+)"
        >
          <span class="text-sm font-bold">🔍 +</span>
        </button>
        <button
          type="button"
          @click="resetZoom"
          class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono"
          title="Reset Zoom"
        >
          1x
        </button>

        <!-- Delete -->
        <button
          type="button"
          @click="handleDelete"
          class="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors ml-2"
          title="Hapus Foto"
        >
          <Icon name="trash" :size="16" />
        </button>

        <!-- Close -->
        <button
          type="button"
          @click="$emit('close')"
          class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Tutup (Esc)"
        >
          <Icon name="x" :size="18" />
        </button>
      </div>
    </div>

    <!-- Center Stage: Photo Display & Navigation Arrows -->
    <div
      class="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- Prev Button -->
      <button
        v-if="photos.length > 1"
        type="button"
        @click="prevPhoto"
        class="absolute left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-rose-500/80 text-white backdrop-blur-sm transition-all hover:scale-110 shadow-xl"
        title="Foto Sebelumnya (Panah Kiri)"
      >
        <Icon name="chevron-left" :size="24" />
      </button>

      <!-- Main Photo with Zoom Transform -->
      <div
        class="max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
        :style="{ transform: `scale(${zoomScale})` }"
      >
        <img
          v-if="currentPhoto"
          :src="currentPhoto.image_url"
          :alt="currentPhoto.caption || 'Couple Photo'"
          class="max-w-[90vw] max-h-[75vh] object-contain rounded-xl shadow-2xl transition-all"
        />
      </div>

      <!-- Next Button -->
      <button
        v-if="photos.length > 1"
        type="button"
        @click="nextPhoto"
        class="absolute right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-rose-500/80 text-white backdrop-blur-sm transition-all hover:scale-110 shadow-xl"
        title="Foto Berikutnya (Panah Kanan)"
      >
        <Icon name="chevron-right" :size="24" />
      </button>
    </div>

    <!-- Bottom Bar: Caption, Date, Location & Heart Reactions -->
    <div class="p-4 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-20 space-y-2 max-w-4xl mx-auto w-full">
      <div class="flex items-start justify-between gap-4">
        <!-- Caption & Metadata -->
        <div class="space-y-1">
          <p class="text-sm sm:text-base font-semibold text-white leading-relaxed">
            {{ currentPhoto?.caption || 'Momen manis bersama 💕' }}
          </p>
          <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>🗓️ {{ formatDate(currentPhoto?.taken_at || currentPhoto?.created_at) }}</span>
            <span v-if="currentPhoto?.location">📍 {{ currentPhoto.location }}</span>
            <span v-if="currentPhoto?.tagged_partner" class="text-rose-400 font-medium">
              ❤️ Bersama Pasangan
            </span>
          </div>
        </div>

        <!-- Heart Reaction Button with flying burst -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="triggerReaction('❤️')"
            class="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/30 hover:scale-105 transition-all"
          >
            <span class="text-base">❤️</span>
            <span>{{ reactionCount }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { Photo } from '@/types'

const props = defineProps<{
  photos: Photo[]
  initialIndex: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'react', photoId: string, emoji: string): void
  (e: 'delete', photoId: string): void
}>()

const currentIndex = ref(props.initialIndex)
const zoomScale = ref(1)
const isSlideshowActive = ref(false)
const lightboxContainer = ref<HTMLElement | null>(null)
let slideshowTimer: any = null

const currentPhoto = computed(() => {
  return props.photos[currentIndex.value] || null
})

const reactionCount = computed(() => {
  if (!currentPhoto.value?.reactions) return 1
  return Object.values(currentPhoto.value.reactions).reduce((a, b) => a + b, 0)
})

function prevPhoto() {
  resetZoom()
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = props.photos.length - 1
  }
}

function nextPhoto() {
  resetZoom()
  if (currentIndex.value < props.photos.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

function zoomIn() {
  if (zoomScale.value < 2.5) zoomScale.value += 0.3
}

function zoomOut() {
  if (zoomScale.value > 0.6) zoomScale.value -= 0.3
}

function resetZoom() {
  zoomScale.value = 1
}

function toggleSlideshow() {
  isSlideshowActive.value = !isSlideshowActive.value
  if (isSlideshowActive.value) {
    slideshowTimer = setInterval(() => {
      nextPhoto()
    }, 3500)
  } else {
    clearInterval(slideshowTimer)
  }
}

function triggerReaction(emoji: string) {
  if (!currentPhoto.value) return
  emit('react', currentPhoto.value.id, emoji)
}

function handleDelete() {
  if (!currentPhoto.value) return
  if (confirm('Hapus foto ini dari galeri?')) {
    emit('delete', currentPhoto.value.id)
    if (props.photos.length <= 1) {
      emit('close')
    } else {
      prevPhoto()
    }
  }
}

// Touch swipe gestures
let touchStartX = 0
function handleTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0].screenX
}

function handleTouchEnd(e: TouchEvent) {
  const touchEndX = e.changedTouches[0].screenX
  const diff = touchEndX - touchStartX
  if (diff > 50) prevPhoto()
  else if (diff < -50) nextPhoto()
}

// Keydown listener
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') prevPhoto()
  if (e.key === 'ArrowRight') nextPhoto()
  if (e.key === 'Escape') emit('close')
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  lightboxContainer.value?.focus()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (slideshowTimer) clearInterval(slideshowTimer)
})
</script>
