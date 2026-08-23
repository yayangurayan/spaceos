<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-lg bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ isEdit ? '✏️' : '💵' }}</span>
          <div>
            <h2 class="text-lg font-bold text-white">
              {{ isEdit ? 'Edit Data Pembayaran' : 'Catat Tagihan / Pembayaran SPP' }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ isEdit ? 'Perbarui nominal, status, atau metode pembayaran.' : 'Rekap pembayaran les bulanan siswa.' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Icon name="x" :size="18" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <!-- 1. Student Selector -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Siswa <span class="text-rose-400">*</span>
          </label>
          <select
            v-model="form.student_id"
            required
            @change="handleStudentChange"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
          >
            <option value="" disabled>-- Pilih Siswa --</option>
            <option v-for="s in students" :key="s.id" :value="s.id">
              {{ s.name }} (SPP: {{ formatCurrency(s.monthly_fee) }})
            </option>
          </select>
        </div>

        <!-- 2. Periode Tagihan (Bulan & Tahun) -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">Bulan</label>
            <select
              v-model.number="form.month"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              <option v-for="(m, idx) in monthNames" :key="idx" :value="idx + 1">
                {{ m }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">Tahun</label>
            <input
              v-model.number="form.year"
              type="number"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <!-- 3. Kategori & Jumlah Tagihan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">Kategori</label>
            <select
              v-model="form.category"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              <option value="Les Income">Les Income (SPP Bulanan)</option>
              <option value="Material Sales">Material Sales (Modul / Buku)</option>
              <option value="Bonus/Extra Classes">Bonus / Kelas Intensif</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Jumlah (IDR) <span class="text-rose-400">*</span>
            </label>
            <input
              v-model.number="form.amount"
              type="number"
              required
              min="0"
              step="50000"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <!-- 4. Status Pembayaran -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Status Pembayaran
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="form.status = 'paid'"
              class="py-2 rounded-xl text-xs font-bold border transition-all"
              :class="form.status === 'paid'
                ? 'bg-emerald-500 text-dark border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'"
            >
              ✓ Lunas (Paid)
            </button>
            <button
              type="button"
              @click="form.status = 'pending'"
              class="py-2 rounded-xl text-xs font-bold border transition-all"
              :class="form.status === 'pending'
                ? 'bg-amber-500 text-dark border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'"
            >
              ⏳ Menunggu
            </button>
            <button
              type="button"
              @click="form.status = 'overdue'"
              class="py-2 rounded-xl text-xs font-bold border transition-all"
              :class="form.status === 'overdue'
                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'"
            >
              ⚠️ Terlambat
            </button>
          </div>
        </div>

        <!-- 5. Tanggal Bayar & Metode -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">Metode Pembayaran</label>
            <select
              v-model="form.payment_method"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              <option value="Transfer">Bank Transfer</option>
              <option value="Cash">Cash (Tunai)</option>
              <option value="E-wallet">E-Wallet</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">Tanggal Bayar</label>
            <input
              v-model="form.paid_date"
              type="date"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <!-- 6. Catatan -->
        <div class="space-y-1.5 pt-1">
          <label class="block text-xs font-semibold text-slate-300">Catatan</label>
          <input
            v-model="form.notes"
            type="text"
            placeholder="e.g. Ditransfer via BCA jam 10:00"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />
        </div>
      </form>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/60 bg-surface/50">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSubmit"
          class="btn-primary px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 flex items-center gap-2"
        >
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Catat Pembayaran' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { Student, TeacherPayment, PaymentFormData, PaymentStatus } from '@/types'

const props = defineProps<{
  payment: TeacherPayment | null
  students: Student[]
  preselectedStudentId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: PaymentFormData): void
}>()

const isEdit = computed(() => Boolean(props.payment))

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const currentD = new Date()
const initialStudent = props.students.find(
  s => s.id === (props.payment?.student_id || props.preselectedStudentId)
) || props.students[0]

const form = reactive<PaymentFormData>({
  student_id: props.payment?.student_id || props.preselectedStudentId || (props.students[0]?.id || ''),
  amount: props.payment?.amount ?? (initialStudent?.monthly_fee ?? 800000),
  month: props.payment?.month ?? (currentD.getMonth() + 1),
  year: props.payment?.year ?? currentD.getFullYear(),
  status: (props.payment?.status as PaymentStatus) || 'paid',
  paid_date: props.payment?.paid_date || new Date().toISOString().split('T')[0],
  payment_method: props.payment?.payment_method || initialStudent?.payment_method || 'Transfer',
  category: props.payment?.category || 'Les Income',
  notes: props.payment?.notes || '',
})

function handleStudentChange() {
  const st = props.students.find(s => s.id === form.student_id)
  if (st && (!form.amount || form.amount === 0)) {
    form.amount = st.monthly_fee
    form.payment_method = st.payment_method
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function handleSubmit() {
  if (!form.student_id || form.amount === null) return
  emit('save', { ...form })
}
</script>
