<template>
  <div class="min-h-screen bg-dark relative overflow-hidden">
    <!-- Premium Aurora Background -->
    <AuroraBackground variant="default" />

    <!-- Interactive Canvas Particles -->
    <ParticleCanvas
      :count="40"
      :hue="190"
      :hue2="250"
      :link-distance="120"
      :speed="0.25"
      :opacity="0.4"
      :interactive="true"
      :size-range="[1, 3]"
    />
    <!-- Header -->
    <header class="border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-2xl relative z-[2]">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg overflow-hidden shadow-md shrink-0">
            <img src="/icons/spaceos-icon-192.webp" alt="SpaceOS" class="w-full h-full object-cover" />
          </div>
          <span class="text-lg font-semibold text-white tracking-tight">SpaceOS</span>
        </div>
        <div class="flex items-center gap-3">
          <!-- Language Toggle Button -->
          <button
            type="button"
            @click="toggleLang"
            class="px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-all hover:scale-105 flex items-center gap-1.5 text-xs font-semibold"
            :title="currentLang === 'id' ? t('switch_to_de') : t('switch_to_id')"
          >
            <span class="text-sm font-bold">{{ currentLang === 'id' ? '🇮🇩' : '🇩🇪' }}</span>
            <span class="hidden sm:inline">{{ currentLang === 'id' ? 'ID' : 'DE' }}</span>
          </button>

          <span class="text-sm text-slate-400 hidden sm:block">{{ userName }}</span>
          <button
            @click="handleLogout"
            class="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ t('sign_out') }}
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-5xl mx-auto px-6 py-10 relative z-[2]">
      <!-- Greeting -->
      <div class="mb-8 animate-fade-in">
        <h1 class="text-3xl font-bold text-white mb-2">
          {{ t('welcome_back') }}, <span class="text-gradient">{{ firstName }}!</span>
        </h1>
        <p class="text-slate-400">{{ t('select_or_create_space') }}</p>
      </div>

      <!-- Actions Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 animate-slide-in">
        <p class="text-sm text-slate-400">
          {{ t('active_spaces_available', { count: spaces.length }) }}
        </p>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            @click="showCreateModal = true"
            class="btn-primary flex items-center gap-2 text-xs sm:text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ t('create_new_space') }}</span>
          </button>
        </div>
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
        <h3 class="text-lg font-semibold text-white mb-2">{{ t('no_spaces_yet') }}</h3>
        <p class="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
          {{ t('no_spaces_desc') }}
        </p>
        <button
          @click="showCreateModal = true"
          class="btn-primary inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('create_first_space') }}
        </button>
      </div>

      <!-- Spaces Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(space, index) in spaces"
          :key="space.id"
          class="space-card glass rounded-xl p-6 sm:p-7 text-left group relative overflow-hidden animate-slide-in cursor-pointer"
          :style="{ animationDelay: `${index * 100}ms`, opacity: 0 }"
          @click="handleSelectSpace(space.id, $event)"
        >
          <!-- Ripple container -->
          <div class="ripple-container absolute inset-0 pointer-events-none overflow-hidden rounded-xl"></div>

          <!-- Content -->
          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-4">
              <!-- Space Icon -->
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 shadow-md"
                :class="space.category === 'private' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : (space.category === 'teacher' || space.id === 'space-teacher') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'"
              >
                {{ space.category === 'private' ? '🔒' : (space.category === 'teacher' || space.id === 'space-teacher') ? '🎓' : '📈' }}
              </div>
              <!-- Space Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-semibold truncate group-hover:text-accent transition-colors duration-150">
                  {{ space.name }}
                </h3>
                <span
                  class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="space.category === 'private'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : (space.category === 'teacher' || space.id === 'space-teacher')
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'"
                >
                  {{ space.category === 'private' ? t('private_space') : (space.category === 'teacher' || space.id === 'space-teacher') ? t('personal_teacher') : t('personal_trader') }}
                </span>
              </div>
              
              <!-- Delete Button -->
              <button
                type="button"
                @click.stop="promptDeleteSpace(space)"
                class="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-60 hover:opacity-100"
                :title="t('delete_space')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <!-- Last accessed -->
            <p class="text-xs text-slate-500">
              <template v-if="space.last_accessed">
                {{ t('last_accessed', { time: formatTimeAgo(space.last_accessed) }) }}
              </template>
              <template v-else>
                {{ t('never_accessed') }}
              </template>
            </p>
          </div>
        </div>
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
            <h3 class="text-lg font-semibold text-white mb-4">{{ t('create_space_title') }}</h3>
            <form @submit.prevent="handleCreateSpace" class="space-y-4">
              <!-- Space Name -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1.5">{{ t('space_name') }}</label>
                <input
                  v-model="newSpace.name"
                  type="text"
                  required
                  :placeholder="t('space_name_placeholder')"
                  class="input-field w-full"
                />
              </div>
              <!-- Space Category / Template -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1.5">{{ t('choose_category_type') }}</label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <!-- Option 1: Trading & Habits -->
                  <button
                    type="button"
                    @click="setSpaceTemplate('personal', 'trader', '📈', 'My Trading Space')"
                    class="p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between hover:scale-[1.02]"
                    :class="newSpace.category === 'trader' && newSpace.type === 'personal'
                      ? 'border-cyan-500 bg-cyan-500/15 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'"
                  >
                    <span class="text-3xl mb-2 block">📈</span>
                    <div>
                      <span class="text-sm font-bold text-white block">{{ t('trading_hub_title') }}</span>
                      <span class="text-xs text-slate-400 leading-tight">{{ t('trading_hub_desc') }}</span>
                    </div>
                  </button>

                  <!-- Option 2: Guru Les & Bimbel -->
                  <button
                    type="button"
                    @click="setSpaceTemplate('personal', 'teacher', '🎓', 'Bimbingan Belajar')"
                    class="p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between hover:scale-[1.02]"
                    :class="newSpace.category === 'teacher' && newSpace.type === 'personal'
                      ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'"
                  >
                    <span class="text-3xl mb-2 block">🎓</span>
                    <div>
                      <span class="text-sm font-bold text-white block">{{ t('teacher_hub_title') }}</span>
                      <span class="text-xs text-slate-400 leading-tight">{{ t('teacher_hub_desc') }}</span>
                    </div>
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
                  {{ t('cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="createLoading"
                  class="btn-primary flex-1 relative"
                >
                  <span :class="{ 'opacity-0': createLoading }">{{ t('create_space_btn') }}</span>
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

    <!-- Delete Space Confirmation Modal -->
    <teleport to="body">
      <transition name="modal">
        <div
          v-if="spaceToDelete"
          class="fixed inset-0 z-[110] flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="spaceToDelete = null"></div>
          <div class="relative z-10 w-full max-w-md glass rounded-3xl p-6 sm:p-8 border border-rose-500/50 shadow-2xl space-y-5 bg-slate-950/95 animate-slide-in">
            <div class="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mx-auto shadow-lg">
              🗑️
            </div>

            <div class="text-center space-y-1.5">
              <h3 class="text-lg font-extrabold text-white">
                {{ t('delete_space_confirm_title') }}
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                {{ t('delete_space_confirm_desc', { name: spaceToDelete.name }) }}
              </p>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="spaceToDelete = null"
                class="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {{ t('cancel') }}
              </button>

              <button
                type="button"
                @click="confirmDeleteSpace"
                class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all"
              >
                {{ t('yes_delete_space') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'
import { supabase } from '@/utils/supabase'
import type { SpaceType, SpaceCategory, SpaceWithMeta } from '@/types'
import ParticleCanvas from '@/components/ui/ParticleCanvas.vue'
import AuroraBackground from '@/components/ui/AuroraBackground.vue'

const router = useRouter()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const route = useRoute()
const authStore = useAuthStore()
const toast = useToastStore()
const { t, currentLang, toggleLang } = useI18n()
const { spaces, isLoading, userName } = storeToRefs(authStore)

const showCreateModal = ref(false)
const createLoading = ref(false)
const spaceToDelete = ref<SpaceWithMeta | null>(null)

const newSpace = reactive({
  name: 'My Trading Space',
  type: 'personal' as SpaceType,
  category: 'trader' as SpaceCategory,
  icon: '📈',
})

function setSpaceTemplate(type: SpaceType, category: SpaceCategory, icon: string, defaultName: string) {
  newSpace.type = type
  newSpace.category = category
  newSpace.icon = icon
  if (!newSpace.name || newSpace.name === 'My Trading Space' || newSpace.name === 'Bimbingan Belajar') {
    newSpace.name = defaultName
  }
}

const firstName = computed(() => {
  const name = userName.value
  return name.split(' ')[0] || name
})

onMounted(async () => {
  await authStore.fetchSpaces()
  // Join code feature removed - Couple Space deprecated
})

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return t('just_now')
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString(currentLang.value === 'de' ? 'de-DE' : 'id-ID', { month: 'short', day: 'numeric' })
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
  await new Promise(r => setTimeout(r, 150))

  const result = await authStore.selectSpace(spaceId)
  if (result?.success) {
    toast.success(t('entering_space'), t('opening_space_desc'))
    router.push('/')
  } else {
    toast.error(t('error_title'), t('select_space_failed'))
  }
}

function promptDeleteSpace(space: SpaceWithMeta) {
  if (spaces.value.length <= 1) {
    toast.warning(t('cannot_delete_last_space'), t('cannot_delete_last_space_desc'))
    return
  }
  spaceToDelete.value = space
}

async function confirmDeleteSpace() {
  if (!spaceToDelete.value) return
  const target = spaceToDelete.value
  const res = await authStore.deleteSpace(target.id)
  spaceToDelete.value = null
  if (res.success) {
    toast.success(t('delete_space_success'), t('delete_space_success_desc', { name: target.name }))
  } else {
    const errMsg = res.error === 'cannot_delete_last_space'
      ? t('cannot_delete_last_space')
      : (res.error || t('try_again'))
    toast.error(t('delete_space_failed') || 'Gagal menghapus space', errMsg)
  }
}

async function handleCreateSpace() {
  if (!newSpace.name.trim()) {
    toast.error(t('error_title'), t('space_name_required'))
    return
  }

  createLoading.value = true

  try {
    const userId = authStore.user?.id || 'demo-user'

    // Use proper UUID for Supabase-compatible ID when authenticated
    const isRealUser = authStore.user && !authStore.user.id.startsWith('demo-user')
    const newSpaceId = isRealUser
      ? crypto.randomUUID()
      : 'space-' + Date.now()

    const createdSpace: SpaceWithMeta = {
      id: newSpaceId,
      name: newSpace.name.trim(),
      type: newSpace.type,
      category: newSpace.category,
      icon: newSpace.icon,
      owner_id: userId,
      role: 'owner',
      last_accessed: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as SpaceWithMeta

    // 1. Initialize 100% EMPTY arrays for all modules in this new space
    localStorage.setItem(`spaceos_trades_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_tx_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_bg_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_habits_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_books_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_events_${newSpaceId}`, JSON.stringify([]))
    // Mark all modules as "already seeded" so composables never auto-populate demo data
    localStorage.setItem(`spaceos_trades_seeded_${newSpaceId}`, 'true')
    localStorage.setItem(`spaceos_finance_seeded_${newSpaceId}`, 'true')
    localStorage.setItem(`spaceos_habits_seeded_${newSpaceId}`, 'true')
    localStorage.setItem(`spaceos_books_seeded_${newSpaceId}`, 'true')
    localStorage.setItem(`spaceos_events_seeded_${newSpaceId}`, 'true')
    localStorage.setItem(`spaceos_teacher_seeded_${newSpaceId}`, 'true')

    // 2. Add to spaces list
    spaces.value.unshift(createdSpace)
    localStorage.setItem('spaceos_spaces', JSON.stringify(spaces.value))

    // 3. Optional online sync
    if (authStore.user && !authStore.user.id.startsWith('demo-user')) {
      const payload: Record<string, any> = {
        id: createdSpace.id,
        name: createdSpace.name,
        type: createdSpace.type,
        category: createdSpace.category,
        icon: createdSpace.icon,
        owner_id: userId,
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: insertedSpace, error: insertError } = await supabase
          .from('spaces')
          .insert(payload)
          .single()
      if (insertError) {
        const pending = JSON.parse(localStorage.getItem('spaceos_pending_spaces') || '[]') as SpaceWithMeta[]
        localStorage.setItem('spaceos_pending_spaces', JSON.stringify([createdSpace, ...pending]))
      } else {
        // Explicitly ensure space_members has owner record
        try {
          await supabase
            .from('space_members')
            .upsert({
              space_id: createdSpace.id,
              user_id: userId,
              role: 'owner',
            }, { onConflict: 'space_id,user_id' })
        } catch {}

        // Explicitly ensure profiles has owner record
        if (authStore.user) {
          try {
            await supabase
              .from('profiles')
              .upsert({
                id: userId,
                email: authStore.user.email || '',
                full_name: authStore.user.full_name || '',
                avatar_url: authStore.user.avatar_url || null,
              }, { onConflict: 'id' })
          } catch {}
        }

        const pending = (JSON.parse(localStorage.getItem('spaceos_pending_spaces') || '[]') as SpaceWithMeta[]).filter(space => space.id !== createdSpace.id)
        localStorage.setItem('spaceos_pending_spaces', JSON.stringify(pending))
      }

    }

    toast.success(t('space_created_success'), t('space_created_ready', { name: createdSpace.name }))
    showCreateModal.value = false
    newSpace.name = 'My Trading Space'
    newSpace.type = 'personal'
    newSpace.category = 'trader'
    newSpace.icon = '📈'

    // Automatically enter the new empty space
    await authStore.selectSpace(createdSpace.id)
    router.push('/')
  } catch (err: any) {
    toast.error(t('create_space_failed'), err?.message || t('try_again'))
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
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.4s ease;
  border: 1px solid rgba(148, 163, 184, 0.08);
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  position: relative;
}

.space-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 0.85rem;
  padding: 1px;
  background: linear-gradient(135deg, transparent, rgba(6, 182, 212, 0.15), transparent, rgba(99, 102, 241, 0.15), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.space-card:hover::before {
  opacity: 1;
}

.space-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(6, 182, 212, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-color: rgba(148, 163, 184, 0.12);
}

.space-card:active {
  transform: translateY(-1px) scale(0.99);
  transition-duration: 0.15s;
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

