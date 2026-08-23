import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to track window scroll position
 */
export function useScroll() {
  const scrollY = ref(0)
  const isScrolled = ref(false)

  function handleScroll() {
    scrollY.value = window.scrollY
    isScrolled.value = window.scrollY > 10
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return { scrollY, isScrolled }
}
