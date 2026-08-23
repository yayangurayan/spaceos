<template>
  <router-view />
  <ToastContainer />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import ToastContainer from '@/components/ToastContainer.vue'

const appStore = useAppStore()

onMounted(() => {
  // Ensure theme class is applied on initial mount
  appStore.applyTheme(appStore.theme)
})
</script>
