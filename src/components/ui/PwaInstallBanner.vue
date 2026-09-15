<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-6 opacity-0 scale-95"
    enter-to-class="transform translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-6 opacity-0 scale-95"
  >
    <div
      v-if="isInstallable && !isInstalled && !isDismissed"
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-50"
    >
      <div
        class="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl"
      >
        <!-- Subtle gradient background glow -->
        <div class="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/15 blur-2xl"></div>
        <div class="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl"></div>

        <div class="relative flex items-start gap-3.5">
          <!-- App Icon -->
          <div class="relative shrink-0">
            <div class="h-12 w-12 overflow-hidden rounded-xl border border-white/10 shadow-md">
              <img
                src="/icons/spaceos-icon-192.webp"
                alt="SpaceOS Logo"
                class="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <!-- Online status badge -->
            <span class="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span class="relative inline-flex h-3 w-3 rounded-full bg-cyan-500 border border-slate-900"></span>
            </span>
          </div>

          <!-- Text Info -->
          <div class="flex-1 min-w-0 pr-6">
            <h4 class="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              Install SpaceOS
              <span class="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                PWA
              </span>
            </h4>
            <p class="mt-0.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
              Tambahkan ke layar utama untuk pengalaman aplikasi mandiri tanpa browser bar.
            </p>
          </div>

          <!-- Close button -->
          <button
            @click="dismiss"
            class="absolute top-0 right-0 p-1 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/60"
            title="Tutup"
            aria-label="Tutup banner instalasi"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            @click="handleInstall"
            :disabled="isInstalling"
            class="flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{{ isInstalling ? 'Memasang...' : 'Tambahkan ke Layar Utama' }}</span>
          </button>

          <button
            @click="dismiss"
            class="py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            Nanti
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePwaInstall } from '@/composables/usePwaInstall';

const { isInstallable, isInstalled, isDismissed, promptInstall, dismiss } = usePwaInstall();
const isInstalling = ref(false);

async function handleInstall() {
  isInstalling.value = true;
  try {
    await promptInstall();
  } finally {
    isInstalling.value = false;
  }
}
</script>
