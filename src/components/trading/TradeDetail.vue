<template>
  <teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        @click="onClose"
      ></div>

      <!-- Modal Container -->
      <div
        class="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 transform transition-all animate-modal-pop max-h-[90vh] flex flex-col"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur sticky top-0 z-20">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              :class="trade.position === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
            >
              {{ trade.position === 'BUY' ? '▲' : '▼' }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold text-white font-mono tracking-tight">
                  {{ trade.pair }}
                </h2>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="trade.position === 'BUY' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'"
                >
                  {{ trade.position }}
                </span>
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {{ trade.account_type }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ formatFullDate(trade.date) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Share / Copy -->
            <button
              type="button"
              @click="copyTradeSummary"
              class="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors"
              title="Copy Ringkasan Trade"
            >
              📋
            </button>
            <!-- Close -->
            <button
              type="button"
              @click="onClose"
              class="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Body Content (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 custom-scroll">
          <!-- 1. P&L & Status Banner -->
          <div
            class="p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4"
            :class="bannerStyle"
          >
            <div>
              <span class="text-[11px] uppercase font-bold tracking-wider opacity-80 block">Net Realized P&L</span>
              <span class="text-3xl font-extrabold font-mono mt-0.5 block">
                {{ trade.pnl !== null ? (trade.pnl >= 0 ? '+' : '') + '$' + trade.pnl.toFixed(2) : 'Open Trade' }}
              </span>
            </div>

            <div class="flex items-center gap-4 text-center sm:text-right">
              <div v-if="trade.pips !== null">
                <span class="text-[10px] uppercase font-semibold opacity-75 block">Pips Gain</span>
                <span class="text-sm font-bold font-mono">
                  {{ trade.pips > 0 ? '+' : '' }}{{ trade.pips.toFixed(1) }} pips
                </span>
              </div>

              <div v-if="trade.rr_ratio !== null">
                <span class="text-[10px] uppercase font-semibold opacity-75 block">R:R Ratio</span>
                <span class="text-sm font-bold font-mono">
                  1:{{ trade.rr_ratio.toFixed(2) }}
                </span>
              </div>

              <div>
                <span class="text-[10px] uppercase font-semibold opacity-75 block">Status</span>
                <span class="text-xs font-extrabold px-2.5 py-1 rounded-full bg-black/30 inline-block mt-0.5">
                  {{ trade.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- 2. Price Levels Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div>
              <span class="text-[10px] uppercase font-semibold text-slate-500 block">Entry Price</span>
              <span class="text-sm font-bold text-white font-mono mt-0.5 block">{{ trade.entry_price }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-semibold text-slate-500 block">Exit Price</span>
              <span class="text-sm font-bold font-mono mt-0.5 block" :class="trade.exit_price ? 'text-white' : 'text-slate-500'">
                {{ trade.exit_price ?? 'Running' }}
              </span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-semibold text-slate-500 block">Stop Loss</span>
              <span class="text-sm font-bold font-mono mt-0.5 block" :class="trade.stop_loss ? 'text-rose-400' : 'text-slate-500'">
                {{ trade.stop_loss ?? '--' }}
              </span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-semibold text-slate-500 block">Take Profit</span>
              <span class="text-sm font-bold font-mono mt-0.5 block" :class="trade.take_profit ? 'text-emerald-400' : 'text-slate-500'">
                {{ trade.take_profit ?? '--' }}
              </span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-semibold text-slate-500 block">Lot Size</span>
              <span class="text-sm font-bold text-accent font-mono mt-0.5 block">{{ trade.lot_size.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 3. Psychology & Moods Section -->
          <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🧠</span>
              <span>Psikologi & Mood Eksekusi</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <!-- Pre Mood -->
              <div class="flex items-center gap-3 bg-dark/60 p-2.5 rounded-lg border border-slate-700/40">
                <span class="text-2xl">{{ trade.pre_mood || '🎯' }}</span>
                <div>
                  <span class="text-[10px] text-slate-500 uppercase font-semibold block">Pre-Trade Mood</span>
                  <span class="text-xs font-medium text-slate-200">{{ getMoodLabel(trade.pre_mood) }}</span>
                </div>
              </div>

              <!-- Post Mood -->
              <div class="flex items-center gap-3 bg-dark/60 p-2.5 rounded-lg border border-slate-700/40">
                <span class="text-2xl">{{ trade.post_mood || '😊' }}</span>
                <div>
                  <span class="text-[10px] text-slate-500 uppercase font-semibold block">Post-Trade Mood</span>
                  <span class="text-xs font-medium text-slate-200">{{ getMoodLabel(trade.post_mood) }}</span>
                </div>
              </div>
            </div>

            <!-- Emotion Tags -->
            <div v-if="trade.emotions && trade.emotions.length > 0">
              <span class="text-[11px] text-slate-400 font-medium block mb-1.5">Emosi yang dirasakan:</span>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in trade.emotions"
                  :key="tag"
                  class="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Mistakes -->
            <div v-if="trade.mistakes && trade.mistakes.length > 0">
              <span class="text-[11px] text-slate-400 font-medium block mb-1.5">Evaluasi Kesalahan:</span>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="mistake in trade.mistakes"
                  :key="mistake"
                  class="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30"
                >
                  ⚠️ {{ mistake }}
                </span>
              </div>
            </div>
          </div>

          <!-- 4. Analysis & Reflection Notes -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>📝</span>
              <span>Catatan Analisis & Refleksi</span>
            </h3>

            <!-- Setup -->
            <div v-if="trade.setup" class="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <span class="text-[10px] uppercase font-bold text-accent block mb-1">Setup / Strategi</span>
              <p class="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{{ trade.setup }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Reason for Entry -->
              <div v-if="trade.entry_reason" class="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
                <span class="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Alasan Entry</span>
                <p class="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{{ trade.entry_reason }}</p>
              </div>

              <!-- Reason for Exit -->
              <div v-if="trade.exit_reason" class="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
                <span class="text-[10px] uppercase font-bold text-amber-400 block mb-1">Alasan Exit</span>
                <p class="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{{ trade.exit_reason }}</p>
              </div>
            </div>

            <!-- What went well -->
            <div v-if="trade.what_went_well" class="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <span class="text-[10px] uppercase font-bold text-cyan-400 block mb-1">Yang Berjalan Bagus</span>
              <p class="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{{ trade.what_went_well }}</p>
            </div>

            <!-- Improvements -->
            <div v-if="trade.improvements" class="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <span class="text-[10px] uppercase font-bold text-rose-400 block mb-1">Rencana Perbaikan</span>
              <p class="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{{ trade.improvements }}</p>
            </div>

            <!-- General Notes -->
            <div v-if="trade.notes" class="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Catatan Tambahan</span>
              <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{{ trade.notes }}</p>
            </div>
          </div>

          <!-- 5. Screenshots Gallery -->
          <div v-if="trade.screenshot_urls && trade.screenshot_urls.length > 0" class="space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🖼️</span>
              <span>Galeri Screenshot Chart ({{ trade.screenshot_urls.length }})</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(url, idx) in trade.screenshot_urls"
                :key="idx"
                @click="openLightbox(url)"
                class="group relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-dark cursor-pointer shadow-md hover:border-accent transition-all"
              >
                <img :src="url" alt="Trade Screenshot" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                  🔍 Perbesar
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between sticky bottom-0 z-20">
          <button
            type="button"
            @click="onDelete"
            class="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition-colors flex items-center gap-1.5"
          >
            <span>🗑️</span>
            <span>Hapus Trade</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="onClose"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              @click="onEdit"
              class="btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <span>✏️</span>
              <span>Edit Trade</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal for Screenshots -->
    <div
      v-if="lightboxUrl"
      class="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4"
      @click="lightboxUrl = null"
    >
      <div class="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
        <img :src="lightboxUrl" alt="Zoomed Screenshot" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        <button
          @click="lightboxUrl = null"
          class="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-slate-800/80 text-white text-xs font-bold hover:bg-slate-700"
        >
          ✕ Tutup
        </button>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Trade } from '@/types'
import { useToastStore } from '@/stores/toast'

const props = defineProps<{
  trade: Trade
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', trade: Trade): void
  (e: 'delete', tradeId: string): void
}>()

const toast = useToastStore()
const lightboxUrl = ref<string | null>(null)

const bannerStyle = computed(() => {
  if (props.trade.status === 'Win') {
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
  }
  if (props.trade.status === 'Loss') {
    return 'bg-rose-500/10 border-rose-500/30 text-rose-300'
  }
  return 'bg-slate-800/60 border-slate-700 text-slate-300'
})

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getMoodLabel(emoji: string | null): string {
  if (!emoji) return 'Netral'
  const map: Record<string, string> = {
    '🎯': 'Fokus & Siap',
    '🔥': 'Percaya Diri',
    '😌': 'Tenang',
    '🤔': 'Ragu-ragu',
    '😨': 'Cemas',
    '⚡': 'Impulsif',
    '🚀': 'Puas / Sesuai Plan',
    '🥳': 'Sangat Senang',
    '😊': 'Cukup Bagus',
    '😐': 'Biasa Saja',
    '🤦‍♂️': 'Menyesal',
    '🤬': 'Kesal / Tilt',
  }
  return map[emoji] || 'Terpilih'
}

function openLightbox(url: string) {
  lightboxUrl.value = url
}

function copyTradeSummary() {
  const t = props.trade
  const summary = `📊 SpaceOS Trade Log: ${t.pair} (${t.position})\n• Date: ${new Date(t.date).toLocaleDateString()}\n• Entry: ${t.entry_price} | Exit: ${t.exit_price ?? 'Open'}\n• Lot: ${t.lot_size} | P&L: ${t.pnl !== null ? (t.pnl >= 0 ? '+' : '') + '$' + t.pnl.toFixed(2) : '--'}\n• Status: ${t.status}\n• Setup: ${t.setup || '-'}`

  navigator.clipboard.writeText(summary)
  toast.success('Disalin ke Clipboard! 📋', 'Ringkasan trade berhasil disalin.')
}

function onClose() {
  emit('close')
}

function onEdit() {
  emit('edit', props.trade)
}

function onDelete() {
  if (confirm(`Apakah kamu yakin ingin menghapus catatan trade ${props.trade.pair}?`)) {
    emit('delete', props.trade.id)
  }
}
</script>

<style scoped>
@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-pop {
  animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
</style>
