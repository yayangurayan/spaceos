<template>
  <div class="glass rounded-xl p-4 mb-6 transition-all duration-200">
    <!-- Top row: Search input + Quick Filters + Toggle button (mobile) -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Box -->
      <div class="relative flex-1">
        <svg
          class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Cari pair, setup, strategi, emosi, atau catatan..."
          class="input-field pl-9 pr-8 text-xs sm:text-sm h-10 w-full"
        />
        <button
          v-if="filters.search"
          @click="filters.search = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
        >
          ✕
        </button>
      </div>

      <!-- Quick Date Range Pills (Desktop) -->
      <div class="hidden md:flex items-center gap-1 bg-dark/60 p-1 rounded-lg border border-slate-700/50">
        <button
          v-for="range in dateRanges"
          :key="range.id"
          @click="filters.dateRange = range.id"
          class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
          :class="filters.dateRange === range.id
            ? 'bg-accent text-dark font-semibold shadow-sm'
            : 'text-slate-400 hover:text-slate-200'"
        >
          {{ range.label }}
        </button>
      </div>

      <!-- Mobile/Tablet filter toggle button -->
      <button
        @click="showMoreFilters = !showMoreFilters"
        class="md:hidden flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface border border-slate-700 text-xs font-medium text-slate-300 hover:text-white"
      >
        <span>⚡ Filter Lanjutan</span>
        <span
          v-if="activeFilterCount > 0"
          class="w-5 h-5 rounded-full bg-accent text-dark font-bold text-[10px] flex items-center justify-center"
        >
          {{ activeFilterCount }}
        </span>
        <span class="text-xs transition-transform duration-200" :class="{ 'rotate-180': showMoreFilters }">▼</span>
      </button>
    </div>

    <!-- Secondary Filter Row (Expandable or visible on larger screens) -->
    <div
      class="mt-3 pt-3 border-t border-slate-700/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      :class="showMoreFilters ? 'grid' : 'hidden md:grid'"
    >
      <!-- Date Range (Mobile select) -->
      <div class="md:hidden">
        <label class="block text-[11px] font-medium text-slate-400 mb-1">Periode</label>
        <select
          v-model="filters.dateRange"
          class="input-field text-xs h-9 py-1"
        >
          <option v-for="range in dateRanges" :key="range.id" :value="range.id">
            {{ range.label }}
          </option>
        </select>
      </div>

      <!-- Custom Date Inputs (if custom selected) -->
      <div v-if="filters.dateRange === 'custom'" class="sm:col-span-2 grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] font-medium text-slate-400 mb-1">Dari Tanggal</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="input-field text-xs h-9 py-1"
          />
        </div>
        <div>
          <label class="block text-[11px] font-medium text-slate-400 mb-1">Sampai Tanggal</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="input-field text-xs h-9 py-1"
          />
        </div>
      </div>

      <!-- Account Type -->
      <div>
        <label class="block text-[11px] font-medium text-slate-400 mb-1">Account Type</label>
        <select
          v-model="filters.accountType"
          class="input-field text-xs h-9 py-1"
        >
          <option value="all">Semua Tipe Akun</option>
          <option value="Real">Real Account</option>
          <option value="Funded">Funded Account</option>
          <option value="Demo">Demo Account</option>
        </select>
      </div>

      <!-- Pair Select -->
      <div>
        <label class="block text-[11px] font-medium text-slate-400 mb-1">Pair / Instrument</label>
        <div class="relative">
          <input
            v-model="filters.pair"
            type="text"
            placeholder="Semua Pair (e.g. XAUUSD)"
            class="input-field text-xs h-9 py-1 uppercase"
            list="popular-pairs"
          />
          <datalist id="popular-pairs">
            <option value="XAUUSD" />
            <option value="EURUSD" />
            <option value="GBPUSD" />
            <option value="USDJPY" />
            <option value="BTCUSD" />
            <option value="US30" />
            <option value="NAS100" />
            <option value="AUDUSD" />
            <option value="GBPJPY" />
          </datalist>
          <button
            v-if="filters.pair"
            @click="filters.pair = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Trade Status -->
      <div>
        <label class="block text-[11px] font-medium text-slate-400 mb-1">Hasil / Status</label>
        <select
          v-model="filters.status"
          class="input-field text-xs h-9 py-1"
        >
          <option value="all">Semua Status</option>
          <option value="Win">✓ Win (Profit)</option>
          <option value="Loss">✗ Loss (Rugi)</option>
          <option value="Breakeven">⚖️ Breakeven</option>
          <option value="Open">⏳ Open Trade</option>
        </select>
      </div>

      <!-- Reset / Summary -->
      <div class="flex items-end justify-between sm:justify-end gap-2">
        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 py-2 px-2"
        >
          <span>↺</span>
          <span>Reset Filter</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TradeFilters } from '@/types'

const props = defineProps<{
  modelValue: TradeFilters
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TradeFilters): void
}>()

const filters = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const showMoreFilters = ref(false)

const dateRanges = [
  { id: 'today' as const, label: 'Hari Ini' },
  { id: 'this_week' as const, label: 'Minggu Ini' },
  { id: 'this_month' as const, label: 'Bulan Ini' },
  { id: 'last_month' as const, label: 'Bulan Lalu' },
  { id: 'all' as const, label: 'Semua' },
  { id: 'custom' as const, label: 'Kustom' },
]

const hasActiveFilters = computed(() => {
  return (
    filters.value.dateRange !== 'this_month' ||
    filters.value.accountType !== 'all' ||
    Boolean(filters.value.pair) ||
    filters.value.status !== 'all' ||
    Boolean(filters.value.search)
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.dateRange !== 'this_month') count++
  if (filters.value.accountType !== 'all') count++
  if (filters.value.pair) count++
  if (filters.value.status !== 'all') count++
  if (filters.value.search) count++
  return count
})

function resetFilters() {
  filters.value = {
    dateRange: 'this_month',
    accountType: 'all',
    pair: '',
    status: 'all',
    search: '',
  }
}
</script>
