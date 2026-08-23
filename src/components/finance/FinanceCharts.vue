<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <!-- Chart 1: Expense Breakdown by Category (Doughnut) -->
    <div class="glass rounded-xl p-5 border border-slate-700/60 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>🍕</span>
            <span>Distribusi Pengeluaran</span>
          </h3>
          <p class="text-xs text-slate-400">Proporsi alokasi belanja per kategori</p>
        </div>
      </div>

      <div class="relative w-full h-[240px] flex items-center justify-center">
        <div v-if="categoryExpenseData.labels.length === 0" class="text-center text-slate-500 text-xs">
          <span class="text-3xl block mb-2">📊</span>
          Belum ada data pengeluaran di periode ini
        </div>
        <canvas v-show="categoryExpenseData.labels.length > 0" ref="doughnutCanvasRef" class="w-full h-full"></canvas>
      </div>

      <!-- Quick Legend Summary -->
      <div v-if="categoryExpenseData.labels.length > 0" class="mt-4 pt-3 border-t border-slate-700/40 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
        <div
          v-for="(label, idx) in categoryExpenseData.labels"
          :key="idx"
          class="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-dark/60 border border-slate-800"
        >
          <span
            class="w-2.5 h-2.5 rounded-full inline-block"
            :style="{ backgroundColor: categoryExpenseData.colors[idx] }"
          ></span>
          <span class="text-slate-300 font-medium">{{ label }}:</span>
          <span class="text-white font-mono font-bold">
            Rp {{ (categoryExpenseData.data[idx] || 0).toLocaleString('id-ID') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Chart 2: Income vs Expense per Month (Last 6 Months Bar Chart) -->
    <div class="glass rounded-xl p-5 border border-slate-700/60 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>📊</span>
            <span>Arus Kas 6 Bulan Terakhir</span>
          </h3>
          <p class="text-xs text-slate-400">Perbandingan pemasukan vs pengeluaran</p>
        </div>

        <div class="flex items-center gap-3 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span class="text-slate-400">Pemasukan</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span class="text-slate-400">Pengeluaran</span>
          </div>
        </div>
      </div>

      <div class="relative w-full h-[240px]">
        <canvas ref="barCanvasRef" class="w-full h-full"></canvas>
      </div>

      <!-- Net Growth Badge -->
      <div class="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
        <span>Rata-rata Saldo 6 Bulan</span>
        <span class="font-mono font-bold text-accent">
          Rp {{ averageNet6Months.toLocaleString('id-ID') }} / bulan
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Chart,
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import type { Transaction } from '@/types'

Chart.register(
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

const props = defineProps<{
  transactions: Transaction[]
  last6Months: { label: string; income: number; expense: number; key: string }[]
}>()

const doughnutCanvasRef = ref<HTMLCanvasElement | null>(null)
const barCanvasRef = ref<HTMLCanvasElement | null>(null)

let doughnutChart: Chart | null = null
let barChart: Chart | null = null

const PRESET_COLORS = [
  '#06b6d4',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#3b82f6',
  '#14b8a6',
  '#f97316',
  '#64748b',
]

/* ============================
   Category Breakdown Data
   ============================ */
const categoryExpenseData = computed(() => {
  const catMap: Record<string, number> = {}
  props.transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount)
    })

  const labels = Object.keys(catMap)
  const data = labels.map(k => catMap[k])
  const colors = labels.map((_, i) => PRESET_COLORS[i % PRESET_COLORS.length])

  return { labels, data, colors }
})

const averageNet6Months = computed(() => {
  if (props.last6Months.length === 0) return 0
  const totalNet = props.last6Months.reduce((acc, m) => acc + (m.income - m.expense), 0)
  return Math.round(totalNet / props.last6Months.length)
})

/* ============================
   Render Charts
   ============================ */
function renderDoughnut() {
  if (!doughnutCanvasRef.value) return
  if (doughnutChart) {
    doughnutChart.destroy()
    doughnutChart = null
  }

  const { labels, data, colors } = categoryExpenseData.value
  if (labels.length === 0) return

  const ctx = doughnutCanvasRef.value.getContext('2d')
  if (!ctx) return

  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
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
              const val = Number(item.raw)
              return `Rp ${val.toLocaleString('id-ID')}`
            },
          },
        },
      },
    },
  })
}

function renderBar() {
  if (!barCanvasRef.value) return
  if (barChart) {
    barChart.destroy()
    barChart = null
  }

  const ctx = barCanvasRef.value.getContext('2d')
  if (!ctx) return

  const labels = props.last6Months.map(m => m.label)
  const incomeData = props.last6Months.map(m => m.income)
  const expenseData = props.last6Months.map(m => m.expense)

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Pemasukan',
          data: incomeData,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Pengeluaran',
          data: expenseData,
          backgroundColor: 'rgba(244, 63, 94, 0.8)',
          borderColor: '#f43f5e',
          borderWidth: 1,
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
              const val = Number(item.raw)
              return `${item.dataset.label}: Rp ${val.toLocaleString('id-ID')}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 10 } },
        },
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.35)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 10, family: 'JetBrains Mono' },
            callback(val) {
              const num = Number(val)
              return `Rp ${num >= 1000000 ? (num / 1000000).toFixed(1) + 'M' : (num / 1000).toFixed(0) + 'k'}`
            },
          },
        },
      },
    },
  })
}

function updateCharts() {
  renderDoughnut()
  renderBar()
}

watch(
  () => [props.transactions, props.last6Months],
  () => {
    updateCharts()
  },
  { deep: true }
)

onMounted(() => {
  updateCharts()
})

onUnmounted(() => {
  if (doughnutChart) doughnutChart.destroy()
  if (barChart) barChart.destroy()
})
</script>
