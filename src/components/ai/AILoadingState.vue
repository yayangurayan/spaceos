<template>
  <div class="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
    <!-- Glowing AI Orb / Brain -->
    <div class="relative flex items-center justify-center">
      <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/30 via-rose-500/30 to-purple-500/30 blur-xl absolute animate-pulse"></div>
      <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-3xl shadow-xl relative z-10 animate-bounce">
        🧠
      </div>
    </div>

    <!-- Thinking text with rotating phrases -->
    <div class="space-y-1">
      <h3 class="text-sm sm:text-base font-bold text-white tracking-tight">
        {{ title || 'AI SpaceOS Sedang Menganalisis...' }}
      </h3>
      <p class="text-xs text-slate-400 font-mono transition-opacity duration-300">
        {{ currentThought }}
      </p>
    </div>

    <!-- Shimmer Skeleton Bars -->
    <div class="w-full max-w-sm space-y-2 pt-2">
      <div class="h-3 rounded-full bg-slate-800 animate-pulse w-full"></div>
      <div class="h-3 rounded-full bg-slate-800 animate-pulse w-4/5 mx-auto"></div>
      <div class="h-3 rounded-full bg-slate-800 animate-pulse w-3/5 mx-auto"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  title?: string
  thoughts?: string[]
}>()

const defaultThoughts = [
  'Mengevaluasi data & korelasi statistik...',
  'Menyusun pola perilaku & psikologi...',
  'Mengidentifikasi kebiasaan & anomali...',
  'Merumuskan rekomendasi praktis terbaik...',
]

const thoughtsList = props.thoughts || defaultThoughts
const currentThoughtIndex = ref(0)
const currentThought = ref(thoughtsList[0])
let interval: any = null

onMounted(() => {
  interval = setInterval(() => {
    currentThoughtIndex.value = (currentThoughtIndex.value + 1) % thoughtsList.length
    currentThought.value = thoughtsList[currentThoughtIndex.value]
  }, 1800)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>
