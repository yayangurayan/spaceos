<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto w-80 rounded-xl glass border-l-4 px-4 py-3 shadow-2xl cursor-pointer"
          :class="borderClass(toast.type)"
          @click="removeToast(toast.id)"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <span class="text-lg mt-0.5 shrink-0">{{ iconFor(toast.type) }}</span>
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white">{{ toast.title }}</p>
              <p v-if="toast.message" class="text-xs text-slate-400 mt-0.5 leading-relaxed">{{ toast.message }}</p>
            </div>
            <!-- Close -->
            <button
              class="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
              @click.stop="removeToast(toast.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast'
import type { Toast } from '@/types'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { removeToast } = toastStore

function borderClass(type: Toast['type']) {
  const map: Record<Toast['type'], string> = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-accent',
  }
  return map[type]
}

function iconFor(type: Toast['type']) {
  const map: Record<Toast['type'], string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return map[type]
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.06, 0.71, 0.55, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(80px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(80px) scale(0.95);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
