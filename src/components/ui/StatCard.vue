<template>
  <div
    class="rounded-xl p-4 sm:p-5 border transition-all duration-150 cursor-default"
    :class="'dark:bg-dark-surface bg-light-surface dark:border-white/[0.08] border-slate-200 dark:hover:border-sky-500/30 hover:border-slate-300 hover:-translate-y-0.5 shadow-sm'"
    :style="{ animationDelay: `${delay}ms` }"
  >
    <!-- Top row: icon + trend -->
    <div class="flex items-center justify-between mb-3">
      <div class="w-8 h-8 rounded-lg dark:bg-white/[0.05] bg-slate-100 flex items-center justify-center dark:text-sky-400 text-sky-600 border dark:border-white/[0.06] border-slate-200">
        <Icon v-if="isSvgIcon(icon)" :name="icon" :size="17" />
        <span v-else class="text-base">{{ icon }}</span>
      </div>

      <span
        v-if="change !== undefined"
        class="text-[11px] font-mono font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1 border"
        :class="changePositive
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'"
      >
        <svg
          class="w-2.5 h-2.5 shrink-0"
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
        <span>{{ change }}</span>
      </span>
    </div>

    <!-- Value: prominent focal point -->
    <p class="text-xl sm:text-2xl font-bold dark:text-white text-slate-900 font-mono tracking-tight tabular-nums mb-1">
      <AnimatedNumber
        v-if="typeof numericValue === 'number'"
        :value="numericValue"
        :prefix="prefix"
        :suffix="suffix"
        :decimals="decimals"
      />
      <span v-else>{{ value }}</span>
    </p>

    <!-- Label: crisp secondary typography -->
    <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ label }}</p>

    <!-- Optional progress bar slot -->
    <div v-if="$slots.default" class="mt-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'
import Icon from './Icon.vue'

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

function isSvgIcon(iconName: string): boolean {
  // If it's a typical icon name without unicode emoji characters
  return /^[a-z0-9-]+$/.test(iconName)
}

/**
 * Extract numeric value for animation.
 */
const numericValue = computed(() => {
  if (typeof props.value === 'number') return props.value
  const cleaned = String(props.value).replace(/[$,]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
})
</script>
