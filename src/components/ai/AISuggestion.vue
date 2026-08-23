<template>
  <div
    v-if="visible"
    class="rounded-xl p-3 sm:p-3.5 border transition-all duration-300 flex items-start gap-3 animate-fade-in relative shadow-lg"
    :class="{
      'bg-amber-500/10 border-amber-500/30 text-amber-200': type === 'warning',
      'bg-cyan-500/10 border-cyan-500/30 text-cyan-200': type === 'info',
      'bg-emerald-500/10 border-emerald-500/30 text-emerald-200': type === 'success',
      'bg-rose-500/10 border-rose-500/30 text-rose-200': type === 'danger',
    }"
  >
    <!-- Icon -->
    <div class="text-lg shrink-0 mt-0.5">
      <span v-if="type === 'warning'">⚠️</span>
      <span v-else-if="type === 'success'">✨</span>
      <span v-else-if="type === 'danger'">🛑</span>
      <span v-else>💡</span>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0 space-y-0.5">
      <h4 v-if="title" class="text-xs font-bold text-white tracking-wide">
        {{ title }}
      </h4>
      <p class="text-xs leading-relaxed opacity-90">
        {{ message }}
      </p>

      <div v-if="actionLabel" class="pt-1.5">
        <button
          type="button"
          @click="$emit('action')"
          class="text-xs font-bold underline hover:opacity-80 transition-opacity"
        >
          {{ actionLabel }} →
        </button>
      </div>
    </div>

    <!-- Dismiss Button -->
    <button
      v-if="dismissible"
      type="button"
      @click="visible = false; $emit('dismiss')"
      class="p-1 rounded text-slate-400 hover:text-white transition-colors shrink-0"
      title="Tutup Saran"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    title?: string
    message: string
    type?: 'warning' | 'info' | 'success' | 'danger'
    actionLabel?: string
    dismissible?: boolean
  }>(),
  {
    type: 'info',
    dismissible: true,
  }
)

defineEmits<{
  (e: 'action'): void
  (e: 'dismiss'): void
}>()

const visible = ref(true)
</script>
