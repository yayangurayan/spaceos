<template>
  <span class="animated-number">{{ prefix }}{{ displayValue }}{{ suffix }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}>(), {
  duration: 1200,
  prefix: '',
  suffix: '',
  decimals: 0,
})

const displayValue = ref('0')
let animationId: number | null = null

/**
 * Ease-out cubic easing function
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Format number with locale-aware separators and decimal places
 */
function formatNumber(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  })
}

/**
 * Animate from current displayed value to target value
 */
function animate(from: number, to: number) {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  const startTime = performance.now()
  const duration = props.duration

  function tick(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutCubic(progress)

    const current = from + (to - from) * easedProgress
    displayValue.value = formatNumber(current)

    if (progress < 1) {
      animationId = requestAnimationFrame(tick)
    } else {
      displayValue.value = formatNumber(to)
      animationId = null
    }
  }

  animationId = requestAnimationFrame(tick)
}

// Watch for value changes and re-animate
watch(() => props.value, (newVal, oldVal) => {
  animate(oldVal ?? 0, newVal)
})

onMounted(() => {
  animate(0, props.value)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.animated-number {
  font-variant-numeric: tabular-nums;
}
</style>
