<template>
  <div class="glass rounded-xl p-5 mb-8 border border-slate-700/60">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-700/50">
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>🎯</span>
          <span>Budget & Batas Pengeluaran Bulanan</span>
        </h3>
        <p class="text-xs text-slate-400">Monitor kepatuhan anggaran per kategori bulan ini</p>
      </div>

      <button
        type="button"
        @click="showBudgetModal = true"
        class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-accent border border-accent/30 transition-all flex items-center gap-1.5"
      >
        <span>⚙️</span>
        <span>Atur Anggaran</span>
      </button>
    </div>

    <!-- Empty Budget List -->
    <div v-if="budgetProgress.length === 0" class="py-8 text-center text-slate-400">
      <span class="text-3xl block mb-2">📋</span>
      <p class="text-sm font-semibold text-white">Belum ada anggaran yang diatur bulan ini</p>
      <p class="text-xs text-slate-500 mt-1">Buat batas pengeluaran untuk mengontrol pengeluaran kamu.</p>
      <button
        type="button"
        @click="showBudgetModal = true"
        class="btn-primary mt-3 px-4 py-1.5 text-xs font-bold rounded-lg"
      >
        + Atur Budget Sekarang
      </button>
    </div>

    <!-- Budget Progress Bars Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="item in budgetProgress"
        :key="item.category"
        class="p-4 rounded-xl bg-slate-800/40 border transition-all"
        :class="item.isOverBudget
          ? 'border-rose-500/50 bg-rose-500/5'
          : item.isNearLimit
          ? 'border-amber-500/50 bg-amber-500/5'
          : 'border-slate-700/50'"
      >
        <!-- Header: Category + Status Badge -->
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-bold text-white">{{ item.category }}</span>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full"
            :class="item.isOverBudget
              ? 'bg-rose-500/20 text-rose-400 animate-pulse'
              : item.isNearLimit
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-emerald-500/20 text-emerald-400'"
          >
            {{ item.isOverBudget ? '⚠️ Over Budget' : item.isNearLimit ? '⚡ Hampir Penuh' : '✓ Terkendali' }}
          </span>
        </div>

        <!-- Numbers -->
        <div class="flex items-baseline justify-between text-xs font-mono mb-2">
          <span class="text-slate-300">
            Terpakai: <strong :class="item.isOverBudget ? 'text-rose-400' : 'text-white'">Rp {{ item.actual_spent.toLocaleString('id-ID') }}</strong>
          </span>
          <span class="text-slate-400">
            Limit: Rp {{ item.monthly_limit.toLocaleString('id-ID') }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/40">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="item.isOverBudget
              ? 'bg-rose-500'
              : item.isNearLimit
              ? 'bg-amber-400'
              : 'bg-gradient-to-r from-accent to-emerald-400'"
            :style="{ width: `${Math.min(100, item.percentage)}%` }"
          ></div>
        </div>

        <!-- Footer Remaining -->
        <div class="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>{{ item.percentage }}% terpakai</span>
          <span :class="item.isOverBudget ? 'text-rose-400 font-bold' : 'text-slate-400'">
            {{ item.isOverBudget ? `Lebih Rp ${(item.actual_spent - item.monthly_limit).toLocaleString('id-ID')}` : `Sisa Rp ${item.remaining.toLocaleString('id-ID')}` }}
          </span>
        </div>
      </div>
    </div>

    <!-- Set Budget Modal -->
    <teleport to="body">
      <div v-if="showBudgetModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" @click="showBudgetModal = false"></div>

        <div class="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 z-10 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span>🎯</span>
              <span>Atur Anggaran Bulanan</span>
            </h3>
            <button @click="showBudgetModal = false" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <form @submit.prevent="handleSaveBudget" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Kategori Pengeluaran</label>
              <select v-model="budgetForm.category" class="input-field text-xs h-10" required>
                <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.name">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Batas Maksimal Bulanan (Rp)</label>
              <input
                v-model.number="budgetForm.monthlyLimit"
                type="number"
                min="10000"
                step="10000"
                required
                placeholder="Contoh: 1500000"
                class="input-field text-xs h-10 font-mono"
              />
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showBudgetModal = false"
                class="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Batal
              </button>
              <button type="submit" class="btn-primary flex-1 py-2 text-xs font-bold rounded-xl">
                Simpan Anggaran
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { BudgetCategoryProgress } from '@/types'

const props = defineProps<{
  budgetProgress: BudgetCategoryProgress[]
  categories: { id: string; name: string; type: string; icon: string }[]
}>()

const emit = defineEmits<{
  (e: 'set-budget', payload: { category: string; monthlyLimit: number }): void
}>()

const showBudgetModal = ref(false)

const expenseCategories = computed(() => {
  return props.categories.filter(c => c.type === 'expense')
})

const budgetForm = reactive({
  category: expenseCategories.value[0]?.name || 'Makanan & Minuman',
  monthlyLimit: 1000000,
})

function handleSaveBudget() {
  if (!budgetForm.category || !budgetForm.monthlyLimit) return
  emit('set-budget', {
    category: budgetForm.category,
    monthlyLimit: budgetForm.monthlyLimit,
  })
  showBudgetModal.value = false
}
</script>
