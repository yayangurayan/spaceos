import { ref, onMounted } from 'vue'

const THEME_KEY = 'spaceos-theme'

const isDark = ref(true)

function applyTheme(dark: boolean) {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }
  try {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  } catch (e) {
    // localStorage might fail in private browsing
  }
}

export function useTheme() {
  onMounted(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved) {
        applyTheme(saved === 'dark')
      } else {
        // Default to dark mode as per DESIGN.md
        applyTheme(true)
      }
    } catch {
      applyTheme(true)
    }
  })

  function toggleTheme() {
    applyTheme(!isDark.value)
  }

  function setTheme(dark: boolean) {
    applyTheme(dark)
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
  }
}
