<template>
  <div class="glass rounded-xl p-5 mb-8">
    <!-- Header: Title + Chart Type Switcher + Timeframe grouping -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xl">📈</span>
          <h2 class="text-base sm:text-lg font-bold text-white">Analisis Kurva P&L</h2>
        </div>
        <p class="text-xs text-slate-400 mt-0.5">
          Visualisasi performa kumulatif dan distribusi keuntungan per periode
        </p>
      </div>

      <!-- Controls -->
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <!-- Chart Mode Toggle: Cumulative Line vs Period Bar -->
        <div class="flex bg-dark/80 p-1 rounded-lg border border-slate-700/60 text-xs">
          <button
            @click="chartMode = 'cumulative'"
            class="px-3 py-1.5 rounded-md font-medium transition-all"
            :class="chartMode === 'cumulative'
              ? 'bg-accent text-dark font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'"
          >
            Kumulatif (Equity)
          </button>
          <button
            @click="chartMode = 'bar'"
            class="px-3 py-1.5 rounded-md font-medium transition-all"
            :class="chartMode === 'bar'
              ? 'bg-accent text-dark font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'"
          >
            Distribusi P&L
          </button>
        </div>

        <!-- Grouping (for Bar chart) -->
        <div v-if="chartMode === 'bar'" class="flex bg-dark/80 p-1 rounded-lg border border-slate-700/60 text-xs">
          <button
            v-for="grp in groupOptions"
            :key="grp.id"
            @click="grouping = grp.id"
            class="px-2 py-1 rounded-md font-medium transition-all"
            :class="grouping === grp.id
              ? 'bg-slate-700 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'"
          >
            {{ grp.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="relative w-full h-[260px] sm:h-[320px]">
      <div v-if="trades.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-center">
        <span class="text-3xl mb-2">📉</span>
        <p class="text-sm font-medium">Belum ada data trade untuk grafik</p>
        <p class="text-xs text-slate-600">Catat trade baru untuk melihat kurva performa kamu.</p>
      </div>

      <canvas ref="canvasRef" class="w-full h-full"></canvas>
    </div>

    <!-- Quick Insights Footer -->
    <div class="mt-4 pt-4 border-t border-slate-700/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
      <div>
        <span class="text-[10px] uppercase font-semibold text-slate-500 block">Total Net Return</span>
        <span
          class="text-sm sm:text-base font-bold font-mono"
          :class="totalNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'"
        >
          {{ totalNetPnl >= 0 ? '+' : '' }}${{ totalNetPnl.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </span>
      </div>
      <div>
        <span class="text-[10px] uppercase font-semibold text-slate-500 block">Avg Win Trade</span>
        <span class="text-sm sm:text-base font-bold font-mono text-emerald-400">
          +${{ avgWin.toFixed(2) }}
        </span>
      </div>
      <div>
        <span class="text-[10px] uppercase font-semibold text-slate-500 block">Avg Loss Trade</span>
        <span class="text-sm sm:text-base font-bold font-mono text-rose-400">
          -${{ Math.abs(avgLoss).toFixed(2) }}
        </span>
      </div>
      <div>
        <span class="text-[10px] uppercase font-semibold text-slate-500 block">Profit Factor</span>
        <span class="text-sm sm:text-base font-bold font-mono text-accent">
          {{ profitFactor }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import {
  Chart,
  LineController,
  BarController,
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { Trade } from '@/types'

// Register Chart.js components
Chart.register(
  LineController,
  BarController,
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  trades: Trade[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const chartMode = ref<'cumulative' | 'bar'>('cumulative')
const grouping = ref<'daily' | 'weekly' | 'monthly'>('daily')

const groupOptions = [
  { id: 'daily' as const, label: 'Harian' },
  { id: 'weekly' as const, label: 'Mingguan' },
  { id: 'monthly' as const, label: 'Bulanan' },
]

/* ============================
   Computed Chart Data
   ============================ */

// Chronologically sorted trades (oldest to newest for charting)
const chronologicalTrades = computed(() => {
  return [...props.trades]
    .filter(t => t.pnl !== null && t.status !== 'Open')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

// Metrics summary
const totalNetPnl = computed(() => {
  return chronologicalTrades.value.reduce((acc, t) => acc + (t.pnl || 0), 0)
})

const avgWin = computed(() => {
  const wins = chronologicalTrades.value.filter(t => (t.pnl || 0) > 0)
  if (wins.length === 0) return 0
  const sum = wins.reduce((acc, t) => acc + (t.pnl || 0), 0)
  return sum / wins.length
})

const avgLoss = computed(() => {
  const losses = chronologicalTrades.value.filter(t => (t.pnl || 0) < 0)
  if (losses.length === 0) return 0
  const sum = losses.reduce((acc, t) => acc + (t.pnl || 0), 0)
  return sum / losses.length
})

const profitFactor = computed(() => {
  const grossProfit = chronologicalTrades.value
    .filter(t => (t.pnl || 0) > 0)
    .reduce((acc, t) => acc + (t.pnl || 0), 0)
  const grossLoss = Math.abs(
    chronologicalTrades.value
      .filter(t => (t.pnl || 0) < 0)
      .reduce((acc, t) => acc + (t.pnl || 0), 0)
  )
  if (grossLoss === 0) return grossProfit > 0 ? '99.9' : '0.00'
  return (grossProfit / grossLoss).toFixed(2)
})

/* ============================
   Chart Rendering Logic
   ============================ */
function buildChart() {
  if (!canvasRef.value) return

  // Destroy previous chart
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const list = chronologicalTrades.value
  if (list.length === 0) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  if (chartMode.value === 'cumulative') {
    renderCumulativeChart(ctx, list)
  } else {
    renderBarChart(ctx, list)
  }
}

function renderCumulativeChart(ctx: CanvasRenderingContext2D, list: Trade[]) {
  // Start equity at 0 or base
  let runningPnl = 0
  const labels: string[] = ['Start']
  const data: number[] = [0]
  const tradeDetails: { pair: string; pnl: number; date: string }[] = [{ pair: 'Start', pnl: 0, date: '' }]

  list.forEach(t => {
    runningPnl += t.pnl || 0
    const d = new Date(t.date)
    labels.push(`${d.getDate()}/${d.getMonth() + 1} ${t.pair}`)
    data.push(Math.round(runningPnl * 100) / 100)
    tradeDetails.push({
      pair: t.pair,
      pnl: t.pnl || 0,
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    })
  })

  // Create subtle gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)')
  gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)')

  const isNetPositive = runningPnl >= 0
  const lineColor = isNetPositive ? '#06b6d4' : '#f43f5e'

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Cumulative P&L ($)',
          data,
          borderColor: lineColor,
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointRadius: list.length > 30 ? 0 : 3,
          pointHoverRadius: 6,
          pointBackgroundColor: lineColor,
          pointBorderColor: '#0f172a',
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(51, 65, 85, 0.8)',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            title(items) {
              const idx = items[0]?.dataIndex ?? 0
              return tradeDetails[idx]?.pair === 'Start' ? 'Initial State' : `${tradeDetails[idx]?.pair} (${tradeDetails[idx]?.date})`
            },
            label(item) {
              const idx = item.dataIndex
              const val = Number(item.raw)
              const trade = tradeDetails[idx]
              const pnlStr = val >= 0 ? `+$${val.toFixed(2)}` : `-$${Math.abs(val).toFixed(2)}`
              const tradePnlStr = trade?.pnl ? (trade.pnl > 0 ? ` (Trade: +$${trade.pnl.toFixed(2)})` : ` (Trade: -$${Math.abs(trade.pnl).toFixed(2)})`) : ''
              return `Cumulative: ${pnlStr}${tradePnlStr}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(51, 65, 85, 0.25)',
          },
          ticks: {
            color: '#64748b',
            font: { size: 10 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
          },
        },
        y: {
          grid: {
            color: 'rgba(51, 65, 85, 0.35)',
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 10, family: 'JetBrains Mono' },
            callback(val) {
              const num = Number(val)
              return num >= 0 ? `+$${num}` : `-$${Math.abs(num)}`
            },
          },
        },
      },
    },
  })
}

function renderBarChart(ctx: CanvasRenderingContext2D, list: Trade[]) {
  // Group by date, week, or month
  const groups: Record<string, { label: string; pnl: number; count: number }> = {}

  list.forEach(t => {
    const d = new Date(t.date)
    let key = ''
    let label = ''

    if (grouping.value === 'daily') {
      key = d.toISOString().split('T')[0]
      label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    } else if (grouping.value === 'weekly') {
      const year = d.getFullYear()
      const oneJan = new Date(year, 0, 1)
      const weekNum = Math.ceil((((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7)
      key = `${year}-W${weekNum}`
      label = `W${weekNum} (${d.toLocaleDateString('id-ID', { month: 'short' })})`
    } else {
      key = `${d.getFullYear()}-${d.getMonth() + 1}`
      label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    }

    if (!groups[key]) {
      groups[key] = { label, pnl: 0, count: 0 }
    }
    groups[key].pnl += t.pnl || 0
    groups[key].count++
  })

  const sortedKeys = Object.keys(groups).sort()
  const labels = sortedKeys.map(k => groups[k].label)
  const data = sortedKeys.map(k => Math.round(groups[k].pnl * 100) / 100)
  const counts = sortedKeys.map(k => groups[k].count)

  const backgroundColors = data.map(v => (v >= 0 ? 'rgba(16, 185, 129, 0.75)' : 'rgba(244, 63, 94, 0.75)'))
  const borderColors = data.map(v => (v >= 0 ? '#10b981' : '#f43f5e'))

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'P&L ($)',
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(51, 65, 85, 0.8)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label(item) {
              const idx = item.dataIndex
              const val = Number(item.raw)
              const count = counts[idx]
              const pnlStr = val >= 0 ? `+$${val.toFixed(2)}` : `-$${Math.abs(val).toFixed(2)}`
              return [`P&L: ${pnlStr}`, `Total Trades: ${count}`]
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#64748b',
            font: { size: 10 },
            maxRotation: 0,
            autoSkip: true,
          },
        },
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.35)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 10, family: 'JetBrains Mono' },
            callback(val) {
              const num = Number(val)
              return num >= 0 ? `+$${num}` : `-$${Math.abs(num)}`
            },
          },
        },
      },
    },
  })
}

watch(
  () => [props.trades, chartMode.value, grouping.value],
  () => {
    buildChart()
  },
  { deep: true }
)

onMounted(() => {
  buildChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>
