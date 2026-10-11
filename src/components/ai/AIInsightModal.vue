<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl surface-card rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-sm">
            <Icon :name="icon || 'bot'" :size="20" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {{ title || 'AI Insight & Analisis' }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Didukung oleh AI SpaceOS Intelligence System
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Icon name="x" :size="18" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <!-- Loading State -->
        <AILoadingState
          v-if="isLoading"
          :title="loadingTitle || 'AI SpaceOS Sedang Menganalisis Data...'"
        />

        <!-- Rendered Content -->
        <div
          v-else
          class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed space-y-3 font-sans"
        >
          <div v-html="renderedMarkdown"></div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <button
            v-if="!isLoading && content"
            type="button"
            @click="copyContent"
            class="btn-secondary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Icon :name="isCopied ? 'check' : 'clipboard'" :size="14" />
            <span>{{ isCopied ? 'Tersalin' : 'Salin Teks' }}</span>
          </button>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="btn-primary px-5 py-2 text-xs font-bold"
        >
          Selesai & Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import AILoadingState from '@/components/ai/AILoadingState.vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps<{
  title?: string
  icon?: string
  content: string
  isLoading?: boolean
  loadingTitle?: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

const toast = useToastStore()
const isCopied = ref(false)

// Simple markdown formatter
const renderedMarkdown = computed(() => {
  if (!props.content) return ''
  let html = props.content

  // Escape basic HTML except what we format
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-cyan-300 mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-white mt-5 mb-3 border-b border-slate-700 pb-1">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-white mt-6 mb-3">$1</h1>')

  // Horizontal Rule
  html = html.replace(/^---$/gim, '<hr class="my-4 border-slate-800" />')

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>')
  html = html.replace(/\*(.*?)\*/gim, '<em class="italic text-slate-300">$1</em>')

  // Unordered list items
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>')
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>')

  // Numbered list items
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-300 my-1"><strong>$1.</strong> $2</li>')

  // Newlines to break (paragraphs)
  html = html.replace(/\n\n/g, '<div class="h-2"></div>')
  html = html.replace(/\n/g, '<br/>')

  return html
})

async function copyContent() {
  try {
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    toast.success('Disalin ke Clipboard', 'Teks laporan berhasil disalin.')
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch {
    toast.error('Gagal Menyalin', 'Izin clipboard ditolak oleh peramban.')
  }
}
</script>
