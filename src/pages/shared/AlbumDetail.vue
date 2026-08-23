<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Back Button -->
    <div>
      <router-link
        to="/gallery"
        class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <Icon name="arrow-left" :size="16" />
        <span>Kembali ke Galeri Album</span>
      </router-link>
    </div>

    <!-- Loading / Not Found State -->
    <div v-if="!album && !isLoading" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block">🔍</span>
      <h3 class="text-base font-bold text-white">Album tidak ditemukan</h3>
      <router-link to="/gallery" class="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold inline-block">
        Lihat Semua Album
      </router-link>
    </div>

    <template v-else-if="album">
      <!-- 1. Album Header Banner -->
      <div class="relative glass rounded-2xl p-6 border border-slate-700/60 overflow-hidden bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-extrabold text-white">
              {{ album.name }}
            </h1>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              📸 {{ albumPhotos.length }} Foto
            </span>
          </div>

          <p v-if="album.description" class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {{ album.description }}
          </p>

          <div class="flex flex-wrap items-center gap-2 pt-1">
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
        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <!-- Slideshow Button -->
          <button
            v-if="albumPhotos.length > 0"
            type="button"
            @click="startSlideshow"
            class="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>▶️ Slideshow</span>
          </button>

          <!-- Upload Photos Button -->
          <button
            type="button"
            @click="showUploadModal = true"
            class="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20"
          >
            <Icon name="upload" :size="14" />
            <span>+ Tambah Foto</span>
          </button>
        </div>
      </div>

      <!-- 2. Grid Style Switcher -->
      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-400 font-mono">
          Menampilkan {{ albumPhotos.length }} foto kenangan
        </span>

        <div class="flex items-center gap-1 bg-dark/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            type="button"
            @click="layoutMode = 'uniform'"
            class="px-2.5 py-1 rounded-lg transition-all"
            :class="layoutMode === 'uniform' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
            title="Grid Kotak Seragam"
          >
            ⏹️ Grid
          </button>
          <button
            type="button"
            @click="layoutMode = 'masonry'"
            class="px-2.5 py-1 rounded-lg transition-all"
            :class="layoutMode === 'masonry' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
            title="Tampilan Masonry / Variasi Tinggi"
          >
            🧱 Masonry
          </button>
        </div>
      </div>

      <!-- 3. Photos Grid -->
      <div v-if="albumPhotos.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
        <span class="text-4xl block">📷</span>
        <h3 class="text-base font-bold text-white">Album ini masih kosong</h3>
        <p class="text-xs text-slate-500">Mulai unggah foto kencan atau liburan ke dalam album ini.</p>
        <button
          type="button"
          @click="showUploadModal = true"
          class="btn-primary px-5 py-2 text-xs font-bold rounded-xl mt-2"
        >
          + Unggah Foto Sekarang
        </button>
      </div>

      <!-- Uniform Grid Mode -->
      <div
        v-else-if="layoutMode === 'uniform'"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
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
            <p class="text-xs font-semibold text-white truncate">{{ photo.caption || 'Foto Kenangan' }}</p>
            <p v-if="photo.location" class="text-[10px] text-slate-300 truncate mt-0.5">📍 {{ photo.location }}</p>
          </div>
        </div>
      </div>

      <!-- Masonry Grid Mode -->
      <div
        v-else
        class="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4"
      >
        <div
          v-for="(photo, idx) in albumPhotos"
          :key="photo.id"
          @click="openLightbox(albumPhotos, idx)"
          class="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 hover:border-rose-500/60 cursor-pointer break-inside-avoid transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-4"
        >
          <img
            :src="photo.image_url"
            :alt="photo.caption || 'Album Photo'"
            class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <div class="p-2.5 bg-slate-900/90 text-xs">
            <p class="font-semibold text-white truncate">{{ photo.caption || 'Momen Spesial' }}</p>
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
import type { PhotoFormData } from '@/types'

const route = useRoute()
const albumId = computed(() => route.params.id as string)

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
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchCoupleData()
})
</script>
