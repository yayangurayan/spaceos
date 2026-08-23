<template>
  <div class="flex items-center gap-1.5 sm:gap-2">
    <!-- Days -->
    <div class="flex flex-col items-center">
      <div
        class="w-8 sm:w-10 h-9 sm:h-11 rounded-lg bg-dark/90 border border-slate-700/80 shadow-md flex items-center justify-center relative overflow-hidden group"
      >
        <span class="font-mono font-extrabold text-sm sm:text-base text-accent">
          {{ formatDigit(days) }}
        </span>
        <div class="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800"></div>
      </div>
      <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">Hari</span>
    </div>

    <span class="text-xs font-mono font-bold text-slate-600 self-start mt-2 sm:mt-2.5">:</span>

    <!-- Hours -->
    <div class="flex flex-col items-center">
      <div
        class="w-8 sm:w-10 h-9 sm:h-11 rounded-lg bg-dark/90 border border-slate-700/80 shadow-md flex items-center justify-center relative overflow-hidden"
      >
        <span class="font-mono font-extrabold text-sm sm:text-base text-white">
          {{ formatDigit(hours) }}
        </span>
        <div class="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800"></div>
      </div>
      <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">Jam</span>
    </div>

    <span class="text-xs font-mono font-bold text-slate-600 self-start mt-2 sm:mt-2.5">:</span>

    <!-- Minutes -->
    <div class="flex flex-col items-center">
      <div
        class="w-8 sm:w-10 h-9 sm:h-11 rounded-lg bg-dark/90 border border-slate-700/80 shadow-md flex items-center justify-center relative overflow-hidden"
      >
        <span class="font-mono font-extrabold text-sm sm:text-base text-white">
          {{ formatDigit(minutes) }}
        </span>
        <div class="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800"></div>
      </div>
      <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">Mnt</span>
    </div>

    <span class="text-xs font-mono font-bold text-slate-600 self-start mt-2 sm:mt-2.5">:</span>

    <!-- Seconds -->
    <div class="flex flex-col items-center">
      <div
        class="w-8 sm:w-10 h-9 sm:h-11 rounded-lg bg-dark/90 border border-slate-700/80 shadow-md flex items-center justify-center relative overflow-hidden"
      >
        <span class="font-mono font-extrabold text-sm sm:text-base text-cyan-300">
          {{ formatDigit(seconds) }}
        </span>
        <div class="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800"></div>
      </div>
      <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">Dtk</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  targetDatetime: string
}>()

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const isPast = ref(false)

let timer: number | null = null

function formatDigit(num: number) {
  return num < 10 ? `0${num}` : `${num}`
}

function updateCountdown() {
  if (!props.targetDatetime) return

  const target = new Date(props.targetDatetime).getTime()
  const now = Date.now()
  const diff = target - now

  if (diff <= 0) {
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    isPast.value = true
    return
  }

  isPast.value = false
  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
}

watch(() => props.targetDatetime, () => {
  updateCountdown()
})

onMounted(() => {
  updateCountdown()
  timer = window.setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
