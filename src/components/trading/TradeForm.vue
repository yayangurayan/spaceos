<template>
  <teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        @click="onClose"
      ></div>

      <!-- Modal Card -->
      <div
        class="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 transform transition-all animate-modal-pop max-h-[90vh] flex flex-col"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur sticky top-0 z-20">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              :class="form.position === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
            >
              {{ form.position === 'BUY' ? '📈' : '📉' }}
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">
                {{ isEditing ? 'Edit Trade' : 'Catat Trade Baru' }}
              </h2>
              <p class="text-xs text-slate-400">
                Lengkapi detail eksekusi, psikologi, dan screenshot jurnal
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="onClose"
            class="w-8 h-8 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Form Body (Scrollable) -->
        <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-6 flex-1 custom-scroll">
          <!-- Section 1: Basic Info -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-1.5">
              <span>① Info Dasar & Instrumen</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <!-- Date & Time -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Waktu Eksekusi <span class="text-rose-400">*</span>
                </label>
                <input
                  v-model="form.date"
                  type="datetime-local"
                  required
                  class="input-field text-xs h-10"
                />
              </div>

              <!-- Pair -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Pair / Symbol <span class="text-rose-400">*</span>
                </label>
                <input
                  v-model="form.pair"
                  type="text"
                  required
                  placeholder="e.g. XAUUSD"
                  class="input-field text-xs h-10 uppercase font-mono"
                  list="form-pairs-list"
                />
                <datalist id="form-pairs-list">
                  <option value="XAUUSD">Gold (XAU/USD)</option>
                  <option value="EURUSD">EUR/USD</option>
                  <option value="GBPUSD">GBP/USD</option>
                  <option value="USDJPY">USD/JPY</option>
                  <option value="GBPJPY">GBP/JPY</option>
                  <option value="AUDUSD">AUD/USD</option>
                  <option value="BTCUSD">Bitcoin</option>
                  <option value="ETHUSD">Ethereum</option>
                  <option value="US30">Dow Jones 30</option>
                  <option value="NAS100">Nasdaq 100</option>
                </datalist>
              </div>

              <!-- Account Type -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Tipe Akun
                </label>
                <select
                  v-model="form.account_type"
                  class="input-field text-xs h-10"
                >
                  <option value="Funded">Funded (Prop Firm)</option>
                  <option value="Real">Real (Personal)</option>
                  <option value="Demo">Demo / Backtest</option>
                </select>
              </div>
            </div>

            <!-- Position Toggle: BUY vs SELL -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">
                Posisi <span class="text-rose-400">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="form.position = 'BUY'"
                  class="py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all"
                  :class="form.position === 'BUY'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'"
                >
                  <span>▲</span>
                  <span>BUY / LONG</span>
                </button>
                <button
                  type="button"
                  @click="form.position = 'SELL'"
                  class="py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all"
                  :class="form.position === 'SELL'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/10'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'"
                >
                  <span>▼</span>
                  <span>SELL / SHORT</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Section 2: Trade Numbers & Live Preview -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-1.5">
              <span>② Parameter Harga & Eksekusi</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <!-- Entry Price -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Entry Price <span class="text-rose-400">*</span>
                </label>
                <input
                  v-model.number="form.entry_price"
                  type="number"
                  step="any"
                  required
                  placeholder="0.00000"
                  class="input-field text-xs h-10 font-mono"
                />
              </div>

              <!-- Exit Price -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Exit Price
                </label>
                <input
                  v-model.number="form.exit_price"
                  type="number"
                  step="any"
                  placeholder="Kosong = Open"
                  class="input-field text-xs h-10 font-mono"
                />
              </div>

              <!-- Stop Loss -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Stop Loss (SL)
                </label>
                <input
                  v-model.number="form.stop_loss"
                  type="number"
                  step="any"
                  placeholder="0.00000"
                  class="input-field text-xs h-10 font-mono"
                />
              </div>

              <!-- Take Profit -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Take Profit (TP)
                </label>
                <input
                  v-model.number="form.take_profit"
                  type="number"
                  step="any"
                  placeholder="0.00000"
                  class="input-field text-xs h-10 font-mono"
                />
              </div>

              <!-- Lot Size -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Lot Size <span class="text-rose-400">*</span>
                </label>
                <input
                  v-model.number="form.lot_size"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="1.00"
                  class="input-field text-xs h-10 font-mono"
                />
              </div>
            </div>

            <!-- Live Calculated Metrics Card -->
            <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
              <div>
                <span class="text-[10px] uppercase font-semibold text-slate-400 block">Kalkulasi P&L</span>
                <div class="flex items-baseline gap-1 mt-0.5">
                  <span
                    class="text-base font-bold font-mono"
                    :class="computedPnl != null ? (computedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500'"
                  >
                    {{ computedPnl != null ? (computedPnl >= 0 ? '+' : '') + '$' + computedPnl.toFixed(2) : '--' }}
                  </span>
                  <span
                    v-if="computedStatus"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    :class="computedStatus === 'Win' ? 'bg-emerald-500/20 text-emerald-300' : computedStatus === 'Loss' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-300'"
                  >
                    {{ computedStatus }}
                  </span>
                </div>
              </div>

              <div>
                <span class="text-[10px] uppercase font-semibold text-slate-400 block">Perolehan Pips</span>
                <span class="text-sm font-bold font-mono text-slate-200 mt-0.5 block">
                  {{ computedPips != null ? (computedPips > 0 ? '+' : '') + computedPips.toFixed(1) + ' pips' : '--' }}
                </span>
              </div>

              <div>
                <span class="text-[10px] uppercase font-semibold text-slate-400 block">R:R Ratio</span>
                <span
                  class="text-sm font-bold font-mono mt-0.5 block"
                  :class="computedRr != null && computedRr >= 2 ? 'text-emerald-400' : computedRr != null && computedRr < 1 ? 'text-rose-400' : 'text-slate-200'"
                >
                  {{ computedRr != null ? '1:' + computedRr.toFixed(2) : '--' }}
                </span>
              </div>

              <div class="col-span-2 sm:col-span-1">
                <!-- Custom P&L Override toggle (optional manual adjustment) -->
                <button
                  type="button"
                  @click="showManualPnl = !showManualPnl"
                  class="text-[11px] text-accent hover:underline flex items-center gap-1"
                >
                  <span>✏️</span>
                  <span>{{ showManualPnl ? 'Pakai Auto P&L' : 'Override P&L' }}</span>
                </button>
                <input
                  v-if="showManualPnl"
                  v-model.number="form.pnl"
                  type="number"
                  step="0.01"
                  placeholder="Manual $ PnL"
                  class="input-field text-xs h-7 py-0 mt-1 font-mono"
                />
              </div>
            </div>

            <!-- Risk Warning Badge -->
            <div
              v-if="computedRr != null && computedRr < 2 && computedRr > 0"
              class="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300"
            >
              <span>⚠️</span>
              <span><strong>Catatan Risk:</strong> R:R ratio kurang dari 1:2. Pastikan sesuai dengan trading plan kamu.</span>
            </div>
          </div>

          <!-- Section 3: Analysis & Reasons -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-1.5">
              <span>③ Analisa & Rencana Trading</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Setup -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Setup / Strategi
                </label>
                <textarea
                  v-model="form.setup"
                  rows="2"
                  placeholder="e.g. London Sweep + FVG Rejection, Break & Retest, Divergence..."
                  class="input-field text-xs py-2"
                ></textarea>
              </div>

              <!-- Reason for Entry -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan Entry (Trigger)
                </label>
                <textarea
                  v-model="form.entry_reason"
                  rows="2"
                  placeholder="e.g. Konfirmasi pin bar di support 15m, volume spike..."
                  class="input-field text-xs py-2"
                ></textarea>
              </div>

              <!-- Reason for Exit -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan Exit / Penutupan
                </label>
                <textarea
                  v-model="form.exit_reason"
                  rows="2"
                  placeholder="e.g. Hit TP1, trailing stop kena, manual close sebelum news..."
                  class="input-field text-xs py-2"
                ></textarea>
              </div>

              <!-- What went well -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">
                  Yang Sudah Bagus (What went well)
                </label>
                <textarea
                  v-model="form.what_went_well"
                  rows="2"
                  placeholder="e.g. Sabar nunggu candle close, tidak geser stop loss..."
                  class="input-field text-xs py-2"
                ></textarea>
              </div>
            </div>

            <!-- Improvements -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">
                Hal yang Bisa Ditingkatkan (Improvements)
              </label>
              <textarea
                v-model="form.improvements"
                rows="2"
                placeholder="e.g. Kurangi lot size saat news, jangan overtrading setelah loss..."
                class="input-field text-xs py-2"
              ></textarea>
            </div>
          </div>

          <!-- Section 4: Psychology & Emotions -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-1.5">
              <span>④ Psikologi & Emosi Trader</span>
            </div>

            <!-- Pre & Post Mood -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Pre Mood -->
              <div class="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
                <label class="block text-xs font-semibold text-slate-300 mb-2">
                  Mood Sebelum Entry
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="mood in preMoods"
                    :key="mood.emoji"
                    type="button"
                    @click="form.pre_mood = mood.emoji"
                    class="p-2 rounded-lg text-lg border transition-all"
                    :class="form.pre_mood === mood.emoji
                      ? 'bg-accent/20 border-accent scale-110'
                      : 'bg-dark border-slate-700 hover:border-slate-500'"
                    :title="mood.label"
                  >
                    {{ mood.emoji }}
                  </button>
                </div>
              </div>

              <!-- Post Mood -->
              <div class="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
                <label class="block text-xs font-semibold text-slate-300 mb-2">
                  Mood Setelah Exit
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="mood in postMoods"
                    :key="mood.emoji"
                    type="button"
                    @click="form.post_mood = mood.emoji"
                    class="p-2 rounded-lg text-lg border transition-all"
                    :class="form.post_mood === mood.emoji
                      ? 'bg-accent/20 border-accent scale-110'
                      : 'bg-dark border-slate-700 hover:border-slate-500'"
                    :title="mood.label"
                  >
                    {{ mood.emoji }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Emotion Tags -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-2">
                Emosi yang Dirasakan (Pilih yang relevan)
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in availableEmotions"
                  :key="tag"
                  type="button"
                  @click="toggleEmotion(tag)"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  :class="form.emotions.includes(tag)
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'"
                >
                  {{ form.emotions.includes(tag) ? '✓ ' : '+ ' }}{{ tag }}
                </button>
              </div>
            </div>

            <!-- Mistakes -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-2">
                Kesalahan Eksekusi (Jika ada)
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="mistake in availableMistakes"
                  :key="mistake"
                  type="button"
                  @click="toggleMistake(mistake)"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  :class="form.mistakes.includes(mistake)
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'"
                >
                  {{ form.mistakes.includes(mistake) ? '⚠️ ' : '' }}{{ mistake }}
                </button>
              </div>
            </div>
          </div>

          <!-- Section 5: Screenshot Upload -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-1.5">
              <span>⑤ Screenshot Chart & Bukti Eksekusi</span>
            </div>

            <!-- Drop Zone -->
            <div
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
              :class="isDragging ? 'border-accent bg-accent/10' : 'border-slate-700 bg-dark/40 hover:border-slate-500'"
              @click="triggerFileInput"
            >
              <input
                ref="fileInputRef"
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
              <span class="text-3xl block mb-2">📸</span>
              <p class="text-xs font-semibold text-white">
                Klik atau Drag & Drop gambar chart di sini
              </p>
              <p class="text-[11px] text-slate-400 mt-1">
                Mendukung PNG, JPG, WEBP. Maksimal beberapa screenshot (setup, entry, exit).
              </p>
            </div>

            <!-- Uploading indicator -->
            <div v-if="isUploading" class="text-center py-2 text-xs text-accent animate-pulse">
              Mengupload screenshot... ⏳
            </div>

            <!-- Thumbnails Preview -->
            <div v-if="form.screenshot_urls.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                v-for="(url, idx) in form.screenshot_urls"
                :key="idx"
                class="relative group rounded-lg overflow-hidden border border-slate-700 bg-dark aspect-video"
              >
                <img :src="url" alt="Trade Screenshot" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click="removeScreenshot(idx)"
                  class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus gambar"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </form>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-end gap-3 sticky bottom-0 z-20">
          <button
            type="button"
            @click="onClose"
            class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSaving || isUploading"
            class="btn-primary px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <span v-if="isSaving">Menyimpan... ⏳</span>
            <span v-else>{{ isEditing ? 'Simpan Perubahan' : 'Catat Trade' }}</span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type {
  Trade,
  TradeFormData,
  EmotionTag,
  MistakeTag,
} from '@/types'
import {
  calculatePnl,
  calculatePips,
  calculateRR,
  determineStatus,
} from '@/composables/useTradeCalculations'
import { useTrading } from '@/composables/useTrading'

const props = defineProps<{
  trade?: Trade | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: TradeFormData): void
}>()

const { uploadScreenshot } = useTrading()

const isEditing = computed(() => !!props.trade)
const isSaving = ref(false)
const isUploading = ref(false)
const isDragging = ref(false)
const showManualPnl = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Form State
const form = reactive<TradeFormData>({
  date: new Date().toISOString().slice(0, 16),
  pair: 'XAUUSD',
  position: 'BUY',
  account_type: 'Funded',
  entry_price: null,
  exit_price: null,
  stop_loss: null,
  take_profit: null,
  lot_size: 1.0,
  setup: '',
  entry_reason: '',
  exit_reason: '',
  what_went_well: '',
  improvements: '',
  emotions: [],
  pre_mood: '🎯',
  post_mood: '🚀',
  mistakes: [],
  screenshot_urls: [],
  notes: '',
  pnl: null,
})

// Psychology Lists
const availableEmotions: EmotionTag[] = [
  'Confident',
  'Disciplined',
  'Patient',
  'FOMO',
  'Greedy',
  'Fearful',
  'Revenge',
]

const availableMistakes: MistakeTag[] = [
  'Overleveraged',
  'No SL',
  'Moved SL',
  'Early Exit',
  'Late Entry',
  'Chasing Price',
  'Overtrading',
]

const preMoods = [
  { emoji: '🎯', label: 'Fokus & Siap' },
  { emoji: '🔥', label: 'Percaya Diri' },
  { emoji: '😌', label: 'Tenang' },
  { emoji: '🤔', label: 'Ragu-ragu' },
  { emoji: '😨', label: 'Cemas' },
  { emoji: '⚡', label: 'Impulsif' },
]

const postMoods = [
  { emoji: '🚀', label: 'Puas / Sesuai Plan' },
  { emoji: '🥳', label: 'Sangat Senang' },
  { emoji: '😊', label: 'Cukup Bagus' },
  { emoji: '😐', label: 'Biasa Saja' },
  { emoji: '🤦‍♂️', label: 'Menyesal' },
  { emoji: '🤬', label: 'Kesal / Tilt' },
]

// Real-time calculated metrics
const computedPnl = computed(() => {
  if (showManualPnl.value && form.pnl !== null && form.pnl !== undefined) {
    return form.pnl
  }
  return calculatePnl(form.entry_price, form.exit_price, form.lot_size, form.position, form.pair)
})

const computedPips = computed(() => {
  return calculatePips(form.entry_price, form.exit_price, form.pair, form.position)
})

const computedRr = computed(() => {
  return calculateRR(form.entry_price, form.exit_price, form.stop_loss, form.take_profit, form.position)
})

const computedStatus = computed(() => {
  return determineStatus(form.exit_price, computedPnl.value)
})

/* ============================
   Psychology Selection Helpers
   ============================ */
function toggleEmotion(tag: EmotionTag) {
  const idx = form.emotions.indexOf(tag)
  if (idx > -1) {
    form.emotions.splice(idx, 1)
  } else {
    form.emotions.push(tag)
  }
}

function toggleMistake(mistake: MistakeTag) {
  const idx = form.mistakes.indexOf(mistake)
  if (idx > -1) {
    form.mistakes.splice(idx, 1)
  } else {
    form.mistakes.push(mistake)
  }
}

/* ============================
   Screenshot Handling
   ============================ */
function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files) return
  await processFiles(Array.from(target.files))
  target.value = ''
}

async function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  if (!e.dataTransfer?.files) return
  await processFiles(Array.from(e.dataTransfer.files))
}

async function processFiles(files: File[]) {
  isUploading.value = true
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    const res = await uploadScreenshot(file)
    if (res.url) {
      form.screenshot_urls.push(res.url)
    }
  }
  isUploading.value = false
}

function removeScreenshot(index: number) {
  form.screenshot_urls.splice(index, 1)
}

/* ============================
   Submit & Close
   ============================ */
function handleSubmit() {
  if (!form.pair || !form.entry_price || !form.lot_size) {
    alert('Mohon isi field wajib: Pair, Entry Price, dan Lot Size.')
    return
  }

  emit('save', {
    ...form,
    pnl: computedPnl.value,
    pips: computedPips.value,
    rr_ratio: computedRr.value,
    status: computedStatus.value,
  })
}

function onClose() {
  emit('close')
}

// Prefill form if editing
onMounted(() => {
  if (props.trade) {
    const t = props.trade
    form.date = t.date ? new Date(t.date).toISOString().slice(0, 16) : ''
    form.pair = t.pair
    form.position = t.position
    form.account_type = t.account_type
    form.entry_price = t.entry_price
    form.exit_price = t.exit_price
    form.stop_loss = t.stop_loss
    form.take_profit = t.take_profit
    form.lot_size = t.lot_size
    form.setup = t.setup || ''
    form.entry_reason = t.entry_reason || ''
    form.exit_reason = t.exit_reason || ''
    form.what_went_well = t.what_went_well || ''
    form.improvements = t.improvements || ''
    form.emotions = [...(t.emotions || [])]
    form.pre_mood = t.pre_mood || ''
    form.post_mood = t.post_mood || ''
    form.mistakes = [...(t.mistakes || [])]
    form.screenshot_urls = [...(t.screenshot_urls || [])]
    form.notes = t.notes || ''
    form.pnl = t.pnl
    if (t.pnl !== null && t.pnl !== undefined) {
      showManualPnl.value = true
    }
  }
})
</script>

<style scoped>
@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-pop {
  animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
</style>
