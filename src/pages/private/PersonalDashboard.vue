<template>
  <div class="space-y-6 animate-fade-in w-full max-w-full">
    <!-- 1. Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <Icon name="heart" size="26" class="text-accent" />
          <h1 class="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Personal Space Dashboard
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-text-tertiary mt-1">
          Pantau keuangan, konsistensi habit harian, dan ruang refleksi diri pribadi Anda.
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <router-link
          to="/finance"
          class="flex-1 sm:flex-none btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <Icon name="wallet" size="14" />
          <span>+ Transaksi</span>
        </router-link>

        <router-link
          to="/habits"
          class="flex-1 sm:flex-none btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <Icon name="target" size="14" />
          <span>+ Habit</span>
        </router-link>

        <router-link
          to="/personal-journal"
          class="flex-1 sm:flex-none btn-primary px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
        >
          <Icon name="feather" size="14" />
          <span>Tulis Jurnal</span>
        </router-link>
      </div>
    </div>

    <!-- 2. High-Level Summary Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Habit Progress Today -->
      <div class="surface-card p-5 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Icon name="target" size="16" class="text-accent" />
            <span class="text-xs font-bold uppercase tracking-wider text-text-tertiary">Habit Hari Ini</span>
          </div>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-profit/15 text-profit flex items-center gap-1">
            <Icon name="flame" size="12" />
            <span>{{ streakOverview.longestStreak }} hari</span>
          </span>
        </div>
        <div class="flex items-end justify-between">
          <div>
            <p class="text-2xl font-bold font-mono tabular-nums text-text-primary">
              {{ completedTodayCount }} / {{ todayHabits.length }}
            </p>
            <p class="text-[11px] text-text-tertiary mt-0.5">Target terselesaikan</p>
          </div>
          <div class="text-right">
            <span class="text-lg font-bold font-mono tabular-nums text-profit">{{ todayCompletionRate }}%</span>
          </div>
        </div>
        <!-- Progress bar -->
        <div class="w-full bg-surface-elevated h-2 rounded-full mt-3 overflow-hidden border border-border-subtle">
          <div
            class="bg-profit h-full transition-all duration-500 rounded-full"
            :style="{ width: `${todayCompletionRate}%` }"
          ></div>
        </div>
      </div>

      <!-- Financial Snapshot (This Month) -->
      <div class="surface-card p-5 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Icon name="dollar-sign" size="16" class="text-accent" />
            <span class="text-xs font-bold uppercase tracking-wider text-text-tertiary">Cashflow Bulan Ini</span>
          </div>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full"
            :class="overviewStats.netSavings >= 0 ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss'"
          >
            {{ overviewStats.netSavings >= 0 ? 'Surplus' : 'Defisit' }}
          </span>
        </div>
        <p class="text-2xl font-bold font-mono tabular-nums text-text-primary">
          {{ formatCurrency(overviewStats.netSavings) }}
        </p>
        <div class="flex items-center justify-between text-xs text-text-tertiary mt-2 pt-2 border-t border-border-subtle">
          <span class="text-profit font-mono tabular-nums">+{{ formatCurrency(overviewStats.totalIncome) }}</span>
          <span class="text-loss font-mono tabular-nums">-{{ formatCurrency(overviewStats.totalExpense) }}</span>
        </div>
      </div>

      <!-- Budget Progress -->
      <div class="surface-card p-5 transition-transform hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Icon name="bar-chart-2" size="16" class="text-accent" />
            <span class="text-xs font-bold uppercase tracking-wider text-text-tertiary">Sisa Anggaran</span>
          </div>
          <span class="text-[10px] text-text-tertiary font-mono">Bulan Ini</span>
        </div>
        <p class="text-2xl font-bold font-mono tabular-nums text-text-primary">
          {{ formatCurrency(budgetRemaining) }}
        </p>
        <div class="flex items-center justify-between text-[11px] text-text-tertiary mt-1">
          <span>Terpakai {{ budgetPercentUsed.toFixed(0) }}%</span>
          <span class="font-mono tabular-nums">Batas: {{ formatCurrency(totalBudget) }}</span>
        </div>
        <div class="w-full bg-surface-elevated h-2 rounded-full mt-2.5 overflow-hidden border border-border-subtle">
          <div
            class="h-full transition-all duration-500 rounded-full"
            :class="budgetPercentUsed > 90 ? 'bg-loss' : budgetPercentUsed > 75 ? 'bg-amber-500' : 'bg-accent'"
            :style="{ width: `${Math.min(100, budgetPercentUsed)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 3. Middle Section: Habit Checklist & Reflection -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Quick Habit Checklist (7 cols) -->
      <div class="lg:col-span-7 surface-card p-5 sm:p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h2 class="text-base font-bold text-text-primary flex items-center gap-2">
              <Icon name="check-circle" size="16" class="text-profit" />
              <span>Checklist Habit Hari Ini</span>
            </h2>
            <p class="text-xs text-text-tertiary mt-0.5">Centang kebiasaan harian langsung dari sini.</p>
          </div>
          <router-link to="/habits" class="text-xs text-accent hover:underline font-semibold flex items-center gap-1">
            <span>Kelola Habit</span>
            <Icon name="arrow-up-right" size="12" />
          </router-link>
        </div>

        <div v-if="todayHabits.length === 0" class="py-8 text-center text-text-tertiary text-xs">
          Belum ada habit yang dijadwalkan hari ini.
          <router-link to="/habits" class="text-accent underline ml-1">Buat Habit Baru</router-link>
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="habit in todayHabits"
            :key="habit.id"
            @click="handleToggleHabit(habit.id)"
            class="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none"
            :class="habit.isCompletedToday
              ? 'bg-profit/10 border-profit/25 text-text-primary'
              : 'bg-surface-elevated/70 hover:bg-surface-elevated border-border-subtle text-text-secondary'"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-surface border border-border-subtle flex items-center justify-center shrink-0 text-accent font-bold text-xs">
                <Icon name="target" size="15" />
              </div>
              <div class="min-w-0">
                <p class="text-xs sm:text-sm font-bold truncate" :class="{ 'line-through text-text-tertiary': habit.isCompletedToday }">
                  {{ habit.name }}
                </p>
                <p class="text-[11px] text-text-tertiary flex items-center gap-1.5 mt-0.5">
                  <span>{{ habit.category }}</span>
                  <span v-if="habit.target">• {{ habit.target }}</span>
                </p>
              </div>
            </div>

            <!-- Checkbox Circle -->
            <button
              type="button"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ml-3"
              :class="habit.isCompletedToday
                ? 'bg-profit text-white shadow-sm'
                : 'border border-border-default text-transparent hover:border-accent'"
            >
              <Icon name="check" size="13" />
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Jurnal Refleksi & Catatan Harian (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        <!-- Daily Reflection Card -->
        <div class="surface-card p-5 border border-border-subtle shadow-md space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Icon name="sparkles" size="13" />
              <span>Refleksi Hari Ini</span>
            </span>
            <router-link to="/personal-journal" class="text-[11px] text-text-tertiary hover:text-text-primary flex items-center gap-1">
              <span>Buka Jurnal</span>
              <Icon name="arrow-up-right" size="11" />
            </router-link>
          </div>

          <h3 class="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
            "{{ currentPrompt }}"
          </h3>

          <form @submit.prevent="saveQuickReflection" class="space-y-2 pt-1">
            <textarea
              v-model="quickNote"
              rows="3"
              class="input-field w-full text-xs resize-none"
              placeholder="Tuliskan catatan singkat atau pikiran Anda hari ini..."
            ></textarea>
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-text-tertiary">Tersimpan ke Jurnal Pribadi</span>
              <button
                type="submit"
                :disabled="!quickNote.trim()"
                class="btn-primary px-3.5 py-1.5 text-xs font-bold transition-all disabled:opacity-40"
              >
                Simpan Catatan
              </button>
            </div>
          </form>
        </div>

        <!-- Recent Transactions Mini Card -->
        <div class="surface-card p-5 border border-border-subtle space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h3 class="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Icon name="wallet" size="14" class="text-accent" />
              <span>Transaksi Terkini</span>
            </h3>
            <router-link to="/finance" class="text-xs text-accent hover:underline flex items-center gap-1">
              <span>Semua</span>
              <Icon name="arrow-up-right" size="11" />
            </router-link>
          </div>

          <div v-if="recentTransactions.length === 0" class="text-center py-4 text-text-tertiary text-xs">
            Belum ada transaksi bulan ini.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="tx in recentTransactions"
              :key="tx.id"
              class="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-surface-elevated/60 transition-colors"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  :class="tx.type === 'income' ? 'bg-profit' : 'bg-loss'"
                />
                <span class="text-text-secondary font-medium truncate">{{ tx.description || tx.category }}</span>
              </div>
              <span
                class="font-mono tabular-nums font-bold shrink-0 ml-2"
                :class="tx.type === 'income' ? 'text-profit' : 'text-loss'"
              >
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { useHabits } from '@/composables/useHabits'
import { useFinance } from '@/composables/useFinance'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const { habitsWithStats, streakOverview, toggleHabit, fetchHabitsData } = useHabits()
const { overviewStats, budgetProgress, filteredTransactions, fetchFinanceData } = useFinance()

const quickNote = ref('')

const PROMPTS = [
  'Apa satu pencapaian kecil atau hal yang paling kamu syukuri hari ini?',
  'Apa prioritas terpenting yang ingin kamu selesaikan sebelum hari berakhir?',
  'Bagaimana suasana hati kamu sekarang, dan apa yang bisa membuatnya lebih baik?',
  'Pelajaran atau inspirasi apa yang kamu dapatkan hari ini?',
]
const currentPrompt = ref(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])

// Today's habits
const todayHabits = computed(() => {
  return habitsWithStats.value || []
})

const completedTodayCount = computed(() => {
  return todayHabits.value.filter(h => h.isCompletedToday).length
})

const todayCompletionRate = computed(() => {
  if (todayHabits.value.length === 0) return 0
  return Math.round((completedTodayCount.value / todayHabits.value.length) * 100)
})

// Budget computations from BudgetCategoryProgress[]
const totalBudget = computed(() => {
  return (budgetProgress.value || []).reduce((sum, b) => sum + (b.monthly_limit || 0), 0)
})

const totalSpent = computed(() => {
  return (budgetProgress.value || []).reduce((sum, b) => sum + (b.actual_spent || 0), 0)
})

const budgetPercentUsed = computed(() => {
  if (totalBudget.value <= 0) return 0
  return (totalSpent.value / totalBudget.value) * 100
})

const budgetRemaining = computed(() => {
  return Math.max(0, totalBudget.value - totalSpent.value)
})

const recentTransactions = computed(() => {
  return (filteredTransactions.value || []).slice(0, 4)
})

function formatCurrency(amount: number): string {
  return 'Rp ' + Math.round(amount || 0).toLocaleString('id-ID')
}

async function handleToggleHabit(habitId: string) {
  const todayStr = new Date().toISOString().split('T')[0]
  await toggleHabit(habitId, todayStr)
}

function saveQuickReflection() {
  if (!quickNote.value.trim()) return

  // Save to localStorage diary storage key
  const storageKey = 'spaceos_personal_journal'
  try {
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
    existing.unshift({
      id: `diary-${Date.now()}`,
      title: `Refleksi Harian (${new Date().toLocaleDateString('id-ID')})`,
      content: `Refleksi: ${currentPrompt.value}\n\n${quickNote.value.trim()}`,
      createdAt: new Date().toISOString(),
      tags: ['Refleksi', 'Dashboard'],
      mood: 'Thoughtful',
    })
    localStorage.setItem(storageKey, JSON.stringify(existing))
    toast.success('Catatan Tersimpan', 'Refleksi harian telah ditambahkan ke Jurnal Pribadi.')
    quickNote.value = ''
  } catch (err) {
    console.error(err)
    toast.error('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan catatan.')
  }
}

onMounted(async () => {
  await Promise.all([
    fetchHabitsData(),
    fetchFinanceData(),
  ])
})
</script>
