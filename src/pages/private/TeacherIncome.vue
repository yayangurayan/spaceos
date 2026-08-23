<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">💰</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pelacak Pendapatan & SPP Les (Income Tracker)
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Pantau status pembayaran bulanan per siswa, buat tagihan, dan kirim pengingat WhatsApp.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="openAddPayment"
          class="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <Icon name="plus" :size="16" />
          <span>+ Catat Pembayaran Baru</span>
        </button>
      </div>
    </div>

    <!-- 2. Income Stats Overview -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Collected This Month -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">✅</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Terkumpul</span>
        </div>
        <p class="text-lg sm:text-xl font-bold font-mono text-emerald-400 truncate">
          {{ formatCurrency(incomeStats.collected) }}
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Lunas Bulan Ini</p>
      </div>

      <!-- Pending Payments -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">⏳</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Menunggu</span>
        </div>
        <p class="text-lg sm:text-xl font-bold font-mono text-amber-300 truncate">
          {{ formatCurrency(incomeStats.pending) }}
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Belum Dikonfirmasi</p>
      </div>

      <!-- Overdue Count -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">⚠️</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400">Terlambat</span>
        </div>
        <p class="text-2xl font-bold font-mono text-rose-400">
          <AnimatedNumber :value="incomeStats.overdueCount" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Melewati Jatuh Tempo</p>
      </div>

      <!-- Total Potential SPP -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">💵</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">Total Potensi</span>
        </div>
        <p class="text-lg sm:text-xl font-bold font-mono text-accent truncate">
          {{ formatCurrency(incomeStats.totalPotential) }}
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Target SPP Siswa Aktif</p>
      </div>
    </div>

    <!-- 3. Period Selector & Filter Toolbar -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <!-- Month & Year Selectors -->
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <select
          v-model.number="selectedMonth"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
        >
          <option v-for="(m, idx) in monthNames" :key="idx" :value="idx + 1">
            {{ m }}
          </option>
        </select>

        <select
          v-model.number="selectedYear"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-accent"
        >
          <option v-for="y in [2025, 2026, 2027]" :key="y" :value="y">{{ y }}</option>
        </select>

        <!-- Status Filter -->
        <select
          v-model="filterStatus"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Status SPP</option>
          <option value="paid">✓ Lunas</option>
          <option value="pending">⏳ Menunggu</option>
          <option value="overdue">⚠️ Terlambat</option>
        </select>
      </div>

      <!-- Search -->
      <div class="relative w-full md:w-64">
        <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Cari nama siswa..."
          class="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
        />
      </div>
    </div>

    <!-- 4. Student Payment Matrix Table -->
    <div class="glass rounded-2xl border border-slate-700/60 overflow-hidden">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span>📋</span>
          <span>Matriks Status SPP Periode {{ monthNames[selectedMonth - 1] }} {{ selectedYear }}</span>
        </h3>
        <span class="text-xs text-slate-400">
          {{ monthlyStudentPayments.length }} Siswa Aktif
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th class="py-3 px-4">Siswa</th>
              <th class="py-3 px-4">Jenjang & Mapel</th>
              <th class="py-3 px-4">Jatuh Tempo</th>
              <th class="py-3 px-4">Nominal SPP</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Metode</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr
              v-for="row in monthlyStudentPayments"
              :key="row.student.id"
              class="hover:bg-slate-800/40 transition-colors"
            >
              <!-- Student -->
              <td class="py-3.5 px-4 font-bold text-white">
                <router-link :to="`/students/${row.student.id}`" class="hover:text-accent transition-colors">
                  {{ row.student.name }}
                </router-link>
                <span class="block text-[11px] text-slate-500 font-normal">
                  Wali: {{ row.student.parent_contact?.name || '-' }}
                </span>
              </td>

              <!-- Grade & Subjects -->
              <td class="py-3.5 px-4 text-slate-300">
                <span>{{ row.student.grade || 'Privat' }}</span>
                <span class="block text-[10px] text-slate-500 truncate max-w-[150px]">
                  {{ row.student.subjects.join(', ') }}
                </span>
              </td>

              <!-- Due Date -->
              <td class="py-3.5 px-4 text-slate-300 font-mono">
                Tgl {{ row.student.payment_due_date }}
              </td>

              <!-- Fee -->
              <td class="py-3.5 px-4 font-mono font-bold text-emerald-400">
                {{ formatCurrency(row.payment?.amount || row.student.monthly_fee) }}
              </td>

              <!-- Status with Overdue Pulse -->
              <td class="py-3.5 px-4">
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                  :class="getStatusClasses(row.status)"
                >
                  <span v-if="row.status === 'overdue'" class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-0.5"></span>
                  <span>{{ row.status === 'paid' ? '✓ Lunas' : row.status === 'overdue' ? '⚠️ Terlambat' : '⏳ Menunggu' }}</span>
                </span>
              </td>

              <!-- Payment Method -->
              <td class="py-3.5 px-4 text-slate-400">
                {{ row.payment?.payment_method || row.student.payment_method }}
              </td>

              <!-- Actions: Lunas Toggle + WA Reminder -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <!-- WhatsApp Reminder Button -->
                  <button
                    type="button"
                    @click="sendWhatsAppReminder(row.student)"
                    class="p-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 transition-colors"
                    title="Kirim Pesan Tagihan WA ke Orang Tua"
                  >
                    <span>💬 WA</span>
                  </button>

                  <!-- Mark Paid / Edit Button -->
                  <button
                    v-if="row.status !== 'paid'"
                    type="button"
                    @click="markAsPaid(row)"
                    class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition-colors"
                  >
                    ✓ Tandai Lunas
                  </button>

                  <button
                    v-else
                    type="button"
                    @click="openEditPayment(row.payment!)"
                    class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Record / Edit Payment -->
    <RecordPaymentModal
      v-if="showPaymentModal"
      :payment="selectedPayment"
      :students="students"
      @close="showPaymentModal = false; selectedPayment = null"
      @save="handleSavePayment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import Icon from '@/components/ui/Icon.vue'
import RecordPaymentModal from '@/components/teacher/RecordPaymentModal.vue'
import { useTeacher } from '@/composables/useTeacher'
import type { Student, TeacherPayment, PaymentFormData } from '@/types'

const {
  students,
  payments,
  fetchTeacherData,
  createPayment,
  updatePayment,
  generateWhatsAppReminder,
} = useTeacher()

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const currentD = new Date()
const selectedMonth = ref(currentD.getMonth() + 1)
const selectedYear = ref(currentD.getFullYear())
const filterStatus = ref('all')
const searchKeyword = ref('')

// Modal
const showPaymentModal = ref(false)
const selectedPayment = ref<TeacherPayment | null>(null)

const monthlyStudentPayments = computed(() => {
  const currentDay = new Date().getDate()
  const currentMonthNum = new Date().getMonth() + 1
  const currentYearNum = new Date().getFullYear()

  return students.value
    .filter(s => s.status === 'active')
    .map(student => {
      const p = payments.value.find(
        pay => pay.student_id === student.id && pay.month === selectedMonth.value && pay.year === selectedYear.value
      )

      let status = p ? p.status : 'pending'
      // Determine if overdue automatically if not yet marked paid and current date is past due date in same or past month
      if (status === 'pending') {
        const isPastMonth = selectedYear.value < currentYearNum || (selectedYear.value === currentYearNum && selectedMonth.value < currentMonthNum)
        const isCurrentMonthPastDue = selectedYear.value === currentYearNum && selectedMonth.value === currentMonthNum && currentDay > (student.payment_due_date || 5)
        if (isPastMonth || isCurrentMonthPastDue) {
          status = 'overdue'
        }
      }

      return {
        student,
        payment: p || null,
        status,
      }
    })
    .filter(row => {
      if (filterStatus.value !== 'all' && row.status !== filterStatus.value) return false
      if (searchKeyword.value.trim()) {
        const q = searchKeyword.value.toLowerCase().trim()
        const matchName = row.student.name.toLowerCase().includes(q)
        const matchParent = row.student.parent_contact?.name?.toLowerCase().includes(q)
        if (!matchName && !matchParent) return false
      }
      return true
    })
})

const incomeStats = computed(() => {
  const currentMonthPays = payments.value.filter(
    p => p.month === selectedMonth.value && p.year === selectedYear.value
  )

  const collected = currentMonthPays
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const pending = currentMonthPays
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const overdueCount = monthlyStudentPayments.value.filter(r => r.status === 'overdue').length

  const totalPotential = students.value
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (Number(s.monthly_fee) || 0), 0)

  return {
    collected,
    pending,
    overdueCount,
    totalPotential,
  }
})

function getStatusClasses(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    case 'overdue':
      return 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse'
    default:
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
  }
}

function openAddPayment() {
  selectedPayment.value = null
  showPaymentModal.value = true
}

function openEditPayment(p: TeacherPayment) {
  selectedPayment.value = p
  showPaymentModal.value = true
}

async function markAsPaid(row: { student: Student; payment: TeacherPayment | null }) {
  if (row.payment) {
    await updatePayment(row.payment.id, {
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
    })
  } else {
    await createPayment({
      student_id: row.student.id,
      amount: row.student.monthly_fee,
      month: selectedMonth.value,
      year: selectedYear.value,
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
      payment_method: row.student.payment_method || 'Transfer',
      category: 'Les Income',
      notes: 'Lunas via sistem',
    })
  }
}

async function handleSavePayment(formData: PaymentFormData) {
  if (selectedPayment.value) {
    await updatePayment(selectedPayment.value.id, formData)
  } else {
    await createPayment(formData)
  }
  showPaymentModal.value = false
  selectedPayment.value = null
}

function sendWhatsAppReminder(student: Student) {
  const msg = generateWhatsAppReminder(student.id, selectedMonth.value, selectedYear.value)
  const phone = student.parent_contact?.phone || ''
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone
  window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, '_blank')
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
}

onMounted(() => {
  fetchTeacherData()
})
</script>
