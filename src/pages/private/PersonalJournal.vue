<template>
  <div class="space-y-6 animate-fade-in w-full max-w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📔</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Jurnal Pribadi (Personal Journal)
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Ruang pribadi untuk menuangkan isi pikiran, mengevaluasi emosi, dan mencatat perjalanan hidup.
        </p>
      </div>

      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="openNewEntry"
          class="btn-primary flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <span class="text-base leading-none">+</span>
          <span>Tulis Jurnal Baru</span>
        </button>
      </div>
    </div>

    <!-- Topic / Prompt Starters -->
    <div class="glass rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
          <span>💡</span>
          <span>Ide Refleksi & Prompt Menulis</span>
        </span>
        <button
          type="button"
          @click="shufflePrompts"
          class="text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          Acak Ide 🔀
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          v-for="(prompt, idx) in activePrompts"
          :key="idx"
          type="button"
          @click="startWithPrompt(prompt)"
          class="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 text-xs text-slate-200 transition-all hover:translate-x-1"
        >
          {{ prompt }}
        </button>
      </div>
    </div>

    <!-- Mood Filter & Search Toolbar -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Mood Pills -->
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          @click="selectedMood = 'all'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          :class="selectedMood === 'all'
            ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
            : 'bg-slate-800/80 text-slate-400 hover:text-white'"
        >
          Semua Mood
        </button>
        <button
          v-for="m in MOOD_OPTIONS"
          :key="m.name"
          type="button"
          @click="selectedMood = m.name"
          class="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
          :class="selectedMood === m.name
            ? 'bg-slate-700 text-white font-bold ring-1 ring-emerald-500'
            : 'bg-slate-800/60 text-slate-400 hover:text-white'"
        >
          <span>{{ m.emoji }}</span>
          <span class="hidden sm:inline">{{ m.label }}</span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative w-full sm:w-64">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari jurnal atau tag..."
          class="input-field w-full pl-8 py-1.5 text-xs"
        />
      </div>
    </div>

    <!-- Entries Grid -->
    <div v-if="filteredEntries.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
      <div class="text-4xl">📖</div>
      <h3 class="text-base font-bold text-white">Belum Ada Catatan Jurnal</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        Jurnal pribadi adalah tempat aman Anda untuk menulis ide, curahan hati, atau rencana masa depan.
      </p>
      <button
        type="button"
        @click="openNewEntry"
        class="btn-primary mt-2 px-5 py-2 text-xs font-bold rounded-xl"
      >
        Tulis Jurnal Pertama
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <article
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="glass rounded-2xl p-5 border border-slate-700/60 hover:border-emerald-500/40 transition-all hover:-translate-y-0.5 flex flex-col justify-between"
      >
        <div>
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">{{ getMoodEmoji(entry.mood) }}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {{ entry.mood || 'Refleksi' }}
                </span>
                <span class="text-[10px] text-slate-500">{{ formatDate(entry.createdAt) }}</span>
              </div>
              <h2 class="text-base font-bold text-white leading-snug truncate">
                {{ entry.title }}
              </h2>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                @click="editEntry(entry)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Edit"
              >
                ✏️
              </button>
              <button
                type="button"
                @click="deleteEntry(entry.id)"
                class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Hapus"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- Content snippet -->
          <p class="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed mt-2 line-clamp-4">
            {{ entry.content }}
          </p>
        </div>

        <!-- Tags & Footer -->
        <div v-if="entry.tags && entry.tags.length > 0" class="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-800/80">
          <span
            v-for="tag in entry.tags"
            :key="tag"
            class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          >
            #{{ tag }}
          </span>
        </div>
      </article>
    </div>

    <!-- Entry Form Modal -->
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          @click.self="showModal = false"
        >
          <div class="glass rounded-2xl p-6 w-full max-w-xl border border-slate-700/80 shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-in">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <span>✍️</span>
                <span>{{ isEditing ? 'Edit Jurnal' : 'Tulis Jurnal Baru' }}</span>
              </h3>
              <button
                type="button"
                @click="showModal = false"
                class="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form @submit.prevent="saveEntry" class="space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Judul Catatan</label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  placeholder="Contoh: Momen tenang sore hari, pembelajaran hari ini..."
                  class="input-field w-full text-sm"
                />
              </div>

              <!-- Mood Selector -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Suasana Hati (Mood)</label>
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <button
                    v-for="m in MOOD_OPTIONS"
                    :key="m.name"
                    type="button"
                    @click="form.mood = m.name"
                    class="p-2 rounded-xl border text-center transition-all"
                    :class="form.mood === m.name
                      ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'"
                  >
                    <span class="text-xl block mb-0.5">{{ m.emoji }}</span>
                    <span class="text-[10px] block truncate">{{ m.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Isi Refleksi / Cerita</label>
                <textarea
                  v-model="form.content"
                  required
                  rows="7"
                  placeholder="Tuangkan apa yang sedang kamu rasakan, pengalaman berharga, atau gagasan yang muncul..."
                  class="input-field w-full text-xs sm:text-sm resize-y leading-relaxed"
                ></textarea>
              </div>

              <!-- Tags -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Tag (Pisahkan dengan koma)</label>
                <input
                  v-model="tagsInput"
                  type="text"
                  placeholder="Syukur, Evaluasi, Target, Hobi"
                  class="input-field w-full text-xs"
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  @click="showModal = false"
                  class="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white border border-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  class="btn-primary px-5 py-2 rounded-xl text-xs font-bold"
                >
                  {{ isEditing ? 'Perbarui Jurnal' : 'Simpan Jurnal' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast'

interface JournalItem {
  id: string
  title: string
  content: string
  mood: string
  tags: string[]
  createdAt: string
}

const toast = useToastStore()
const STORAGE_KEY = 'spaceos_personal_journal'

const MOOD_OPTIONS = [
  { name: 'Happy', emoji: '😊', label: 'Senang' },
  { name: 'Calmed', emoji: '🌿', label: 'Tenang' },
  { name: 'Focused', emoji: '🎯', label: 'Fokus' },
  { name: 'Energetic', emoji: '⚡', label: 'Semangat' },
  { name: 'Thoughtful', emoji: '🤔', label: 'Merenung' },
  { name: 'Tired', emoji: '😴', label: 'Lelah' },
]

const ALL_PROMPTS = [
  'Hal apa yang paling kamu syukuri dari kejadian hari ini?',
  'Apa satu keputusan terbaik yang kamu buat minggu ini?',
  'Jika hari ini bisa diulang, apa yang ingin kamu lakukan berbeda?',
  'Apa kekhawatiran terbesar saat ini, dan bagaimana cara menyederhanakannya?',
  'Target apa yang ingin kamu capai dalam 30 hari ke depan?',
  'Pujian apa yang ingin kamu berikan kepada dirimu sendiri hari ini?',
]

const entries = ref<JournalItem[]>([])
const selectedMood = ref('all')
const searchQuery = ref('')
const activePrompts = ref<string[]>([])

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const tagsInput = ref('')
const form = reactive({
  title: '',
  content: '',
  mood: 'Calmed',
})

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      entries.value = JSON.parse(raw)
    } else {
      entries.value = []
    }
  } catch {
    entries.value = []
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
  } catch (err) {
    console.error(err)
  }
}

function shufflePrompts() {
  const shuffled = [...ALL_PROMPTS].sort(() => 0.5 - Math.random())
  activePrompts.value = shuffled.slice(0, 2)
}

function startWithPrompt(prompt: string) {
  form.title = `Refleksi: ${prompt}`
  form.content = `Tanya: ${prompt}\n\nJawab: `
  form.mood = 'Thoughtful'
  tagsInput.value = 'Refleksi'
  isEditing.value = false
  editingId.value = null
  showModal.value = true
}

function openNewEntry() {
  form.title = ''
  form.content = ''
  form.mood = 'Calmed'
  tagsInput.value = ''
  isEditing.value = false
  editingId.value = null
  showModal.value = true
}

function editEntry(entry: JournalItem) {
  isEditing.value = true
  editingId.value = entry.id
  form.title = entry.title
  form.content = entry.content
  form.mood = entry.mood || 'Calmed'
  tagsInput.value = (entry.tags || []).join(', ')
  showModal.value = true
}

function saveEntry() {
  if (!form.title.trim() || !form.content.trim()) return

  const tags = tagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  if (isEditing.value && editingId.value) {
    const idx = entries.value.findIndex(e => e.id === editingId.value)
    if (idx !== -1) {
      entries.value[idx] = {
        ...entries.value[idx],
        title: form.title.trim(),
        content: form.content.trim(),
        mood: form.mood,
        tags,
      }
      toast.success('Jurnal Diperbarui', 'Perubahan jurnal berhasil disimpan.')
    }
  } else {
    entries.value.unshift({
      id: `diary-${Date.now()}`,
      title: form.title.trim(),
      content: form.content.trim(),
      mood: form.mood,
      tags,
      createdAt: new Date().toISOString(),
    })
    toast.success('Jurnal Tersimpan', 'Catatan baru berhasil ditambahkan.')
  }

  saveToStorage()
  showModal.value = false
}

function deleteEntry(id: string) {
  if (confirm('Yakin ingin menghapus catatan jurnal ini?')) {
    entries.value = entries.value.filter(e => e.id !== id)
    saveToStorage()
    toast.info('Jurnal Dihapus', 'Catatan telah dihapus.')
  }
}

const filteredEntries = computed(() => {
  return entries.value.filter(entry => {
    if (selectedMood.value !== 'all' && entry.mood !== selectedMood.value) {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchTitle = entry.title.toLowerCase().includes(q)
      const matchContent = entry.content.toLowerCase().includes(q)
      const matchTag = entry.tags?.some(t => t.toLowerCase().includes(q))
      if (!matchTitle && !matchContent && !matchTag) return false
    }
    return true
  })
})

function getMoodEmoji(mood: string): string {
  const found = MOOD_OPTIONS.find(m => m.name === mood)
  return found?.emoji || '📔'
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

onMounted(() => {
  loadEntries()
  shufflePrompts()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
