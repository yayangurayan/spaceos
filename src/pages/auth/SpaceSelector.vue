<template>
  <div class="min-h-screen bg-dark">
    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-md">
            <span class="text-white font-bold text-sm">S</span>
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
    <main class="max-w-5xl mx-auto px-6 py-10">
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
            @click="showJoinModal = true"
            class="px-4 py-2.5 rounded-xl border border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all hover:scale-102"
          >
            <span>🔑</span>
            <span>{{ t('join_couple_space') }}</span>
          </button>

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
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(space, index) in spaces"
          :key="space.id"
          class="space-card glass rounded-xl p-6 text-left group relative overflow-hidden animate-slide-in cursor-pointer"
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
                class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-150 group-hover:scale-110 shadow-md"
                :class="space.type === 'couple' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : (space.category === 'teacher' || space.id === 'space-teacher') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'"
              >
                {{ space.type === 'couple' ? '💑' : (space.category === 'teacher' || space.id === 'space-teacher') ? '🎓' : '📈' }}
              </div>
              <!-- Space Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-semibold truncate group-hover:text-accent transition-colors duration-150">
                  {{ space.name }}
                </h3>
                <span
                  class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="space.type === 'couple'
                    ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                    : (space.category === 'teacher' || space.id === 'space-teacher')
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'"
                >
                  {{ space.type === 'couple' ? t('couple_space') : (space.category === 'teacher' || space.id === 'space-teacher') ? t('personal_teacher') : t('personal_trader') }}
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
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <!-- Option 1: Trading & Habits -->
                  <button
                    type="button"
                    @click="setSpaceTemplate('personal', 'trader', '📈', 'My Trading Space')"
                    class="p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between"
                    :class="newSpace.category === 'trader' && newSpace.type === 'personal'
                      ? 'border-cyan-500 bg-cyan-500/15 text-white shadow-lg shadow-cyan-500/10 scale-102 ring-1 ring-cyan-500'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'"
                  >
                    <span class="text-2xl mb-1 block">📈</span>
                    <div>
                      <span class="text-xs font-bold text-white block">{{ t('trading_hub_title') }}</span>
                      <span class="text-[10px] text-slate-400 leading-tight">{{ t('trading_hub_desc') }}</span>
                    </div>
                  </button>

                  <!-- Option 2: Guru Les & Bimbel -->
                  <button
                    type="button"
                    @click="setSpaceTemplate('personal', 'teacher', '🎓', 'Bimbingan Belajar')"
                    class="p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between"
                    :class="newSpace.category === 'teacher' && newSpace.type === 'personal'
                      ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-lg shadow-indigo-500/10 scale-102 ring-1 ring-indigo-500'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'"
                  >
                    <span class="text-2xl mb-1 block">🎓</span>
                    <div>
                      <span class="text-xs font-bold text-white block">{{ t('teacher_hub_title') }}</span>
                      <span class="text-[10px] text-slate-400 leading-tight">{{ t('teacher_hub_desc') }}</span>
                    </div>
                  </button>

                  <!-- Option 3: Couple Space -->
                  <button
                    type="button"
                    @click="setSpaceTemplate('couple', 'general', '💑', 'Our Romantic Space 💕')"
                    class="p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between"
                    :class="newSpace.type === 'couple'
                      ? 'border-pink-500 bg-pink-500/15 text-white shadow-lg shadow-pink-500/10 scale-102 ring-1 ring-pink-500'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'"
                  >
                    <span class="text-2xl mb-1 block">💑</span>
                    <div>
                      <span class="text-xs font-bold text-white block">{{ t('couple_space_title') }}</span>
                      <span class="text-[10px] text-slate-400 leading-tight">{{ t('couple_space_desc') }}</span>
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

    <!-- Join Couple Space Modal -->
    <teleport to="body">
      <transition name="modal">
        <div
          v-if="showJoinModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showJoinModal = false"></div>
          <div class="relative z-10 w-full max-w-md glass rounded-3xl p-6 sm:p-8 border border-pink-500/40 bg-slate-950/95 animate-slide-in space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center text-2xl mx-auto shadow-md">
              🔑
            </div>

            <div class="text-center space-y-1">
              <h3 class="text-lg font-extrabold text-white">{{ t('join_space_title') }}</h3>
              <p class="text-xs text-slate-400">
                {{ t('join_space_desc') }}
              </p>
            </div>

            <form @submit.prevent="handleJoinSpace" class="space-y-4 pt-2">
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-slate-300">{{ t('invite_code_label') }}</label>
                <input
                  v-model="inviteCodeInput"
                  type="text"
                  required
                  :placeholder="t('invite_code_placeholder')"
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase tracking-wider focus:outline-none focus:border-pink-500 text-center"
                />
              </div>

              <div class="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-200 text-center">
                💡 <em>{{ t('join_space_info') }}</em>
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  @click="showJoinModal = false"
                  class="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  {{ t('cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="joinLoading"
                  class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition-all"
                >
                  <span v-if="!joinLoading">{{ t('join_now') }}</span>
                  <span v-else>{{ t('processing') }}</span>
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
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'
import { supabase } from '@/utils/supabase'
import type { SpaceType, SpaceCategory, SpaceWithMeta } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { t, currentLang, toggleLang } = useI18n()
const { spaces, isLoading, userName } = storeToRefs(authStore)

const showCreateModal = ref(false)
const createLoading = ref(false)
const showJoinModal = ref(false)
const joinLoading = ref(false)
const inviteCodeInput = ref('')
const spaceToDelete = ref<SpaceWithMeta | null>(null)

async function handleJoinSpace() {
  if (!inviteCodeInput.value.trim()) return
  joinLoading.value = true
  const res = await authStore.joinSpaceWithInviteCode(inviteCodeInput.value.trim())
  joinLoading.value = false
  if (res.success) {
    toast.success(t('join_success_title'), t('join_success_desc', { name: res.space?.name || '' }))
    showJoinModal.value = false
    router.push('/')
  } else {
    toast.error(t('join_failed_title'), res.error || t('invalid_invite_code'))
  }
}

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
  if (!newSpace.name || newSpace.name === 'My Trading Space' || newSpace.name === 'Bimbingan Belajar' || newSpace.name === 'Our Romantic Space 💕') {
    newSpace.name = defaultName
  }
}

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

  if (minutes < 1) return t('just_now')
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
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
    toast.error('Error', 'Gagal memilih space.')
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
    toast.error('Gagal menghapus space', res.error || 'Terjadi kesalahan.')
  }
}

async function handleCreateSpace() {
  if (!newSpace.name.trim()) {
    toast.error('Error', 'Nama space harus diisi.')
    return
  }

  createLoading.value = true

  try {
    const userId = authStore.user?.id || 'demo-user'
    const newSpaceId = 'space-' + Date.now()

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
    }

    // 1. Initialize 100% EMPTY arrays for all modules in this new space
    localStorage.setItem(`spaceos_trades_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_tx_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_bg_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_students_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_lessons_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_plans_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_mats_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_pays_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_couple_albums_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_couple_photos_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_couple_journals_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_couple_events_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_couple_notes_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_habits_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_books_${newSpaceId}`, JSON.stringify([]))
    localStorage.setItem(`spaceos_events_${newSpaceId}`, JSON.stringify([]))

    // 2. Add to spaces list
    spaces.value.unshift(createdSpace)
    localStorage.setItem('spaceos_spaces', JSON.stringify(spaces.value))

    // 3. Optional online sync
    if (authStore.user && authStore.user.id !== 'demo-user-123') {
      try {
        await supabase
          .from('spaces')
          .insert({
            id: createdSpace.id,
            name: createdSpace.name,
            type: createdSpace.type,
            category: createdSpace.category,
            icon: createdSpace.icon,
            owner_id: userId,
          })
      } catch (err) {
        console.warn('Supabase space sync note:', err)
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
    toast.error('Gagal membuat space', err?.message || 'Silakan coba lagi.')
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
