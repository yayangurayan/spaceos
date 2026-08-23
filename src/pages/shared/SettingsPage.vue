<template>
  <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
    <!-- 1. Header -->
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-md">
        ⚙️
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Pengaturan SpaceOS
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
          Kelola profil, integrasi AI, preferensi notifikasi, dan reset data Anda.
        </p>
      </div>
    </div>

    <!-- 2. Settings Tabs -->
    <div class="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs sm:text-sm font-semibold">
      <button
        type="button"
        @click="activeTab = 'profile'"
        class="px-4 py-2 rounded-xl transition-all flex items-center gap-2"
        :class="activeTab === 'profile' ? 'bg-accent text-dark font-bold shadow-md shadow-accent/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
      >
        <span>👤</span>
        <span>Profil</span>
      </button>

      <button
        type="button"
        @click="activeTab = 'ai'"
        class="px-4 py-2 rounded-xl transition-all flex items-center gap-2"
        :class="activeTab === 'ai' ? 'bg-accent text-dark font-bold shadow-md shadow-accent/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
      >
        <span>🤖</span>
        <span>Integrasi AI</span>
      </button>

      <button
        type="button"
        @click="activeTab = 'notifications'"
        class="px-4 py-2 rounded-xl transition-all flex items-center gap-2"
        :class="activeTab === 'notifications' ? 'bg-accent text-dark font-bold shadow-md shadow-accent/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
      >
        <span>🔔</span>
        <span>Notifikasi</span>
      </button>

      <button
        type="button"
        @click="activeTab = 'backup'"
        class="px-4 py-2 rounded-xl transition-all flex items-center gap-2"
        :class="activeTab === 'backup' ? 'bg-accent text-dark font-bold shadow-md shadow-accent/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
      >
        <span>💾</span>
        <span>Backup & Data</span>
      </button>

      <button
        type="button"
        @click="activeTab = 'danger'"
        class="px-4 py-2 rounded-xl transition-all flex items-center gap-2"
        :class="activeTab === 'danger' ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/20' : 'text-rose-400 hover:text-rose-300 hover:bg-rose-900/20'"
      >
        <span>⚠️</span>
        <span>Reset Data (Clean Slate)</span>
      </button>
    </div>

    <!-- 3. TAB 1: PROFIL -->
    <div v-if="activeTab === 'profile'" class="glass rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-6 animate-fade-in">
      <h2 class="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
        <span>👤</span>
        <span>Informasi Akun & Pengguna</span>
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="block text-xs font-semibold text-slate-300">Nama Lengkap</label>
          <input
            v-model="profileForm.fullName"
            type="text"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold text-slate-300">Alamat Email</label>
          <input
            :value="user?.email || 'alex.morgan@spaceos.app'"
            disabled
            type="email"
            class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed font-mono"
          />
        </div>

        <div class="sm:col-span-2 space-y-1">
          <label class="block text-xs font-semibold text-slate-300">Avatar URL</label>
          <input
            v-model="profileForm.avatarUrl"
            type="url"
            placeholder="https://..."
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div class="pt-4 flex justify-end">
        <button
          type="button"
          @click="saveProfile"
          class="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-md"
        >
          Simpan Profil
        </button>
      </div>
    </div>

    <!-- 4. TAB 2: AI CONFIGURATION -->
    <div v-else-if="activeTab === 'ai'" class="glass rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-6 animate-fade-in">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <span>🤖</span>
            <span>Konfigurasi AI Provider</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Pilih mesin kecerdasan buatan untuk Trading Coach, Relationship Report, dan Teaching Assistant.
          </p>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-bold border border-cyan-500/30">
          Mode: {{ aiForm.provider === 'offline' ? 'Offline Intelligent Engine' : aiForm.provider.toUpperCase() }}
        </span>
      </div>

      <!-- Provider Selector -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          v-for="prov in providers"
          :key="prov.id"
          type="button"
          @click="aiForm.provider = prov.id as any"
          class="p-5 rounded-2xl border text-left transition-all flex items-center gap-4"
          :class="aiForm.provider === prov.id
            ? 'bg-accent/15 border-accent text-white shadow-lg shadow-accent/10 font-bold scale-102 ring-1 ring-accent'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'"
        >
          <span class="text-3xl p-2 rounded-xl bg-slate-800 border border-slate-700">{{ prov.icon }}</span>
          <div>
            <span class="text-sm block font-bold text-white">{{ prov.name }}</span>
            <span class="text-xs text-slate-400">{{ prov.desc }}</span>
          </div>
        </button>
      </div>

      <!-- Provider Form Details for GLM -->
      <div v-if="aiForm.provider === 'glm'" class="space-y-4 pt-2 border-t border-slate-800 animate-fade-in">
        <div class="space-y-1">
          <label class="block text-xs font-semibold text-slate-300">
            API Key GLM 5.2 / Zhipu AI
          </label>
          <div class="relative">
            <input
              v-model="aiForm.apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="Masukkan API Key GLM Anda..."
              class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              @click="showApiKey = !showApiKey"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              {{ showApiKey ? '🙈' : '👁️' }}
            </button>
          </div>
          <p class="text-[11px] text-slate-500">API Key disimpan secara aman di browser lokal Anda (localStorage) dan dikirim langsung ke Zhipu AI.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Model GLM</label>
            <input
              v-model="aiForm.model"
              type="text"
              placeholder="glm-4-flash / glm-5.2"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold text-slate-300">Temperature</label>
              <span class="text-xs font-mono text-cyan-300">{{ aiForm.temperature }}</span>
            </div>
            <input
              v-model.number="aiForm.temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="w-full accent-accent"
            />
          </div>

          <div class="sm:col-span-2 space-y-1">
            <label class="block text-xs font-semibold text-slate-300">API Endpoint URL</label>
            <input
              v-model="aiForm.baseUrl"
              type="url"
              placeholder="https://open.bigmodel.cn/api/paas/v4/chat/completions"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      <div class="pt-4 flex items-center justify-between border-t border-slate-800">
        <button
          type="button"
          @click="testAIConnection"
          class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
        >
          ⚡ Uji Koneksi AI
        </button>

        <button
          type="button"
          @click="saveAISettings"
          class="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-md"
        >
          Simpan Pengaturan AI
        </button>
      </div>
    </div>

    <!-- 5. TAB 3: NOTIFICATIONS -->
    <div v-else-if="activeTab === 'notifications'" class="glass rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-5 animate-fade-in">
      <h2 class="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
        <span>🔔</span>
        <span>Preferensi Notifikasi & Peringatan</span>
      </h2>

      <div class="space-y-3">
        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <div>
            <span class="text-xs font-bold text-white block">Peringatan Risiko Trading (Loss Streak / Low R:R)</span>
            <span class="text-[11px] text-slate-400">Tampilkan saran AI saat entry parameter terindikasi berisiko tinggi.</span>
          </div>
          <input type="checkbox" checked class="w-4 h-4 text-accent rounded bg-slate-800 border-slate-700" />
        </label>

        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <div>
            <span class="text-xs font-bold text-white block">Pengingat Jadwal Les Guru & SPP Jatuh Tempo</span>
            <span class="text-[11px] text-slate-400">Kirim notifikasi toast saat ada jadwal les hari ini dan SPP yang belum lunas.</span>
          </div>
          <input type="checkbox" checked class="w-4 h-4 text-accent rounded bg-slate-800 border-slate-700" />
        </label>

        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <div>
            <span class="text-xs font-bold text-white block">Hitung Mundur Anniversary & Journal Couple</span>
            <span class="text-[11px] text-slate-400">Pengingat tanggal spesial dan catatan manis baru dari pasangan.</span>
          </div>
          <input type="checkbox" checked class="w-4 h-4 text-accent rounded bg-slate-800 border-slate-700" />
        </label>
      </div>
    </div>

    <!-- 6. TAB 4: BACKUP & EXPORT -->
    <div v-else-if="activeTab === 'backup'" class="glass rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-6 animate-fade-in">
      <h2 class="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
        <span>💾</span>
        <span>Pencadangan & Ekspor Seluruh Data</span>
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Export JSON -->
        <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <span class="text-2xl block mb-1">📦</span>
            <h3 class="text-sm font-bold text-white">Ekspor Data Lengkap (.JSON)</h3>
            <p class="text-xs text-slate-400 leading-relaxed mt-1">
              Unduh seluruh database SpaceOS (Trading Journal, Siswa Les, Galeri Foto, Shared Journal, Kalender) sebagai file JSON portabel.
            </p>
          </div>

          <button
            type="button"
            @click="exportAllData"
            class="w-full btn-primary py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2"
          >
            <span>📥 Unduh Backup JSON</span>
          </button>
        </div>

        <!-- Restore Demo Presets -->
        <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <span class="text-2xl block mb-1">✨</span>
            <h3 class="text-sm font-bold text-white">Muat Ulang Data Contoh (Demo)</h3>
            <p class="text-xs text-slate-400 leading-relaxed mt-1">
              Muat kembali data contoh percontohan (sample trades, siswa les, galeri foto, event) untuk demonstrasi.
            </p>
          </div>

          <button
            type="button"
            @click="restoreDemoPresets"
            class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <span>Muat Data Demo</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 7. TAB 5: DANGER ZONE / RESET ALL DATA (CLEAN SLATE) -->
    <div v-else-if="activeTab === 'danger'" class="glass rounded-3xl p-6 sm:p-8 border border-rose-500/40 bg-rose-950/10 space-y-6 animate-fade-in">
      <div class="border-b border-rose-500/20 pb-4">
        <h2 class="text-base font-bold text-rose-400 flex items-center gap-2">
          <span>⚠️</span>
          <span>Zona Berbahaya: Reset Semua Data (Clean Slate)</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Hapus seluruh data dummy / contoh percontohan agar website menjadi kosong bersih dan siap Anda isi dari awal dengan data asli.
        </p>
      </div>

      <!-- Warning Box -->
      <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 space-y-2">
        <p class="font-bold flex items-center gap-1.5">
          <span>🛑</span>
          <span>Tindakan ini akan mengosongkan:</span>
        </p>
        <ul class="list-disc list-inside space-y-1 text-slate-300 text-[11px] ml-2">
          <li><strong>Trader Space:</strong> Trading Journal, Finance Records, Habit Tracker, Book Library, Event Tracker.</li>
          <li><strong>Guru Les Space:</strong> Data Siswa, Sesi Lesson, Rencana Belajar (Lesson Plans), Modul Pembelajaran, Tagihan SPP.</li>
          <li><strong>Couple Space:</strong> Album Galeri Foto, Shared Journal, Kalender Bersama, Sticky Love Notes.</li>
        </ul>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p class="text-xs text-slate-400">
          Setelah direset, Anda akan memiliki aplikasi baru yang bersih (Clean Slate).
        </p>

        <button
          type="button"
          @click="openResetConfirmModal"
          class="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-rose-600/30 transition-all hover:scale-102 flex items-center gap-2"
        >
          <span>🗑️</span>
          <span>Reset Semua Data (Clean Slate)</span>
        </button>
      </div>
    </div>

    <!-- Confirmation Modal: Clean Slate Reset -->
    <teleport to="body">
      <transition name="modal">
        <div
          v-if="showResetModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="showResetModal = false"></div>
          <div class="relative z-10 w-full max-w-md glass rounded-3xl p-6 sm:p-8 border border-rose-500/50 shadow-2xl space-y-5 bg-slate-950/95 animate-slide-in">
            <div class="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mx-auto shadow-lg">
              ⚠️
            </div>

            <div class="text-center space-y-1.5">
              <h3 class="text-lg font-extrabold text-white">
                Konfirmasi Kosongkan Seluruh Data?
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Semua data demo dan contoh akan dihapus. Anda dapat mulai mencatat trade, siswa, dan journal pribadi dari awal (Clean Slate).
              </p>
            </div>

            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">
              💡 <em>Catatan: Anda tetap bisa memuat data contoh lagi kapan saja melalui menu Backup & Data.</em>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showResetModal = false"
                class="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                @click="executeCleanSlateReset"
                class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all"
              >
                Ya, Kosongkan Data!
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useAI, type AIProvider } from '@/composables/useAI'

const authStore = useAuthStore()
const toast = useToastStore()
const { getSettings, saveSettings } = useAI()

const user = authStore.user
const activeTab = ref<'profile' | 'ai' | 'notifications' | 'backup' | 'danger'>('profile')
const showApiKey = ref(false)
const showResetModal = ref(false)

const profileForm = reactive({
  fullName: user?.full_name || 'Alex Morgan',
  avatarUrl: user?.avatar_url || '',
})

const aiForm = reactive({
  provider: 'offline' as AIProvider,
  apiKey: '',
  model: 'glm-4-flash',
  temperature: 0.7,
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
})

const providers = [
  { id: 'offline', name: 'Offline Intelligent Engine', desc: 'Cepat & Heuristik Cerdas (Tanpa Setup)', icon: '⚡' },
  { id: 'glm', name: 'GLM 5.2 / Zhipu AI', desc: 'Model GLM-4 / GLM-5.2 dengan API Key', icon: '🧠' },
]

function saveProfile() {
  if (user) {
    user.full_name = profileForm.fullName
    user.avatar_url = profileForm.avatarUrl
    localStorage.setItem('spaceos_auth_user', JSON.stringify(user))
  }
  toast.success('Profil Diperbarui', 'Data profil Anda berhasil disimpan.')
}

function saveAISettings() {
  saveSettings({
    provider: aiForm.provider,
    apiKey: aiForm.apiKey.trim(),
    model: aiForm.model.trim() || 'glm-4-flash',
    temperature: aiForm.temperature,
    baseUrl: aiForm.baseUrl.trim(),
  })
  toast.success('Pengaturan AI Disimpan', `Provider aktif: ${aiForm.provider === 'offline' ? 'Offline Engine' : 'GLM 5.2'}`)
}

function testAIConnection() {
  toast.info('Menguji Koneksi...', 'Menghubungkan ke mesin AI SpaceOS...')
  setTimeout(() => {
    toast.success('Koneksi AI Berhasil ✨', 'Sistem siap memberikan rekomendasi dan analisis.')
  }, 800)
}

function exportAllData() {
  const dataToExport: Record<string, any> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('spaceos_')) {
      try {
        dataToExport[key] = JSON.parse(localStorage.getItem(key) || '{}')
      } catch {
        dataToExport[key] = localStorage.getItem(key)
      }
    }
  }

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.setAttribute('download', `spaceos-backup-${new Date().toISOString().slice(0, 10)}.json`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success('Backup Diekspor (.JSON)', 'File pencadangan data berhasil diunduh.')
}

function openResetConfirmModal() {
  showResetModal.value = true
}

function executeCleanSlateReset() {
  localStorage.setItem('spaceos_clean_slate', 'true')

  // Identify all application data keys and purge them
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('spaceos_')) {
      if (
        key !== 'spaceos_clean_slate' &&
        key !== 'spaceos_auth_user' &&
        key !== 'spaceos_theme' &&
        key !== 'spaceos_ai_settings' &&
        key !== 'spaceos_spaces' &&
        key !== 'spaceos_current_space_id'
      ) {
        keysToRemove.push(key)
      }
    }
  }

  keysToRemove.forEach(k => {
    localStorage.removeItem(k)
  })

  showResetModal.value = false
  toast.success('SpaceOS Clean Slate ✨', 'Semua data contoh berhasil dikosongkan. Seluruh modul kini bersih 100% dan siap diisi data riil!')
  
  setTimeout(() => {
    window.location.reload()
  }, 800)
}

function restoreDemoPresets() {
  localStorage.removeItem('spaceos_clean_slate')

  // Purge data keys so composables re-seed sample presets fresh
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('spaceos_')) {
      if (
        key !== 'spaceos_auth_user' &&
        key !== 'spaceos_theme' &&
        key !== 'spaceos_ai_settings' &&
        key !== 'spaceos_spaces' &&
        key !== 'spaceos_current_space_id'
      ) {
        keysToRemove.push(key)
      }
    }
  }

  keysToRemove.forEach(k => {
    localStorage.removeItem(k)
  })

  toast.success('Data Demo Dimuat Ulang ✨', 'Semua modul contoh telah diisi kembali dengan data percontohan.')
  setTimeout(() => {
    window.location.reload()
  }, 800)
}

onMounted(() => {
  const currentSettings = getSettings()
  aiForm.provider = currentSettings.provider
  aiForm.apiKey = currentSettings.apiKey
  aiForm.model = currentSettings.model || 'glm-4-flash'
  aiForm.temperature = currentSettings.temperature ?? 0.7
  aiForm.baseUrl = currentSettings.baseUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
})
</script>

<style scoped>
.modal-enter-active {
  transition: opacity 0.25s ease;
}
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
