<template>
  <div class="min-h-screen bg-dark">
    <!-- Header -->
    <header class="border-b border-slate-800">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <span class="text-white font-bold text-sm">S</span>
          </div>
          <span class="text-lg font-semibold text-white tracking-tight">SpaceOS</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-slate-400 hidden sm:block">{{ userName }}</span>
          <button
            @click="handleLogout"
            class="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-5xl mx-auto px-6 py-10">
      <!-- Greeting -->
      <div class="mb-8 animate-fade-in">
        <h1 class="text-3xl font-bold text-white mb-2">
          Welcome back, <span class="text-gradient">{{ firstName }}!</span>
        </h1>
        <p class="text-slate-400">Select a space to continue, or create a new one.</p>
      </div>

      <!-- Actions Bar -->
      <div class="flex items-center justify-between mb-6 animate-slide-in">
        <p class="text-sm text-slate-500">
          {{ spaces.length }} space{{ spaces.length !== 1 ? 's' : '' }} available
        </p>
        <button
          @click="showCreateModal = true"
          class="btn-primary flex items-center gap-2 text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Space
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="glass rounded-xl p-6 animate-pulse">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-xl bg-slate-700"></div>
            <div class="flex-1">
              <div class="h-4 bg-slate-700 rounded w-24 mb-2"></div>
              <div class="h-3 bg-slate-700/60 rounded w-16"></div>
            </div>
          </div>
          <div class="h-3 bg-slate-700/40 rounded w-32"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="spaces.length === 0"
        class="glass rounded-2xl p-12 text-center animate-fade-in"
      >
        <div class="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">🚀</span>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">No spaces yet</h3>
        <p class="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
          Create your first space to start organizing your life with SpaceOS.
        </p>
        <button
          @click="showCreateModal = true"
          class="btn-primary inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create your first space
        </button>
      </div>

      <!-- Spaces Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="(space, index) in spaces"
          :key="space.id"
          class="space-card glass rounded-xl p-6 text-left group relative overflow-hidden animate-slide-in"
          :style="{ animationDelay: `${index * 80}ms`, opacity: 0 }"
          @click="handleSelectSpace(space.id, $event)"
        >
          <!-- Ripple container -->
          <div class="ripple-container absolute inset-0 pointer-events-none overflow-hidden rounded-xl"></div>

          <!-- Content -->
          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-4">
              <!-- Space Icon -->
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-150 group-hover:scale-110"
                :class="space.type === 'couple' ? 'bg-couple/20' : 'bg-primary/20'"
              >
                {{ space.type === 'couple' ? '💑' : '👤' }}
              </div>
              <!-- Space Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-semibold truncate group-hover:text-accent transition-colors duration-150">
                  {{ space.name }}
                </h3>
                <span
                  class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="space.type === 'couple'
                    ? 'bg-couple/10 text-couple'
                    : 'bg-primary/10 text-blue-400'"
                >
                  {{ space.type === 'couple' ? 'Couple' : 'Personal' }}
                </span>
              </div>
              <!-- Arrow -->
              <svg
                class="w-5 h-5 text-slate-600 group-hover:text-accent group-hover:translate-x-1 transition-all duration-150 shrink-0"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <!-- Last accessed -->
            <p class="text-xs text-slate-500">
              <template v-if="space.last_accessed">
                Last accessed {{ formatTimeAgo(space.last_accessed) }}
              </template>
              <template v-else>
                Never accessed
              </template>
            </p>
          </div>
        </button>
      </div>
    </main>

    <!-- Create Space Modal -->
    <teleport to="body">
      <transition name="modal">
        <div
          v-if="showCreateModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCreateModal = false"></div>
          <div class="relative z-10 w-full max-w-md glass rounded-2xl p-6 animate-slide-in">
            <h3 class="text-lg font-semibold text-white mb-4">Create a new Space</h3>
            <form @submit.prevent="handleCreateSpace" class="space-y-4">
              <!-- Space Name -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1.5">Space name</label>
                <input
                  v-model="newSpace.name"
                  type="text"
                  required
                  placeholder="e.g. My Personal Space"
                  class="input-field w-full"
                />
              </div>
              <!-- Space Type -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    @click="newSpace.type = 'personal'"
                    class="p-3 rounded-lg border text-center transition-all duration-150"
                    :class="newSpace.type === 'personal'
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'"
                  >
                    <span class="text-2xl block mb-1">👤</span>
                    <span class="text-sm font-medium">Personal</span>
                  </button>
                  <button
                    type="button"
                    @click="newSpace.type = 'couple'"
                    class="p-3 rounded-lg border text-center transition-all duration-150"
                    :class="newSpace.type === 'couple'
                      ? 'border-couple bg-couple/10 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'"
                  >
                    <span class="text-2xl block mb-1">💑</span>
                    <span class="text-sm font-medium">Couple</span>
                  </button>
                </div>
              </div>
              <!-- Actions -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  class="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                  @click="showCreateModal = false"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="createLoading"
                  class="btn-primary flex-1 relative"
                >
                  <span :class="{ 'opacity-0': createLoading }">Create Space</span>
                  <div v-if="createLoading" class="absolute inset-0 flex items-center justify-center">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'
import type { SpaceType } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { spaces, isLoading, userName } = storeToRefs(authStore)

const showCreateModal = ref(false)
const createLoading = ref(false)

const newSpace = reactive({
  name: '',
  type: 'personal' as SpaceType,
})

const firstName = computed(() => {
  const name = userName.value
  return name.split(' ')[0] || name
})

onMounted(async () => {
  await authStore.fetchSpaces()
})

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function handleSelectSpace(spaceId: string, event: MouseEvent) {
  // Ripple effect
  const button = (event.currentTarget as HTMLElement)
  const rippleContainer = button.querySelector('.ripple-container')
  if (rippleContainer) {
    const rect = button.getBoundingClientRect()
    const ripple = document.createElement('div')
    const size = Math.max(rect.width, rect.height) * 2
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`
    ripple.className = 'ripple'
    rippleContainer.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  // Small delay for visual feedback
  await new Promise(r => setTimeout(r, 200))

  const result = await authStore.selectSpace(spaceId)
  if (result?.success) {
    toast.success('Space selected', 'Entering your space...')
    router.push({ name: 'Home' })
  } else {
    toast.error('Error', 'Failed to select space.')
  }
}

async function handleCreateSpace() {
  if (!newSpace.name.trim()) {
    toast.error('Error', 'Space name is required.')
    return
  }

  createLoading.value = true

  try {
    const userId = authStore.user?.id
    if (!userId) throw new Error('Not authenticated')

    // Create the space
    const { data: space, error: createError } = await supabase
      .from('spaces')
      .insert({
        name: newSpace.name.trim(),
        type: newSpace.type,
        owner_id: userId,
      })
      .select()
      .single()

    if (createError) throw createError

    // Add creator as owner in space_members
    const { error: memberError } = await supabase
      .from('space_members')
      .insert({
        space_id: space.id,
        user_id: userId,
        role: 'owner',
      })

    if (memberError) throw memberError

    toast.success('Space created!', `"${space.name}" is ready to use.`)
    showCreateModal.value = false
    newSpace.name = ''
    newSpace.type = 'personal'

    // Refresh spaces list
    await authStore.fetchSpaces()
  } catch (err: any) {
    toast.error('Failed to create space', err?.message || 'Please try again.')
  } finally {
    createLoading.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.space-card {
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
  border: 1px solid transparent;
}

.space-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(148, 163, 184, 0.15);
}

.space-card:active {
  transform: scale(0.98);
}

/* Ripple effect */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(6, 182, 212, 0.2);
  transform: scale(0);
  animation: rippleEffect 0.6s ease-out;
  pointer-events: none;
}

@keyframes rippleEffect {
  to {
    transform: scale(1);
    opacity: 0;
  }
}

/* Modal transitions */
.modal-enter-active {
  transition: opacity 0.25s ease;
}
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
