<template>
  <aside
    class="flex flex-col h-full select-none relative transition-colors duration-200"
    :class="[
      isCollapsed ? 'w-16' : 'w-[260px]',
      'dark:bg-dark-surface bg-light-surface border-r dark:border-white/[0.08] border-slate-200'
    ]"
  >
    <!-- ============================
         Header: Logo + Space Title
         ============================ -->
    <div
      class="border-b dark:border-white/[0.08] border-slate-200 shrink-0"
      :class="isCollapsed ? 'py-4 flex flex-col items-center justify-center' : 'px-4 py-3.5 space-y-2'"
    >
      <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'justify-between'">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0 border dark:border-white/10 border-slate-300">
            <img src="/icons/spaceos-icon-192.webp" alt="SpaceOS" class="w-full h-full object-cover" />
          </div>
          <div v-if="!isCollapsed" class="min-w-0">
            <h1 class="text-sm font-bold dark:text-white text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>SpaceOS</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20">PRO</span>
            </h1>
            <p v-if="currentSpace" class="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
              {{ currentSpace.name }}
            </p>
          </div>
        </div>

        <router-link
          v-if="!isCollapsed"
          to="/space-selector"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          :title="t('switch_space_title')"
        >
          <Icon name="switch" :size="16" />
        </router-link>
      </div>
    </div>

    <!-- ============================
         Navigation Sections
         ============================ -->
    <nav class="flex-1 overflow-y-auto py-2.5 space-y-4" :class="isCollapsed ? 'px-2' : 'px-3'">
      <div
        v-for="(section, sIdx) in navigationSections"
        :key="sIdx"
      >
        <!-- Section Title (Hidden if collapsed) -->
        <p
          v-if="!isCollapsed && section.title"
          class="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
        >
          {{ section.title }}
        </p>

        <!-- Nav Items -->
        <div class="space-y-0.5">
          <router-link
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="group flex items-center rounded-lg text-xs font-medium transition-all duration-150 relative"
            :class="[
              isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2',
              isActive(item.to)
                ? 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
            ]"
            :title="isCollapsed ? item.label : undefined"
            @click="$emit('navigate')"
          >
            <!-- Active indicator dot -->
            <span
              v-if="isActive(item.to)"
              class="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 shrink-0"
              :class="isCollapsed ? 'absolute top-1.5 right-1.5' : ''"
            ></span>

            <Icon
              :name="item.icon"
              :size="18"
              class="shrink-0"
              :class="isActive(item.to) ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'"
            />
            <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
            <span
              v-if="!isCollapsed && item.badge"
              class="ml-auto text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ============================
         Footer: PWA, Lang, Theme, Logout
         ============================ -->
    <div
      class="border-t dark:border-white/[0.08] border-slate-200 py-2.5 space-y-1 shrink-0"
      :class="isCollapsed ? 'px-2' : 'px-3'"
    >
      <!-- Install PWA -->
      <button
        v-if="isInstallable && !isInstalled"
        @click="handleInstallClick"
        class="group flex items-center rounded-lg text-xs font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-colors w-full"
        :class="isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'"
        :title="isCollapsed ? 'Install SpaceOS' : undefined"
      >
        <Icon name="download" :size="18" class="shrink-0 text-sky-500" />
        <span v-if="!isCollapsed" class="truncate">Install SpaceOS</span>
      </button>

      <!-- Theme Switcher -->
      <button
        type="button"
        @click="toggleTheme"
        class="group flex items-center rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors w-full"
        :class="isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <Icon :name="isDark ? 'sun' : 'moon'" :size="18" class="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
        <span v-if="!isCollapsed" class="truncate">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <!-- Language Switcher -->
      <button
        type="button"
        @click="toggleLang"
        class="group flex items-center rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors w-full"
        :class="isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'"
        :title="currentLang === 'id' ? t('switch_to_de') : t('switch_to_id')"
      >
        <span class="shrink-0 font-mono text-xs font-bold px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {{ currentLang.toUpperCase() }}
        </span>
        <span v-if="!isCollapsed" class="truncate">{{ currentLang === 'id' ? 'Bahasa Indonesia' : 'Deutsch' }}</span>
      </button>

      <!-- Logout -->
      <button
        type="button"
        @click="handleLogout"
        class="group flex items-center rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
        :class="isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'"
        :title="isCollapsed ? t('logout') : undefined"
      >
        <Icon name="logout" :size="18" class="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-rose-500" />
        <span v-if="!isCollapsed" class="truncate">{{ t('logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useNavigation } from '@/composables/useNavigation'
import Icon from '@/components/ui/Icon.vue'
import { useI18n } from '@/composables/useI18n'
import { usePwaInstall } from '@/composables/usePwaInstall'
import { useTheme } from '@/composables/useTheme'

withDefaults(defineProps<{
  isCollapsed?: boolean
}>(), {
  isCollapsed: false,
})

const emit = defineEmits<{
  navigate: []
}>()

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { currentSpace } = storeToRefs(authStore)
const { currentLang, toggleLang, t } = useI18n()
const { navigationSections, isActive } = useNavigation()
const { isInstallable, isInstalled, promptInstall } = usePwaInstall()
const { isDark, toggleTheme } = useTheme()

async function handleInstallClick() {
  await promptInstall()
  emit('navigate')
}

async function handleLogout() {
  await authStore.logout()
  toast.info(t('goodbye'), t('logged_out_desc'))
  router.push({ name: 'Login' })
}
</script>
