<template>
  <div
    class="group relative glass rounded-2xl overflow-hidden border border-slate-700/60 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/5 cursor-pointer flex flex-col justify-between"
    @click="$emit('click', album)"
  >
    <!-- Cover Image -->
    <div class="relative aspect-[4/3] overflow-hidden bg-slate-900">
      <img
        v-if="album.cover_url"
        :src="album.cover_url"
        :alt="album.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <!-- Gradient Fallback -->
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-800 text-4xl"
      >
        <span>📷</span>
      </div>

      <!-- Photo Count Badge -->
      <div class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-dark/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 flex items-center gap-1.5 shadow-md">
        <span>📸</span>
        <span>{{ album.photo_count || 0 }} Foto</span>
      </div>

      <!-- Tag Pills (top left) -->
      <div v-if="album.tags && album.tags.length > 0" class="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[70%]">
        <span
          v-for="tag in album.tags.slice(0, 2)"
          :key="tag"
          class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-dark/70 backdrop-blur-sm text-rose-300 border border-rose-500/20"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- Album Info -->
    <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
      <div>
        <h3 class="text-base font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
          {{ album.name }}
        </h3>
        <p v-if="album.description" class="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {{ album.description }}
        </p>
      </div>

      <!-- Date Range & Action Buttons -->
      <div class="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
        <span class="text-[11px] text-slate-500 font-mono flex items-center gap-1 truncate">
          <span>🗓️</span>
          <span>{{ album.date_range || 'Kenangan Bersama' }}</span>
        </span>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            @click.stop="$emit('edit', album)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit Album"
          >
            <Icon name="edit" :size="14" />
          </button>
          <button
            type="button"
            @click.stop="$emit('delete', album.id)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Hapus Album"
          >
            <Icon name="trash" :size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'
import type { Album } from '@/types'

defineProps<{
  album: Album
}>()

defineEmits<{
  (e: 'click', album: Album): void
  (e: 'edit', album: Album): void
  (e: 'delete', id: string): void
}>()
</script>
