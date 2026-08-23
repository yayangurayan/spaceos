<template>
  <div class="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
    <!-- Cosmic background glow -->
    <div class="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-rose-500/10 blur-3xl absolute pointer-events-none"></div>

    <div class="relative z-10 max-w-lg w-full glass rounded-3xl p-8 sm:p-10 border border-slate-700/60 shadow-2xl text-center space-y-6 animate-fade-in">
      <!-- Icon / Illustration -->
      <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-4xl shadow-xl animate-bounce">
        🛸
      </div>

      <!-- Title & 404 -->
      <div class="space-y-2">
        <span class="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
          Galactic Error 404
        </span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ruang Tidak Ditemukan
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
          Halaman atau koordinat ruang angkasa yang Anda cari tidak tersedia atau telah dipindahkan ke orbit lain.
        </p>
      </div>

      <!-- Quick Destination Links -->
      <div class="space-y-2 pt-2 text-left">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center mb-1">
          Navigasi Cepat ke Space Anda
        </span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <router-link
            to="/"
            class="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-white transition-all flex items-center gap-2"
          >
            <span>🏠</span>
            <span>Dashboard Utama</span>
          </router-link>

          <router-link
            to="/settings"
            class="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-white transition-all flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Pengaturan</span>
          </router-link>
        </div>
      </div>

      <!-- Back CTA -->
      <div class="pt-2">
        <router-link
          to="/"
          class="btn-primary w-full py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 inline-flex items-center justify-center gap-2"
        >
          <span>← Kembali ke Pangkalan SpaceOS</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 Cosmic Error Page
</script>
