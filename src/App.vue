<template>
  <router-view />
  <ToastContainer />
  <PwaInstallBanner />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import ToastContainer from '@/components/ToastContainer.vue'
import PwaInstallBanner from '@/components/ui/PwaInstallBanner.vue'

const appStore = useAppStore()

onMounted(() => {
  appStore.applyTheme()
})
</script>
