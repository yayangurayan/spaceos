import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Toast } from '@/types'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function addToast(toast: Omit<Toast, 'id'>) {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
    const newToast: Toast = { id, duration: 5000, ...toast }
    toasts.value.push(newToast)

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration)
    }
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  // Convenience methods
  function success(title: string, message?: string) {
    addToast({ type: 'success', title, message })
  }

  function showError(title: string, message?: string) {
    addToast({ type: 'error', title, message })
  }

  function warning(title: string, message?: string) {
    addToast({ type: 'warning', title, message })
  }

  function info(title: string, message?: string) {
    addToast({ type: 'info', title, message })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error: showError,
    warning,
    info,
  }
})
