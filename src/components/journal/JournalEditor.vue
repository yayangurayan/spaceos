<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ isEdit ? '✏️' : '📖' }}</span>
          <div>
            <h2 class="text-lg font-bold text-white">
              {{ isEdit ? 'Edit Catatan Journal' : 'Tulis Shared Journal Baru' }}
            </h2>
            <p class="text-xs text-slate-400">
              Bagikan perasaan, cerita hari ini, atau pesan manis untuk pasanganmu.
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
        <!-- 1. Mood Picker -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Pilih Mood Hari Ini 💕
          </label>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <button
              v-for="m in moods"
              :key="m.name"
              type="button"
              @click="form.mood = m.name as any"
              class="p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1"
              :class="form.mood === m.name
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/20 font-bold scale-105'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'"
            >
              <span class="text-xl">{{ m.emoji }}</span>
              <span class="text-[10px]">{{ m.label }}</span>
            </button>
          </div>
        </div>

        <!-- 2. Title -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Judul Catatan (Opsional)
          </label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g. Obrolan Manis di Kedai Kopi, Hari Anniversary Kita"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <!-- 3. Formatting Toolbar & Rich Content Textarea -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-slate-300">
              Isi Cerita & Pesan <span class="text-rose-400">*</span>
            </label>

            <!-- Quick Markdown Format Helpers & AI Prompt -->
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="insertAIPrompt"
                class="px-2.5 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-[11px] font-bold text-rose-300 flex items-center gap-1 transition-colors"
                title="Dapatkan ide topik menulis dari AI"
              >
                <span>💡</span>
                <span>Ide AI</span>
              </button>

              <button
                type="button"
                @click="insertFormat('**', '**')"
                class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300"
                title="Tebal (Bold)"
              >
                B
              </button>
              <button
                type="button"
                @click="insertFormat('*', '*')"
                class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] italic text-slate-300"
                title="Miring (Italic)"
              >
                I
              </button>
              <button
                type="button"
                @click="insertFormat('> ', '')"
                class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
                title="Kutipan (Quote)"
              >
                "
              </button>
              <button
                type="button"
                @click="insertFormat('• ', '')"
                class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
                title="Poin (Bullet)"
              >
                •
              </button>
            </div>
          </div>

          <textarea
            ref="contentInputRef"
            v-model="form.content"
            rows="8"
            required
            placeholder="Tuliskan cerita indahmu, perasaan terdalam, atau kenangan menyenangkan hari ini..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
          ></textarea>
        </div>

        <!-- 4. Tags -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Tagar / Kategori (Pisahkan dengan koma)
          </label>
          <input
            v-model="tagsInput"
            type="text"
            placeholder="e.g. DateNight, Travel, DeepTalk, Love"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <!-- 5. Draft vs Publish Toggle -->
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <div>
            <p class="text-xs font-semibold text-white">Publikasikan Langsung ke Pasangan</p>
            <p class="text-[11px] text-slate-400">Jika dimatikan, catatan akan tersimpan sebagai draft pribadi.</p>
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="form.is_published"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
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
          class="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all"
        >
          <span>{{ isEdit ? 'Simpan Perubahan' : form.is_published ? 'Publikasikan Journal 💕' : 'Simpan Sebagai Draft' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { useJournalAI } from '@/composables/useJournalAI'
import type { JournalEntry, JournalEntryFormData, JournalMood } from '@/types'

const props = defineProps<{
  entry: JournalEntry | null
  initialPrompt?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: JournalEntryFormData): void
}>()

const { getConversationStarters } = useJournalAI()

const isEdit = computed(() => Boolean(props.entry))
const contentInputRef = ref<HTMLTextAreaElement | null>(null)
const tagsInput = ref(props.entry?.tags ? props.entry.tags.join(', ') : '')

const moods = [
  { name: 'Happy', emoji: '😊', label: 'Senang' },
  { name: 'Loving', emoji: '💕', label: 'Sayang' },
  { name: 'Excited', emoji: '🎉', label: 'Bersemangat' },
  { name: 'Thoughtful', emoji: '😔', label: 'Reflektif' },
  { name: 'Neutral', emoji: '😐', label: 'Santai' },
  { name: 'Sad', emoji: '😢', label: 'Sedih' },
]

const form = reactive<JournalEntryFormData>({
  title: props.entry?.title || (props.initialPrompt ? props.initialPrompt.replace(/^[^\w\s]+/, '').trim() : ''),
  content: props.entry?.content || (props.initialPrompt ? `*Topik: ${props.initialPrompt}*\n\n` : ''),
  mood: (props.entry?.mood as JournalMood) || 'Loving',
  tags: props.entry?.tags ? [...props.entry.tags] : [],
  is_published: props.entry ? props.entry.is_published : true,
})

function insertAIPrompt() {
  const starters = getConversationStarters()
  if (starters.length > 0) {
    const randomStarter = starters[0]
    form.content = (form.content ? form.content + '\n\n' : '') + `> 💡 *${randomStarter}*\n\n`
  }
}

onMounted(() => {
  if (props.initialPrompt && !form.content) {
    form.content = `*Topik: ${props.initialPrompt}*\n\n`
  }
})

function insertFormat(prefix: string, suffix: string) {
  const el = contentInputRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = form.content
  const selected = text.slice(start, end)
  form.content = text.slice(0, start) + prefix + selected + suffix + text.slice(end)
}

function handleSubmit() {
  if (!form.content.trim()) return
  form.tags = tagsInput.value
    .split(',')
    .map(t => t.trim().replace(/^#/, ''))
    .filter(Boolean)

  emit('save', { ...form })
}
</script>
