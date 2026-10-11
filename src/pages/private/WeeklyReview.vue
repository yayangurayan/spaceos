<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-sm">
          <Icon name="clipboard" :size="24" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Weekly Review & Evaluasi Diri
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Refleksi mingguan performa trading, kedisiplinan habit, dan target pekan depan.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="generateAIWeeklySummary"
          class="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-2"
        >
          <Icon name="bot" :size="16" class="text-sky-500" />
          <span>AI Weekly Summary</span>
        </button>

        <button
          type="button"
          @click="saveReview"
          class="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-2"
        >
          <Icon name="save" :size="15" />
          <span>Simpan Review Pekan Ini</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Cards for the Week -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="surface-card rounded-2xl p-4 flex items-center gap-3.5">
        <span class="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
          <Icon name="target" :size="20" />
        </span>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Win Rate Trading</span>
          <span class="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">{{ stats.winRate }}%</span>
        </div>
      </div>

      <div class="surface-card rounded-2xl p-4 flex items-center gap-3.5">
        <span class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Icon name="dollar-sign" :size="20" />
        </span>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Net P&L Pekan Ini</span>
          <span class="text-lg font-bold font-mono tabular-nums" :class="stats.totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
            {{ stats.totalPnl >= 0 ? '+' : '' }}${{ stats.totalPnl.toFixed(2) }}
          </span>
        </div>
      </div>

      <div class="surface-card rounded-2xl p-4 flex items-center gap-3.5">
        <span class="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Icon name="activity" :size="20" />
        </span>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Eksekusi</span>
          <span class="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">{{ stats.totalTrades }} Trades</span>
        </div>
      </div>

      <div class="surface-card rounded-2xl p-4 flex items-center gap-3.5">
        <span class="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Icon name="flame" :size="20" />
        </span>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Streak Konsistensi</span>
          <span class="text-lg font-bold font-mono tabular-nums text-purple-600 dark:text-purple-300">5 Hari</span>
        </div>
      </div>
    </div>

    <!-- Review Form Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Section 1: Wins & Achievements -->
      <div class="surface-card rounded-2xl p-6 space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Icon name="trophy" :size="16" />
          <span>Pencapaian Terbaik Pekan Ini (Top Wins)</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Apa saja setup yang tereksekusi dengan disiplin dan kebiasaan positif yang konsisten Anda lakukan?
        </p>

        <textarea
          v-model="reviewData.wins"
          rows="5"
          placeholder="• Mengikuti trading plan dengan R:R minimal 1:2 di pair XAUUSD&#10;• Menyelesaikan baca 45 halaman buku trading psychology&#10;• Tidak tergoda FOMO saat news release"
          class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
        ></textarea>
      </div>

      <!-- Section 2: Mistakes & Lessons Learned -->
      <div class="surface-card rounded-2xl p-6 space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <Icon name="lightbulb" :size="16" />
          <span>Evaluasi Kesalahan & Pelajaran (Lessons Learned)</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Kesalahan apa yang terjadi pekan ini dan apa langkah perbaikan agar tidak terulang?
        </p>

        <textarea
          v-model="reviewData.lessons"
          rows="5"
          placeholder="• Sempat menggeser Stop Loss di hari Selasa karena takut loss&#10;• Mengurangi screen time trading berlebihan setelah sesi New York tutup"
          class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
        ></textarea>
      </div>

      <!-- Section 3: Next Week Action Plan -->
      <div class="surface-card rounded-2xl p-6 space-y-4 lg:col-span-2">
        <h2 class="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-2">
          <Icon name="target" :size="16" />
          <span>Rencana Aksi & Fokus Target Pekan Depan</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Tentukan 3 target spesifik yang ingin Anda capai pekan depan.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            v-model="reviewData.goal1"
            type="text"
            placeholder="Target 1: Maksimal 2 trade per hari"
            class="input-field w-full text-xs"
          />
          <input
            v-model="reviewData.goal2"
            type="text"
            placeholder="Target 2: Olahraga 4x dan tidur tepat waktu"
            class="input-field w-full text-xs"
          />
          <input
            v-model="reviewData.goal3"
            type="text"
            placeholder="Target 3: Review trading journal setiap malam"
            class="input-field w-full text-xs"
          />
        </div>
      </div>
    </div>

    <!-- AI Summary Modal -->
    <AIInsightModal
      v-if="showAIModal"
      title="AI Weekly Executive Summary & Performance Reflection"
      icon="bot"
      :content="aiSummaryContent"
      :is-loading="isAILoading"
      loading-title="AI Sedang Menganalisis Seluruh Performa & Jurnal Pekan Ini..."
      @close="showAIModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import AIInsightModal from '@/components/ai/AIInsightModal.vue'
import Icon from '@/components/ui/Icon.vue'
import { useTrading } from '@/composables/useTrading'
import { useToastStore } from '@/stores/toast'

const { stats, fetchTrades } = useTrading()
const toast = useToastStore()

const showAIModal = ref(false)
const isAILoading = ref(false)
const aiSummaryContent = ref('')

const reviewData = reactive({
  wins: '• Disiplin menggunakan Stop Loss pada semua posisi.\n• Eksekusi setup London Breakout dengan rasio R:R 1:2.5.\n• Mempertahankan streak membaca buku 7 hari beruntun.',
  lessons: '• Mengurangi overtrading saat sesi volatilitas rendah.\n• Jangan entry posisi saat emosi sedang lelah.',
  goal1: 'Maksimal 2 trade berkualitas tinggi per hari',
  goal2: 'Rutinitas membaca buku 30 menit setiap pagi',
  goal3: 'Mencatat evaluasi trade selambat-lambatnya 1 jam pasca exit',
})

function saveReview() {
  localStorage.setItem('spaceos_weekly_review', JSON.stringify(reviewData))
  toast.success('Review Tersimpan ✨', 'Evaluasi mingguan berhasil dicatat ke arsip performa Anda.')
}

async function generateAIWeeklySummary() {
  showAIModal.value = true
  isAILoading.value = true
  aiSummaryContent.value = ''

  setTimeout(() => {
    aiSummaryContent.value = `## Laporan Analisis Kinerja Mingguan (Executive Summary)

### 1. Ikhtisar Kunci Performa
* **Tingkat Kemenangan (Win Rate):** **${stats.value.winRate}%** (${stats.value.totalTrades} trade tereksekusi).
* **Perolehan PnL Bersih:** **$${stats.value.totalPnl.toFixed(2)}**.
* **Tingkat Kepatuhan Trading Plan:** **92%** (Sangat Baik).

---

### 2. Pola & Observasi Psikologi
* Anda menunjukkan kedisiplinan tinggi dalam membatasi risiko kerugian pada setiap posisi.
* Trade dengan hasil terbaik tercapai pada sesi London di pair utama.
* Catatan evaluasi menunjukkan transisi positif dari *impulsive trading* menuju *systematic execution*.

---

### 3. Fokus & Arahan Strategis Pekan Depan
1. **Pertahankan Selektivitas Entry:** Tunggu konfirmasi pola chart yang benar-benar matang sebelum menekan tombol order.
2. **Kesehatan Mental & Istirahat:** Jaga rutinitas tidur dan rehat di antara sesi trading agar konsentrasi tetap tajam.
3. **Compound Konsistensi:** Terus terapkan manajemen lot dinamis sesuai ukuran akun.`
    isAILoading.value = false
  }, 1200)
}

onMounted(() => {
  fetchTrades()
  const saved = localStorage.getItem('spaceos_weekly_review')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(reviewData, parsed)
    } catch {}
  }
})
</script>
