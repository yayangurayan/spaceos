<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center gap-2">
          <span>📈</span>
          <span>{{ currentSpace?.category === 'private' ? t('private_dashboard') : t('dashboard_trading') }}</span>
        </h1>
        <p class="text-slate-400 text-xs sm:text-sm">{{ currentSpace?.category === 'private' ? t('private_space_subtitle') : t('trading_habit') }}</p>
      </div>

      <router-link
        to="/trading"
        class="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
      >
        <span>{{ t('add_new_trade') }}</span>
      </router-link>
    </div>

    <!-- Error State -->
    <div v-if="error" class="glass rounded-xl p-8 text-center animate-fade-in">
      <span class="text-4xl block mb-3">⚠️</span>
      <p class="text-white font-medium mb-1">{{ t('failed_load_data') }}</p>
      <p class="text-sm text-slate-400 mb-4">{{ error }}</p>
      <button class="btn-primary" @click="retry">{{ t('try_again') }}</button>
    </div>

    <template v-else>
      <!-- Stats Cards (Loading) -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SkeletonLoader v-for="i in 4" :key="i" type="card" />
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="📊"
          :value="stats.totalTrades"
          label="Total Trades (bulan ini)"
          :change="stats.totalTradesChange"
          :change-positive="true"
          :delay="0"
        />
        <StatCard
          icon="🎯"
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
            :height="5"
          />
        </StatCard>
        <StatCard
          icon="💰"
          :value="stats.totalPnl"
          label="Total P&L (bulan ini)"
          :change="stats.totalPnlChange"
          :change-positive="stats.totalPnl >= 0"
          prefix="$"
          :delay="200"
          :class="stats.totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'"
        />
        <StatCard
          icon="🔥"
          :value="stats.currentStreak"
          label="Current Streak (hari)"
          :change="stats.streakChange"
          :change-positive="true"
          :delay="300"
          suffix=" hari"
        />
      </div>

      <!-- Recent Trades Table -->
      <div class="mb-8 animate-fade-in" :style="{ animationDelay: '350ms', opacity: 0 }">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">{{ t('trades_last') }}</h2>
          <button @click="router.push('/trading')" class="text-accent text-sm hover:underline transition-colors">
            Lihat Semua →
          </button>
        </div>

        <!-- Loading -->
        <SkeletonLoader v-if="isLoading" type="table" :rows="5" :columns="5" />

        <!-- Table -->
        <div v-else class="glass rounded-xl overflow-hidden">
          <!-- Header -->
          <div class="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-slate-700/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
            class="trade-row grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 px-5 py-4 border-b border-slate-700/30 last:border-0 cursor-pointer"
            @click="onTradeClick(trade)"
          >
            <!-- Date -->
            <div class="text-sm text-slate-300">
              <span class="sm:hidden text-[10px] text-slate-500 uppercase block">{{ t('date') }}</span>
              {{ formatTradeDate(trade.date) }}
            </div>
            <!-- Pair -->
            <div class="text-sm text-white font-medium">
              <span class="sm:hidden text-[10px] text-slate-500 uppercase block">{{ t('pair') }}</span>
              {{ trade.pair }}
            </div>
            <!-- Position -->
            <div>
              <span class="sm:hidden text-[10px] text-slate-500 uppercase block mb-0.5">{{ t('position') }}</span>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="trade.position === 'Long'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-orange-500/10 text-orange-400'"
              >
                {{ trade.position }}
              </span>
            </div>
            <!-- P&L -->
            <div class="text-sm font-mono font-semibold text-right"
              :class="trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'"
            >
              <span class="sm:hidden text-[10px] text-slate-500 uppercase block font-sans font-normal">{{ t('pnl') }}</span>
              {{ trade.pnl >= 0 ? '+' : '' }}${{ trade.pnl.toFixed(2) }}
            </div>
            <!-- Status -->
            <div class="text-right">
              <span class="sm:hidden text-[10px] text-slate-500 uppercase block mb-0.5 text-left">{{ t('status') }}</span>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="trade.status === 'Win'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'"
              >
                {{ trade.status === 'Win' ? '✓ Win' : '✗ Loss' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions + Habit Progress -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Quick Actions -->
        <div class="animate-fade-in" :style="{ animationDelay: '450ms', opacity: 0 }">
          <h2 class="text-lg font-semibold text-white mb-4">{{ t('quick_actions') }}</h2>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="router.push('/trading')"
              class="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <span class="text-lg">📝</span>
              {{ t('add_new_trade') }}
            </button>
            <button
              @click="router.push('/trading')"
              class="flex-1 glass rounded-lg py-3 px-5 text-sm font-medium text-slate-300 hover:text-white hover:border-accent/30 transition-all duration-150 hover:-translate-y-0.5"
            >
              <span class="text-lg mr-2">📋</span>
              {{ t('open_trading_journal') }}
            </button>
          </div>
        </div>

        <!-- Risk Management & Discipline Widget -->
        <div class="animate-fade-in" :style="{ animationDelay: '550ms', opacity: 0 }">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white">🛡️ Manajemen Risiko & Disiplin</h2>
            <router-link
              to="/calculator"
              class="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
            >
              📐 Buka Kalkulator Lot →
            </router-link>
          </div>

          <div class="glass rounded-xl p-5 border border-slate-700/60 space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🛑</span>
                <div>
                  <p class="text-xs font-bold text-white">Aturan Stop Loss Otomatis</p>
                  <p class="text-[10px] text-slate-400">Selalu tentukan SL sebelum entri posisi</p>
                </div>
              </div>
              <span class="text-xs font-bold font-mono text-cyan-400">Max 1-2%</span>
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🎯</span>
                <div>
                  <p class="text-xs font-bold text-white">Target Risk : Reward Ideal</p>
                  <p class="text-[10px] text-slate-400">Hanya ambil setup dengan potensi profit memadai</p>
                </div>
              </div>
              <span class="text-xs font-bold font-mono text-emerald-400">Min 1 : 2</span>
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🧘</span>
                <div>
                  <p class="text-xs font-bold text-white">Disiplin Psikologi Pasar</p>
                  <p class="text-[10px] text-slate-400">Jeda setelah 2x loss beruntun, hindari FOMO</p>
                </div>
              </div>
              <span class="text-xs font-bold font-mono text-amber-400">Cooling Off</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import StatCard from '@/components/ui/StatCard.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
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
