<template>
  <teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" @click="onClose"></div>

      <div class="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 animate-modal-pop">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              :class="form.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
            >
              {{ form.type === 'income' ? '💰' : '💸' }}
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-white">
                {{ isEditing ? 'Edit Transaksi' : 'Catat Transaksi Baru' }}
              </h2>
              <p class="text-xs text-slate-400">
                Kelola pemasukan atau pengeluaran kas kamu
              </p>
            </div>
          </div>
          <button @click="onClose" class="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll">
          <!-- Type Toggle: Income vs Expense -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="form.type = 'income'"
              class="py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all"
              :class="form.type === 'income'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'"
            >
              <span>+</span>
              <span>Pemasukan (Income)</span>
            </button>
            <button
              type="button"
              @click="form.type = 'expense'"
              class="py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all"
              :class="form.type === 'expense'
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/10'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'"
            >
              <span>-</span>
              <span>Pengeluaran (Expense)</span>
            </button>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              Nominal Transaksi (Rp) <span class="text-rose-400">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-bold">Rp</span>
              <input
                v-model.number="form.amount"
                type="number"
                step="any"
                min="0"
                required
                placeholder="0"
                class="input-field pl-10 text-base font-mono font-bold h-11"
              />
            </div>
            <p v-if="form.amount" class="text-[11px] text-accent mt-1 font-mono">
              Rp {{ (form.amount || 0).toLocaleString('id-ID') }}
            </p>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              Kategori <span class="text-rose-400">*</span>
            </label>
            <select v-model="form.category" class="input-field text-xs h-10" required>
              <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.name">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Date & Wallet -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Tanggal</label>
              <input v-model="form.date" type="date" required class="input-field text-xs h-10" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Akun / Dompet</label>
              <input
                v-model="form.wallet"
                type="text"
                placeholder="e.g. Bank BCA, Cash, GoPay"
                class="input-field text-xs h-10"
                list="wallet-presets"
              />
              <datalist id="wallet-presets">
                <option value="Bank BCA" />
                <option value="Bank Mandiri" />
                <option value="Bank Jago" />
                <option value="Cash / Tunai" />
                <option value="GoPay / OVO / DANA" />
                <option value="Crypto USDT" />
                <option value="Kartu Kredit" />
              </datalist>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Deskripsi / Catatan</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Catatan opsional (e.g. Makan siang, langganan tradingview...)"
              class="input-field text-xs py-2"
            ></textarea>
          </div>

          <!-- Receipt Attachment -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Lampirkan Bukti / Struk (Opsional)</label>
            <div
              class="border border-dashed border-slate-700 rounded-xl p-3 text-center cursor-pointer hover:border-slate-500 transition-all bg-dark/40"
              @click="triggerReceiptInput"
            >
              <input
                ref="receiptInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleReceiptFile"
              />
              <span v-if="!form.receipt_url" class="text-xs text-slate-400">
                📎 Klik untuk upload foto struk / bukti transfer
              </span>
              <div v-else class="relative inline-block aspect-video h-20 rounded-lg overflow-hidden border border-slate-700">
                <img :src="form.receipt_url" alt="Receipt" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click.stop="form.receipt_url = null"
                  class="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              @click="onClose"
              class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold"
            >
              {{ isEditing ? 'Simpan Perubahan' : 'Catat Transaksi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Transaction, TransactionFormData, TransactionType } from '@/types'

const props = defineProps<{
  transaction?: Transaction | null
  categories: { id: string; name: string; type: string; icon: string }[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: TransactionFormData): void
}>()

const isEditing = computed(() => !!props.transaction)
const receiptInputRef = ref<HTMLInputElement | null>(null)

const form = reactive<TransactionFormData>({
  type: 'expense' as TransactionType,
  amount: null,
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  wallet: 'Bank BCA',
  receipt_url: null,
})

const filteredCategories = computed(() => {
  return props.categories.filter(c => c.type === form.type)
})

function triggerReceiptInput() {
  receiptInputRef.value?.click()
}

function handleReceiptFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = ev => {
    form.receipt_url = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

function handleSubmit() {
  if (!form.amount || !form.category) {
    alert('Mohon isi nominal dan kategori transaksi.')
    return
  }

  emit('save', { ...form })
}

function onClose() {
  emit('close')
}

onMounted(() => {
  if (props.transaction) {
    const t = props.transaction
    form.type = t.type
    form.amount = t.amount
    form.category = t.category
    form.description = t.description || ''
    form.date = t.date
    form.wallet = t.wallet || 'Bank BCA'
    form.receipt_url = t.receipt_url
  } else {
    form.category = filteredCategories.value[0]?.name || 'Makanan & Minuman'
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
</style>
