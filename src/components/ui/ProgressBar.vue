<template>
  <div class="progress-bar-wrapper">
    <!-- Label row -->
    <div v-if="label || showValue" class="flex items-center justify-between mb-1.5">
      <span v-if="label" class="text-xs font-medium text-slate-400">{{ label }}</span>
      <span v-if="showValue" class="text-xs font-semibold text-white">{{ Math.round(animatedValue) }}%</span>
    </div>

    <!-- Bar track -->
    <div
      class="progress-track"
      :style="{ height: `${height}px` }"
    >
      <!-- Bar fill -->
      <div
        class="progress-fill"
        :class="gradientClass"
        :style="{ width: `${animatedValue}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  color?: 'cyan' | 'green' | 'red' | 'amber' | 'purple'
  height?: number
  label?: string
  showValue?: boolean
}>(), {
  color: 'cyan',
  height: 6,
  label: '',
  showValue: false,
})

const animatedValue = ref(0)

const gradientClass = computed(() => {
  const map: Record<string, string> = {
    cyan: 'gradient-cyan',
    green: 'gradient-green',
    red: 'gradient-red',
    amber: 'gradient-amber',
    purple: 'gradient-purple',
  }
  return map[props.color] || 'gradient-cyan'
})

function animateTo(target: number) {
  // Clamp between 0-100
  const clamped = Math.max(0, Math.min(100, target))
  // Use a small delay so CSS transition triggers on mount
  requestAnimationFrame(() => {
    animatedValue.value = clamped
  })
}

watch(() => props.value, (v) => animateTo(v))

onMounted(() => {
  // Start from 0 then animate
  animatedValue.value = 0
  setTimeout(() => animateTo(props.value), 50)
})
</script>

<style scoped>
.progress-track {
  width: 100%;
  border-radius: 999px;
  background: rgba(51, 65, 85, 0.5);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

/* Subtle shimmer on the fill */
.progress-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  animation: shimmerBar 2s ease-in-out infinite;
}

/* Gradient presets */
.gradient-cyan {
  background: linear-gradient(90deg, #0891b2, #06b6d4, #22d3ee);
}
.gradient-green {
  background: linear-gradient(90deg, #059669, #10b981, #34d399);
}
.gradient-red {
  background: linear-gradient(90deg, #dc2626, #ef4444, #f87171);
}
.gradient-amber {
  background: linear-gradient(90deg, #d97706, #f59e0b, #fbbf24);
}
.gradient-purple {
  background: linear-gradient(90deg, #7c3aed, #8b5cf6, #a78bfa);
}

@keyframes shimmerBar {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
</style>
