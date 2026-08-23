<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- 1. Total Balance / Net Savings -->
    <div class="glass rounded-xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 border border-slate-700/60">
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">
          💳
        </div>
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="stats.totalBalance >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'"
        >
          {{ stats.totalBalance >= 0 ? 'Surplus' : 'Defisit' }}
        </span>
      </div>
      <p class="text-xs text-slate-400 font-medium">Total Saldo Bersih</p>
      <p
        class="text-2xl sm:text-3xl font-extrabold font-mono mt-1"
        :class="stats.totalBalance >= 0 ? 'text-white' : 'text-rose-400'"
      >
        <AnimatedNumber :value="stats.totalBalance" prefix="Rp " :decimals="0" />
      </p>
      <p class="text-[11px] text-slate-500 mt-1">Periode aktif</p>
    </div>

    <!-- 2. Total Income -->
    <div class="glass rounded-xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 border border-slate-700/60">
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">
          💰
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
          + Pemasukan
        </span>
      </div>
      <p class="text-xs text-slate-400 font-medium">Total Pemasukan</p>
      <p class="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-1">
        <AnimatedNumber :value="stats.totalIncome" prefix="Rp " :decimals="0" />
      </p>
      <p class="text-[11px] text-slate-500 mt-1">Inflow kas masuk</p>
    </div>

    <!-- 3. Total Expense -->
    <div class="glass rounded-xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 border border-slate-700/60">
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-xl">
          💸
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
          - Pengeluaran
        </span>
      </div>
      <p class="text-xs text-slate-400 font-medium">Total Pengeluaran</p>
      <p class="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400 mt-1">
        <AnimatedNumber :value="stats.totalExpense" prefix="Rp " :decimals="0" />
      </p>
      <p class="text-[11px] text-slate-500 mt-1">Top: {{ stats.topExpenseCategory }}</p>
    </div>

    <!-- 4. Savings Rate -->
    <div class="glass rounded-xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 border border-slate-700/60">
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-xl">
          🎯
        </div>
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="stats.savingsRate >= 20 ? 'bg-cyan-500/15 text-cyan-300' : 'bg-amber-500/15 text-amber-400'"
        >
          Target: >20%
        </span>
      </div>
      <p class="text-xs text-slate-400 font-medium">Savings Rate</p>
      <p class="text-2xl sm:text-3xl font-extrabold font-mono text-accent mt-1">
        <AnimatedNumber :value="stats.savingsRate" suffix="%" :decimals="1" />
      </p>
      <!-- Mini Progress bar -->
      <div class="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="stats.savingsRate >= 20 ? 'bg-gradient-to-r from-accent to-emerald-400' : 'bg-amber-400'"
          :style="{ width: `${Math.min(100, Math.max(0, stats.savingsRate))}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import type { FinanceOverviewStats } from '@/types'

defineProps<{
  stats: FinanceOverviewStats
}>()
</script>
