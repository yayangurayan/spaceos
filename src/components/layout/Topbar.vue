<template>
  <header
    class="sticky top-0 z-30 h-14 border-b flex items-center justify-between px-4 lg:px-6 shrink-0 transition-colors duration-200"
    :class="'dark:bg-dark-surface/95 bg-light-surface/95 dark:border-white/[0.08] border-slate-200'"
  >
    <!-- Left: Hamburger / Toggle + Space indicator -->
    <div class="flex items-center gap-3">
      <!-- Mobile Hamburger -->
      <button
        type="button"
        class="lg:hidden w-10 h-10 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors flex items-center justify-center shrink-0"
        @click="$emit('toggle-mobile-sidebar')"
        aria-label="Toggle mobile menu"
      >
        <Icon name="menu" :size="20" />
      </button>

      <!-- Desktop Sidebar Toggle -->
      <button
        type="button"
        class="hidden lg:flex w-9 h-9 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors items-center justify-center shrink-0"
        @click="$emit('toggle-sidebar')"
        :title="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <Icon name="menu" :size="18" />
      </button>

      <!-- Current Space Badge (Desktop) -->
      <div v-if="currentSpace" class="hidden sm:flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg border dark:border-white/10 border-slate-200 dark:bg-dark-elevated bg-slate-100 flex items-center justify-center shrink-0 text-sky-500 dark:text-sky-400">
          <Icon :name="getSpaceIcon(currentSpace)" :size="15" />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold dark:text-white text-slate-900 leading-tight flex items-center gap-1.5">
            <span class="truncate max-w-[180px]">{{ currentSpace.name }}</span>
            <span
              class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase shrink-0"
              :class="getSpaceBadgeClass(currentSpace)"
            >
              {{ getSpaceLabel(currentSpace) }}
            </span>
          </p>
        </div>
      </div>

      <!-- Current Space Badge (Mobile) -->
      <div v-if="currentSpace" class="sm:hidden flex items-center gap-1.5 min-w-0 max-w-[120px] xs:max-w-[150px]">
        <Icon :name="getSpaceIcon(currentSpace)" :size="15" class="text-sky-500 dark:text-sky-400 shrink-0" />
        <span class="text-xs font-semibold dark:text-white text-slate-900 truncate">{{ currentSpace.name }}</span>
      </div>
    </div>

    <!-- Right: Quick Actions + Theme Switcher + Space Switcher -->
    <div class="flex items-center gap-1 sm:gap-2">
      <!-- Command Palette Trigger Button (Ctrl+K) -->
      <button
        type="button"
        @click="$emit('open-command-palette')"
        class="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
        title="Buka Command Palette (Ctrl+K)"
      >
        <Icon name="search" :size="13" />
        <span class="text-xs font-normal">Cari / Perintah...</span>
        <kbd class="ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">Ctrl K</kbd>
      </button>

      <!-- Mobile Search Button -->
      <button
        type="button"
        @click="$emit('open-command-palette')"
        class="md:hidden w-10 h-10 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors flex items-center justify-center shrink-0"
        title="Cari (Ctrl+K)"
      >
        <Icon name="search" :size="16" />
      </button>

      <!-- Theme Switcher -->
      <button
        type="button"
        @click="toggleTheme"
        class="w-10 h-10 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors flex items-center justify-center shrink-0"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <Icon :name="isDark ? 'sun' : 'moon'" :size="17" />
      </button>

      <!-- Language Switcher Pill -->
      <button
        type="button"
        @click="toggleLang"
        class="h-9 px-2.5 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border dark:border-white/10 border-slate-200 transition-colors flex items-center justify-center shrink-0"
        :title="currentLang === 'id' ? t('switch_to_de') : t('switch_to_id')"
      >
        {{ currentLang.toUpperCase() }}
      </button>

      <!-- Space Switcher & User Profile Dropdown -->
      <div class="relative shrink-0" ref="dropdownRef">
        <button
          type="button"
          @click="isDropdownOpen = !isDropdownOpen"
          class="h-10 flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-1.5 sm:pr-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors"
        >
          <!-- User Initials Avatar -->
          <div class="w-6 h-6 rounded-md bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[11px] font-mono font-bold border border-sky-500/30 shrink-0">
            {{ userInitials }}
          </div>
          <span class="hidden md:block text-xs font-medium dark:text-slate-200 text-slate-700 max-w-[120px] truncate">
            {{ userName }}
          </span>
          <Icon name="chevron-down" :size="13" class="text-slate-400 transition-transform duration-150" :class="{ 'rotate-180': isDropdownOpen }" />
        </button>

        <!-- Dropdown Menu -->
        <transition name="dropdown">
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 top-full mt-1.5 w-[calc(100vw-2rem)] sm:w-72 max-w-sm rounded-xl shadow-lg border z-50 overflow-hidden dark:bg-dark-elevated bg-white dark:border-white/[0.1] border-slate-200"
          >
            <!-- User Header -->
            <div class="px-3.5 py-3 border-b dark:border-white/[0.08] border-slate-100 flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-mono font-bold border border-sky-500/30 shrink-0">
                {{ userInitials }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold dark:text-white text-slate-900 truncate">{{ userName }}</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{{ userEmail }}</p>
              </div>
            </div>

            <!-- Spaces List -->
            <div class="p-1.5 space-y-0.5 max-h-60 overflow-y-auto">
              <p class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {{ t('select_workspace') }}
              </p>

              <button
                v-for="space in spaces"
                :key="space.id"
                @click="handleSwitchSpace(space.id)"
                class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors"
                :class="currentSpace?.id === space.id
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'"
              >
                <Icon :name="getSpaceIcon(space)" :size="15" class="shrink-0 text-slate-400 dark:text-slate-500" />
                <div class="flex-1 min-w-0">
                  <p class="truncate leading-tight">{{ space.name }}</p>
                  <p class="text-[10px] text-slate-400 capitalize">{{ getSpaceLabel(space) }}</p>
                </div>
                <span
                  v-if="currentSpace?.id === space.id"
                  class="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 shrink-0"
                ></span>
              </button>
            </div>

            <!-- Switch all & Settings -->
            <div class="border-t dark:border-white/[0.08] border-slate-100 p-1.5 space-y-0.5">
              <button
                type="button"
                @click="handleSwitchAll"
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
              >
                <Icon name="switch" :size="14" />
                <span>{{ t('switch_space') }}</span>
              </button>

              <router-link
                to="/settings"
                @click="isDropdownOpen = false"
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
              >
                <Icon name="settings" :size="14" />
                <span>{{ t('settings_reset') }}</span>
              </router-link>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import Icon from '@/components/ui/Icon.vue'
import { useI18n } from '@/composables/useI18n'
import { useTheme } from '@/composables/useTheme'

withDefaults(defineProps<{
  isSidebarCollapsed?: boolean
}>(), {
  isSidebarCollapsed: false,
})

defineEmits<{
  'toggle-sidebar': []
  'toggle-mobile-sidebar': []
  'open-command-palette': []
}>()

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { currentLang, toggleLang, t } = useI18n()
const { isDark, toggleTheme } = useTheme()
const { currentSpace, spaces, user } = storeToRefs(authStore)

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const userName = computed(() => user.value?.full_name || user.value?.email?.split('@')[0] || 'Pengguna')
const userEmail = computed(() => user.value?.email || '')
const userInitials = computed(() => {
  const name = userName.value
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
})

function getSpaceIcon(space: any): string {
  if (space.type === 'couple') return 'heart'
  if (space.category === 'teacher') return 'graduation-cap'
  if (space.category === 'personal' || space.category === 'private') return 'user'
  return 'trending-up'
}

function getSpaceLabel(space: any): string {
  if (space.type === 'couple') return t('couple_space') || 'Couple'
  if (space.category === 'teacher') return t('teacher_space') || 'Teacher'
  if (space.category === 'personal' || space.category === 'private') return t('personal_space') || 'Personal'
  return t('trading_space') || 'Trading'
}

function getSpaceBadgeClass(space: any): string {
  if (space.type === 'couple') return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20'
  if (space.category === 'teacher') return 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20'
  if (space.category === 'personal' || space.category === 'private') return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20'
  return 'bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20'
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isDropdownOpen.value) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

async function handleSwitchSpace(spaceId: string) {
  if (spaceId === currentSpace.value?.id) {
    isDropdownOpen.value = false
    return
  }

  const result = await authStore.selectSpace(spaceId)
  if (result?.success) {
    toast.success('Workspace Berganti', 'Menampilkan data ruang kerja yang dipilih.')
    isDropdownOpen.value = false
    router.push('/')
  }
}

function handleSwitchAll() {
  isDropdownOpen.value = false
  router.push({ name: 'SpaceSelector' })
}
</script>

<style scoped>
.dropdown-enter-active {
  transition: opacity 0.15s cubic-bezier(0.2, 0, 0, 1), transform 0.15s cubic-bezier(0.2, 0, 0, 1);
}
.dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.97) translateY(-4px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(-2px);
}
</style>
