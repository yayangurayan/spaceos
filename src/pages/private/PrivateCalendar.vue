<template>
  <div class="space-y-6 animate-fade-in">
    <header class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">{{ t('private_space') }}</p>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white">{{ t('private_calendar') }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ t('private_calendar_desc') }}</p>
      </div>
      <button class="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold" @click="showForm = !showForm">{{ t('new_private_event') }}</button>
    </header>

    <form v-if="showForm" class="glass rounded-2xl p-5 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-slide-in" @submit.prevent="saveEvent">
      <input v-model="draft.title" required :placeholder="t('event_title_placeholder')" class="input-field sm:col-span-2" />
      <input v-model="draft.date" required type="date" class="input-field" />
      <div class="sm:col-span-3 flex justify-end gap-2">
        <button type="button" class="px-4 py-2 rounded-xl text-xs text-slate-300 border border-slate-700" @click="showForm = false">{{ t('cancel') }}</button>
        <button class="btn-primary px-4 py-2 rounded-xl text-xs font-bold">{{ t('save_event') }}</button>
      </div>
    </form>

    <div v-if="events.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400">
      <div class="text-4xl mb-3">🗓️</div>
      <h2 class="text-base font-bold text-white">{{ t('no_private_events') }}</h2>
      <p class="text-xs mt-1">{{ t('no_private_events_desc') }}</p>
    </div>
    <div v-else class="space-y-3">
      <article v-for="event in events" :key="event.id" class="glass rounded-2xl p-4 border border-slate-700/60 flex items-center gap-4 hover:border-emerald-500/40 transition-all hover:translate-x-1">
        <time class="w-14 h-14 rounded-xl bg-emerald-500/15 text-emerald-300 flex flex-col items-center justify-center text-xs font-bold"><span>{{ day(event.date) }}</span><span class="text-[10px] uppercase">{{ month(event.date) }}</span></time>
        <h2 class="flex-1 font-semibold text-white">{{ event.title }}</h2>
        <button class="text-slate-500 hover:text-rose-400 text-xl" :title="t('delete')" @click="removeEvent(event.id)">×</button>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'

type PrivateEvent = { id: string; title: string; date: string }
const authStore = useAuthStore()
const { currentSpace } = storeToRefs(authStore)
const { currentLang, t } = useI18n()
const showForm = ref(false)
const events = ref<PrivateEvent[]>([])
const draft = reactive({ title: '', date: new Date().toISOString().split('T')[0] })
const storageKey = computed(() => `spaceos_private_calendar_${currentSpace.value?.id || 'none'}`)
function loadEvents() { try { events.value = JSON.parse(localStorage.getItem(storageKey.value) || '[]') } catch { events.value = [] } }
function persist() { localStorage.setItem(storageKey.value, JSON.stringify(events.value)) }
function saveEvent() { events.value.push({ id: `private-event-${Date.now()}`, title: draft.title.trim(), date: draft.date }); events.value.sort((a, b) => a.date.localeCompare(b.date)); persist(); draft.title = ''; showForm.value = false }
function removeEvent(id: string) { events.value = events.value.filter(event => event.id !== id); persist() }
function day(value: string) { return new Date(`${value}T00:00:00`).getDate() }
function month(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString(currentLang.value === 'de' ? 'de-DE' : 'id-ID', { month: 'short' }) }
watch(storageKey, loadEvents, { immediate: true })
</script>
