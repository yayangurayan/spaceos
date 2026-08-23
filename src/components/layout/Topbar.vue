<template>
  <header class="sticky top-0 z-30 h-16 glass border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-6 shrink-0">
    <!-- Left: Hamburger + Space name -->
    <div class="flex items-center gap-3">
      <!-- Mobile Hamburger -->
      <button
        class="lg:hidden p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        @click="$emit('toggle-mobile-sidebar')"
      >
        <Icon name="menu" :size="20" />
      </button>

      <!-- Desktop Sidebar Toggle -->
      <button
        class="hidden lg:flex p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        @click="$emit('toggle-sidebar')"
      >
        <Icon name="menu" :size="20" />
      </button>

      <!-- Current Space -->
      <div v-if="currentSpace" class="hidden sm:block">
        <p class="text-sm font-medium text-white leading-tight">{{ currentSpace.name }}</p>
        <p class="text-[11px] text-slate-500 leading-tight capitalize">{{ currentSpace.type }} space</p>
      </div>
    </div>

    <!-- Right: Avatar + Space Switcher -->
    <div class="flex items-center gap-3">
      <span class="text-xs text-slate-500 hidden md:block">v0.1</span>

      <!-- Space Switcher Dropdown -->
      <div class="relative" ref="dropdownRef">
        <button
          @click="isDropdownOpen = !isDropdownOpen"
          class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-700/50 transition-colors"
        >
          <!-- Avatar -->
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-700/50">
            {{ userInitials }}
          </div>
          <Icon name="chevron-down" :size="14" class="text-slate-500 transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }" />
        </button>

        <!-- Dropdown Menu -->
        <transition name="dropdown">
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 top-full mt-2 w-72 glass rounded-xl shadow-2xl shadow-black/30 border border-slate-700/50 overflow-hidden"
          >
            <!-- User Info -->
            <div class="px-4 py-3 border-b border-slate-700/50">
              <p class="text-sm font-medium text-white truncate">{{ userName }}</p>
              <p class="text-xs text-slate-500 truncate">{{ userEmail }}</p>
            </div>

            <!-- Spaces List -->
            <div class="py-1.5 max-h-60 overflow-y-auto">
              <p class="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Your Spaces</p>
              <button
                v-for="space in spaces"
                :key="space.id"
                @click="handleSwitchSpace(space.id)"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-700/40 transition-colors"
              >
                <span class="text-lg shrink-0">{{ space.type === 'couple' ? '💑' : '👤' }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-white truncate">{{ space.name }}</p>
                  <p class="text-[11px] text-slate-500 capitalize">{{ space.type }}</p>
                </div>
                <span
                  v-if="currentSpace?.id === space.id"
                  class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent shrink-0"
                >
                  Active
                </span>
              </button>
            </div>

            <!-- Actions -->
            <div class="border-t border-slate-700/50 p-2">
              <button
                @click="handleSwitchAll"
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/40 transition-colors"
              >
                <Icon name="switch" :size="16" />
                <span>Switch Space</span>
              </button>
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

defineEmits<{
  'toggle-sidebar': []
  'toggle-mobile-sidebar': []
}>()

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { currentSpace, spaces, user } = storeToRefs(authStore)

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const userName = computed(() => user.value?.full_name || user.value?.email || 'User')
const userEmail = computed(() => user.value?.email || '')
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
    toast.success('Space switched', 'Now viewing a different space.')
    isDropdownOpen.value = false
    // Re-navigate to home to refresh content
    router.push({ name: 'Home' })
  }
}

function handleSwitchAll() {
  isDropdownOpen.value = false
  router.push({ name: 'SpaceSelector' })
}
</script>

<style scoped>
.dropdown-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
