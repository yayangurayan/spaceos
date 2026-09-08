<template>
  <div class="space-y-6 animate-fade-in">
    <header class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">{{ t('private_space') }}</p>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white">{{ t('private_diary') }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('private_diary_desc') }}</p>
      </div>
      <button class="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold" @click="showForm = !showForm">{{ t('new_diary_entry') }}</button>
    </header>

    <form v-if="showForm" class="glass rounded-2xl p-5 border border-emerald-500/30 space-y-3 animate-slide-in" @submit.prevent="saveEntry">
      <input v-model="draft.title" required :placeholder="t('diary_title_placeholder')" class="input-field w-full" />
      <textarea v-model="draft.content" required rows="5" :placeholder="t('diary_content_placeholder')" class="input-field w-full resize-y"></textarea>
      <div class="flex justify-end gap-2">
        <button type="button" class="px-4 py-2 rounded-xl text-xs text-slate-300 border border-slate-700" @click="showForm = false">{{ t('cancel') }}</button>
        <button class="btn-primary px-4 py-2 rounded-xl text-xs font-bold">{{ t('save_entry') }}</button>
      </div>
    </form>

    <div v-if="entries.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400">
      <div class="text-4xl mb-3">📔</div>
      <h2 class="text-base font-bold text-white">{{ t('no_diary_entries') }}</h2>
      <p class="text-xs mt-1">{{ t('no_diary_entries_desc') }}</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <article v-for="entry in entries" :key="entry.id" class="glass rounded-2xl p-5 border border-slate-700/60 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-bold text-white">{{ entry.title }}</h2>
            <time class="text-[11px] text-slate-500">{{ formatDate(entry.createdAt) }}</time>
          </div>
          <button class="text-slate-500 hover:text-rose-400" :title="t('delete')" @click="removeEntry(entry.id)">×</button>
        </div>
        <p class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed mt-4">{{ entry.content }}</p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'

type DiaryEntry = { id: string; title: string; content: string; createdAt: string }
const authStore = useAuthStore()
const { currentSpace } = storeToRefs(authStore)
const { currentLang, t } = useI18n()
const showForm = ref(false)
const entries = ref<DiaryEntry[]>([])
const draft = reactive({ title: '', content: '' })
const storageKey = computed(() => `spaceos_private_diary_${currentSpace.value?.id || 'none'}`)

function loadEntries() {
  try { entries.value = JSON.parse(localStorage.getItem(storageKey.value) || '[]') } catch { entries.value = [] }
}
function persist() { localStorage.setItem(storageKey.value, JSON.stringify(entries.value)) }
function saveEntry() {
  entries.value.unshift({ id: `diary-${Date.now()}`, title: draft.title.trim(), content: draft.content.trim(), createdAt: new Date().toISOString() })
  persist(); draft.title = ''; draft.content = ''; showForm.value = false
}
function removeEntry(id: string) { entries.value = entries.value.filter(entry => entry.id !== id); persist() }
function formatDate(value: string) { return new Date(value).toLocaleDateString(currentLang.value === 'de' ? 'de-DE' : 'id-ID', { dateStyle: 'medium' }) }
watch(storageKey, loadEntries, { immediate: true })
</script>
