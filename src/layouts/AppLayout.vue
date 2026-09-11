<template>
  <div class="min-h-screen bg-dark text-slate-200 font-sans relative">
    <!-- Subtle aurora background for the main app -->
    <AuroraBackground variant="subtle" />

    <!-- ============================
         Desktop Sidebar (lg+)
         ============================ -->
    <aside
      class="fixed top-0 left-0 z-40 h-screen hidden lg:block border-r border-slate-700/50"
      :style="{ width: isSidebarCollapsed ? '0px' : '280px', transition: 'width 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }"
    >
      <div
        class="h-full overflow-hidden"
        :style="{ width: isSidebarCollapsed ? '0px' : '280px', opacity: isSidebarCollapsed ? 0 : 1, transition: 'width 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease' }"
      >
        <Sidebar @navigate="onNavigate" />
      </div>
    </aside>

    <!-- ============================
         Mobile Sidebar Overlay (< lg)
         ============================ -->
    <teleport to="body">
      <transition name="overlay">
        <div
          v-if="isMobileSidebarOpen"
          class="fixed inset-0 z-50 lg:hidden"
        >
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/60 backdrop-blur-sm"
            @click="closeMobileSidebar"
          ></div>

          <!-- Sidebar Panel -->
          <transition name="sidebar-slide">
            <div
              v-if="isMobileSidebarOpen"
              class="absolute top-0 left-0 h-full w-[280px] shadow-2xl shadow-black/50"
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
            >
              <Sidebar @navigate="closeMobileSidebar" />
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

    <!-- ============================
         Main Content Area
         ============================ -->
    <div
      class="flex flex-col min-h-screen relative z-[1]"
      :style="{ marginLeft: desktopMargin, transition: 'margin-left 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }"
    >
      <!-- Top Bar -->
      <Topbar
        @toggle-sidebar="toggleDesktopSidebar"
        @toggle-mobile-sidebar="toggleMobileSidebar"
      />

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-6 overflow-x-hidden">
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
import AuroraBackground from '@/components/ui/AuroraBackground.vue'
import { useNavigation } from '@/composables/useNavigation'

const {
  isMobile,
  isMobileSidebarOpen,
  closeMobileSidebar,
  toggleMobileSidebar,
} = useNavigation()

/* ============================
   Desktop Sidebar State
   ============================ */
const isSidebarCollapsed = ref(false)

function toggleDesktopSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const desktopMargin = computed(() => {
  if (isMobile.value) return '0px'
  return isSidebarCollapsed.value ? '0px' : '280px'
})

function onNavigate() {
  // Handled by Sidebar emitting 'navigate'
}

/* ============================
   Swipe to Close (Mobile)
   ============================ */
let touchStartX = 0
let touchCurrentX = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchCurrentX = touchStartX
}

function onTouchMove(e: TouchEvent) {
  touchCurrentX = e.touches[0].clientX
}

function onTouchEnd() {
  const diff = touchStartX - touchCurrentX
  // Swipe left to close
  if (diff > 60) {
    closeMobileSidebar()
  }
}

/* ============================
   Escape key to close mobile sidebar
   ============================ */
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isMobileSidebarOpen.value) {
    closeMobileSidebar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
/* ============================
   Page Transition (smooth fade + subtle slide)
   ============================ */
.page-enter-active {
  transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), filter 0.35s ease;
}
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.99);
  filter: blur(2px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.99);
  filter: blur(2px);
}

/* ============================
   Mobile Overlay
   ============================ */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* ============================
   Mobile Sidebar Slide
   ============================ */
.sidebar-slide-enter-active {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.sidebar-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 1, 1);
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}
</style>
