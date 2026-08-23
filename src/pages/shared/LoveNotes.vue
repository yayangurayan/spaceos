<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">💌</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Papan Pesan Cinta (Love Notes)
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Kumpulan sticky notes digital, pesan manis, dan ucapan semangat untuk pasangan.
        </p>
      </div>

      <!-- Header Action -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="showModal = true"
          class="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
        >
          <Icon name="plus" :size="16" />
          <span>+ Tempel Pesan Baru</span>
        </button>
      </div>
    </div>

    <!-- 2. Corkboard / Grid of Love Notes -->
    <div v-if="loveNotes.length === 0" class="glass rounded-3xl p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block">💌</span>
      <h3 class="text-base font-bold text-white">Papan pesan masih kosong</h3>
      <p class="text-xs text-slate-500">Tempelkan sticky note pertama untuk menyemangati pasanganmu!</p>
      <button
        type="button"
        @click="showModal = true"
        class="btn-primary px-5 py-2 text-xs font-bold rounded-xl mt-2"
      >
        + Tempel Love Note
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <div
        v-for="note in sortedLoveNotes"
        :key="note.id"
        class="group relative rounded-2xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between min-h-[190px] border border-black/10 select-none animate-fade-in"
        :class="getNoteBgClass(note.color)"
      >
        <!-- Pin / Pushpin Icon -->
        <div class="flex items-center justify-between mb-2">
          <button
            type="button"
            @click.stop="togglePinLoveNote(note.id)"
            class="text-base p-1 hover:scale-125 transition-transform"
            :title="note.is_pinned ? 'Lepas Pin' : 'Sematkan di atas'"
          >
            <span>{{ note.is_pinned ? '📌' : '📍' }}</span>
          </button>

          <!-- Read status indicator / Delete -->
          <div class="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              @click.stop="deleteLoveNote(note.id)"
              class="p-1 rounded text-slate-700 hover:text-rose-700 transition-colors"
              title="Hapus Catatan"
            >
              <Icon name="trash" :size="13" />
            </button>
          </div>
        </div>

        <!-- Note Message -->
        <p class="text-xs sm:text-sm font-sans font-medium text-slate-900 leading-relaxed whitespace-pre-line flex-1">
          {{ note.message }}
        </p>

        <!-- Footer / Sender & Date -->
        <div class="pt-3 mt-3 border-t border-black/10 flex items-center justify-between text-[11px] text-slate-700 font-sans">
          <span>Dari: <strong>{{ note.from_name || 'Pasanganmu 💕' }}</strong></span>
          <span class="font-mono text-[10px] opacity-75">{{ formatDate(note.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Modal: Add Note -->
    <LoveNoteModal
      v-if="showModal"
      :note="null"
      @close="showModal = false"
      @save="handleSaveNote"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import LoveNoteModal from '@/components/love-notes/LoveNoteModal.vue'
import { useCouple } from '@/composables/useCouple'
import type { LoveNoteFormData } from '@/types'

const {
  loveNotes,
  fetchCoupleData,
  createLoveNote,
  togglePinLoveNote,
  deleteLoveNote,
} = useCouple()

const showModal = ref(false)

const sortedLoveNotes = computed(() => {
  return [...loveNotes.value].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

function getNoteBgClass(color: string) {
  switch (color) {
    case 'yellow': return 'bg-amber-200 text-amber-950 rotate-1'
    case 'pink': return 'bg-pink-200 text-pink-950 -rotate-1'
    case 'cyan': return 'bg-cyan-200 text-cyan-950 rotate-2'
    case 'purple': return 'bg-purple-200 text-purple-950 -rotate-2'
    case 'peach': return 'bg-orange-200 text-orange-950 rotate-1'
    case 'mint': return 'bg-emerald-200 text-emerald-950 -rotate-1'
    default: return 'bg-pink-200 text-pink-950'
  }
}

async function handleSaveNote(formData: LoveNoteFormData) {
  await createLoveNote(formData)
  showModal.value = false
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

onMounted(() => {
  fetchCoupleData()
})
</script>
