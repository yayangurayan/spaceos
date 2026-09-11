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
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease;
  position: relative;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.06);
}

/* Animated gradient border */
.stat-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), transparent 40%, transparent 60%, rgba(99, 102, 241, 0.15));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.stat-card:hover::before {
  opacity: 1;
}

/* Inner top glow */
.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.stat-card:hover::after {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 30px -5px rgba(0, 0, 0, 0.35),
    0 0 20px -3px rgba(6, 182, 212, 0.08);
  border-color: rgba(148, 163, 184, 0.1);
}

.stat-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(99, 102, 241, 0.08));
  border: 1px solid rgba(6, 182, 212, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover .stat-icon-wrap {
  transform: scale(1.08);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);
}
</style>

