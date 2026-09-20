<template>
  <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
    <!-- Back Button -->
    <div class="flex items-center justify-between">
      <router-link
        to="/journal"
        class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-200"
      >
        <Icon name="arrow-left" :size="16" />
        <span>{{ t('back_to_journal') }}</span>
      </router-link>

      <div v-if="entry" class="flex items-center gap-2">
        <button
          type="button"
          @click="showEditModal = true"
          class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors duration-200"
        >
          {{ t('edit') }}
        </button>
        <button
          type="button"
          @click="handleDelete"
          class="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors duration-200"
        >
          <Icon name="trash" :size="15" />
        </button>
      </div>
    </div>

    <!-- Loading / Not Found State -->
    <div v-if="!entry && !isLoading" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block">🔍</span>
      <h3 class="text-base font-bold text-white">{{ t('entry_not_found') }}</h3>
      <router-link to="/journal" class="btn-primary inline-block px-5 py-2 text-xs font-bold rounded-xl mt-2">
        {{ t('view_all_journals') }}
      </router-link>
    </div>

    <template v-else-if="entry">
      <!-- 1. Journal Article Card -->
      <article class="glass rounded-3xl p-5 sm:p-8 border border-slate-700/60 space-y-6 shadow-xl">
        <!-- Author & Mood Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
              {{ entry.author_name?.charAt(0) || 'K' }}
            </div>

            <div>
              <p class="text-sm font-bold text-white">{{ entry.author_name || t('you') }}</p>
              <p class="text-xs text-slate-400 font-mono">
                {{ formatDateTime(entry.published_at || entry.created_at) }}
              </p>
            </div>
          </div>

          <!-- Mood Pill -->
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <span>{{ getMoodEmoji(entry.mood) }}</span>
            <span>{{ t('mood_label') }}: {{ entry.mood }}</span>
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
          {{ entry.title || t('love_note_default_title') }}
        </h1>

        <!-- Content -->
        <div class="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line space-y-4 font-sans font-normal">
          {{ entry.content }}
        </div>

        <!-- Tags -->
        <div v-if="entry.tags && entry.tags.length > 0" class="flex flex-wrap gap-2 pt-2">
          <span
            v-for="tag in entry.tags"
            :key="tag"
            class="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-800 text-rose-300 border border-slate-700/60"
          >
            #{{ tag }}
          </span>
        </div>

        <!-- Reactions Toolbar -->
        <div class="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span class="text-xs text-slate-400 font-medium">{{ t('react_for_partner') }}</span>

          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="emoji in ['❤️', '💕', '😊', '🎉', '🥰']"
              :key="emoji"
              type="button"
              @click="handleReact(emoji)"
              class="px-3 py-1.5 rounded-xl border transition-all duration-200 text-xs font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95"
              :class="entry.userReaction === emoji
                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'"
            >
              <span>{{ emoji }}</span>
              <span>{{ entry.reactions?.[emoji] || 0 }}</span>
            </button>
          </div>
        </div>
      </article>

      <!-- 2. Comments Thread -->
      <section class="glass rounded-3xl p-5 sm:p-8 border border-slate-700/60 space-y-5">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>💬</span>
          <span>{{ t('comments_section_title') }} ({{ entry.comments?.length || 0 }})</span>
        </h3>

        <!-- Comment Input Box -->
        <form @submit.prevent="submitComment" class="space-y-3">
          <textarea
            v-model="commentText"
            rows="3"
            :placeholder="t('comment_placeholder')"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors duration-200 resize-none"
          ></textarea>

          <div class="flex items-center justify-between">
            <!-- Emoji suggestions -->
            <div class="flex items-center gap-1 text-base">
              <button
                v-for="e in ['🥰', '❤️', '😘', '🥺', '✨']"
                :key="e"
                type="button"
                @click="commentText += e"
                class="hover:scale-125 transition-transform duration-200"
              >
                {{ e }}
              </button>
            </div>

            <button
              type="submit"
              :disabled="!commentText.trim()"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition-all duration-200"
            >
              {{ t('send_reply') }}
            </button>
          </div>
        </form>

        <!-- Comments List -->
        <div v-if="entry.comments && entry.comments.length > 0" class="space-y-3 pt-4 border-t border-slate-800">
          <div
            v-for="comment in entry.comments"
            :key="comment.id"
            class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-rose-300">{{ comment.author_name || t('partner_name') }}</span>
              <span class="text-[10px] text-slate-500 font-mono">{{ formatDateTime(comment.created_at) }}</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">{{ comment.content }}</p>
          </div>
        </div>
      </section>
    </template>

    <!-- Modal: Edit Journal -->
    <JournalEditor
      v-if="showEditModal && entry"
      :entry="entry"
      @close="showEditModal = false"
      @save="handleSaveEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import JournalEditor from '@/components/journal/JournalEditor.vue'
import { useCouple } from '@/composables/useCouple'
import { useI18n } from '@/composables/useI18n'
import type { JournalEntryFormData } from '@/types'

const route = useRoute()
const router = useRouter()
const { t, currentLang } = useI18n()
const entryId = computed(() => route.params.id as string)

const {
  journalEntries,
  isLoading,
  fetchCoupleData,
  updateJournalEntry,
  deleteJournalEntry,
  reactToJournal,
  addJournalComment,
} = useCouple()

const showEditModal = ref(false)
const commentText = ref('')

const entry = computed(() => {
  return journalEntries.value.find(j => j.id === entryId.value)
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

async function handleReact(emoji: string) {
  if (!entry.value) return
  await reactToJournal(entry.value.id, emoji)
}

async function submitComment() {
  if (!entry.value || !commentText.value.trim()) return
  await addJournalComment(entry.value.id, commentText.value)
  commentText.value = ''
}

async function handleSaveEdit(formData: JournalEntryFormData) {
  if (!entry.value) return
  await updateJournalEntry(entry.value.id, formData)
  showEditModal.value = false
}

async function handleDelete() {
  if (!entry.value) return
  if (confirm(t('confirm_delete_journal'))) {
    await deleteJournalEntry(entry.value.id)
    router.push('/journal')
  }
}

function formatDateTime(datetimeStr?: string | null) {
  if (!datetimeStr) return '-'
  const locale = currentLang.value === 'de' ? 'de-DE' : 'id-ID'
  return new Date(datetimeStr).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchCoupleData()
})
</script>
