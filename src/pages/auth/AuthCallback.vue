<template>
  <div class="min-h-screen bg-dark flex items-center justify-center p-4 text-center animate-fade-in">
    <div>
      <div class="w-12 h-12 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-slate-400 text-sm">Completing sign in...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

onMounted(async () => {
  try {
    // Supabase handles the OAuth callback automatically via the URL hash
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) throw error

    if (session?.user) {
      await authStore.fetchProfile(session.user.id)
      await authStore.fetchSpaces()
      toast.success('Signed in!', 'Welcome to SpaceOS.')
      router.replace({ name: 'SpaceSelector' })
    } else {
      router.replace({ name: 'Login' })
    }
  } catch (err: any) {
    console.error('Auth callback error:', err)
    toast.error('Sign in failed', err?.message || 'Please try again.')
    router.replace({ name: 'Login' })
  }
})
</script>
