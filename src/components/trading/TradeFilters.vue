<template>
  <div class="surface-card p-4 mb-6 transition-all duration-200">
    <!-- Top row: Search input + Quick Filters + Toggle button (mobile) -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Box -->
      <div class="relative flex-1">
        <Icon
          name="search"
          size="16"
          class="text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <input
          v-model="filters.search"
          type="text"
          placeholder="Cari pair, setup, strategi, atau catatan..."
          class="input-field pl-9 pr-8 text-xs sm:text-sm h-10 w-full"
        />
        <button
          v-if="filters.search"
          @click="filters.search = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-xs"
        >
          <Icon name="x" size="14" />
        </button>
      </div>

      <!-- Quick Date Range Pills (Desktop) -->
      <div class="hidden md:flex items-center gap-1 bg-surface-elevated/70 p-1 rounded-xl border border-border-subtle">
        <button
          v-for="range in dateRanges"
          :key="range.id"
          @click="filters.dateRange = range.id"
          class="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="filters.dateRange === range.id
            ? 'bg-accent text-dark font-bold shadow-sm'
            : 'text-text-tertiary hover:text-text-primary'"
        >
          {{ range.label }}
        </button>
      </div>

      <!-- Mobile/Tablet filter toggle button -->
      <button
        @click="showMoreFilters = !showMoreFilters"
        class="md:hidden flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs font-medium text-text-secondary hover:text-text-primary"
      >
        <Icon name="filter" size="14" />
        <span>Filter Lanjutan</span>
        <span
          v-if="activeFilterCount > 0"
          class="w-5 h-5 rounded-full bg-accent text-dark font-bold text-[10px] flex items-center justify-center"
        >
          {{ activeFilterCount }}
        </span>
        <Icon name="chevron-down" size="14" class="transition-transform duration-200" :class="{ 'rotate-180': showMoreFilters }" />
      </button>
    </div>

    <!-- Secondary Filter Row (Expandable or visible on larger screens) -->
    <div
      class="mt-3 pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      :class="showMoreFilters ? 'grid' : 'hidden md:grid'"
    >
      <!-- Date Range (Mobile select) -->
      <div class="md:hidden">
        <label class="block text-[11px] font-medium text-text-tertiary mb-1">Periode</label>
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
          <label class="block text-[11px] font-medium text-text-tertiary mb-1">Dari Tanggal</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="input-field text-xs h-9 py-1"
          />
        </div>
        <div>
          <label class="block text-[11px] font-medium text-text-tertiary mb-1">Sampai Tanggal</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="input-field text-xs h-9 py-1"
          />
        </div>
      </div>

      <!-- Account Type -->
      <div>
        <label class="block text-[11px] font-medium text-text-tertiary mb-1">Account Type</label>
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
        <label class="block text-[11px] font-medium text-text-tertiary mb-1">Pair / Instrument</label>
        <div class="relative">
          <input
            v-model="filters.pair"
            type="text"
            placeholder="Semua Pair (mis. XAUUSD)"
            class="input-field text-xs h-9 py-1 uppercase font-mono"
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
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-xs"
          >
            <Icon name="x" size="13" />
          </button>
        </div>
      </div>

      <!-- Trade Status -->
      <div>
        <label class="block text-[11px] font-medium text-text-tertiary mb-1">Hasil / Status</label>
        <select
          v-model="filters.status"
          class="input-field text-xs h-9 py-1"
        >
          <option value="all">Semua Status</option>
          <option value="Win">Win (Profit)</option>
          <option value="Loss">Loss (Rugi)</option>
          <option value="Breakeven">Breakeven</option>
          <option value="Open">Open Trade</option>
        </select>
      </div>

      <!-- Reset / Summary -->
      <div class="flex items-end justify-between sm:justify-end gap-2">
        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1.5 py-2 px-2"
        >
          <Icon name="refresh-cw" size="13" />
          <span>Reset Filter</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
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
