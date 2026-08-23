<template>
  <div class="min-h-screen bg-dark text-slate-200 font-sans">
    <!-- ============================
         Desktop Sidebar (lg+)
         ============================ -->
    <aside
      class="fixed top-0 left-0 z-40 h-screen hidden lg:block border-r border-slate-700/50 transition-all duration-300"
      :style="{ width: isSidebarCollapsed ? '0px' : '280px' }"
    >
      <div
        class="h-full overflow-hidden transition-all duration-300"
        :style="{ width: isSidebarCollapsed ? '0px' : '280px', opacity: isSidebarCollapsed ? 0 : 1 }"
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
      class="flex flex-col min-h-screen transition-all duration-300"
      :style="{ marginLeft: desktopMargin }"
    >
      <!-- Top Bar -->
      <Topbar
        @toggle-sidebar="toggleDesktopSidebar"
        @toggle-mobile-sidebar="toggleMobileSidebar"
      />

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-6">
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
   Page Transition (fade + slide right)
   ============================ */
.page-enter-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.page-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* ============================
   Mobile Overlay
   ============================ */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* ============================
   Mobile Sidebar Slide
   ============================ */
.sidebar-slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.sidebar-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}
</style>
