<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-1 flex items-center gap-2.5">
          <Icon name="chart-line" size="24" class="text-accent" />
          <span>{{ currentSpace?.category === 'private' ? t('private_dashboard') : t('dashboard_trading') }}</span>
        </h1>
        <p class="text-text-tertiary text-xs sm:text-sm">{{ currentSpace?.category === 'private' ? t('private_space_subtitle') : t('trading_habit') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          to="/backtesting"
          class="px-3.5 py-2 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold border border-accent/25 transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
        >
          <Icon name="zap" size="14" />
          <span>Lab Backtesting</span>
        </router-link>

        <router-link
          to="/trading"
          class="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-98"
        >
          <Icon name="plus" size="14" />
          <span>{{ t('add_new_trade') }}</span>
        </router-link>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="surface-card p-8 text-center animate-fade-in border border-rose-500/30">
      <div class="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">
        <Icon name="alert-triangle" size="24" />
      </div>
      <p class="text-text-primary font-semibold mb-1">{{ t('failed_load_data') }}</p>
      <p class="text-xs text-text-tertiary mb-4">{{ error }}</p>
      <button class="btn-primary" @click="retry">{{ t('try_again') }}</button>
    </div>

    <template v-else>
      <!-- Stats Cards (Loading) -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonLoader v-for="i in 4" :key="i" type="card" />
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="bar-chart-2"
          :value="stats.totalTrades"
          label="Total Trades (bulan ini)"
          :change="stats.totalTradesChange"
          :change-positive="true"
          :delay="0"
        />
        <StatCard
          icon="target"
          :value="stats.winRate"
          label="Win Rate"
          :change="stats.winRateChange"
          :change-positive="true"
          suffix="%"
          :delay="100"
        >
          <ProgressBar
            :value="stats.winRate"
            color="cyan"
            :height="4"
          />
        </StatCard>
        <StatCard
          icon="dollar-sign"
          :value="stats.totalPnl"
          label="Total P&L (bulan ini)"
          :change="stats.totalPnlChange"
          :change-positive="stats.totalPnl >= 0"
          prefix="$"
          :delay="200"
        />
        <StatCard
          icon="flame"
          :value="stats.currentStreak"
          label="Current Streak (hari)"
          :change="stats.streakChange"
          :change-positive="true"
          :delay="300"
          suffix=" hari"
        />
      </div>

      <!-- Trading Plan & Active Strategy (Editable) -->
      <TradingPlanCard :show-backtest-link="true" class="animate-fade-in" />

      <!-- Recent Trades Table -->
      <div class="animate-fade-in" :style="{ animationDelay: '250ms', opacity: 0 }">
        <div class="flex items-center justify-between mb-3.5">
          <div class="flex items-center gap-2">
            <h2 class="text-sm sm:text-base font-bold text-text-primary uppercase tracking-wider">{{ t('trades_last') }}</h2>
          </div>
          <button @click="router.push('/trading')" class="text-accent text-xs font-semibold hover:underline flex items-center gap-1 transition-colors">
            <span>Lihat Semua</span>
            <Icon name="arrow-up-right" size="13" />
          </button>
        </div>

        <!-- Loading -->
        <SkeletonLoader v-if="isLoading" type="table" :rows="5" :columns="5" />

        <!-- Table -->
        <div v-else class="surface-card overflow-hidden">
          <!-- Header -->
          <div class="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-border-subtle text-[11px] font-semibold text-text-tertiary uppercase tracking-wider bg-surface-elevated/40">
            <span>{{ t('date') }}</span>
            <span>{{ t('pair') }}</span>
            <span>{{ t('position') }}</span>
            <span class="text-right">{{ t('pnl') }}</span>
            <span class="text-right">{{ t('status') }}</span>
          </div>

          <!-- Rows -->
          <div
            v-for="trade in recentTrades"
            :key="trade.id"
            class="trade-row grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 px-5 py-3.5 border-b border-border-subtle last:border-0 cursor-pointer transition-colors"
            @click="onTradeClick(trade)"
          >
            <!-- Date -->
            <div class="text-xs text-text-secondary flex items-center">
              <span class="sm:hidden text-[10px] text-text-tertiary uppercase mr-1">{{ t('date') }}:</span>
              {{ formatTradeDate(trade.date) }}
            </div>
            <!-- Pair -->
            <div class="text-xs font-mono font-bold text-text-primary flex items-center">
              <span class="sm:hidden text-[10px] text-text-tertiary uppercase mr-1 font-sans font-normal">{{ t('pair') }}:</span>
              {{ trade.pair }}
            </div>
            <!-- Position -->
            <div>
              <span class="sm:hidden text-[10px] text-text-tertiary uppercase block mb-0.5">{{ t('position') }}</span>
              <span
                class="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md"
                :class="trade.position === 'Long'
                  ? 'bg-profit/10 text-profit border border-profit/25'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'"
              >
                {{ trade.position }}
              </span>
            </div>
            <!-- P&L -->
            <div class="text-xs font-mono tabular-nums font-semibold text-right"
              :class="trade.pnl >= 0 ? 'text-profit' : 'text-loss'"
            >
              <span class="sm:hidden text-[10px] text-text-tertiary uppercase block font-sans font-normal">{{ t('pnl') }}</span>
              {{ trade.pnl >= 0 ? '+' : '' }}${{ trade.pnl.toFixed(2) }}
            </div>
            <!-- Status -->
            <div class="text-right">
              <span class="sm:hidden text-[10px] text-text-tertiary uppercase block mb-0.5 text-left">{{ t('status') }}</span>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="trade.status === 'Win'
                  ? 'bg-profit/15 text-profit'
                  : 'bg-loss/15 text-loss'"
              >
                {{ trade.status === 'Win' ? 'Win' : 'Loss' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions + Risk Management -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Quick Actions -->
        <div class="surface-card p-5 animate-fade-in" :style="{ animationDelay: '350ms', opacity: 0 }">
          <h2 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-3.5">{{ t('quick_actions') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              @click="router.push('/trading')"
              class="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold"
            >
              <Icon name="edit" size="15" />
              <span>{{ t('add_new_trade') }}</span>
            </button>
            <button
              @click="router.push('/backtesting')"
              class="btn-secondary flex items-center justify-center gap-2 py-2.5 text-xs font-medium"
            >
              <Icon name="zap" size="15" />
              <span>Uji Backtest</span>
            </button>
            <button
              @click="router.push('/calculator')"
              class="btn-secondary flex items-center justify-center gap-2 py-2.5 text-xs font-medium"
            >
              <Icon name="calculator" size="15" />
              <span>Kalkulator</span>
            </button>
          </div>
        </div>

        <!-- Risk Management & Discipline Widget -->
        <div class="surface-card p-5 animate-fade-in" :style="{ animationDelay: '400ms', opacity: 0 }">
          <div class="flex items-center justify-between mb-3.5">
            <div class="flex items-center gap-2">
              <Icon name="shield" size="16" class="text-accent" />
              <h2 class="text-sm font-bold text-text-primary uppercase tracking-wider">Manajemen Risiko & Disiplin</h2>
            </div>
            <router-link
              to="/calculator"
              class="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>Kalkulator Lot</span>
              <Icon name="arrow-up-right" size="12" />
            </router-link>
          </div>

          <div class="space-y-2.5">
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/70 border border-border-subtle">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Icon name="stop-circle" size="15" />
                </div>
                <div>
                  <p class="text-xs font-bold text-text-primary">Aturan Stop Loss Otomatis</p>
                  <p class="text-[10px] text-text-tertiary">Selalu tentukan SL sebelum entri posisi</p>
                </div>
              </div>
              <span class="text-xs font-bold font-mono tabular-nums text-accent">Max 1-2%</span>
            </div>

            <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/70 border border-border-subtle">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Icon name="target" size="15" />
                </div>
                <div>
                  <p class="text-xs font-bold text-text-primary">Target Risk : Reward Ideal</p>
                  <p class="text-[10px] text-text-tertiary">Hanya ambil setup dengan potensi memadai</p>
                </div>
              </div>
              <span class="text-xs font-bold font-mono tabular-nums text-profit">Min 1 : 2</span>
            </div>

            <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/70 border border-border-subtle">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Icon name="activity" size="15" />
                </div>
                <div>
                  <p class="text-xs font-bold text-text-primary">Disiplin Psikologi Pasar</p>
                  <p class="text-[10px] text-text-tertiary">Jeda setelah 2x loss beruntun, hindari FOMO</p>
                </div>
              </div>
              <span class="text-xs font-bold font-mono tabular-nums text-amber-400">Cooling Off</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import StatCard from '@/components/ui/StatCard.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import TradingPlanCard from '@/components/trading/TradingPlanCard.vue'
import { useTraderDashboard } from '@/composables/useTraderDashboard'
import { useI18n } from '@/composables/useI18n'
import type { TradeEntry } from '@/composables/useTraderDashboard'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { t } = useI18n()
const { currentSpace } = storeToRefs(useAuthStore())

const {
  isLoading,
  error,
  stats,
  recentTrades,
  retry,
} = useTraderDashboard()

function formatTradeDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function onTradeClick(_trade: TradeEntry) {
  router.push('/trading')
}
</script>

<style scoped>
.trade-row {
  transition: background-color 0.15s ease;
}
.trade-row:hover {
  background-color: rgba(51, 65, 85, 0.3);
}

.pnl-positive {
  --tw-ring-color: rgba(16, 185, 129, 0.15);
}
.pnl-negative {
  --tw-ring-color: rgba(239, 68, 68, 0.15);
}

.habit-dot {
  cursor: default;
}
.habit-dot:hover {
  transform: scale(1.1);
}
</style>
