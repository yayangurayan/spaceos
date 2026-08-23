<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header with Cover & Title -->
      <div class="p-6 border-b border-slate-700/60 bg-slate-900/50 flex flex-col sm:flex-row gap-5 items-start">
        <!-- Book Cover Preview -->
        <div class="w-24 sm:w-28 h-36 sm:h-40 rounded-xl overflow-hidden shadow-lg bg-slate-800 border border-slate-700 flex-shrink-0">
          <img
            v-if="book.cover_url && !imageError"
            :src="book.cover_url"
            :alt="book.title"
            class="w-full h-full object-cover"
            @error="imageError = true"
          />
          <div
            v-else
            class="w-full h-full flex flex-col justify-between p-2.5 text-center bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900"
          >
            <span class="text-[10px] font-black uppercase text-white/40">SpaceOS</span>
            <p class="text-xs font-bold text-white line-clamp-3">{{ book.title }}</p>
            <p class="text-[10px] text-white/70 truncate">{{ book.author }}</p>
          </div>
        </div>

        <!-- Book Meta -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span
                class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-1.5"
                :class="statusBadgeClasses"
              >
                <span>{{ statusIcon }}</span>
                <span>{{ statusLabel }}</span>
              </span>
              <h2 class="text-lg sm:text-xl font-bold text-white leading-tight">
                {{ book.title }}
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Karya <strong class="text-slate-300">{{ book.author }}</strong>
              </p>
            </div>

            <button
              type="button"
              @click="$emit('close')"
              class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Icon name="x" :size="18" />
            </button>
          </div>

          <!-- Rating & Recommender -->
          <div class="flex flex-wrap items-center gap-3 mt-3 text-xs">
            <div v-if="book.rating" class="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <span class="text-amber-400">★</span>
              <span class="font-bold text-white">{{ book.rating }}.0</span>
              <span class="text-[10px] text-slate-400">/ 5</span>
            </div>

            <div v-if="book.recommended_by" class="flex items-center gap-1.5 text-slate-400">
              <Icon name="sparkles" :size="13" class="text-accent" />
              <span>Rekomendasi: <strong class="text-slate-300">{{ book.recommended_by }}</strong></span>
            </div>
          </div>

          <!-- Genres -->
          <div v-if="book.genres && book.genres.length > 0" class="flex flex-wrap gap-1.5 mt-3">
            <span
              v-for="g in book.genres"
              :key="g"
              class="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
            >
              {{ g }}
            </span>
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <!-- Progress Summary -->
        <div v-if="book.total_pages" class="glass rounded-xl p-4 border border-slate-700/60 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400 font-medium">Progres Membaca</span>
            <span class="font-mono font-bold text-accent">
              {{ book.current_page }} / {{ book.total_pages }} Halaman ({{ progressPercentage }}%)
            </span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div
              class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>

          <!-- Dates Info -->
          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Mulai: {{ book.start_date ? formatDate(book.start_date) : '-' }}</span>
            <span>Selesai: {{ book.end_date ? formatDate(book.end_date) : (book.status === 'completed' ? 'Selesai' : 'Sedang berjalan') }}</span>
          </div>
        </div>

        <!-- Review & Thoughts -->
        <div v-if="book.review" class="space-y-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>📝</span>
            <span>Review & Catatan Pribadi</span>
          </h3>
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            {{ book.review }}
          </div>
        </div>

        <!-- Key Insights -->
        <div v-if="book.insights" class="space-y-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <span>💡</span>
            <span>Key Insights & Pembelajaran</span>
          </h3>
          <div class="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 font-mono leading-relaxed whitespace-pre-line">
            {{ book.insights }}
          </div>
        </div>

        <!-- Quotes I Love -->
        <div v-if="book.quotes" class="space-y-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>💬</span>
            <span>Kutipan Favorit (Quotes I Love)</span>
          </h3>
          <blockquote class="p-4 rounded-xl bg-amber-950/20 border-l-4 border-amber-500 text-xs text-amber-200 italic leading-relaxed whitespace-pre-line">
            “{{ book.quotes }}”
          </blockquote>
        </div>

        <!-- Reading History Logs for this Book -->
        <div class="space-y-2 pt-2 border-t border-slate-800">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span>🕒</span>
              <span>Riwayat Sesi Membaca</span>
            </span>
            <span class="text-[11px] text-slate-500 font-mono">{{ bookLogs.length }} Sesi</span>
          </h3>

          <div v-if="bookLogs.length === 0" class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            Belum ada catatan log membaca untuk buku ini.
          </div>

          <div v-else class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            <div
              v-for="log in bookLogs"
              :key="log.id"
              class="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs"
            >
              <div>
                <span class="font-mono text-cyan-400 font-bold">+{{ log.pages_read }} Hal</span>
                <span class="text-slate-500 text-[10px] ml-2">{{ formatDate(log.date) }}</span>
                <p v-if="log.notes" class="text-slate-300 text-[11px] mt-0.5">{{ log.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-700/60 bg-surface/50">
        <button
          type="button"
          @click="$emit('edit', book)"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Icon name="edit" :size="14" />
          <span>Edit Buku</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('update-progress', book)"
            class="btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Icon name="plus" :size="13" />
            <span>Update Progres</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { Book, ReadingLog } from '@/types'

const props = defineProps<{
  book: Book
  readingLogs: ReadingLog[]
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'edit', book: Book): void
  (e: 'update-progress', book: Book): void
}>()

const imageError = ref(false)

const bookLogs = computed(() => {
  return props.readingLogs.filter(l => l.book_id === props.book.id)
})

const progressPercentage = computed(() => {
  if (!props.book.total_pages || props.book.total_pages <= 0) return 0
  return Math.min(100, Math.round(((props.book.current_page || 0) / props.book.total_pages) * 100))
})

const statusLabel = computed(() => {
  switch (props.book.status) {
    case 'reading': return 'Sedang Dibaca'
    case 'completed': return 'Selesai'
    case 'want_to_read': return 'Ingin Dibaca'
    default: return 'Buku'
  }
})

const statusIcon = computed(() => {
  switch (props.book.status) {
    case 'reading': return '📖'
    case 'completed': return '✅'
    case 'want_to_read': return '📚'
    default: return '📘'
  }
})

const statusBadgeClasses = computed(() => {
  switch (props.book.status) {
    case 'reading': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
    case 'completed': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'want_to_read': return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    default: return 'bg-slate-800 text-slate-300 border-slate-700'
  }
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
