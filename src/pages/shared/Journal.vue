<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📖</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Buku Harian Bersama (Shared Journal)
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Catat perasaan, cerita harian, dan apresiasi kecil untuk pasanganmu.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <!-- AI Relationship Report Button -->
        <button
          type="button"
          @click="runRelationshipReport"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 transition-all hover:scale-102"
        >
          <span>✨</span>
          <span>AI Relationship Report</span>
        </button>

        <button
          type="button"
          @click="openWriteModal()"
          class="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
        >
          <Icon name="plus" :size="16" />
          <span>+ Tulis Journal Baru</span>
        </button>
      </div>
    </div>

    <!-- AI Conversation Starters -->
    <div class="glass rounded-2xl p-4 border border-rose-500/20 bg-rose-500/5 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
          <span>💡</span>
          <span>Ide Topik & Pemantik Cerita Hari Ini</span>
        </span>
        <button
          type="button"
          @click="refreshStarters"
          class="text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          🔄 Acak Ulang
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          v-for="(prompt, idx) in activeStarters"
          :key="idx"
          type="button"
          @click="startWithPrompt(prompt)"
          class="text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-xs text-slate-200 transition-all hover:translate-x-1"
        >
          {{ prompt }}
        </button>
      </div>
    </div>

    <!-- 2. Memory Lane / "On This Day" Banner -->
    <div
      v-if="onThisDayItems.hasMemory"
      class="glass rounded-2xl p-5 border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 flex items-start gap-4 animate-fade-in"
    >
      <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-2xl shrink-0">
        ⏳
      </div>
      <div class="space-y-1 flex-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400">
          Nostalgia Hari Ini (On This Day)
        </span>
        <h3 class="text-sm font-bold text-white">
          {{ onThisDayItems.journals[0]?.title || 'Kenangan Manis di Tanggal Ini' }}
        </h3>
        <p class="text-xs text-slate-300 line-clamp-2">
          {{ onThisDayItems.journals[0]?.content || 'Ada foto kenangan yang kalian ambil di tanggal ini beberapa tahun lalu.' }}
        </p>
      </div>
    </div>

    <!-- 3. Mood & Filter Toolbar -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <!-- Mood Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        <button
          type="button"
          @click="selectedMood = 'all'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          :class="selectedMood === 'all'
            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-md'
            : 'bg-slate-800/80 text-slate-400 hover:text-white'"
        >
          Semua Mood
        </button>

        <button
          v-for="m in moodOptions"
          :key="m.name"
          type="button"
          @click="selectedMood = m.name"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
          :class="selectedMood === m.name
            ? 'bg-rose-500 text-white font-bold shadow-md'
            : 'bg-slate-800/80 text-slate-400 hover:text-white'"
        >
          <span>{{ m.emoji }}</span>
          <span>{{ m.label }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="relative w-full md:w-64">
        <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari cerita, tagar, kata kunci..."
          class="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>
    </div>

    <!-- 4. Journal Entries Feed -->
    <div v-if="filteredEntries.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block">📖</span>
      <h3 class="text-base font-bold text-white">Belum ada journal entry</h3>
      <p class="text-xs text-slate-500">Mulai tulis catatan cinta atau cerita seru hari ini.</p>
      <button
        type="button"
        @click="openWriteModal()"
        class="btn-primary px-5 py-2 text-xs font-bold rounded-xl mt-2"
      >
        + Tulis Journal Pertama
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="glass rounded-2xl p-5 border border-slate-700/60 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/5 cursor-pointer flex flex-col justify-between"
        @click="navigateToEntry(entry.id)"
      >
        <div class="space-y-3">
          <!-- Top Row: Mood, Author & Date -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl p-1.5 rounded-xl bg-slate-800 border border-slate-700">
                {{ getMoodEmoji(entry.mood) }}
              </span>
              <div>
                <span class="text-xs font-bold text-white block">{{ entry.author_name || 'Kamu' }}</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ formatDate(entry.published_at || entry.created_at) }}</span>
              </div>
            </div>

            <span
              v-if="!entry.is_published"
              class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30"
            >
              Draft
            </span>
          </div>

          <!-- Title & Preview Content -->
          <div>
            <h3 class="text-base font-bold text-white hover:text-rose-400 transition-colors line-clamp-1">
              {{ entry.title || 'Catatan Bersama' }}
            </h3>
            <p class="text-xs text-slate-300 line-clamp-3 mt-1.5 leading-relaxed">
              {{ entry.content }}
            </p>
          </div>

          <!-- Tags -->
          <div v-if="entry.tags && entry.tags.length > 0" class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in entry.tags"
              :key="tag"
              class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-rose-300 border border-slate-700/60"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Footer: Comments & Reactions count -->
        <div class="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1">
              <span>💬</span>
              <span>{{ entry.comments?.length || 0 }} Komentar</span>
            </span>

            <button
              type="button"
              @click.stop="reactToJournal(entry.id, '❤️')"
              class="flex items-center gap-1 hover:text-rose-400 transition-colors"
            >
              <span>❤️</span>
              <span>{{ entry.reactions?.['❤️'] || 0 }}</span>
            </button>
          </div>

          <div class="flex items-center gap-1">
            <button
              type="button"
              @click.stop="openEditModal(entry)"
              class="p-1.5 text-slate-400 hover:text-white"
              title="Edit Entry"
            >
              <Icon name="edit" :size="14" />
            </button>
            <button
              type="button"
              @click.stop="confirmDelete(entry.id)"
              class="p-1.5 text-slate-400 hover:text-rose-400"
              title="Hapus Entry"
            >
              <Icon name="trash" :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Write / Edit Journal -->
    <JournalEditor
      v-if="showEditorModal"
      :entry="selectedEntry"
      :initial-prompt="initialPrompt"
      @close="showEditorModal = false; selectedEntry = null; initialPrompt = ''"
      @save="handleSaveJournal"
    />

    <!-- Modal: AI Relationship Report -->
    <AIInsightModal
      v-if="showReportModal"
      title="AI Relationship Insights & Harmony Report"
      icon="✨"
      :content="reportContent"
      :is-loading="isGenerating"
      loading-title="AI Sedang Menganalisis Harmoni Hubungan & Iklim Emosi..."
      @close="showReportModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import JournalEditor from '@/components/journal/JournalEditor.vue'
import AIInsightModal from '@/components/ai/AIInsightModal.vue'
import { useCouple } from '@/composables/useCouple'
import { useJournalAI } from '@/composables/useJournalAI'
import type { JournalEntry, JournalEntryFormData } from '@/types'

const router = useRouter()

const {
  journalEntries,
  onThisDayItems,
  fetchCoupleData,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  reactToJournal,
} = useCouple()

const { isGenerating, generateRelationshipReport, getConversationStarters } = useJournalAI()

const selectedMood = ref('all')
const searchQuery = ref('')
const activeStarters = ref<string[]>([])
const initialPrompt = ref('')

// Modals
const showEditorModal = ref(false)
const selectedEntry = ref<JournalEntry | null>(null)
const showReportModal = ref(false)
const reportContent = ref('')

const moodOptions = [
  { name: 'Happy', emoji: '😊', label: 'Senang' },
  { name: 'Loving', emoji: '💕', label: 'Sayang' },
  { name: 'Excited', emoji: '🎉', label: 'Semangat' },
  { name: 'Thoughtful', emoji: '😔', label: 'Reflektif' },
]

const filteredEntries = computed(() => {
  return journalEntries.value.filter(entry => {
    if (selectedMood.value !== 'all' && entry.mood !== selectedMood.value) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchTitle = entry.title?.toLowerCase().includes(q)
      const matchContent = entry.content.toLowerCase().includes(q)
      const matchTag = entry.tags?.some(t => t.toLowerCase().includes(q))
      if (!matchTitle && !matchContent && !matchTag) return false
    }
    return true
  })
})

function getMoodEmoji(mood: string) {
  switch (mood) {
    case 'Happy': return '😊'
    case 'Loving': return '💕'
    case 'Excited': return '🎉'
    case 'Thoughtful': return '😔'
    case 'Neutral': return '😐'
    case 'Sad': return '😢'
    default: return '❤️'
  }
}

function refreshStarters() {
  activeStarters.value = getConversationStarters()
}

function startWithPrompt(promptText: string) {
  initialPrompt.value = promptText
  selectedEntry.value = null
  showEditorModal.value = true
}

function openWriteModal(prompt?: string) {
  selectedEntry.value = null
  initialPrompt.value = prompt || ''
  showEditorModal.value = true
}

async function runRelationshipReport() {
  showReportModal.value = true
  reportContent.value = ''
  const res = await generateRelationshipReport(journalEntries.value)
  reportContent.value = res
}

function openEditModal(entry: JournalEntry) {
  selectedEntry.value = entry
  initialPrompt.value = ''
  showEditorModal.value = true
}

async function handleSaveJournal(formData: JournalEntryFormData) {
  if (selectedEntry.value) {
    await updateJournalEntry(selectedEntry.value.id, formData)
  } else {
    await createJournalEntry(formData)
  }
  showEditorModal.value = false
  selectedEntry.value = null
  initialPrompt.value = ''
}

function navigateToEntry(id: string) {
  router.push(`/journal/${id}`)
}

async function confirmDelete(id: string) {
  if (confirm('Hapus catatan journal ini?')) {
    await deleteJournalEntry(id)
  }
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchCoupleData()
  refreshStarters()
})
</script>
