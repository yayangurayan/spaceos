<template>
  <div class="space-y-6 animate-fade-in w-full max-w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>📐</span>
          <span>Position Sizing & Risk Calculator</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Hitung ukuran lot ideal dan batasi risiko trading per posisi secara matematis dan disiplin.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="resetForm"
          class="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Calculator Grid: Inputs (Left) & Results Summary (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- INPUT FORM (7 cols) -->
      <div class="lg:col-span-7 glass rounded-2xl p-5 sm:p-6 border border-slate-700/60 space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <span>⚙️</span>
          <span>Parameter Trade & Akun</span>
        </h2>

        <!-- 1. Account Balance & Risk Mode -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Saldo Akun (Account Balance)
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                v-model.number="form.balance"
                type="number"
                step="10"
                min="1"
                class="input-field w-full pl-8 font-mono text-sm"
                placeholder="10000"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-semibold text-slate-300">Toleransi Risiko</label>
              <div class="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  @click="form.riskMode = 'percent'"
                  class="px-2 py-0.5 rounded font-bold transition-colors"
                  :class="form.riskMode === 'percent' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'"
                >
                  %
                </button>
                <button
                  type="button"
                  @click="form.riskMode = 'amount'"
                  class="px-2 py-0.5 rounded font-bold transition-colors"
                  :class="form.riskMode === 'amount' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'"
                >
                  $
                </button>
              </div>
            </div>

            <div class="relative">
              <span v-if="form.riskMode === 'amount'" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                v-model.number="form.riskValue"
                type="number"
                :step="form.riskMode === 'percent' ? '0.25' : '10'"
                min="0.1"
                class="input-field w-full font-mono text-sm"
                :class="form.riskMode === 'amount' ? 'pl-8' : 'pr-8'"
                :placeholder="form.riskMode === 'percent' ? '1.0' : '100'"
              />
              <span v-if="form.riskMode === 'percent'" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
            </div>

            <!-- Quick risk preset pills -->
            <div class="flex items-center gap-1.5 mt-2">
              <button
                v-for="p in [0.5, 1, 2, 3]"
                :key="p"
                type="button"
                @click="form.riskMode = 'percent'; form.riskValue = p"
                class="px-2 py-0.5 rounded text-[10px] font-bold transition-colors"
                :class="form.riskMode === 'percent' && form.riskValue === p ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'"
              >
                {{ p }}%
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Instrument & Pair Selector -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/40">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Kategori Aset</label>
            <select v-model="form.assetClass" class="input-field w-full text-xs">
              <option value="forex_standard">Forex (EURUSD, GBPUSD, dll.)</option>
              <option value="forex_jpy">Forex JPY (USDJPY, EURJPY, dll.)</option>
              <option value="gold">Gold / Logam Mulia (XAUUSD)</option>
              <option value="crypto">Kripto (BTC, ETH, SOL)</option>
              <option value="indices">Index (US30, NAS100, SPX500)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Pair / Simbol</label>
            <input
              v-model="form.pair"
              type="text"
              class="input-field w-full font-mono text-sm uppercase"
              placeholder="EURUSD"
            />
          </div>
        </div>

        <!-- 3. Entry, Stop Loss & Take Profit -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700/40">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Harga Entry</label>
            <input
              v-model.number="form.entryPrice"
              type="number"
              step="any"
              class="input-field w-full font-mono text-sm"
              placeholder="1.08500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-rose-300 mb-1.5">Harga Stop Loss</label>
            <input
              v-model.number="form.stopLossPrice"
              type="number"
              step="any"
              class="input-field w-full font-mono text-sm border-rose-500/30 focus:border-rose-400"
              placeholder="1.08200"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-emerald-300 mb-1.5">Harga Take Profit (Opsional)</label>
            <input
              v-model.number="form.takeProfitPrice"
              type="number"
              step="any"
              class="input-field w-full font-mono text-sm border-emerald-500/30 focus:border-emerald-400"
              placeholder="1.09200"
            />
          </div>
        </div>
      </div>

      <!-- RESULTS DISPLAY (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        <!-- Main Recommended Lot Card -->
        <div class="glass rounded-2xl p-6 border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 shadow-xl shadow-cyan-950/20 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-widest text-cyan-300">Rekomendasi Posisi</span>
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-bold"
              :class="calculatedLot > 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'"
            >
              {{ form.pair || 'INSTRUMENT' }}
            </span>
          </div>

          <div class="text-center py-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span class="text-xs font-medium text-slate-400 block mb-1">Ukuran Posisi / Lot Size</span>
            <span class="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
              {{ formattedLot }}
            </span>
            <span class="text-xs text-slate-400 block mt-1">
              {{ form.assetClass === 'crypto' ? 'Unit Koin' : 'Lots Standard' }}
            </span>
          </div>

          <!-- Key Metrics -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Total Resiko ($)</span>
              <span class="text-lg font-bold font-mono text-rose-400 block">
                ${{ calculatedRiskDollars.toFixed(2) }}
              </span>
              <span class="text-[10px] text-slate-500">
                {{ calculatedRiskPercent.toFixed(2) }}% dari modal
              </span>
            </div>

            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Jarak Stop Loss</span>
              <span class="text-lg font-bold font-mono text-white block">
                {{ stopLossDistanceDisplay }}
              </span>
              <span class="text-[10px] text-slate-500">
                Pips / Points
              </span>
            </div>
          </div>

          <!-- Risk to Reward Ratio (If TP entered) -->
          <div v-if="calculatedRR > 0" class="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase text-emerald-400 block">Risk : Reward Ratio</span>
              <span class="text-lg font-bold font-mono text-emerald-300">
                1 : {{ calculatedRR.toFixed(2) }}
              </span>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-semibold text-slate-400 block">Potensi Profit</span>
              <span class="text-sm font-bold font-mono text-emerald-400">
                +${{ potentialProfit.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Discipline Reminder Card -->
        <div class="glass rounded-xl p-4 border border-slate-700/50 bg-slate-900/40 text-xs text-slate-300 space-y-2">
          <div class="flex items-center gap-2 text-cyan-400 font-bold">
            <span>🛡️</span>
            <span>Aturan Disiplin Trading SpaceOS</span>
          </div>
          <p class="text-slate-400 leading-relaxed text-[11px]">
            Jangan pernah memperbesar lot karena emosi atau balas dendam market. Selalu pasang Stop Loss di sistem sebelum menekan tombol Buy/Sell.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

interface FormState {
  balance: number
  riskMode: 'percent' | 'amount'
  riskValue: number
  assetClass: 'forex_standard' | 'forex_jpy' | 'gold' | 'crypto' | 'indices'
  pair: string
  entryPrice: number | null
  stopLossPrice: number | null
  takeProfitPrice: number | null
}

const form = reactive<FormState>({
  balance: 10000,
  riskMode: 'percent',
  riskValue: 1,
  assetClass: 'forex_standard',
  pair: 'EURUSD',
  entryPrice: 1.085,
  stopLossPrice: 1.082,
  takeProfitPrice: 1.092,
})

function resetForm() {
  form.balance = 10000
  form.riskMode = 'percent'
  form.riskValue = 1
  form.assetClass = 'forex_standard'
  form.pair = 'EURUSD'
  form.entryPrice = null
  form.stopLossPrice = null
  form.takeProfitPrice = null
}

// 1. Calculated Risk in Dollars
const calculatedRiskDollars = computed(() => {
  if (form.riskMode === 'amount') {
    return Math.max(0, form.riskValue || 0)
  }
  const bal = form.balance || 0
  const pct = form.riskValue || 0
  return (bal * pct) / 100
})

const calculatedRiskPercent = computed(() => {
  if (!form.balance || form.balance <= 0) return 0
  return (calculatedRiskDollars.value / form.balance) * 100
})

// 2. Stop Loss Distance
const slDistance = computed(() => {
  if (!form.entryPrice || !form.stopLossPrice) return 0
  return Math.abs(form.entryPrice - form.stopLossPrice)
})

const stopLossDistanceDisplay = computed(() => {
  if (slDistance.value === 0) return '0.0'
  if (form.assetClass === 'forex_standard') {
    return (slDistance.value * 10000).toFixed(1) + ' pips'
  }
  if (form.assetClass === 'forex_jpy') {
    return (slDistance.value * 100).toFixed(1) + ' pips'
  }
  if (form.assetClass === 'gold') {
    return (slDistance.value * 10).toFixed(1) + ' pips'
  }
  return slDistance.value.toFixed(2) + ' pts'
})

// 3. Lot / Position Size Calculation
const calculatedLot = computed(() => {
  if (!form.entryPrice || !form.stopLossPrice || slDistance.value <= 0) return 0
  const riskDollars = calculatedRiskDollars.value
  if (riskDollars <= 0) return 0

  switch (form.assetClass) {
    case 'forex_standard': {
      // 1 pip = $10 per standard lot
      const pips = slDistance.value * 10000
      const lot = riskDollars / (pips * 10)
      return Math.max(0.01, Math.round(lot * 100) / 100)
    }
    case 'forex_jpy': {
      // Approx $6.5 - $7.5 per pip per lot, assuming standard ~9.2
      const pips = slDistance.value * 100
      const lot = riskDollars / (pips * 7.5)
      return Math.max(0.01, Math.round(lot * 100) / 100)
    }
    case 'gold': {
      // 100 oz per standard lot. 1 pip ($0.10) = $10 per lot. $1 move = $100 per lot.
      const moveInDollars = slDistance.value
      const lot = riskDollars / (moveInDollars * 100)
      return Math.max(0.01, Math.round(lot * 100) / 100)
    }
    case 'crypto': {
      // Direct unit size: risk / price difference
      const units = riskDollars / slDistance.value
      return Math.round(units * 1000) / 1000
    }
    case 'indices': {
      // Typically $1 or $5 per point
      const lot = riskDollars / slDistance.value
      return Math.max(0.01, Math.round(lot * 100) / 100)
    }
    default:
      return 0.01
  }
})

const formattedLot = computed(() => {
  if (calculatedLot.value <= 0) return '0.00'
  return calculatedLot.value.toString()
})

// 4. Take Profit & Risk Reward
const tpDistance = computed(() => {
  if (!form.entryPrice || !form.takeProfitPrice) return 0
  return Math.abs(form.takeProfitPrice - form.entryPrice)
})

const calculatedRR = computed(() => {
  if (slDistance.value <= 0 || tpDistance.value <= 0) return 0
  return tpDistance.value / slDistance.value
})

const potentialProfit = computed(() => {
  if (calculatedRR.value <= 0) return 0
  return calculatedRiskDollars.value * calculatedRR.value
})
</script>
