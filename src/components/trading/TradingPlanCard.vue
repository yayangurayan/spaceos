<template>
  <div class="surface-card p-5 sm:p-6 transition-all">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-border-subtle pb-4">
      <div>
        <div class="flex items-center gap-2">
          <Icon name="clipboard" size="18" class="text-accent" />
          <h2 class="text-base sm:text-lg font-bold text-text-primary tracking-tight">Trading Plan & Strategi Teruji</h2>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/25">
            Aktif
          </span>
        </div>
        <p class="text-xs text-text-tertiary mt-1">
          Patuhi trading plan berikut secara disiplin untuk menjaga psikologi dan konsistensi probabilitas.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="openEditModal"
          class="btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
        >
          <Icon name="edit" size="13" />
          <span>Edit Plan</span>
        </button>

        <router-link
          v-if="showBacktestLink"
          to="/backtesting"
          class="px-3 py-1.5 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold border border-accent/25 transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
        >
          <Icon name="zap" size="13" />
          <span>Buka Backtesting</span>
          <Icon name="arrow-up-right" size="12" />
        </router-link>
      </div>
    </div>

    <!-- Strategy Summary Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <div class="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
        <div class="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">Nama Strategi</div>
        <div class="text-xs sm:text-sm font-bold text-accent truncate" :title="tradingPlan.strategyName">
          {{ tradingPlan.strategyName || 'Smart Money Concept' }}
        </div>
      </div>

      <div class="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
        <div class="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">Sesi Trading</div>
        <div class="text-xs sm:text-sm font-semibold text-text-primary truncate" :title="tradingPlan.marketSession">
          {{ tradingPlan.marketSession || 'London & NY' }}
        </div>
      </div>

      <div class="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
        <div class="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">Timeframe Analisa</div>
        <div class="text-xs sm:text-sm font-semibold text-text-primary truncate" :title="tradingPlan.timeframes">
          {{ tradingPlan.timeframes || 'HTF: 1H | LTF: 5m' }}
        </div>
      </div>

      <div class="p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
        <div class="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">Risiko Per Posisi</div>
        <div class="text-xs sm:text-sm font-bold text-amber-400 truncate" :title="tradingPlan.riskPerTrade">
          {{ tradingPlan.riskPerTrade || 'Max 1%' }}
        </div>
      </div>
    </div>

    <!-- Strategy Detail Blocks -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 1. Entry Rules -->
      <div class="p-4 rounded-xl bg-surface-elevated/50 border border-border-subtle space-y-2">
        <div class="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Icon name="target" size="14" />
          <span>Aturan Konfirmasi Entri (Entry Rules)</span>
        </div>
        <div class="text-xs text-text-secondary whitespace-pre-line leading-relaxed pl-1 font-mono">
          {{ tradingPlan.entryRules || 'Belum ada aturan entri tertulis.' }}
        </div>
      </div>

      <!-- 2. Stop Loss & Invalidation -->
      <div class="p-4 rounded-xl bg-surface-elevated/50 border border-border-subtle space-y-2">
        <div class="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
          <Icon name="stop-circle" size="14" />
          <span>Invalidasi & Stop Loss (Risk Rules)</span>
        </div>
        <div class="text-xs text-text-secondary whitespace-pre-line leading-relaxed pl-1 font-mono">
          {{ tradingPlan.invalidationRules || 'Selalu tetapkan SL sebelum entry.' }}
        </div>
      </div>

      <!-- 3. Take Profit & Targets -->
      <div class="p-4 rounded-xl bg-surface-elevated/50 border border-border-subtle space-y-2">
        <div class="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <Icon name="check-circle" size="14" />
          <span>Target Profit & Manajemen Posisi</span>
        </div>
        <div class="text-xs text-text-secondary whitespace-pre-line leading-relaxed pl-1 font-mono">
          {{ tradingPlan.exitRules || 'Target minimal 1:2 Risk to Reward.' }}
        </div>
      </div>

      <!-- 4. Psychology & Discipline -->
      <div class="p-4 rounded-xl bg-surface-elevated/50 border border-border-subtle space-y-2">
        <div class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Icon name="activity" size="14" />
          <span>Disiplin Psikologi & Batas Harian</span>
        </div>
        <div class="text-xs text-text-secondary whitespace-pre-line leading-relaxed pl-1 font-mono">
          {{ tradingPlan.psychologyRules || 'Max 2x loss sehari, no revenge trading.' }}
        </div>
      </div>
    </div>

    <!-- Pairs Pill List -->
    <div v-if="tradingPlan.pairs && tradingPlan.pairs.length > 0" class="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-border-subtle">
      <span class="text-[11px] font-semibold text-text-tertiary mr-1">Pair Fokus:</span>
      <span
        v-for="p in tradingPlan.pairs"
        :key="p"
        class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-surface-elevated text-text-secondary border border-border-subtle"
      >
        {{ p }}
      </span>
    </div>

    <!-- ============================================================
         EDIT TRADING PLAN MODAL
         ============================================================ -->
    <teleport to="body">
      <div
        v-if="isEditing"
        class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        @click.self="isEditing = false"
      >
        <div class="bg-surface border border-border-default max-w-2xl w-full rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-border-subtle pb-3">
            <div class="flex items-center gap-2">
              <Icon name="edit" size="18" class="text-accent" />
              <h3 class="text-base sm:text-lg font-bold text-text-primary">Edit Trading Plan & Strategi</h3>
            </div>
            <button
              type="button"
              @click="isEditing = false"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors"
            >
              <Icon name="x" size="16" />
            </button>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <!-- 1. Strategy Name & Session -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-text-secondary mb-1">Nama Strategi</label>
                <input
                  v-model="editForm.strategyName"
                  type="text"
                  class="input-field w-full text-xs font-semibold"
                  placeholder="Misal: SMC Liquidity Sweep 15m"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-text-secondary mb-1">Sesi Pasar (Trading Session)</label>
                <input
                  v-model="editForm.marketSession"
                  type="text"
                  class="input-field w-full text-xs"
                  placeholder="Misal: London Open (14:00 - 17:00 WIB)"
                />
              </div>
            </div>

            <!-- 2. Timeframes & Risk -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-text-secondary mb-1">Timeframe Analisa</label>
                <input
                  v-model="editForm.timeframes"
                  type="text"
                  class="input-field w-full text-xs"
                  placeholder="Misal: HTF: 4H/1H | LTF: 15m/5m"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-text-secondary mb-1">Toleransi Risiko</label>
                <input
                  v-model="editForm.riskPerTrade"
                  type="text"
                  class="input-field w-full text-xs"
                  placeholder="Misal: 1% per trade (Maksimal 2 trade/hari)"
                />
              </div>
            </div>

            <!-- 3. Pairs -->
            <div>
              <label class="block text-xs font-semibold text-text-secondary mb-1">
                Pasangan Mata Uang / Pair (Pisahkan dengan koma)
              </label>
              <input
                v-model="pairsInput"
                type="text"
                class="input-field w-full text-xs font-mono"
                placeholder="XAUUSD, EURUSD, GBPUSD, BTCUSD"
              />
            </div>

            <!-- 4. Entry Rules -->
            <div>
              <label class="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                <Icon name="target" size="13" />
                <span>Aturan Entri / Checklist Konfirmasi</span>
              </label>
              <textarea
                v-model="editForm.entryRules"
                rows="4"
                class="input-field w-full text-xs font-mono leading-relaxed"
                placeholder="Tuliskan langkah-langkah wajib sebelum menekan tombol BUY/SELL..."
              ></textarea>
            </div>

            <!-- 5. Invalidation & SL -->
            <div>
              <label class="block text-xs font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                <Icon name="stop-circle" size="13" />
                <span>Aturan Stop Loss & Invalidasi Setup</span>
              </label>
              <textarea
                v-model="editForm.invalidationRules"
                rows="3"
                class="input-field w-full text-xs font-mono leading-relaxed"
                placeholder="Di mana SL diletakkan? Kondisi apa yang membatalkan setup..."
              ></textarea>
            </div>

            <!-- 6. Exit & TP -->
            <div>
              <label class="block text-xs font-semibold text-accent mb-1 flex items-center gap-1.5">
                <Icon name="check-circle" size="13" />
                <span>Aturan Take Profit & Penguncian Profit (BE)</span>
              </label>
              <textarea
                v-model="editForm.exitRules"
                rows="3"
                class="input-field w-full text-xs font-mono leading-relaxed"
                placeholder="Kapan geser SL ke BE? Berapa target minimal R:R..."
              ></textarea>
            </div>

            <!-- 7. Psychology -->
            <div>
              <label class="block text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                <Icon name="activity" size="13" />
                <span>Aturan Disiplin Psikologi & Larangan</span>
              </label>
              <textarea
                v-model="editForm.psychologyRules"
                rows="3"
                class="input-field w-full text-xs font-mono leading-relaxed"
                placeholder="Batas maksimal loss berturut-turut, jeda trading..."
              ></textarea>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <button
              type="button"
              @click="isEditing = false"
              class="btn-secondary px-4 py-2 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              @click="savePlan"
              class="btn-primary px-5 py-2 text-xs font-bold shadow-lg flex items-center gap-1.5"
            >
              <Icon name="bookmark" size="14" />
              <span>Simpan Trading Plan</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { useBacktesting } from '@/composables/useBacktesting'

withDefaults(defineProps<{
  showBacktestLink?: boolean
}>(), {
  showBacktestLink: true,
})

const { tradingPlan, updateTradingPlan } = useBacktesting()

const isEditing = ref(false)
const pairsInput = ref('')

const editForm = reactive({
  strategyName: '',
  marketSession: '',
  timeframes: '',
  riskPerTrade: '',
  entryRules: '',
  invalidationRules: '',
  exitRules: '',
  psychologyRules: '',
})

function openEditModal() {
  editForm.strategyName = tradingPlan.value.strategyName || ''
  editForm.marketSession = tradingPlan.value.marketSession || ''
  editForm.timeframes = tradingPlan.value.timeframes || ''
  editForm.riskPerTrade = tradingPlan.value.riskPerTrade || ''
  editForm.entryRules = tradingPlan.value.entryRules || ''
  editForm.invalidationRules = tradingPlan.value.invalidationRules || ''
  editForm.exitRules = tradingPlan.value.exitRules || ''
  editForm.psychologyRules = tradingPlan.value.psychologyRules || ''
  pairsInput.value = (tradingPlan.value.pairs || []).join(', ')
  isEditing.value = true
}

function savePlan() {
  const parsedPairs = pairsInput.value
    .split(',')
    .map(p => p.trim().toUpperCase())
    .filter(Boolean)

  updateTradingPlan({
    ...editForm,
    pairs: parsedPairs.length > 0 ? parsedPairs : ['XAUUSD', 'EURUSD'],
  })

  isEditing.value = false
}
</script>
