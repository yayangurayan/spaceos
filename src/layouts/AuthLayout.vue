<template>
  <div class="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden">
    <!-- Animated background orbs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Large floating orbs -->
      <div
        class="floating-orb w-[500px] h-[500px] bg-primary/20 -top-40 -right-40"
        style="animation-duration: 12s;"
      ></div>
      <div
        class="floating-orb w-[400px] h-[400px] bg-accent/15 -bottom-32 -left-32"
        style="animation-duration: 15s; animation-delay: 2s;"
      ></div>
      <div
        class="floating-orb w-[350px] h-[350px] bg-couple/10 top-1/3 left-1/2 -translate-x-1/2"
        style="animation-duration: 18s; animation-delay: 4s;"
      ></div>

      <!-- Animated particles -->
      <div
        v-for="i in 12"
        :key="i"
        class="floating-particle bg-accent/40"
        :style="{
          left: `${8 + (i * 7.5) % 90}%`,
          bottom: `-${4 + (i % 3) * 2}%`,
          width: `${3 + (i % 4)}px`,
          height: `${3 + (i % 4)}px`,
          animationDuration: `${8 + (i % 5) * 3}s`,
          animationDelay: `${(i * 0.8)}s`,
        }"
      ></div>

      <!-- Subtle grid overlay -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsMTYzLDE4NCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
    </div>

    <!-- Auth Card -->
    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="glass rounded-2xl p-8 shadow-2xl shadow-black/30 border border-slate-700/40">
        <!-- Logo -->
        <div class="flex items-center justify-center gap-3 mb-8">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/25 animate-float" style="animation-duration: 4s;">
            <span class="text-white font-bold text-lg">S</span>
          </div>
          <span class="text-2xl font-bold text-white tracking-tight">SpaceOS</span>
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
// AuthLayout - provides the visual shell for login & register
</script>

<style scoped>
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
