<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📸</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {{ t('gallery_title') }}
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          {{ t('gallery_desc') }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="showUploadModal = true"
          class="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Icon name="upload" :size="14" />
          <span>{{ t('upload_photo') }}</span>
        </button>

        <button
          type="button"
          @click="openCreateAlbum"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Icon name="plus" :size="16" />
          <span>{{ t('create_album') }}</span>
        </button>
      </div>
    </div>

    <!-- 2. Stats & View Switcher Toolbar -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <!-- Left: View Mode Tabs -->
      <div class="flex items-center gap-2">
        <div class="flex bg-dark/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            type="button"
            @click="currentView = 'albums'"
            class="px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5"
            :class="currentView === 'albums' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>📁</span>
            <span>{{ t('album_count', { count: albums.length }) }}</span>
          </button>

          <button
            type="button"
            @click="currentView = 'timeline'"
            class="px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5"
            :class="currentView === 'timeline' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>⏱️</span>
            <span>{{ t('timeline_count', { count: photos.length }) }}</span>
          </button>
        </div>
      </div>

      <!-- Right: Search -->
      <div class="relative w-full md:w-64">
        <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari album, lokasi, tagar..."
          class="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>
    </div>

    <!-- 3. VIEW MODE A: ALBUMS GRID -->
    <div v-if="currentView === 'albums'" class="space-y-6">
      <div v-if="filteredAlbums.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
        <span class="text-4xl block">📁</span>
        <h3 class="text-base font-bold text-white">{{ t('no_matching_albums') }}</h3>
        <p class="text-xs text-slate-500">Mulai buat album pertama untuk mengabadikan momen perjalanan kalian.</p>
        <button
          type="button"
          @click="openCreateAlbum"
          class="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md mt-2"
        >
          + {{ t('create_memory_album') }}
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AlbumCard
          v-for="alb in filteredAlbums"
          :key="alb.id"
          :album="alb"
          @click="navigateToAlbum(alb.id)"
          @edit="openEditAlbum"
          @delete="confirmDeleteAlbum"
        />
      </div>
    </div>

    <!-- 4. VIEW MODE B: TIMELINE VIEW -->
    <div v-else class="space-y-8">
      <div v-if="groupedTimelinePhotos.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-2">
        <span class="text-4xl block">📸</span>
        <p class="text-base font-bold text-white">{{ t('no_uploaded_photos') }}</p>
        <p class="text-xs text-slate-500">Klik "Unggah Foto" untuk menambahkan foto kenangan kalian.</p>
      </div>

      <div
        v-for="group in groupedTimelinePhotos"
        :key="group.period"
        class="space-y-4"
      >
        <!-- Period Separator Header -->
        <div class="flex items-center gap-3">
          <span class="text-lg">🗓️</span>
          <h2 class="text-sm sm:text-base font-extrabold text-white tracking-wide">
            {{ group.period }}
          </h2>
          <div class="h-px bg-slate-800 flex-1"></div>
          <span class="text-xs font-mono text-slate-500">{{ group.items.length }} Foto</span>
        </div>

        <!-- Photos Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div
            v-for="photo in group.items"
            :key="photo.id"
            @click="openLightboxByPhoto(photo)"
            class="group relative rounded-xl overflow-hidden aspect-square bg-slate-900 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <img
              :src="photo.image_url"
              :alt="photo.caption || 'Photo'"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
              <div class="flex justify-end">
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-rose-300 backdrop-blur-sm">
                  ❤️ {{ photo.reactions?.['❤️'] || 1 }}
                </span>
              </div>
              <div>
                <p class="text-[11px] font-semibold text-white truncate">{{ photo.caption || 'Foto Kenangan' }}</p>
                <p v-if="photo.location" class="text-[9px] text-slate-300 truncate">📍 {{ photo.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AlbumFormModal
      v-if="showAlbumModal"
      :album="selectedAlbum"
      @close="showAlbumModal = false; selectedAlbum = null"
      @save="handleSaveAlbum"
    />

    <PhotoUploadModal
      v-if="showUploadModal"
      :albums="albums"
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
import { useRouter } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import AlbumCard from '@/components/gallery/AlbumCard.vue'
import AlbumFormModal from '@/components/gallery/AlbumFormModal.vue'
import PhotoUploadModal from '@/components/gallery/PhotoUploadModal.vue'
import PhotoLightbox from '@/components/gallery/PhotoLightbox.vue'
import { useCouple } from '@/composables/useCouple'
import { useI18n } from '@/composables/useI18n'
import type { Album, AlbumFormData, Photo, PhotoFormData } from '@/types'

const router = useRouter()
const { t } = useI18n()

const {
  albums,
  photos,
  albumsWithMeta,
  timelinePhotos,
  activeLightboxIndex,
  lightboxPhotos,
  fetchCoupleData,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addPhotos,
  deletePhoto,
  reactToPhoto,
  openLightbox,
  closeLightbox,
} = useCouple()

const currentView = ref<'albums' | 'timeline'>('albums')
const searchQuery = ref('')

// Modals
const showAlbumModal = ref(false)
const selectedAlbum = ref<Album | null>(null)
const showUploadModal = ref(false)

const filteredAlbums = computed(() => {
  if (!searchQuery.value.trim()) return albumsWithMeta.value
  const q = searchQuery.value.toLowerCase().trim()
  return albumsWithMeta.value.filter(a => {
    const matchName = a.name.toLowerCase().includes(q)
    const matchDesc = a.description?.toLowerCase().includes(q)
    const matchTags = a.tags?.some(t => t.toLowerCase().includes(q))
    return matchName || matchDesc || matchTags
  })
})

const groupedTimelinePhotos = computed(() => {
  const groups: Record<string, Photo[]> = {}

  timelinePhotos.value.forEach(p => {
    const d = new Date(p.taken_at || p.created_at)
    const periodKey = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    if (!groups[periodKey]) groups[periodKey] = []
    groups[periodKey].push(p)
  })

  return Object.keys(groups).map(key => ({
    period: key,
    items: groups[key],
  }))
})

function navigateToAlbum(id: string) {
  router.push(`/gallery/${id}`)
}

function openCreateAlbum() {
  selectedAlbum.value = null
  showAlbumModal.value = true
}

function openEditAlbum(alb: Album) {
  selectedAlbum.value = alb
  showAlbumModal.value = true
}

async function handleSaveAlbum(formData: AlbumFormData) {
  if (selectedAlbum.value) {
    await updateAlbum(selectedAlbum.value.id, formData)
  } else {
    await createAlbum(formData)
  }
  showAlbumModal.value = false
  selectedAlbum.value = null
}

async function confirmDeleteAlbum(id: string) {
  const alb = albums.value.find(a => a.id === id)
  if (confirm(`Hapus album "${alb?.name || 'ini'}"? Foto-foto di dalamnya akan tetap tersimpan.`)) {
    await deleteAlbum(id)
  }
}

async function handleUploadPhotos(photosData: PhotoFormData[]) {
  await addPhotos(photosData)
  showUploadModal.value = false
}

function openLightboxByPhoto(photo: Photo) {
  const list = timelinePhotos.value
  const idx = list.findIndex(p => p.id === photo.id)
  openLightbox(list, idx !== -1 ? idx : 0)
}

onMounted(() => {
  fetchCoupleData()
})
</script>
