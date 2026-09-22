<template>
  <div class="space-y-6 animate-fade-in w-full max-w-full">
    <!-- 1. Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">🌿</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personal Space Dashboard
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Pantau keuangan, konsistensi habit harian, dan ruang refleksi diri pribadi Anda.
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <router-link
          to="/finance"
          class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
        >
          <span>💵</span>
          <span>+ Transaksi</span>
        </router-link>

        <router-link
          to="/habits"
          class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
        >
          <span>🎯</span>
          <span>+ Habit</span>
        </router-link>

        <router-link
          to="/personal-journal"
          class="flex-1 sm:flex-none btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
        >
          <span>✍️</span>
          <span>Tulis Jurnal</span>
        </router-link>
      </div>
    </div>

    <!-- 2. High-Level Summary Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Habit Progress Today -->
      <div class="glass rounded-2xl p-5 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🎯</span>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Habit Hari Ini</span>
          </div>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
            🔥 {{ streakOverview.longestStreak }} hari streak
          </span>
        </div>
        <div class="flex items-end justify-between">
          <div>
            <p class="text-2xl font-bold font-mono text-white">
              {{ completedTodayCount }} / {{ todayHabits.length }}
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">Target terselesaikan</p>
          </div>
          <div class="text-right">
            <span class="text-lg font-bold font-mono text-emerald-400">{{ todayCompletionRate }}%</span>
          </div>
        </div>
        <!-- Progress bar -->
        <div class="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
          <div
            class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
            :style="{ width: `${todayCompletionRate}%` }"
          ></div>
        </div>
      </div>

      <!-- Financial Snapshot (This Month) -->
      <div class="glass rounded-2xl p-5 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">💰</span>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Cashflow Bulan Ini</span>
          </div>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full"
            :class="overviewStats.netSavings >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'"
          >
            {{ overviewStats.netSavings >= 0 ? 'Surplus' : 'Defisit' }}
          </span>
        </div>
        <p class="text-2xl font-bold font-mono text-white">
          {{ formatCurrency(overviewStats.netSavings) }}
        </p>
        <div class="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
          <span class="text-emerald-400">Masuk: +{{ formatCurrency(overviewStats.totalIncome) }}</span>
          <span class="text-rose-400">Keluar: -{{ formatCurrency(overviewStats.totalExpense) }}</span>
        </div>
      </div>

      <!-- Budget Progress -->
      <div class="glass rounded-2xl p-5 border border-slate-700/60 transition-transform hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📊</span>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Sisa Anggaran</span>
          </div>
          <span class="text-[10px] text-slate-400">Bulan Ini</span>
        </div>
        <p class="text-2xl font-bold font-mono text-white">
          {{ formatCurrency(budgetRemaining) }}
        </p>
        <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span>Terpakai {{ budgetPercentUsed.toFixed(0) }}%</span>
          <span>Batas: {{ formatCurrency(totalBudget) }}</span>
        </div>
        <div class="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
          <div
            class="h-full transition-all duration-500"
            :class="budgetPercentUsed > 90 ? 'bg-rose-500' : budgetPercentUsed > 75 ? 'bg-amber-500' : 'bg-cyan-500'"
            :style="{ width: `${Math.min(100, budgetPercentUsed)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 3. Middle Section: Habit Checklist & Reflection -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Quick Habit Checklist (7 cols) -->
      <div class="lg:col-span-7 glass rounded-2xl p-5 sm:p-6 border border-slate-700/60 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700/50">
          <div>
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <span>✅</span>
              <span>Checklist Habit Hari Ini</span>
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">Centang kebiasaan harian langsung dari sini.</p>
          </div>
          <router-link to="/habits" class="text-xs text-accent hover:underline font-semibold">
            Kelola Habit →
          </router-link>
        </div>

        <div v-if="todayHabits.length === 0" class="py-8 text-center text-slate-400 text-xs">
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
              ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
              : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-2xl shrink-0">{{ habit.icon }}</span>
              <div class="min-w-0">
                <p class="text-xs sm:text-sm font-bold truncate" :class="{ 'line-through text-slate-400': habit.isCompletedToday }">
                  {{ habit.name }}
                </p>
                <p class="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span>{{ habit.category }}</span>
                  <span v-if="habit.target">• {{ habit.target }}</span>
                </p>
              </div>
            </div>

            <!-- Checkbox Circle -->
            <button
              type="button"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0 ml-3"
              :class="habit.isCompletedToday
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'border-2 border-slate-600 hover:border-slate-400 text-transparent'"
            >
              ✓
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Jurnal Refleksi & Catatan Harian (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        <!-- Daily Reflection Card -->
        <div class="glass rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 shadow-lg space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <span>💡</span>
              <span>Refleksi Hari Ini</span>
            </span>
            <router-link to="/personal-journal" class="text-[11px] text-slate-400 hover:text-white">
              Buka Jurnal →
            </router-link>
          </div>

          <h3 class="text-sm font-bold text-white leading-snug">
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
              <span class="text-[10px] text-slate-500">Tersimpan ke Jurnal Pribadi</span>
              <button
                type="submit"
                :disabled="!quickNote.trim()"
                class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all"
              >
                Simpan Catatan
              </button>
            </div>
          </form>
        </div>

        <!-- Recent Transactions Mini Card -->
        <div class="glass rounded-2xl p-5 border border-slate-700/60 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>💳</span>
              <span>Transaksi Terkini</span>
            </h3>
            <router-link to="/finance" class="text-xs text-accent hover:underline">
              Semua →
            </router-link>
          </div>

          <div v-if="recentTransactions.length === 0" class="text-center py-4 text-slate-500 text-xs">
            Belum ada transaksi bulan ini.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="tx in recentTransactions"
              :key="tx.id"
              class="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-800/50"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-sm">{{ tx.type === 'income' ? '🟢' : '🔴' }}</span>
                <span class="text-slate-300 font-medium truncate">{{ tx.description || tx.category }}</span>
              </div>
              <span
                class="font-mono font-bold shrink-0 ml-2"
                :class="tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'"
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
