<template>
  <div class="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden">
    <!-- Aurora Gradient Background -->
    <AuroraBackground variant="auth" />

    <!-- Canvas Particles -->
    <ParticleCanvas
      :count="50"
      :hue="190"
      :hue2="260"
      :link-distance="150"
      :speed="0.3"
      :opacity="0.5"
      :interactive="true"
      :size-range="[1.5, 3.5]"
    />

    <!-- Floating sparkle dots (CSS) -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      <div
        v-for="i in 20"
        :key="'sparkle-' + i"
        class="sparkle-dot"
        :style="{
          left: `${(i * 4.7 + 3) % 96}%`,
          top: `${(i * 7.3 + 5) % 92}%`,
          animationDelay: `${i * 0.4}s`,
          animationDuration: `${3 + (i % 4) * 1.5}s`,
        }"
      ></div>

      <!-- Horizontal shimmer line -->
      <div class="shimmer-line" style="top: 30%; animation-delay: 0s;"></div>
      <div class="shimmer-line" style="top: 65%; animation-delay: 4s;"></div>
    </div>

    <!-- Subtle grid overlay -->
    <div class="absolute inset-0 z-[1] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsMTYzLDE4NCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 pointer-events-none"></div>

    <!-- Auth Card -->
    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="auth-card glass rounded-2xl p-8 shadow-2xl shadow-black/40 border border-white/[0.08]">
        <!-- Glowing border effect -->
        <div class="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-indigo-500/20 -z-10 opacity-60"></div>

        <!-- Logo -->
        <div class="flex items-center justify-center gap-3 mb-8">
          <div class="logo-icon w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-2 ring-white/10">
            <span class="text-white font-extrabold text-xl tracking-wide">S</span>
          </div>
          <div>
            <span class="text-2xl font-extrabold text-white tracking-tight">SpaceOS</span>
            <span class="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold align-top">PRO</span>
          </div>
        </div>

        <!-- Page Content -->
        <router-view v-slot="{ Component }">
          <transition name="auth" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ParticleCanvas from '@/components/ui/ParticleCanvas.vue'
import AuroraBackground from '@/components/ui/AuroraBackground.vue'
</script>

<style scoped>
/* Auth card glass effect enhanced */
.auth-card {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
}

/* Logo icon float animation */
.logo-icon {
  animation: logoFloat 4s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(2deg); }
}

/* Sparkle dots */
.sparkle-dot {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: sparklePulse ease-in-out infinite;
  opacity: 0;
}

@keyframes sparklePulse {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

/* Horizontal shimmer lines */
.shimmer-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.15) 30%, rgba(99, 102, 241, 0.15) 50%, rgba(6, 182, 212, 0.15) 70%, transparent 100%);
  animation: shimmerSlide 8s ease-in-out infinite;
  opacity: 0;
}

@keyframes shimmerSlide {
  0% { opacity: 0; transform: scaleX(0.3) translateX(-50%); }
  30% { opacity: 1; }
  50% { transform: scaleX(1) translateX(0); }
  70% { opacity: 1; }
  100% { opacity: 0; transform: scaleX(0.3) translateX(50%); }
}

/* Auth transition */
.auth-enter-active,
.auth-leave-active {
  transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.auth-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.auth-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
