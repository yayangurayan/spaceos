<template>
  <div class="space-y-6 animate-fade-in w-full max-w-full min-w-0">
    <!-- Page Header & Action Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <Icon name="chart-line" size="26" class="text-accent" />
          <h1 class="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Trading Journal
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-text-tertiary mt-1">
          Catat, evaluasi psikologi, dan tingkatkan performa trading kamu secara terukur.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
        <!-- AI Trading Coach CTA -->
        <button
          type="button"
          @click="runAICoach"
          class="min-h-[44px] px-3 sm:px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
          title="Analisis pola performa, emosi, dan rekomendasi trading dengan AI"
        >
          <Icon name="sparkles" size="14" />
          <span>AI Trading Coach</span>
        </button>

        <!-- Export to CSV -->
        <button
          type="button"
          @click="exportToCSV()"
          class="min-h-[44px] btn-secondary px-3 sm:px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          title="Export data trade yang terfilter ke format CSV"
        >
          <Icon name="download" size="14" />
          <span>Export CSV</span>
        </button>

        <!-- Primary CTA: Add New Trade -->
        <button
          type="button"
          @click="openAddTradeModal"
          class="col-span-2 sm:col-span-1 min-h-[44px] btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
        >
          <Icon name="plus" size="15" />
          <span>Add New Trade</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar Component -->
    <TradeFilters v-model="filters" />

    <!-- Stats Overview (Horizontal scroll on mobile, grid on desktop) -->
    <div>
      <div class="flex items-center justify-between mb-2.5">
        <h2 class="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
          <Icon name="activity" size="14" class="text-accent" />
          <span>Ringkasan Statistik (Periode Terpilih)</span>
        </h2>
        <span class="text-[11px] text-text-tertiary font-mono">
          {{ filteredTrades.length }} trades
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto pb-1">
        <!-- 1. Total Trades -->
        <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <Icon name="bar-chart-2" size="18" class="text-text-tertiary" />
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary">Total</span>
          </div>
          <p class="text-xl sm:text-2xl font-bold text-text-primary font-mono tabular-nums">
            <AnimatedNumber :value="stats.totalTrades" />
          </p>
          <p class="text-[11px] text-text-tertiary mt-0.5">Trades</p>
        </div>

        <!-- 2. Win Rate -->
        <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <Icon name="target" size="18" class="text-accent" />
            <span
              class="text-[10px] font-bold px-1.5 py-0.5 rounded"
              :class="stats.winRate >= 50 ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss'"
            >
              {{ stats.winTrades }}W / {{ stats.lossTrades }}L
            </span>
          </div>
          <p class="text-xl sm:text-2xl font-bold font-mono tabular-nums" :class="stats.winRate >= 50 ? 'text-profit' : 'text-loss'">
            <AnimatedNumber :value="stats.winRate" suffix="%" :decimals="1" />
          </p>
          <p class="text-[11px] text-text-tertiary mt-0.5">Win Rate</p>
        </div>

        <!-- 3. Total P&L -->
        <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <Icon name="dollar-sign" size="18" :class="stats.totalPnl >= 0 ? 'text-profit' : 'text-loss'" />
            <span
              class="text-[10px] font-bold px-1.5 py-0.5 rounded"
              :class="stats.totalPnl >= 0 ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss'"
            >
              Net PnL
            </span>
          </div>
          <p
            class="text-xl sm:text-2xl font-bold font-mono tabular-nums"
            :class="stats.totalPnl >= 0 ? 'text-profit' : 'text-loss'"
          >
            <AnimatedNumber :value="stats.totalPnl" prefix="$" :decimals="2" />
          </p>
          <p class="text-[11px] text-text-tertiary mt-0.5">Total P&L</p>
        </div>

        <!-- 4. Best Trade -->
        <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <Icon name="arrow-up-right" size="18" class="text-profit" />
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-profit/15 text-profit">Max Win</span>
          </div>
          <p class="text-xl sm:text-2xl font-bold font-mono tabular-nums text-profit">
            <AnimatedNumber :value="stats.bestTrade" prefix="+$" :decimals="2" />
          </p>
          <p class="text-[11px] text-text-tertiary mt-0.5">Best Trade</p>
        </div>

        <!-- 5. Worst Trade -->
        <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <Icon name="arrow-down-right" size="18" class="text-loss" />
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-loss/15 text-loss">Max Loss</span>
          </div>
          <p class="text-xl sm:text-2xl font-bold font-mono tabular-nums text-loss">
            <AnimatedNumber :value="Math.abs(stats.worstTrade)" prefix="-$" :decimals="2" />
          </p>
          <p class="text-[11px] text-text-tertiary mt-0.5">Worst Trade</p>
        </div>

        <!-- 6. Avg R:R Ratio -->
        <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-2">
            <Icon name="layers" size="18" class="text-accent" />
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent">R:R</span>
          </div>
          <p class="text-xl sm:text-2xl font-bold font-mono tabular-nums text-accent">
            <AnimatedNumber :value="stats.avgRrRatio" prefix="1:" :decimals="2" />
          </p>
          <p class="text-[11px] text-text-tertiary mt-0.5">Average R:R</p>
        </div>
      </div>
    </div>

    <!-- P&L Chart Section -->
    <PnLChart :trades="filteredTrades" />

    <!-- Trades List Section -->
    <div class="surface-card p-5">
      <!-- Section Header + View Mode Switcher -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-border-subtle">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
            <Icon name="clipboard" size="18" class="text-accent" />
            <span>Riwayat Eksekusi Trade</span>
          </h2>
          <p class="text-xs text-text-tertiary">
            Menampilkan {{ paginatedTrades.length }} dari {{ filteredTrades.length }} trade
          </p>
        </div>

        <!-- View Mode Switcher: Table vs Card -->
        <div class="flex items-center gap-2 self-end sm:self-auto">
          <div class="flex bg-surface-elevated/70 p-1 rounded-xl border border-border-subtle text-xs">
            <button
              type="button"
              @click="viewMode = 'table'"
              class="px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all"
              :class="viewMode === 'table'
                ? 'bg-surface text-text-primary font-bold shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'"
              title="Tampilan Tabel"
            >
              <Icon name="file-text" size="13" />
              <span>Tabel</span>
            </button>
            <button
              type="button"
              @click="viewMode = 'card'"
              class="px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all"
              :class="viewMode === 'card'
                ? 'bg-surface text-text-primary font-bold shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'"
              title="Tampilan Kartu"
            >
              <Icon name="layers" size="13" />
              <span>Kartu</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-12 text-center text-text-tertiary">
        <SkeletonLoader type="table" :rows="6" :columns="6" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredTrades.length === 0"
        class="py-16 text-center flex flex-col items-center justify-center space-y-3"
      >
        <Icon name="file-text" size="44" class="text-text-tertiary opacity-40 mb-1" />
        <h3 class="text-base font-bold text-text-primary">Tidak ada trade ditemukan</h3>
        <p class="text-xs text-text-tertiary max-w-sm">
          Tidak ada catatan trade yang cocok dengan kriteria filter saat ini.
        </p>
        <button
          type="button"
          @click="openAddTradeModal"
          class="btn-primary mt-2 px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
        >
          <Icon name="plus" size="14" />
          <span>Catat Trade Baru</span>
        </button>
      </div>

      <!-- 1. TABLE VIEW (Desktop default) -->
      <div v-else-if="viewMode === 'table'" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-border-subtle text-text-tertiary font-semibold uppercase tracking-wider text-[10px] bg-surface-elevated/40">
              <th class="py-3 px-3">Tanggal</th>
              <th class="py-3 px-3">Pair</th>
              <th class="py-3 px-3">Posisi</th>
              <th class="py-3 px-3">Akun</th>
              <th class="py-3 px-3 text-right">Entry</th>
              <th class="py-3 px-3 text-right">Exit</th>
              <th class="py-3 px-3 text-right">Lot</th>
              <th class="py-3 px-3 text-right">P&L ($)</th>
              <th class="py-3 px-3 text-center">R:R</th>
              <th class="py-3 px-3 text-center">Status</th>
              <th class="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr
              v-for="trade in paginatedTrades"
              :key="trade.id"
              @click="openDetailModal(trade)"
              class="group hover:bg-surface-elevated/50 cursor-pointer transition-colors"
            >
              <!-- Date -->
              <td class="py-3.5 px-3 text-text-secondary whitespace-nowrap">
                <span class="font-medium text-text-primary block">{{ formatShortDate(trade.date) }}</span>
                <span class="text-[10px] text-text-tertiary font-mono">{{ formatTime(trade.date) }}</span>
              </td>

              <!-- Pair -->
              <td class="py-3.5 px-3 whitespace-nowrap">
                <span class="font-bold text-text-primary font-mono text-xs">{{ trade.pair }}</span>
                <span v-if="trade.screenshot_urls && trade.screenshot_urls.length > 0" class="ml-1 text-[10px] opacity-70" title="Ada screenshot">
                  <Icon name="images" size="12" class="inline text-accent" />
                </span>
              </td>

              <!-- Position -->
              <td class="py-3.5 px-3 whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                  :class="trade.position === 'BUY'
                    ? 'bg-profit/10 text-profit border border-profit/25'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/25'"
                >
                  {{ trade.position }}
                </span>
              </td>

              <!-- Account Type -->
              <td class="py-3.5 px-3 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-elevated text-text-secondary border border-border-subtle">
                  {{ trade.account_type }}
                </span>
              </td>

              <!-- Entry -->
              <td class="py-3.5 px-3 text-right font-mono tabular-nums text-text-primary whitespace-nowrap">
                {{ trade.entry_price }}
              </td>

              <!-- Exit -->
              <td class="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap" :class="trade.exit_price ? 'text-text-primary' : 'text-text-tertiary'">
                {{ trade.exit_price ?? 'Open' }}
              </td>

              <!-- Lot -->
              <td class="py-3.5 px-3 text-right font-mono tabular-nums text-accent whitespace-nowrap">
                {{ trade.lot_size.toFixed(2) }}
              </td>

              <!-- P&L -->
              <td class="py-3.5 px-3 text-right font-mono tabular-nums font-bold whitespace-nowrap"
                :class="trade.pnl !== null ? (trade.pnl >= 0 ? 'text-profit' : 'text-loss') : 'text-text-tertiary'"
              >
                <div v-if="trade.pnl !== null">
                  <span>{{ trade.pnl >= 0 ? '+' : '' }}${{ trade.pnl.toFixed(2) }}</span>
                  <span v-if="trade.pips !== null" class="block text-[10px] font-normal text-text-tertiary">
                    {{ trade.pips > 0 ? '+' : '' }}{{ trade.pips.toFixed(1) }}p
                  </span>
                </div>
                <span v-else>--</span>
              </td>

              <!-- R:R -->
              <td class="py-3.5 px-3 text-center font-mono tabular-nums text-text-secondary whitespace-nowrap">
                {{ trade.rr_ratio !== null ? '1:' + trade.rr_ratio.toFixed(2) : '--' }}
              </td>

              <!-- Status -->
              <td class="py-3.5 px-3 text-center whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="trade.status === 'Win'
                    ? 'bg-profit/15 text-profit'
                    : trade.status === 'Loss'
                    ? 'bg-loss/15 text-loss'
                    : trade.status === 'Breakeven'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-surface-elevated text-text-secondary'"
                >
                  {{ trade.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-3 text-right whitespace-nowrap" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    @click="openDetailModal(trade)"
                    class="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    title="Lihat Detail"
                  >
                    <Icon name="eye" size="14" />
                  </button>
                  <button
                    type="button"
                    @click="openEditModal(trade)"
                    class="p-1.5 rounded-lg text-text-tertiary hover:text-accent hover:bg-surface-elevated transition-colors"
                    title="Edit Trade"
                  >
                    <Icon name="edit" size="14" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDeleteTrade(trade)"
                    class="p-1.5 rounded-lg text-text-tertiary hover:text-rose-400 hover:bg-surface-elevated transition-colors"
                    title="Hapus Trade"
                  >
                    <Icon name="trash" size="14" />
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
          class="p-4 rounded-xl bg-surface-elevated/50 border border-border-subtle hover:border-border-default cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
        >
          <!-- Card Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold text-text-primary font-mono text-sm">{{ trade.pair }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                :class="trade.position === 'BUY'
                  ? 'bg-profit/10 text-profit border border-profit/25'
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/25'"
              >
                {{ trade.position }}
              </span>
              <span class="text-[10px] text-text-tertiary bg-surface px-2 py-0.5 rounded border border-border-subtle">
                {{ trade.account_type }}
              </span>
            </div>

            <!-- Status Badge -->
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold"
              :class="trade.status === 'Win'
                ? 'bg-profit/15 text-profit'
                : trade.status === 'Loss'
                ? 'bg-loss/15 text-loss'
                : 'bg-surface-elevated text-text-secondary'"
            >
              {{ trade.status }}
            </span>
          </div>

          <!-- Price Flow & P&L -->
          <div class="flex items-center justify-between pt-1 border-t border-border-subtle">
            <div>
              <span class="text-[10px] text-text-tertiary uppercase font-semibold block">Entry / Exit</span>
              <span class="text-xs font-mono tabular-nums text-text-secondary">
                {{ trade.entry_price }} → {{ trade.exit_price ?? 'Open' }}
              </span>
            </div>

            <div class="text-right">
              <span class="text-[10px] text-text-tertiary uppercase font-semibold block">P&L ($)</span>
              <span
                class="text-base font-bold font-mono tabular-nums"
                :class="trade.pnl !== null ? (trade.pnl >= 0 ? 'text-profit' : 'text-loss') : 'text-text-tertiary'"
              >
                {{ trade.pnl !== null ? (trade.pnl >= 0 ? '+' : '') + '$' + trade.pnl.toFixed(2) : '--' }}
              </span>
            </div>
          </div>

          <!-- Footer Info: Date, Lot, Mood, Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-border-subtle text-xs text-text-tertiary">
            <div class="flex items-center gap-2">
              <span class="flex items-center gap-1">
                <Icon name="calendar" size="12" />
                <span>{{ formatShortDate(trade.date) }}</span>
              </span>
              <span>•</span>
              <span class="text-accent font-mono">{{ trade.lot_size.toFixed(2) }}L</span>
            </div>

            <div class="flex items-center gap-1" @click.stop>
              <button
                type="button"
                @click="openEditModal(trade)"
                class="p-1 rounded text-text-tertiary hover:text-accent"
              >
                <Icon name="edit" size="13" />
              </button>
              <button
                type="button"
                @click="confirmDeleteTrade(trade)"
                class="p-1 rounded text-text-tertiary hover:text-rose-400"
              >
                <Icon name="trash" size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="filteredTrades.length > itemsPerPage"
        class="mt-6 pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-tertiary"
      >
        <span>
          Halaman <strong class="text-text-primary">{{ currentPage }}</strong> dari <strong class="text-text-primary">{{ totalPages }}</strong>
        </span>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed border border-border-subtle transition-colors"
          >
            Sebelumnya
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            @click="currentPage = p"
            class="w-7 h-7 rounded-lg text-xs font-semibold transition-colors"
            :class="currentPage === p ? 'bg-accent text-dark font-bold' : 'bg-surface-elevated hover:bg-surface text-text-secondary border border-border-subtle'"
          >
            {{ p }}
          </button>

          <button
            type="button"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed border border-border-subtle transition-colors"
          >
            Selanjutnya
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

    <!-- 3. AI Trading Coach Modal -->
    <AIInsightModal
      v-if="showAIModal"
      title="Laporan AI Trading Coach & Analisis Psikologi"
      icon="sparkles"
      :content="aiAnalysisResult"
      :is-loading="isAnalyzing"
      loading-title="AI Sedang Menganalisis Pola 20 Trade & Psikologi Anda..."
      @close="showAIModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import TradeFilters from '@/components/trading/TradeFilters.vue'
import PnLChart from '@/components/trading/PnLChart.vue'
import TradeForm from '@/components/trading/TradeForm.vue'
import TradeDetail from '@/components/trading/TradeDetail.vue'
import AIInsightModal from '@/components/ai/AIInsightModal.vue'
import { useTrading } from '@/composables/useTrading'
import { useTradingAI } from '@/composables/useTradingAI'
import type { Trade, TradeFormData } from '@/types'

const {
  filteredTrades,
  paginatedTrades,
  stats,
  filters,
  currentPage,
  totalPages,
  itemsPerPage,
  isLoading,
  fetchTrades,
  createTrade,
  updateTrade,
  deleteTrade,
  exportToCSV,
} = useTrading()

const { isAnalyzing, analyzeTrades } = useTradingAI()

const showAIModal = ref(false)
const aiAnalysisResult = ref('')

async function runAICoach() {
  showAIModal.value = true
  aiAnalysisResult.value = ''
  const res = await analyzeTrades(filteredTrades.value)
  aiAnalysisResult.value = res
}

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
