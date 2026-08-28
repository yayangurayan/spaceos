<template>
  <header class="sticky top-0 z-30 h-16 glass border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-6 shrink-0 backdrop-blur-xl bg-slate-950/70">
    <!-- Left: Hamburger + Space name -->
    <div class="flex items-center gap-3">
      <!-- Mobile Hamburger -->
      <button
        class="lg:hidden p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all hover:scale-105"
        @click="$emit('toggle-mobile-sidebar')"
      >
        <Icon name="menu" :size="20" />
      </button>

      <!-- Desktop Sidebar Toggle -->
      <button
        class="hidden lg:flex p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all hover:scale-105"
        @click="$emit('toggle-sidebar')"
      >
        <Icon name="menu" :size="20" />
      </button>

      <!-- Current Space Badge -->
      <div v-if="currentSpace" class="hidden sm:flex items-center gap-2.5">
        <span class="text-xl p-1.5 rounded-xl bg-slate-800 border border-slate-700 shadow-sm">
          {{ currentSpace.type === 'couple' ? '💑' : currentSpace.category === 'teacher' ? '🎓' : '📈' }}
        </span>
        <div>
          <p class="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
            <span>{{ currentSpace.name }}</span>
            <span
              class="text-[10px] font-extrabold px-2 py-0.2 rounded-full uppercase tracking-wider"
              :class="currentSpace.type === 'couple' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : currentSpace.category === 'teacher' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'"
            >
              {{ currentSpace.type === 'couple' ? t('couple_space') : currentSpace.category === 'teacher' ? t('teacher_space') : t('trader_space') }}
            </span>
          </p>
          <p class="text-[11px] text-slate-400 leading-tight">
            {{ currentSpace.type === 'couple' ? t('romantic_shared_hub') : currentSpace.category === 'teacher' ? t('bimbingan_belajar') : t('trading_habit') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Right: Quick Actions + Theme Switcher + Avatar + Space Switcher -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Language Toggle Button -->
      <button
        type="button"
        @click="toggleLang"
        class="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-all hover:scale-105 flex items-center justify-center"
        :title="currentLang === 'id' ? t('switch_to_de') : t('switch_to_id')"
      >
        <span class="text-sm font-bold">{{ currentLang === 'id' ? '🇮🇩' : '🇩🇪' }}</span>
      </button>

      <!-- Space Switcher Dropdown -->
      <div class="relative" ref="dropdownRef">
        <button
          @click="isDropdownOpen = !isDropdownOpen"
          class="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all hover:scale-102"
        >
          <!-- Avatar -->
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold ring-2 ring-slate-700/50 shadow-md">
            {{ userInitials }}
          </div>
          <div class="hidden xl:block text-left text-xs">
            <span class="font-bold text-white block leading-none">{{ userName }}</span>
            <span class="text-[10px] text-slate-400 leading-none">{{ t('user_title') }}</span>
          </div>
          <Icon name="chevron-down" :size="14" class="text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }" />
        </button>

        <!-- Dropdown Menu -->
        <transition name="dropdown">
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 top-full mt-2 w-80 glass rounded-2xl shadow-2xl shadow-black/60 border border-slate-700/80 overflow-hidden z-50 bg-slate-900/95 backdrop-blur-xl"
          >
            <!-- User Info -->
            <div class="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {{ userInitials }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-white truncate">{{ userName }}</p>
                <p class="text-xs text-slate-400 truncate font-mono">{{ userEmail }}</p>
              </div>
            </div>

            <!-- Spaces List -->
            <div class="p-2 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              <p class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ t('select_workspace') }}</p>
              
              <button
                v-for="space in spaces"
                :key="space.id"
                @click="handleSwitchSpace(space.id)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                :class="currentSpace?.id === space.id ? 'bg-cyan-500/15 border border-cyan-500/30 text-white font-bold' : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'"
              >
                <span class="text-xl shrink-0">{{ space.type === 'couple' ? '💑' : space.category === 'teacher' ? '🎓' : '📈' }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-white truncate">{{ space.name }}</p>
                  <p class="text-[10px] text-slate-400 capitalize">{{ space.type === 'couple' ? t('couple_space') : space.category === 'teacher' ? t('teacher_space') : t('trader_space') }}</p>
                </div>
                <span
                  v-if="currentSpace?.id === space.id"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0"
                >
                  {{ t('active') }}
                </span>
              </button>
            </div>

            <!-- Actions -->
            <div class="border-t border-slate-800 p-2 space-y-1">
              <button
                @click="handleSwitchAll"
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Icon name="switch" :size="15" />
                <span>{{ t('switch_space') }}</span>
              </button>

              <router-link
                to="/settings"
                @click="isDropdownOpen = false"
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <span>⚙️</span>
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

defineEmits<{
  'toggle-sidebar': []
  'toggle-mobile-sidebar': []
}>()

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { currentLang, toggleLang, t } = useI18n()
const { currentSpace, spaces, user } = storeToRefs(authStore)

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const userName = computed(() => user.value?.full_name || user.value?.email || 'Alex Morgan')
const userEmail = computed(() => user.value?.email || 'alex.morgan@spaceos.app')
const userInitials = computed(() => {
  const name = userName.value
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
})

// Close dropdown on outside click
function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

async function handleSwitchSpace(spaceId: string) {
  if (spaceId === currentSpace.value?.id) {
    isDropdownOpen.value = false
    return
  }

  const result = await authStore.selectSpace(spaceId)
  if (result?.success) {
    toast.success('Space Berganti ✨', 'Menampilkan data ruang kerja yang dipilih.')
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
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-6px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-6px);
}
</style>
