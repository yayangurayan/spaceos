import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const isSidebarOpen = ref(true)
  const savedTheme = (localStorage.getItem('spaceos_theme') as 'dark' | 'light') || 'dark'
  const theme = ref<'dark' | 'light'>(savedTheme)

  // Apply theme to DOM on store initialization
  applyTheme(theme.value)

  // Getters
  const isDarkMode = computed(() => theme.value === 'dark')

  function applyTheme(newTheme: 'dark' | 'light') {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (newTheme === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
        root.setAttribute('data-theme', 'dark')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
        root.setAttribute('data-theme', 'light')
      }
    }
    localStorage.setItem('spaceos_theme', newTheme)
  }

  // Actions
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function setLoading(value: boolean) {
    isLoading.value = value
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme(theme.value)
  }

  function setTheme(newTheme: 'dark' | 'light') {
    theme.value = newTheme
    applyTheme(newTheme)
  }

  return {
    isLoading,
    isSidebarOpen,
    theme,
    isDarkMode,
    toggleSidebar,
    setLoading,
    toggleTheme,
    setTheme,
    applyTheme,
  }
})
