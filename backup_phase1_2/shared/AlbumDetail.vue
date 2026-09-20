<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Back Button -->
    <div>
      <router-link
        to="/gallery"
        class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <Icon name="arrow-left" :size="16" />
        <span>{{ t('back_to_gallery') }}</span>
      </router-link>
    </div>

    <!-- Loading / Not Found State -->
    <div v-if="!album && !isLoading" class="glass rounded-2xl p-8 sm:p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block">🔍</span>
      <h3 class="text-base font-bold text-white">{{ t('album_not_found') }}</h3>
      <router-link to="/gallery" class="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold inline-block">
        {{ t('view_all_albums') }}
      </router-link>
    </div>

    <template v-else-if="album">
      <!-- 1. Album Header Banner -->
      <div class="relative glass rounded-2xl p-5 sm:p-6 border border-slate-700/60 overflow-hidden bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-2 min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-extrabold text-white break-words">
              {{ album.name }}
            </h1>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 shrink-0">
              📸 {{ t('photos_count', { count: albumPhotos.length }) }}
            </span>
          </div>

          <p v-if="album.description" class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed break-words">
            {{ album.description }}
          </p>

          <div v-if="album.tags && album.tags.length > 0" class="flex flex-wrap items-center gap-1.5 pt-1">
            <span
              v-for="tag in album.tags"
              :key="tag"
              class="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <!-- Slideshow Button -->
          <button
            v-if="albumPhotos.length > 0"
            type="button"
            @click="startSlideshow"
            class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{{ t('slideshow') }}</span>
          </button>

          <!-- Upload Photos Button -->
          <button
            type="button"
            @click="showUploadModal = true"
            class="btn-primary flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20"
          >
            <Icon name="upload" :size="14" />
            <span>{{ t('add_photo') }}</span>
          </button>
        </div>
      </div>

      <!-- 2. Grid Style Switcher -->
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-slate-400 font-mono truncate">
          {{ t('photos_count', { count: albumPhotos.length }) }}
        </span>

        <div class="flex items-center gap-1 bg-dark/80 p-1 rounded-xl border border-slate-700/60 text-xs shrink-0">
          <button
            type="button"
            @click="layoutMode = 'uniform'"
            class="px-2.5 py-1 rounded-lg transition-all"
            :class="layoutMode === 'uniform' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
            title="Grid"
          >
            ⏹️ Grid
          </button>
          <button
            type="button"
            @click="layoutMode = 'masonry'"
            class="px-2.5 py-1 rounded-lg transition-all"
            :class="layoutMode === 'masonry' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
            title="Masonry"
          >
            🧱 Masonry
          </button>
        </div>
      </div>

      <!-- 3. Photos Grid -->
      <div v-if="albumPhotos.length === 0" class="glass rounded-2xl p-8 sm:p-12 text-center text-slate-400 space-y-3">
        <span class="text-4xl block">📷</span>
        <h3 class="text-base font-bold text-white">{{ t('no_photos_album') }}</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">{{ t('no_photos_album_desc') }}</p>
        <button
          type="button"
          @click="showUploadModal = true"
          class="btn-primary px-5 py-2 text-xs font-bold rounded-xl mt-2"
        >
          {{ t('add_photo') }}
        </button>
      </div>

      <!-- Uniform Grid Mode -->
      <div
        v-else-if="layoutMode === 'uniform'"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4"
      >
        <div
          v-for="(photo, idx) in albumPhotos"
          :key="photo.id"
          @click="openLightbox(albumPhotos, idx)"
          class="group relative rounded-2xl overflow-hidden aspect-square bg-slate-900 border border-slate-700/60 hover:border-rose-500/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <img
            :src="photo.image_url"
            :alt="photo.caption || 'Album Photo'"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
            <p class="text-xs font-semibold text-white truncate">{{ photo.caption || '' }}</p>
            <p v-if="photo.location" class="text-[10px] text-slate-300 truncate mt-0.5">📍 {{ photo.location }}</p>
          </div>
        </div>
      </div>

      <!-- Masonry Grid Mode -->
      <div
        v-else
        class="columns-2 sm:columns-3 md:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4"
      >
        <div
          v-for="(photo, idx) in albumPhotos"
          :key="photo.id"
          @click="openLightbox(albumPhotos, idx)"
          class="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 hover:border-rose-500/60 cursor-pointer break-inside-avoid transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-3 sm:mb-4"
        >
          <img
            :src="photo.image_url"
            :alt="photo.caption || 'Album Photo'"
            class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <div class="p-2.5 bg-slate-900/90 text-xs">
            <p class="font-semibold text-white truncate">{{ photo.caption || '' }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">🗓️ {{ formatDate(photo.taken_at || photo.created_at) }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <PhotoUploadModal
      v-if="showUploadModal && album"
      :albums="albums"
      :preselected-album-id="album.id"
      @close="showUploadModal = false"
      @upload="handleUploadPhotos"
    />

    <PhotoLightbox
      v-if="activeLightboxIndex !== null && lightboxPhotos.length > 0"
      :photos="lightboxPhotos"
      :initial-index="activeLightboxIndex"
      @close="closeLightbox"
      @react="reactToPhoto"
      @delete="deletePhoto"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import PhotoUploadModal from '@/components/gallery/PhotoUploadModal.vue'
import PhotoLightbox from '@/components/gallery/PhotoLightbox.vue'
import { useCouple } from '@/composables/useCouple'
import { useI18n } from '@/composables/useI18n'
import type { PhotoFormData } from '@/types'

const route = useRoute()
const albumId = computed(() => route.params.id as string)
const { t, currentLang } = useI18n()

const {
  albums,
  photos,
  isLoading,
  activeLightboxIndex,
  lightboxPhotos,
  fetchCoupleData,
  addPhotos,
  deletePhoto,
  reactToPhoto,
  openLightbox,
  closeLightbox,
} = useCouple()

const layoutMode = ref<'uniform' | 'masonry'>('uniform')
const showUploadModal = ref(false)

const album = computed(() => {
  return albums.value.find(a => a.id === albumId.value)
})

const albumPhotos = computed(() => {
  return photos.value.filter(p => p.album_id === albumId.value)
})

async function handleUploadPhotos(photosData: PhotoFormData[]) {
  await addPhotos(photosData)
  showUploadModal.value = false
}

function startSlideshow() {
  if (albumPhotos.value.length === 0) return
  openLightbox(albumPhotos.value, 0)
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '-'
  const locale = currentLang.value === 'de' ? 'de-DE' : 'id-ID'
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchCoupleData()
})
</script>
