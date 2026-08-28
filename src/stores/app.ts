import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const isSidebarOpen = ref(true)
  function applyTheme() {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.add('dark')
      root.classList.remove('light')
      root.setAttribute('data-theme', 'dark')
    }
  }

  // Actions
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function setLoading(value: boolean) {
    isLoading.value = value
  }

  return {
    isLoading,
    isSidebarOpen,
    toggleSidebar,
    setLoading,
    applyTheme,
  }
})
