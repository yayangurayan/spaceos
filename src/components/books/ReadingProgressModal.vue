<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-lg bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">📖</span>
          <div>
            <h2 class="text-lg font-bold text-white">Log Progres Membaca</h2>
            <p class="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
              {{ book.title }}
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

      <!-- Body (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <!-- 1. Current Progress Visualizer -->
        <div class="glass rounded-xl p-4 border border-slate-700/60 bg-slate-900/40 text-center space-y-3">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Halaman 0</span>
            <span class="font-bold text-white text-sm">
              {{ pageInput }} / {{ book.total_pages || '∞' }} Hal
            </span>
            <span>{{ book.total_pages || '??' }} Hal</span>
          </div>

          <!-- Slider -->
          <div class="px-1">
            <input
              type="range"
              min="0"
              :max="book.total_pages || 1000"
              v-model.number="pageInput"
              class="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <!-- Percentage Badge & Remaining info -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-xs text-slate-400">
              Sisa: <strong class="text-slate-200">{{ remainingPages }} halaman</strong>
            </span>
            <span
              class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border"
              :class="progressPercentage >= 100
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'"
            >
              {{ progressPercentage }}% Selesai
            </span>
          </div>
        </div>

        <!-- 2. Manual Page & Delta Input -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">
              Halaman Terakhir Selesai
            </label>
            <input
              v-model.number="pageInput"
              type="number"
              min="0"
              :max="book.total_pages || 9999"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-accent"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">
              Dibaca Hari Ini (Delta)
            </label>
            <input
              v-model.number="pagesReadSession"
              type="number"
              min="0"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-cyan-400 font-mono font-bold focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <!-- 3. Session Notes -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Catatan Sesi / Insight Singkat Hari Ini
          </label>
          <input
            v-model="sessionNotes"
            type="text"
            placeholder="e.g. Selesai Bab 3: Mengatasi ketakutan cut loss"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />
        </div>

        <!-- 4. Reading History Timeline -->
        <div class="space-y-3 pt-3 border-t border-slate-800">
          <h4 class="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span>🕒</span>
              <span>Riwayat Aktivitas Membaca</span>
            </span>
            <span class="text-[11px] font-normal text-slate-500 font-mono">
              {{ bookLogs.length }} Sesi Tercatat
            </span>
          </h4>

          <div v-if="bookLogs.length === 0" class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            Belum ada riwayat baca untuk buku ini. Mulai log sesi pertama kamu!
          </div>

          <div v-else class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            <div
              v-for="log in bookLogs"
              :key="log.id"
              class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs"
            >
              <div class="min-w-0 pr-2">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-cyan-400 font-bold">+{{ log.pages_read }} Hal</span>
                  <span class="text-slate-500 text-[10px]">{{ formatDate(log.date) }}</span>
                </div>
                <p v-if="log.notes" class="text-slate-300 text-[11px] mt-0.5 truncate">
                  {{ log.notes }}
                </p>
              </div>

              <button
                type="button"
                @click="$emit('delete-log', log.id)"
                class="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0"
                title="Hapus riwayat ini"
              >
                <Icon name="trash" :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Action Buttons -->
      <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-700/60 bg-surface/50">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Tutup
        </button>

        <button
          type="button"
          @click="handleSaveProgress"
          class="btn-primary px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 flex items-center gap-2"
        >
          <span>Simpan & Log Baca</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { Book, ReadingLog } from '@/types'

const props = defineProps<{
  book: Book
  readingLogs: ReadingLog[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', newPage: number, pagesReadSession: number, notes: string): void
  (e: 'delete-log', logId: string): void
}>()

const pageInput = ref(props.book.current_page || 0)
const pagesReadSession = ref(0)
const sessionNotes = ref('')

// Logs for this specific book
const bookLogs = computed(() => {
  return props.readingLogs.filter(l => l.book_id === props.book.id)
})

const progressPercentage = computed(() => {
  if (!props.book.total_pages || props.book.total_pages <= 0) return 0
  return Math.min(100, Math.round((pageInput.value / props.book.total_pages) * 100))
})

const remainingPages = computed(() => {
  if (!props.book.total_pages) return 0
  return Math.max(0, props.book.total_pages - pageInput.value)
})

// Auto-adjust pagesReadSession when slider/pageInput moves
watch(pageInput, (newVal) => {
  const diff = newVal - (props.book.current_page || 0)
  if (diff > 0) {
    pagesReadSession.value = diff
  }
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function handleSaveProgress() {
  emit('save', pageInput.value, pagesReadSession.value, sessionNotes.value)
}
</script>
