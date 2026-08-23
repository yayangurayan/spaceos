<template>
  <div class="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden">
    <!-- Animated background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse" style="animation-duration: 4s;"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/15 blur-3xl animate-pulse" style="animation-duration: 5s; animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-couple/5 blur-3xl animate-pulse" style="animation-duration: 6s; animation-delay: 2s;"></div>
    </div>

    <!-- Grid overlay -->
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsMTYzLDE4NCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>

    <!-- Auth Card -->
    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="glass rounded-2xl p-8 shadow-2xl shadow-black/20">
        <!-- Logo -->
        <div class="flex items-center justify-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20">
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
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.auth-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.auth-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
