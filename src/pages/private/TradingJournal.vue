<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page Header & Action Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📊</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trading Journal
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Catat, evaluasi psikologi, dan tingkatkan performa trading kamu secara terukur.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <!-- Export to CSV -->
        <button
          type="button"
          @click="exportToCSV()"
          class="flex-1 sm:flex-none glass rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-accent/40 flex items-center justify-center gap-2 transition-all"
          title="Export data trade yang terfilter ke format CSV"
        >
          <span>📥</span>
          <span>Export CSV</span>
        </button>

        <!-- Primary CTA: Add New Trade -->
        <button
          type="button"
          @click="openAddTradeModal"
          class="flex-1 sm:flex-none btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <span class="text-base leading-none">+</span>
          <span>Add New Trade</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar Component -->
    <TradeFilters v-model="filters" />

    <!-- Stats Overview (Horizontal scroll on mobile, grid on desktop) -->
    <div>
      <div class="flex items-center justify-between mb-2.5">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>📈</span>
          <span>Ringkasan Statistik (Periode Terpilih)</span>
        </h2>
        <span class="text-[11px] text-slate-500 font-medium">
          {{ filteredTrades.length }} trades tercatat
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto pb-1">
        <!-- 1. Total Trades -->
        <div class="glass rounded-xl p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xl">📊</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Total</span>
          </div>
          <p class="text-xl sm:text-2xl font-bold text-white font-mono">
            <AnimatedNumber :value="stats.totalTrades" />
          </p>
          <p class="text-[11px] text-slate-400 mt-0.5">Trades</p>
        </div>

        <!-- 2. Win Rate -->
        <div class="glass rounded-xl p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xl">🎯</span>
            <span
              class="text-[10px] font-bold px-1.5 py-0.5 rounded"
              :class="stats.winRate >= 50 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'"
            >
              {{ stats.winTrades }}W / {{ stats.lossTrades }}L
            </span>
          </div>
          <p class="text-xl sm:text-2xl font-bold font-mono" :class="stats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'">
            <AnimatedNumber :value="stats.winRate" suffix="%" :decimals="1" />
          </p>
          <p class="text-[11px] text-slate-400 mt-0.5">Win Rate</p>
        </div>

        <!-- 3. Total P&L -->
        <div class="glass rounded-xl p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xl">💰</span>
            <span
              class="text-[10px] font-bold px-1.5 py-0.5 rounded"
              :class="stats.totalPnl >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'"
            >
              Net PnL
            </span>
          </div>
          <p
            class="text-xl sm:text-2xl font-bold font-mono"
            :class="stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'"
          >
            <AnimatedNumber :value="stats.totalPnl" prefix="$" :decimals="2" />
          </p>
          <p class="text-[11px] text-slate-400 mt-0.5">Total P&L</p>
        </div>

        <!-- 4. Best Trade -->
        <div class="glass rounded-xl p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xl">🚀</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Max Win</span>
          </div>
          <p class="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            <AnimatedNumber :value="stats.bestTrade" prefix="+$" :decimals="2" />
          </p>
          <p class="text-[11px] text-slate-400 mt-0.5">Best Trade</p>
        </div>

        <!-- 5. Worst Trade -->
        <div class="glass rounded-xl p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xl">🛑</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400">Max Loss</span>
          </div>
          <p class="text-xl sm:text-2xl font-bold font-mono text-rose-400">
            <AnimatedNumber :value="Math.abs(stats.worstTrade)" prefix="-$" :decimals="2" />
          </p>
          <p class="text-[11px] text-slate-400 mt-0.5">Worst Trade</p>
        </div>

        <!-- 6. Avg R:R Ratio -->
        <div class="glass rounded-xl p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xl">⚖️</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">Risk/Reward</span>
          </div>
          <p class="text-xl sm:text-2xl font-bold font-mono text-accent">
            <AnimatedNumber :value="stats.avgRrRatio" prefix="1:" :decimals="2" />
          </p>
          <p class="text-[11px] text-slate-400 mt-0.5">Average R:R</p>
        </div>
      </div>
    </div>

    <!-- P&L Chart Section -->
    <PnLChart :trades="filteredTrades" />

    <!-- Trades List Section -->
    <div class="glass rounded-xl p-5">
      <!-- Section Header + View Mode Switcher -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-700/50">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>📋</span>
            <span>Riwayat Eksekusi Trade</span>
          </h2>
          <p class="text-xs text-slate-400">
            Menampilkan {{ paginatedTrades.length }} dari {{ filteredTrades.length }} trade
          </p>
        </div>

        <!-- View Mode Switcher: Table vs Card -->
        <div class="flex items-center gap-2 self-end sm:self-auto">
          <div class="flex bg-dark/80 p-1 rounded-lg border border-slate-700/60 text-xs">
            <button
              type="button"
              @click="viewMode = 'table'"
              class="px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all"
              :class="viewMode === 'table'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'"
              title="Tampilan Tabel"
            >
              <span>📑 Tabel</span>
            </button>
            <button
              type="button"
              @click="viewMode = 'card'"
              class="px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all"
              :class="viewMode === 'card'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'"
              title="Tampilan Kartu"
            >
              <span>🗂️ Kartu</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-12 text-center text-slate-400">
        <SkeletonLoader type="table" :rows="6" :columns="6" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredTrades.length === 0"
        class="py-16 text-center flex flex-col items-center justify-center space-y-3"
      >
        <span class="text-5xl mb-1">📝</span>
        <h3 class="text-base font-bold text-white">Tidak ada trade ditemukan</h3>
        <p class="text-xs text-slate-400 max-w-sm">
          Tidak ada catatan trade yang cocok dengan kriteria filter saat ini.
        </p>
        <button
          type="button"
          @click="openAddTradeModal"
          class="btn-primary mt-2 px-5 py-2 text-xs font-bold rounded-xl"
        >
          + Catat Trade Baru Sekarang
        </button>
      </div>

      <!-- 1. TABLE VIEW (Desktop default) -->
      <div v-else-if="viewMode === 'table'" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-700/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th class="pb-3 px-3">Tanggal</th>
              <th class="pb-3 px-3">Pair</th>
              <th class="pb-3 px-3">Posisi</th>
              <th class="pb-3 px-3">Akun</th>
              <th class="pb-3 px-3 text-right">Entry</th>
              <th class="pb-3 px-3 text-right">Exit</th>
              <th class="pb-3 px-3 text-right">Lot</th>
              <th class="pb-3 px-3 text-right">P&L ($)</th>
              <th class="pb-3 px-3 text-center">R:R</th>
              <th class="pb-3 px-3 text-center">Status</th>
              <th class="pb-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr
              v-for="trade in paginatedTrades"
              :key="trade.id"
              @click="openDetailModal(trade)"
              class="group hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <!-- Date -->
              <td class="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                <span class="font-medium text-white block">{{ formatShortDate(trade.date) }}</span>
                <span class="text-[10px] text-slate-500">{{ formatTime(trade.date) }}</span>
              </td>

              <!-- Pair -->
              <td class="py-3.5 px-3 whitespace-nowrap">
                <span class="font-bold text-white font-mono text-xs">{{ trade.pair }}</span>
                <span v-if="trade.screenshot_urls && trade.screenshot_urls.length > 0" class="ml-1 text-[10px] opacity-70" title="Ada screenshot">📸</span>
              </td>

              <!-- Position -->
              <td class="py-3.5 px-3 whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="trade.position === 'BUY'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'"
                >
                  {{ trade.position === 'BUY' ? '▲ BUY' : '▼ SELL' }}
                </span>
              </td>

              <!-- Account Type -->
              <td class="py-3.5 px-3 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {{ trade.account_type }}
                </span>
              </td>

              <!-- Entry -->
              <td class="py-3.5 px-3 text-right font-mono text-slate-200 whitespace-nowrap">
                {{ trade.entry_price }}
              </td>

              <!-- Exit -->
              <td class="py-3.5 px-3 text-right font-mono whitespace-nowrap" :class="trade.exit_price ? 'text-slate-200' : 'text-slate-500'">
                {{ trade.exit_price ?? 'Open' }}
              </td>

              <!-- Lot -->
              <td class="py-3.5 px-3 text-right font-mono text-accent whitespace-nowrap">
                {{ trade.lot_size.toFixed(2) }}
              </td>

              <!-- P&L -->
              <td class="py-3.5 px-3 text-right font-mono font-bold whitespace-nowrap"
                :class="trade.pnl !== null ? (trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500'"
              >
                <div v-if="trade.pnl !== null">
                  <span>{{ trade.pnl >= 0 ? '+' : '' }}${{ trade.pnl.toFixed(2) }}</span>
                  <span v-if="trade.pips !== null" class="block text-[10px] font-normal text-slate-400">
                    {{ trade.pips > 0 ? '+' : '' }}{{ trade.pips.toFixed(1) }}p
                  </span>
                </div>
                <span v-else>--</span>
              </td>

              <!-- R:R -->
              <td class="py-3.5 px-3 text-center font-mono text-slate-300 whitespace-nowrap">
                {{ trade.rr_ratio !== null ? '1:' + trade.rr_ratio.toFixed(2) : '--' }}
              </td>

              <!-- Status -->
              <td class="py-3.5 px-3 text-center whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="trade.status === 'Win'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : trade.status === 'Loss'
                    ? 'bg-rose-500/15 text-rose-400'
                    : trade.status === 'Breakeven'
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-slate-700 text-slate-300'"
                >
                  {{ trade.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-3 text-right whitespace-nowrap" @click.stop>
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="openDetailModal(trade)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Lihat Detail"
                  >
                    👁️
                  </button>
                  <button
                    type="button"
                    @click="openEditModal(trade)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-slate-700 transition-colors"
                    title="Edit Trade"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    @click="confirmDeleteTrade(trade)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                    title="Hapus Trade"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. CARD VIEW (Mobile-first responsive cards) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div
          v-for="trade in paginatedTrades"
          :key="trade.id"
          @click="openDetailModal(trade)"
          class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-accent/40 cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
        >
          <!-- Card Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white font-mono text-sm">{{ trade.pair }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="trade.position === 'BUY'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'"
              >
                {{ trade.position }}
              </span>
              <span class="text-[10px] text-slate-400 bg-dark px-2 py-0.5 rounded">
                {{ trade.account_type }}
              </span>
            </div>

            <!-- Status Badge -->
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold"
              :class="trade.status === 'Win'
                ? 'bg-emerald-500/20 text-emerald-400'
                : trade.status === 'Loss'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-slate-700 text-slate-300'"
            >
              {{ trade.status }}
            </span>
          </div>

          <!-- Price Flow & P&L -->
          <div class="flex items-center justify-between pt-1 border-t border-slate-700/40">
            <div>
              <span class="text-[10px] text-slate-500 uppercase font-semibold block">Entry → Exit</span>
              <span class="text-xs font-mono text-slate-200">
                {{ trade.entry_price }} → {{ trade.exit_price ?? 'Open' }}
              </span>
            </div>

            <div class="text-right">
              <span class="text-[10px] text-slate-500 uppercase font-semibold block">P&L ($)</span>
              <span
                class="text-base font-bold font-mono"
                :class="trade.pnl !== null ? (trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500'"
              >
                {{ trade.pnl !== null ? (trade.pnl >= 0 ? '+' : '') + '$' + trade.pnl.toFixed(2) : '--' }}
              </span>
            </div>
          </div>

          <!-- Footer Info: Date, Lot, Mood, Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs text-slate-400">
            <div class="flex items-center gap-2">
              <span>📅 {{ formatShortDate(trade.date) }}</span>
              <span>•</span>
              <span class="text-accent font-mono">{{ trade.lot_size.toFixed(2) }}L</span>
              <span v-if="trade.post_mood" class="text-sm" :title="'Mood: ' + trade.post_mood">
                {{ trade.post_mood }}
              </span>
            </div>

            <div class="flex items-center gap-1" @click.stop>
              <button
                type="button"
                @click="openEditModal(trade)"
                class="p-1 rounded text-slate-400 hover:text-accent"
              >
                ✏️
              </button>
              <button
                type="button"
                @click="confirmDeleteTrade(trade)"
                class="p-1 rounded text-slate-400 hover:text-rose-400"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="filteredTrades.length > itemsPerPage"
        class="mt-6 pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400"
      >
        <span>
          Halaman <strong>{{ currentPage }}</strong> dari <strong>{{ totalPages }}</strong>
        </span>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Sebelumnya
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            @click="currentPage = p"
            class="w-7 h-7 rounded-lg text-xs font-semibold transition-colors"
            :class="currentPage === p ? 'bg-accent text-dark font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'"
          >
            {{ p }}
          </button>

          <button
            type="button"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya →
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- 1. Add / Edit Trade Form Modal -->
    <TradeForm
      v-if="showFormModal"
      :trade="selectedTrade"
      @close="closeFormModal"
      @save="handleSaveTrade"
    />

    <!-- 2. Trade Detail Modal -->
    <TradeDetail
      v-if="showDetailModal && selectedTrade"
      :trade="selectedTrade"
      @close="closeDetailModal"
      @edit="handleEditFromDetail"
      @delete="handleDeleteFromDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import TradeFilters from '@/components/trading/TradeFilters.vue'
import PnLChart from '@/components/trading/PnLChart.vue'
import TradeForm from '@/components/trading/TradeForm.vue'
import TradeDetail from '@/components/trading/TradeDetail.vue'
import { useTrading } from '@/composables/useTrading'
import type { Trade, TradeFormData } from '@/types'

const {
  filteredTrades,
  paginatedTrades,
  stats,
  filters,
  currentPage,
  itemsPerPage,
  totalPages,
  isLoading,
  fetchTrades,
  createTrade,
  updateTrade,
  deleteTrade,
  exportToCSV,
} = useTrading()

// UI state
const viewMode = ref<'table' | 'card'>('table')
const showFormModal = ref(false)
const showDetailModal = ref(false)
const selectedTrade = ref<Trade | null>(null)

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

/* ============================
   Modal Control Handlers
   ============================ */
function openAddTradeModal() {
  selectedTrade.value = null
  showFormModal.value = true
}

function openEditModal(trade: Trade) {
  selectedTrade.value = trade
  showFormModal.value = true
}

function openDetailModal(trade: Trade) {
  selectedTrade.value = trade
  showDetailModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  selectedTrade.value = null
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedTrade.value = null
}

function handleEditFromDetail(trade: Trade) {
  closeDetailModal()
  openEditModal(trade)
}

async function handleDeleteFromDetail(tradeId: string) {
  closeDetailModal()
  await deleteTrade(tradeId)
}

async function confirmDeleteTrade(trade: Trade) {
  if (confirm(`Hapus catatan trade ${trade.pair} (${trade.position})?`)) {
    await deleteTrade(trade.id)
  }
}

async function handleSaveTrade(formData: TradeFormData) {
  if (selectedTrade.value) {
    const res = await updateTrade(selectedTrade.value.id, formData)
    if (res.success) closeFormModal()
  } else {
    const res = await createTrade(formData)
    if (res.success) closeFormModal()
  }
}

onMounted(() => {
  fetchTrades()
})
</script>
