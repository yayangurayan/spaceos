<template>
  <div class="space-y-6 animate-fade-in w-full max-w-full min-w-0">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Icon name="wallet" :size="20" />
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ t('finance_tracker_title') }}
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ t('finance_tracker_desc') }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="exportTransactionsCSV"
          class="flex-1 sm:flex-none btn-secondary px-3.5 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
        >
          <Icon name="download" :size="15" />
          <span>{{ t('export_csv') }}</span>
        </button>

        <button
          type="button"
          @click="openAddModal"
          class="flex-1 sm:flex-none btn-primary px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
        >
          <Icon name="plus" :size="16" />
          <span>{{ t('record_transaction') }}</span>
        </button>
      </div>
    </div>

    <!-- 1. Overview Cards -->
    <FinanceOverviewCards :stats="overviewStats" />

    <!-- 2. Charts Section -->
    <FinanceCharts
      :transactions="filteredTransactions"
      :last6-months="last6MonthsData"
    />

    <!-- 3. Budget Tracker Section -->
    <BudgetTracker
      :budget-progress="budgetProgress"
      :categories="availableCategories"
      @set-budget="handleSetBudget"
    />

    <!-- 4. Transactions List Section -->
    <div class="surface-card rounded-2xl p-5">
      <!-- Section Header & Filter Controls -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="file-text" :size="18" class="text-sky-500" />
            <span>{{ t('transaction_history') }}</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Menampilkan {{ paginatedTransactions.length }} dari {{ filteredTransactions.length }} transaksi
          </p>
        </div>

        <!-- View Mode & Quick Filters -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Type Filter Pills -->
          <div class="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              @click="filters.type = 'all'"
              class="px-3 py-1.5 rounded-lg font-medium transition-all"
              :class="filters.type === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
            >
              {{ t('all') }}
            </button>
            <button
              type="button"
              @click="filters.type = 'income'"
              class="px-3 py-1.5 rounded-lg font-medium transition-all"
              :class="filters.type === 'income' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
            >
              + {{ t('income') }}
            </button>
            <button
              type="button"
              @click="filters.type = 'expense'"
              class="px-3 py-1.5 rounded-lg font-medium transition-all"
              :class="filters.type === 'expense' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
            >
              - {{ t('expense') }}
            </button>
          </div>

          <!-- View Mode (Table vs Card) -->
          <div class="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              @click="viewMode = 'table'"
              class="px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all"
              :class="viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
            >
              <Icon name="layers" :size="13" />
              <span>{{ t('table') }}</span>
            </button>
            <button
              type="button"
              @click="viewMode = 'card'"
              class="px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all"
              :class="viewMode === 'card' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
            >
              <Icon name="folder" :size="13" />
              <span>{{ t('card') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Secondary Filter Row: Search & Category -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Cari deskripsi, kategori, wallet..."
            class="input-field text-xs h-9 w-full"
          />
        </div>
        <div>
          <select v-model="filters.category" class="input-field text-xs h-9 w-full">
            <option value="all">{{ t('all_categories') }}</option>
            <option v-for="cat in availableCategories" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div>
          <select v-model="filters.dateRange" class="input-field text-xs h-9 w-full">
            <option value="this_month">{{ t('this_month') }}</option>
            <option value="last_month">{{ t('last_month') }}</option>
            <option value="this_week">{{ t('this_week') }}</option>
            <option value="today">{{ t('today') }}</option>
            <option value="last_30_days">{{ t('last_30_days') }}</option>
            <option value="all">{{ t('all_time') }}</option>
          </select>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTransactions.length === 0" class="py-12 text-center text-slate-500 space-y-2">
        <span class="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 mx-auto flex items-center justify-center">
          <Icon name="wallet" :size="24" />
        </span>
        <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('no_transactions') }}</h4>
        <p class="text-xs text-slate-500">{{ t('no_matching_transactions') }}</p>
        <button
          type="button"
          @click="openAddModal"
          class="btn-primary mt-2 px-4 py-1.5 text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
        >
          <Icon name="plus" :size="14" />
          <span>Catat Transaksi Baru</span>
        </button>
      </div>

      <!-- 1. TABLE VIEW -->
      <div v-else-if="viewMode === 'table'" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th class="pb-3 px-3">Tanggal</th>
              <th class="pb-3 px-3">Kategori</th>
              <th class="pb-3 px-3">Deskripsi</th>
              <th class="pb-3 px-3">Akun/Dompet</th>
              <th class="pb-3 px-3 text-right">Jumlah</th>
              <th class="pb-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
            <tr
              v-for="tx in paginatedTransactions"
              :key="tx.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- Date -->
              <td class="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap font-mono tabular-nums">
                {{ formatDisplayDate(tx.date) }}
              </td>

              <!-- Category Badge -->
              <td class="py-3 px-3 whitespace-nowrap">
                <span
                  class="px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5"
                  :class="tx.type === 'income' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'"
                >
                  <span>{{ tx.category }}</span>
                </span>
              </td>

              <!-- Description -->
              <td class="py-3 px-3 text-slate-800 dark:text-slate-200">
                <span>{{ tx.description || '-' }}</span>
                <span v-if="tx.receipt_url" class="ml-1 text-sky-500 text-[11px]" title="Ada bukti struk">📎</span>
              </td>

              <!-- Wallet -->
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                  {{ tx.wallet }}
                </span>
              </td>

              <!-- Amount -->
              <td class="py-3 px-3 text-right font-mono tabular-nums font-bold whitespace-nowrap"
                :class="tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
              >
                {{ tx.type === 'income' ? '+' : '-' }}Rp {{ Number(tx.amount).toLocaleString('id-ID') }}
              </td>

              <!-- Actions -->
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="openEditModal(tx)"
                    class="p-1.5 rounded text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit"
                  >
                    <Icon name="edit" :size="14" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete(tx)"
                    class="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Hapus"
                  >
                    <Icon name="trash" :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. CARD VIEW (Mobile-friendly) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div
          v-for="tx in paginatedTransactions"
          :key="tx.id"
          class="p-4 rounded-xl surface-card hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5"
        >
          <div class="flex items-center justify-between">
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5"
              :class="tx.type === 'income' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'"
            >
              <span>{{ tx.category }}</span>
            </span>

            <span
              class="text-base font-bold font-mono tabular-nums"
              :class="tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ tx.type === 'income' ? '+' : '-' }}Rp {{ Number(tx.amount).toLocaleString('id-ID') }}
            </span>
          </div>

          <p v-if="tx.description" class="text-xs text-slate-700 dark:text-slate-200">
            {{ tx.description }}
          </p>

          <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div class="flex items-center gap-2">
              <span class="font-mono tabular-nums">{{ formatDisplayDate(tx.date) }}</span>
              <span>•</span>
              <span>{{ tx.wallet }}</span>
            </div>

            <div class="flex items-center gap-1">
              <button @click="openEditModal(tx)" class="p-1 rounded text-slate-400 hover:text-sky-500"><Icon name="edit" :size="14" /></button>
              <button @click="confirmDelete(tx)" class="p-1 rounded text-slate-400 hover:text-rose-500"><Icon name="trash" :size="14" /></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="filteredTransactions.length > itemsPerPage"
        class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400"
      >
        <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="btn-secondary px-3 py-1 text-xs disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            type="button"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="btn-secondary px-3 py-1 text-xs disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <TransactionForm
      v-if="showModal"
      :transaction="selectedTx"
      :categories="availableCategories"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FinanceOverviewCards from '@/components/finance/FinanceOverviewCards.vue'
import FinanceCharts from '@/components/finance/FinanceCharts.vue'
import BudgetTracker from '@/components/finance/BudgetTracker.vue'
import TransactionForm from '@/components/finance/TransactionForm.vue'
import Icon from '@/components/ui/Icon.vue'
import { useFinance } from '@/composables/useFinance'
import { useI18n } from '@/composables/useI18n'
import type { Transaction, TransactionFormData } from '@/types'

const {
  filteredTransactions,
  paginatedTransactions,
  overviewStats,
  budgetProgress,
  last6MonthsData,
  availableCategories,
  filters,
  currentPage,
  itemsPerPage,
  totalPages,
  fetchFinanceData,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setBudget,
  exportTransactionsCSV,
} = useFinance()
const { t } = useI18n()

const viewMode = ref<'table' | 'card'>('table')
const showModal = ref(false)
const selectedTx = ref<Transaction | null>(null)

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openAddModal() {
  selectedTx.value = null
  showModal.value = true
}

function openEditModal(tx: Transaction) {
  selectedTx.value = tx
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedTx.value = null
}

async function handleSave(formData: TransactionFormData) {
  if (selectedTx.value) {
    const res = await updateTransaction(selectedTx.value.id, formData)
    if (res.success) closeModal()
  } else {
    const res = await addTransaction(formData)
    if (res.success) closeModal()
  }
}

async function confirmDelete(tx: Transaction) {
  if (confirm(`Hapus transaksi "${tx.category} - Rp ${Number(tx.amount).toLocaleString('id-ID')}"?`)) {
    await deleteTransaction(tx.id)
  }
}

async function handleSetBudget(payload: { category: string; monthlyLimit: number }) {
  await setBudget(payload.category, payload.monthlyLimit)
}

onMounted(() => {
  fetchFinanceData()
})
</script>
