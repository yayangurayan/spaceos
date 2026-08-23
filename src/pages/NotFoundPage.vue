<template>
  <div class="min-h-screen bg-dark flex items-center justify-center">
    <div class="text-center animate-fade-in">
      <h1 class="text-8xl font-bold text-gradient mb-4">404</h1>
      <p class="text-xl text-slate-400 mb-8">Page not found</p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 Page
</script>
