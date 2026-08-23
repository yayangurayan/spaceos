import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const isSidebarOpen = ref(true)
  const theme = ref<'dark' | 'light'>('dark')

  // Getters
  const isDarkMode = computed(() => theme.value === 'dark')

  // Actions
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function setLoading(value: boolean) {
    isLoading.value = value
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    isLoading,
    isSidebarOpen,
    theme,
    isDarkMode,
    toggleSidebar,
    setLoading,
    toggleTheme,
  }
})
