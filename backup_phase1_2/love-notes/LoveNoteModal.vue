<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-md bg-surface border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">💌</span>
          <div>
            <h2 class="text-lg font-bold text-white">Tulis Love Note</h2>
            <p class="text-xs text-slate-400">Tinggalkan pesan manis digital untuk pasanganmu.</p>
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
        <!-- Color Choice -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Pilih Warna Kertas Sticky Note
          </label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="c in colorList"
              :key="c.name"
              type="button"
              @click="form.color = c.name as any"
              class="aspect-square rounded-xl transition-all flex items-center justify-center font-bold text-sm shadow-md"
              :class="[
                c.bgClass,
                form.color === c.name ? 'ring-4 ring-rose-500 scale-110' : 'opacity-80 hover:opacity-100'
              ]"
            >
              <span v-if="form.color === c.name">✓</span>
            </button>
          </div>
        </div>

        <!-- Sticky Note Preview Box -->
        <div
          class="rounded-2xl p-5 shadow-lg space-y-3 transition-colors relative"
          :class="currentNoteBgClass"
        >
          <textarea
            v-model="form.message"
            rows="5"
            required
            placeholder="Tuliskan ucapan sayang, gombalan lucu, atau pesan semangat..."
            class="w-full bg-transparent text-slate-900 placeholder-slate-600 font-sans text-sm focus:outline-none resize-none leading-relaxed"
          ></textarea>

          <div class="flex items-center justify-between pt-2 border-t border-black/10 text-slate-700 text-xs">
            <span>Dari: <strong>Kamu 💕</strong></span>
            <span>Untuk: <strong>Pasanganmu</strong></span>
          </div>
        </div>

        <!-- Pin Checkbox -->
        <div class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <input
            id="pin-note"
            v-model="form.is_pinned"
            type="checkbox"
            class="w-4 h-4 rounded text-rose-500 bg-slate-800 border-slate-700"
          />
          <label for="pin-note" class="text-xs text-slate-300 font-medium cursor-pointer">
            📌 Sematkan / Pin di paling atas papan pesan
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
          <span>Tempel Note 💌</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { LoveNote, LoveNoteFormData, LoveNoteColor } from '@/types'

const props = defineProps<{
  note: LoveNote | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: LoveNoteFormData): void
}>()

const colorList: { name: LoveNoteColor; bgClass: string }[] = [
  { name: 'yellow', bgClass: 'bg-amber-200 text-amber-950' },
  { name: 'pink', bgClass: 'bg-pink-200 text-pink-950' },
  { name: 'cyan', bgClass: 'bg-cyan-200 text-cyan-950' },
  { name: 'purple', bgClass: 'bg-purple-200 text-purple-950' },
  { name: 'peach', bgClass: 'bg-orange-200 text-orange-950' },
  { name: 'mint', bgClass: 'bg-emerald-200 text-emerald-950' },
]

const form = reactive<LoveNoteFormData>({
  message: props.note?.message || '',
  color: props.note?.color || 'pink',
  is_pinned: props.note?.is_pinned || false,
})

const currentNoteBgClass = computed(() => {
  const match = colorList.find(c => c.name === form.color)
  return match?.bgClass || 'bg-pink-200 text-pink-950'
})

function handleSubmit() {
  if (!form.message.trim()) return
  emit('save', { ...form })
}
</script>
