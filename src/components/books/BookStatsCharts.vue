<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header Summary Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 1. Average Rating Stat Card -->
      <div class="glass rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Rata-rata Rating</span>
          <span class="text-xl">⭐</span>
        </div>
        <div class="my-3 flex items-baseline gap-3">
          <span class="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">
            {{ averageRating.toFixed(1) }}
          </span>
          <span class="text-xs text-slate-400 font-medium">dari 5.0 bintang</span>
        </div>
        <div class="flex items-center gap-1">
          <span
            v-for="s in 5"
            :key="s"
            class="text-sm"
            :class="s <= Math.round(averageRating) ? 'text-amber-400' : 'text-slate-700'"
          >
            ★
          </span>
          <span class="text-[11px] text-slate-400 ml-2">Total {{ totalBooks }} Buku</span>
        </div>
      </div>

      <!-- 2. Reading Pace / Speed -->
      <div class="glass rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Kecepatan Membaca</span>
          <span class="text-xl">⚡</span>
        </div>
        <div class="my-3 flex items-baseline gap-2">
          <span class="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">
            {{ avgPagesPerDay }}
          </span>
          <span class="text-xs text-slate-400 font-medium">Halaman / Hari Aktif</span>
        </div>
        <p class="text-[11px] text-slate-400">
          Konsistensi membentuk retensi ilmu jangka panjang
        </p>
      </div>

      <!-- 3. Top Favorite Genre -->
      <div class="glass rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Genre Terbanyak</span>
          <span class="text-xl">🏆</span>
        </div>
        <div class="my-3">
          <p class="text-xl sm:text-2xl font-extrabold text-white truncate">
            {{ topGenre ? topGenre.genre : 'Belum ada data' }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ topGenre ? `${topGenre.count} buku (${topGenre.percentage}% dari koleksi)` : 'Tambahkan buku pertama' }}
          </p>
        </div>
        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            class="bg-accent h-full rounded-full"
            :style="{ width: `${topGenre ? topGenre.percentage : 0}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Charts Row: Books Per Month (Bar) & Genre Distribution (Doughnut) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Chart A: Books Per Month -->
      <div class="glass rounded-2xl p-5 border border-slate-700/60">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">📊</span>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-white">Buku Diselesaikan Per Bulan</h3>
              <p class="text-[11px] text-slate-400">Tren membaca tahun {{ currentYear }}</p>
            </div>
          </div>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            {{ totalCompletedThisYear }} Selesai
          </span>
        </div>

        <div class="relative w-full h-56 sm:h-64">
          <canvas ref="barCanvasRef"></canvas>
        </div>
      </div>

      <!-- Chart B: Genre Distribution -->
      <div class="glass rounded-2xl p-5 border border-slate-700/60">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">🍩</span>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-white">Distribusi Genre & Minat</h3>
              <p class="text-[11px] text-slate-400">Komposisi topik buku di perpustakaan</p>
            </div>
          </div>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-slate-700">
            {{ genreStats.length }} Kategori
          </span>
        </div>

        <div class="relative w-full h-56 sm:h-64 flex items-center justify-center">
          <canvas v-if="genreStats.length > 0" ref="doughnutCanvasRef"></canvas>
          <div v-else class="text-center text-xs text-slate-500">
            Belum ada data genre untuk ditampilkan.
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Reading Heatmap: GitHub-style 60-Day Activity Matrix -->
    <div class="glass rounded-2xl p-5 border border-slate-700/60 space-y-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">🔥</span>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-white">Reading Activity Heatmap (60 Hari Terakhir)</h3>
            <p class="text-[11px] text-slate-400">Aktivitas dan volume halaman yang kamu selesaikan setiap hari</p>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-1.5 text-[10px] text-slate-400 self-end sm:self-center">
          <span>Kurang</span>
          <span class="w-3 h-3 rounded-sm bg-slate-800/80 border border-slate-700"></span>
          <span class="w-3 h-3 rounded-sm bg-cyan-900/60 border border-cyan-800"></span>
          <span class="w-3 h-3 rounded-sm bg-cyan-700/80 border border-cyan-600"></span>
          <span class="w-3 h-3 rounded-sm bg-cyan-500 border border-cyan-400"></span>
          <span class="w-3 h-3 rounded-sm bg-accent border border-cyan-300"></span>
          <span>Banyak</span>
        </div>
      </div>

      <!-- Heatmap Grid -->
      <div class="overflow-x-auto pb-2 custom-scrollbar">
        <div class="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[500px]">
          <div
            v-for="day in readingHeatmap"
            :key="day.date"
            class="w-4 h-4 rounded-sm transition-transform hover:scale-125 cursor-pointer relative group"
            :class="getHeatmapColor(day.level)"
          >
            <!-- Tooltip -->
            <div
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 whitespace-nowrap bg-dark/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white border border-slate-700 shadow-xl pointer-events-none"
            >
              <p class="font-bold text-cyan-300">{{ day.date }}</p>
              <p class="text-slate-300">{{ day.pages }} halaman ({{ day.count }} sesi)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  BarController,
  DoughnutController,
  BarElement,
  ArcElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { GenreStat, ReadingHeatmapDay, ReadingLog } from '@/types'

Chart.register(
  BarController,
  DoughnutController,
  BarElement,
  ArcElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  totalBooks: number
  averageRating: number
  genreStats: GenreStat[]
  booksPerMonthData: { labels: string[]; data: number[] }
  readingHeatmap: ReadingHeatmapDay[]
  readingLogs: ReadingLog[]
}>()

const barCanvasRef = ref<HTMLCanvasElement | null>(null)
const doughnutCanvasRef = ref<HTMLCanvasElement | null>(null)

let barChartInstance: Chart | null = null
let doughnutChartInstance: Chart | null = null

const currentYear = new Date().getFullYear()

const topGenre = computed(() => {
  return props.genreStats && props.genreStats.length > 0 ? props.genreStats[0] : null
})

const totalCompletedThisYear = computed(() => {
  return props.booksPerMonthData.data.reduce((sum, val) => sum + val, 0)
})

const avgPagesPerDay = computed(() => {
  const activeDays = props.readingHeatmap.filter(d => d.pages > 0)
  if (activeDays.length === 0) return 0
  const total = activeDays.reduce((sum, d) => sum + d.pages, 0)
  return Math.round(total / activeDays.length)
})

function getHeatmapColor(level: number) {
  switch (level) {
    case 1:
      return 'bg-cyan-900/60 border border-cyan-800'
    case 2:
      return 'bg-cyan-700/80 border border-cyan-600'
    case 3:
      return 'bg-cyan-500 border border-cyan-400 shadow-sm shadow-cyan-500/30'
    case 4:
      return 'bg-accent border border-cyan-300 shadow-sm shadow-cyan-400/50'
    default:
      return 'bg-slate-800/80 border border-slate-700/60'
  }
}

function initBarChart() {
  if (!barCanvasRef.value) return
  if (barChartInstance) barChartInstance.destroy()

  const ctx = barCanvasRef.value.getContext('2d')
  if (!ctx) return

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.booksPerMonthData.labels,
      datasets: [
        {
          label: 'Buku Selesai',
          data: props.booksPerMonthData.data,
          backgroundColor: 'rgba(6, 182, 212, 0.75)',
          borderColor: '#06b6d4',
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(6, 182, 212, 0.95)',
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
          padding: 8,
          callbacks: {
            label(item) {
              return `Selesai: ${item.raw} buku`
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
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#94a3b8',
            font: { size: 10, family: 'JetBrains Mono' },
          },
        },
      },
    },
  })
}

function initDoughnutChart() {
  if (!doughnutCanvasRef.value) return
  if (doughnutChartInstance) doughnutChartInstance.destroy()

  const ctx = doughnutCanvasRef.value.getContext('2d')
  if (!ctx || props.genreStats.length === 0) return

  const labels = props.genreStats.map(g => g.genre)
  const data = props.genreStats.map(g => g.count)

  const palette = [
    '#06b6d4',
    '#8b5cf6',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#3b82f6',
    '#14b8a6',
    '#f97316',
    '#6366f1',
  ]

  doughnutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: palette.slice(0, labels.length),
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#94a3b8',
            font: { size: 11 },
            boxWidth: 12,
            padding: 10,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(51, 65, 85, 0.8)',
          borderWidth: 1,
          padding: 8,
          callbacks: {
            label(item) {
              const count = Number(item.raw)
              const pct = props.genreStats[item.dataIndex]?.percentage || 0
              return ` ${count} buku (${pct}%)`
            },
          },
        },
      },
      cutout: '65%',
    },
  })
}

watch(
  () => [props.booksPerMonthData, props.genreStats],
  () => {
    initBarChart()
    initDoughnutChart()
  },
  { deep: true }
)

onMounted(() => {
  initBarChart()
  initDoughnutChart()
})

onUnmounted(() => {
  if (barChartInstance) barChartInstance.destroy()
  if (doughnutChartInstance) doughnutChartInstance.destroy()
})
</script>
