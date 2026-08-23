<template>
  <aside class="flex flex-col h-full bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/70 select-none">
    <!-- ============================
         Header: Logo + Space Name & Mode Selector
         ============================ -->
    <div class="px-5 py-4 border-b border-slate-800/80 shrink-0 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/30">
            <span class="text-white font-extrabold text-base tracking-wider">S</span>
          </div>
          <div>
            <h1 class="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>SpaceOS</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">PRO</span>
            </h1>
            <p v-if="currentSpace" class="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
              {{ currentSpace.name }}
            </p>
          </div>
        </div>

        <router-link
          to="/space-selector"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Ganti Space"
        >
          <Icon name="switch" :size="16" />
        </router-link>
      </div>
    </div>

    <!-- ============================
         Navigation Sections
         ============================ -->
    <nav class="flex-1 overflow-y-auto py-3 px-3 space-y-5 custom-scrollbar">
      <div
        v-for="(section, sIdx) in navigationSections"
        :key="sIdx"
      >
        <!-- Section Title -->
        <p
          v-if="section.title"
          class="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500"
        >
          {{ section.title }}
        </p>

        <!-- Nav Items -->
        <div class="space-y-1">
          <router-link
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 relative overflow-hidden"
            :class="isActive(item.to)
              ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent text-cyan-300 border-l-4 border-cyan-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-l-4 border-transparent hover:translate-x-1'"
            @click="$emit('navigate')"
          >
            <Icon
              :name="item.icon"
              :size="18"
              class="shrink-0 transition-transform duration-200 group-hover:scale-110"
              :class="isActive(item.to) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'"
            />
            <span class="truncate">{{ item.label }}</span>
            <span
              v-if="item.badge"
              class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
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
    <div class="border-t border-slate-800/80 px-3 py-3 space-y-1 shrink-0 bg-slate-950/40">
      <!-- Settings -->
      <router-link
        v-for="item in footerItems.items"
        :key="item.to"
        :to="item.to"
        class="nav-item group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
        :class="isActive(item.to)
          ? 'bg-cyan-500/15 text-cyan-300 border-l-4 border-cyan-400'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-l-4 border-transparent'"
        @click="$emit('navigate')"
      >
        <Icon
          :name="item.icon"
          :size="18"
          class="shrink-0 transition-transform duration-200 group-hover:scale-110"
          :class="isActive(item.to) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'"
        />
        <span>{{ item.label }}</span>
      </router-link>

      <!-- Theme Toggle -->
      <button
        @click="toggleTheme"
        class="nav-item group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-200 w-full text-left"
      >
        <Icon
          :name="isDarkMode ? 'moon' : 'sun'"
          :size="18"
          class="shrink-0 text-slate-500 group-hover:text-slate-300 transition-transform duration-200 group-hover:scale-110"
        />
        <span>{{ isDarkMode ? 'Dark Mode (Aktif)' : 'Light Mode' }}</span>
      </button>

      <!-- Logout -->
      <button
        @click="handleLogout"
        class="nav-item group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 w-full text-left"
      >
        <Icon
          name="logout"
          :size="18"
          class="shrink-0 text-slate-500 group-hover:text-rose-400 transition-transform duration-200 group-hover:scale-110"
        />
        <span>Keluar (Sign Out)</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useNavigation } from '@/composables/useNavigation'
import Icon from '@/components/ui/Icon.vue'

defineEmits<{
  navigate: []
}>()

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const toast = useToastStore()
const { isDarkMode } = storeToRefs(appStore)
const { currentSpace } = storeToRefs(authStore)
const { toggleTheme } = appStore
const { navigationSections, footerItems, isActive } = useNavigation()

async function handleLogout() {
  await authStore.logout()
  toast.info('Sampai Jumpa!', 'Anda telah keluar dari SpaceOS.')
  router.push({ name: 'Login' })
}
</script>
