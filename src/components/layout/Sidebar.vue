<template>
  <aside class="flex flex-col h-full bg-surface">
    <!-- ============================
         Header: Logo + Space Name
         ============================ -->
    <div class="flex items-center gap-3 px-5 h-16 border-b border-slate-700/50 shrink-0">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/10">
        <span class="text-white font-bold text-sm">S</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-white tracking-tight truncate">SpaceOS</p>
        <p v-if="currentSpace" class="text-[11px] text-slate-500 truncate leading-tight">
          {{ currentSpace.name }}
        </p>
      </div>
    </div>

    <!-- ============================
         Navigation Sections
         ============================ -->
    <nav class="flex-1 overflow-y-auto py-3 px-3 space-y-5 sidebar-scroll">
      <div
        v-for="(section, sIdx) in navigationSections"
        :key="sIdx"
      >
        <!-- Section Title -->
        <p
          v-if="section.title"
          class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500"
        >
          {{ section.title }}
        </p>

        <!-- Nav Items -->
        <div class="space-y-0.5">
          <router-link
            v-for="(item, iIdx) in section.items"
            :key="item.to"
            :to="item.to"
            class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out relative"
            :class="isActive(item.to)
              ? 'bg-primary/10 text-primary border-l-[3px] border-primary pl-[9px]'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/40 border-l-[3px] border-transparent pl-[9px]'"
            :style="{ animationDelay: `${(sIdx * section.items.length + iIdx) * 50}ms` }"
            @click="$emit('navigate')"
          >
            <Icon
              :name="item.icon"
              :size="18"
              class="shrink-0 transition-transform duration-200 group-hover:scale-110"
              :class="isActive(item.to) ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'"
            />
            <span class="truncate">{{ item.label }}</span>
            <span
              v-if="item.badge"
              class="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ============================
         Footer: Settings, Theme, Logout
         ============================ -->
    <div class="border-t border-slate-700/50 px-3 py-3 space-y-0.5 shrink-0">
      <!-- Settings -->
      <router-link
        v-for="item in footerItems.items"
        :key="item.to"
        :to="item.to"
        class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out"
        :class="isActive(item.to)
          ? 'bg-primary/10 text-primary'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/40'"
        @click="$emit('navigate')"
      >
        <Icon
          :name="item.icon"
          :size="18"
          class="shrink-0 transition-transform duration-200 group-hover:scale-110"
          :class="isActive(item.to) ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'"
        />
        <span>{{ item.label }}</span>
      </router-link>

      <!-- Theme Toggle -->
      <button
        @click="toggleTheme"
        class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/40 transition-all duration-200 ease-out w-full"
      >
        <Icon
          :name="isDarkMode ? 'moon' : 'sun'"
          :size="18"
          class="shrink-0 text-slate-500 group-hover:text-slate-300 transition-transform duration-200 group-hover:scale-110"
        />
        <span>{{ isDarkMode ? 'Dark Mode' : 'Light Mode' }}</span>
      </button>

      <!-- Logout -->
      <button
        @click="handleLogout"
        class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ease-out w-full"
      >
        <Icon
          name="logout"
          :size="18"
          class="shrink-0 text-slate-500 group-hover:text-red-400 transition-transform duration-200 group-hover:scale-110"
        />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useNavigation } from '@/composables/useNavigation'
import Icon from '@/components/ui/Icon.vue'

defineEmits<{
  navigate: []
}>()

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const { isDarkMode } = storeToRefs(appStore)
const { currentSpace } = storeToRefs(authStore)
const { toggleTheme } = appStore
const { navigationSections, footerItems, isActive } = useNavigation()

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}
.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.5);
  border-radius: 2px;
}

/* Stagger entrance animation */
.nav-item {
  animation: navSlideIn 0.3s ease-out both;
}

@keyframes navSlideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
