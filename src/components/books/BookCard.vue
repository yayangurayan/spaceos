<template>
  <div
    class="group relative glass rounded-2xl p-4 border border-slate-700/60 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between"
  >
    <!-- Top Row: Shelf Badge & Favorite Toggle -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <!-- Status Badge -->
      <span
        class="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
        :class="statusBadgeClasses"
      >
        <span>{{ statusIcon }}</span>
        <span>{{ statusLabel }}</span>
      </span>

      <!-- Favorite Button -->
      <button
        type="button"
        @click.stop="$emit('toggle-favorite', book.id)"
        class="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
        :class="{ 'text-amber-400 bg-amber-400/10': book.is_favorite }"
        :title="book.is_favorite ? 'Favorit' : 'Tambah ke Favorit'"
      >
        <Icon :name="book.is_favorite ? 'star-filled' : 'star'" :size="16" />
      </button>
    </div>

    <!-- Middle: Cover + Details -->
    <div class="flex gap-4 cursor-pointer" @click="$emit('view-detail', book)">
      <!-- Book Cover (2:3 ratio) -->
      <div class="relative w-20 sm:w-24 h-28 sm:h-34 flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-slate-800 border border-slate-700/80 group-hover:border-accent/50 transition-colors">
        <img
          v-if="book.cover_url && !imageError"
          :src="book.cover_url"
          :alt="book.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          @error="imageError = true"
          loading="lazy"
        />
        <!-- Stylized Fallback Cover -->
        <div
          v-else
          class="w-full h-full flex flex-col justify-between p-2 text-center select-none bg-gradient-to-br"
          :class="fallbackCoverGradient"
        >
          <span class="text-xs font-black tracking-wider uppercase text-white/40">SpaceOS</span>
          <p class="text-[11px] font-bold text-white leading-tight line-clamp-3">
            {{ book.title }}
          </p>
          <p class="text-[9px] text-white/70 truncate">
            {{ book.author }}
          </p>
        </div>

        <!-- Rating overlay if present -->
        <div
          v-if="book.rating"
          class="absolute bottom-1 right-1 bg-dark/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-300 flex items-center gap-0.5 border border-amber-500/30"
        >
          <span>★</span>
          <span>{{ book.rating }}</span>
        </div>
      </div>

      <!-- Book Info -->
      <div class="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {{ book.title }}
          </h3>
          <p class="text-xs text-slate-400 mt-0.5 truncate">
            Oleh <span class="text-slate-300">{{ book.author }}</span>
          </p>

          <!-- Recommended By -->
          <p v-if="book.recommended_by" class="text-[10px] text-slate-500 mt-1 truncate flex items-center gap-1">
            <Icon name="sparkles" :size="11" class="text-cyan-400 flex-shrink-0" />
            <span>Rec: {{ book.recommended_by }}</span>
          </p>

          <!-- Genres Tags -->
          <div v-if="book.genres && book.genres.length > 0" class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="genre in book.genres.slice(0, 3)"
              :key="genre"
              class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              {{ genre }}
            </span>
            <span v-if="book.genres.length > 3" class="text-[10px] text-slate-500 self-center">
              +{{ book.genres.length - 3 }}
            </span>
          </div>
        </div>

        <!-- Star Rating Picker / Display -->
        <div v-if="book.rating" class="flex items-center gap-1 mt-2">
          <span
            v-for="s in 5"
            :key="s"
            class="text-xs"
            :class="s <= book.rating ? 'text-amber-400' : 'text-slate-600'"
          >
            ★
          </span>
          <span class="text-[11px] text-slate-400 ml-1 font-mono">({{ book.rating }}/5)</span>
        </div>
      </div>
    </div>

    <!-- Reading Progress Bar (for reading books or with pages recorded) -->
    <div v-if="book.total_pages && book.total_pages > 0" class="mt-4 pt-3 border-t border-slate-750/50">
      <div class="flex items-center justify-between text-xs mb-1.5">
        <span class="text-slate-400 text-[11px] flex items-center gap-1">
          <Icon name="book-open" :size="12" class="text-accent" />
          <span>{{ book.current_page }} / {{ book.total_pages }} Hal</span>
        </span>
        <span class="font-mono font-bold text-[11px]" :class="progressPercentage >= 100 ? 'text-emerald-400' : 'text-accent'">
          {{ progressPercentage }}%
        </span>
      </div>

      <!-- Animated Progress Track -->
      <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/40 relative">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out"
          :class="progressPercentage >= 100
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-sm shadow-cyan-500/50'"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Footer Action Bar -->
    <div class="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
      <!-- Quick Progress Button -->
      <button
        v-if="book.status === 'reading' || (book.total_pages && book.current_page < book.total_pages)"
        type="button"
        @click.stop="$emit('update-progress', book)"
        class="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30 transition-all flex items-center gap-1.5"
      >
        <Icon name="plus" :size="12" />
        <span>Update Hal</span>
      </button>
      <button
        v-else-if="book.status === 'want_to_read'"
        type="button"
        @click.stop="$emit('move-shelf', book.id, 'reading')"
        class="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all flex items-center gap-1.5"
      >
        <span>📖 Mulai Baca</span>
      </button>
      <span v-else class="text-[11px] font-medium text-emerald-400/90 flex items-center gap-1">
        <Icon name="check-circle" :size="13" />
        <span>Selesai Dibaca</span>
      </span>

      <!-- Right Action Icons -->
      <div class="flex items-center gap-1">
        <!-- Move Shelf Dropdown Menu -->
        <div class="relative group/menu">
          <button
            type="button"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Pindah Rak"
          >
            <Icon name="layers" :size="15" />
          </button>
          <div
            class="absolute right-0 bottom-full mb-1 hidden group-hover/menu:block w-36 bg-surface/95 backdrop-blur-md rounded-xl p-1 shadow-2xl border border-slate-700 z-30"
          >
            <button
              type="button"
              v-if="book.status !== 'reading'"
              @click.stop="$emit('move-shelf', book.id, 'reading')"
              class="w-full text-left px-2.5 py-1.5 text-xs rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
            >
              <span>📖</span>
              <span>Sedang Baca</span>
            </button>
            <button
              type="button"
              v-if="book.status !== 'completed'"
              @click.stop="$emit('move-shelf', book.id, 'completed')"
              class="w-full text-left px-2.5 py-1.5 text-xs rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
            >
              <span>✅</span>
              <span>Tandai Selesai</span>
            </button>
            <button
              type="button"
              v-if="book.status !== 'want_to_read'"
              @click.stop="$emit('move-shelf', book.id, 'want_to_read')"
              class="w-full text-left px-2.5 py-1.5 text-xs rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
            >
              <span>📚</span>
              <span>Ingin Dibaca</span>
            </button>
          </div>
        </div>

        <!-- Edit Button -->
        <button
          type="button"
          @click.stop="$emit('edit', book)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-slate-800 transition-colors"
          title="Edit Buku"
        >
          <Icon name="edit" :size="15" />
        </button>

        <!-- Delete Button -->
        <button
          type="button"
          @click.stop="$emit('delete', book.id)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="Hapus Buku"
        >
          <Icon name="trash" :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { Book, BookShelfStatus } from '@/types'

const props = defineProps<{
  book: Book
}>()

defineEmits<{
  (e: 'edit', book: Book): void
  (e: 'delete', id: string): void
  (e: 'update-progress', book: Book): void
  (e: 'move-shelf', id: string, status: BookShelfStatus): void
  (e: 'toggle-favorite', id: string): void
  (e: 'view-detail', book: Book): void
}>()

const imageError = ref(false)

const progressPercentage = computed(() => {
  if (!props.book.total_pages || props.book.total_pages <= 0) return 0
  const cur = props.book.current_page || 0
  return Math.min(100, Math.round((cur / props.book.total_pages) * 100))
})

const statusLabel = computed(() => {
  switch (props.book.status) {
    case 'reading':
      return 'Sedang Dibaca'
    case 'completed':
      return 'Selesai'
    case 'want_to_read':
      return 'Ingin Dibaca'
    default:
      return 'Buku'
  }
})

const statusIcon = computed(() => {
  switch (props.book.status) {
    case 'reading':
      return '📖'
    case 'completed':
      return '✅'
    case 'want_to_read':
      return '📚'
    default:
      return '📘'
  }
})

const statusBadgeClasses = computed(() => {
  switch (props.book.status) {
    case 'reading':
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'want_to_read':
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700'
  }
})

const fallbackCoverGradient = computed(() => {
  const g = props.book.genres?.[0]?.toLowerCase() || ''
  if (g.includes('trad') || g.includes('finance')) return 'from-cyan-900 via-blue-900 to-slate-900'
  if (g.includes('psych') || g.includes('mind')) return 'from-purple-900 via-indigo-900 to-slate-900'
  if (g.includes('help') || g.includes('habit')) return 'from-amber-900 via-orange-950 to-slate-900'
  if (g.includes('tech')) return 'from-emerald-900 via-teal-950 to-slate-900'
  return 'from-slate-800 via-slate-900 to-dark'
})
</script>
