<template>
  <div
    class="stat-card glass rounded-xl p-5 animate-slide-in cursor-default"
    :style="{ animationDelay: `${delay}ms`, opacity: 0 }"
  >
    <!-- Top row: icon + trend -->
    <div class="flex items-center justify-between mb-3">
      <div class="stat-icon-wrap">
        <span class="text-2xl">{{ icon }}</span>
      </div>
      <span
        v-if="change !== undefined"
        class="text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5"
        :class="changePositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'"
      >
        <svg
          class="w-3 h-3"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            v-if="changePositive"
            d="M6 9V3M3 5l3-3 3 3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-else
            d="M6 3v6M3 7l3 3 3-3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ change }}
      </span>
    </div>

    <!-- Value -->
    <p class="text-2xl font-bold text-white mb-0.5">
      <AnimatedNumber
        v-if="typeof numericValue === 'number'"
        :value="numericValue"
        :prefix="prefix"
        :suffix="suffix"
        :decimals="decimals"
      />
      <span v-else>{{ value }}</span>
    </p>

    <!-- Label -->
    <p class="text-xs text-slate-500">{{ label }}</p>

    <!-- Optional progress bar slot -->
    <div v-if="$slots.default" class="mt-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'

const props = withDefaults(defineProps<{
  icon: string
  value: string | number
  label: string
  change?: string
  changePositive?: boolean
  delay?: number
  prefix?: string
  suffix?: string
  decimals?: number
}>(), {
  changePositive: true,
  delay: 0,
  prefix: '',
  suffix: '',
  decimals: 0,
})

/**
 * Extract numeric value for animation.
 * Strips common prefixes like $ and suffixes like % or k
 */
const numericValue = computed(() => {
  if (typeof props.value === 'number') return props.value
  // Try to parse the string as a number
  const cleaned = String(props.value).replace(/[$,]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.3),
    0 0 15px -3px rgba(6, 182, 212, 0.1);
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(6, 182, 212, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
