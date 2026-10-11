<template>
  <teleport to="body">
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[120] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="surface-card w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-border-default animate-scale-in"
          role="dialog"
          aria-modal="true"
        >
          <!-- Search Header Input -->
          <div class="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle bg-surface-elevated/40">
            <Icon name="search" size="18" class="text-accent shrink-0" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Cari navigasi, tools, atau ketik aksi... (mis. backtest, habit, tema)"
              class="flex-1 bg-transparent border-0 outline-none text-sm text-text-primary placeholder:text-text-tertiary font-medium"
              @keydown.down.prevent="navigateResults(1)"
              @keydown.up.prevent="navigateResults(-1)"
              @keydown.enter.prevent="selectHighlighted"
              @keydown.esc.prevent="close"
            />
            <button
              type="button"
              @click="close"
              class="px-1.5 py-0.5 rounded text-[11px] font-mono text-text-tertiary bg-surface-elevated border border-border-subtle hover:text-text-primary"
            >
              ESC
            </button>
          </div>

          <!-- Results List -->
          <div class="max-h-[60vh] overflow-y-auto p-2 space-y-4">
            <!-- No results -->
            <div
              v-if="filteredCommands.length === 0"
              class="py-10 text-center text-xs text-text-tertiary"
            >
              Tidak ada perintah atau halaman yang cocok dengan "{{ query }}"
            </div>

            <!-- Grouped commands -->
            <div
              v-for="group in groupedCommands"
              :key="group.category"
              class="space-y-1"
            >
              <div class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                {{ group.category }}
              </div>

              <div
                v-for="item in group.items"
                :key="item.id"
                @mouseenter="highlightedId = item.id"
                @click="executeItem(item)"
                class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                :class="highlightedId === item.id
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-text-secondary hover:bg-surface-elevated/60'"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    :class="highlightedId === item.id
                      ? 'bg-accent text-dark font-bold'
                      : 'bg-surface-elevated text-text-tertiary'"
                  >
                    <Icon :name="item.icon" size="14" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-medium" :class="{ 'text-text-primary': highlightedId !== item.id }">
                      {{ item.title }}
                    </p>
                    <p v-if="item.subtitle" class="text-[10px] text-text-tertiary truncate">
                      {{ item.subtitle }}
                    </p>
                  </div>
                </div>

                <div class="shrink-0 flex items-center gap-1.5">
                  <span
                    v-if="item.badge"
                    class="px-2 py-0.5 rounded text-[10px] font-mono text-text-tertiary bg-surface-elevated border border-border-subtle"
                  >
                    {{ item.badge }}
                  </span>
                  <Icon
                    v-if="highlightedId === item.id"
                    name="arrow-up-right"
                    size="13"
                    class="text-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Palette Footer -->
          <div class="px-4 py-2.5 border-t border-border-subtle bg-surface-elevated/30 flex items-center justify-between text-[11px] text-text-tertiary">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 rounded bg-surface border border-border-subtle font-mono text-[10px]">↑</kbd>
                <kbd class="px-1.5 py-0.5 rounded bg-surface border border-border-subtle font-mono text-[10px]">↓</kbd>
                <span>Navigasi</span>
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 rounded bg-surface border border-border-subtle font-mono text-[10px]">↵</kbd>
                <span>Pilih</span>
              </span>
            </div>
            <span class="font-mono text-[10px]">SpaceOS v2.0</span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import { useTheme } from '@/composables/useTheme'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: string
  category: 'Navigasi' | 'Quick Actions' | 'Ganti Ruang Kerja'
  badge?: string
  action: () => void
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const { currentLang, toggleLang } = useI18n()
const authStore = useAuthStore()

const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const highlightedId = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

function close() {
  isOpen.value = false
}

// All available searchable actions & routes
const allCommands = computed<CommandItem[]>(() => [
  // Trader Space
  {
    id: 'nav-trader',
    title: 'Dashboard Trading',
    subtitle: 'Analisis PnL, Winrate, dan Rencana Trading',
    icon: 'chart-line',
    category: 'Navigasi',
    badge: 'Trader',
    action: () => router.push('/'),
  },
  {
    id: 'nav-backtest',
    title: 'Lab Backtesting',
    subtitle: 'Simulasi strategi SMC & kurva ekuitas',
    icon: 'zap',
    category: 'Navigasi',
    badge: 'Trader',
    action: () => router.push('/backtesting'),
  },
  {
    id: 'nav-trading',
    title: 'Trading Journal',
    subtitle: 'Logbook eksekusi trade dan analisis AI',
    icon: 'file-text',
    category: 'Navigasi',
    badge: 'Trader',
    action: () => router.push('/trading'),
  },
  {
    id: 'nav-calculator',
    title: 'Kalkulator Lot',
    subtitle: 'Hitung ukuran posisi dan risiko per trade',
    icon: 'calculator',
    category: 'Navigasi',
    badge: 'Tools',
    action: () => router.push('/calculator'),
  },

  // Teacher Space
  {
    id: 'nav-teacher',
    title: 'Teacher Space Dashboard',
    subtitle: 'Ringkasan kelas, jadwal harian, dan income',
    icon: 'graduation-cap',
    category: 'Navigasi',
    badge: 'Teacher',
    action: () => router.push('/teacher'),
  },
  {
    id: 'nav-schedule',
    title: 'Jadwal & Sesi Mengajar',
    subtitle: 'Kalender dan slot les siswa',
    icon: 'calendar',
    category: 'Navigasi',
    badge: 'Teacher',
    action: () => router.push('/schedule'),
  },
  {
    id: 'nav-students',
    title: 'Daftar Siswa',
    subtitle: 'Database kontak, progres, dan billing',
    icon: 'users',
    category: 'Navigasi',
    badge: 'Teacher',
    action: () => router.push('/students'),
  },
  {
    id: 'nav-materials',
    title: 'Materi Pembelajaran',
    subtitle: 'Bank soal, modul PDF, dan catatan',
    icon: 'book',
    category: 'Navigasi',
    badge: 'Teacher',
    action: () => router.push('/materials'),
  },
  {
    id: 'nav-income',
    title: 'Laporan Pendapatan Mengajar',
    subtitle: 'Pencatatan invoice dan honor siswa',
    icon: 'wallet',
    category: 'Navigasi',
    badge: 'Teacher',
    action: () => router.push('/income'),
  },

  // Personal Space
  {
    id: 'nav-personal',
    title: 'Personal Dashboard',
    subtitle: 'Habit harian, cashflow, dan jurnal refleksi',
    icon: 'heart',
    category: 'Navigasi',
    badge: 'Personal',
    action: () => router.push('/personal'),
  },
  {
    id: 'nav-habits',
    title: 'Habit Tracker',
    subtitle: 'Pantau streak dan konsistensi kebiasaan',
    icon: 'target',
    category: 'Navigasi',
    badge: 'Personal',
    action: () => router.push('/habits'),
  },
  {
    id: 'nav-finance',
    title: 'Finance Tracker',
    subtitle: 'Pencatatan pengeluaran, pemasukan, dan anggaran',
    icon: 'dollar-sign',
    category: 'Navigasi',
    badge: 'Personal',
    action: () => router.push('/finance'),
  },
  {
    id: 'nav-diary',
    title: 'Jurnal Pribadi',
    subtitle: 'Ruang refleksi dan catatan harian',
    icon: 'feather',
    category: 'Navigasi',
    badge: 'Personal',
    action: () => router.push('/personal-journal'),
  },

  // Quick Actions
  {
    id: 'act-theme',
    title: isDark.value ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode (Night Sky)',
    subtitle: 'Beralih palet tema tampilan',
    icon: isDark.value ? 'sun' : 'moon',
    category: 'Quick Actions',
    action: () => toggleTheme(),
  },
  {
    id: 'act-lang',
    title: currentLang.value === 'id' ? 'Ubah Bahasa ke Deutsch (DE)' : 'Ubah Bahasa ke Indonesia (ID)',
    subtitle: 'Lokalisasi antarmuka',
    icon: 'sparkles',
    category: 'Quick Actions',
    action: () => toggleLang(),
  },

  // Switch Spaces
  {
    id: 'space-trader',
    title: 'Masuk ke Trader Space',
    subtitle: 'Mode Analis Pasar & Backtesting',
    icon: 'chart-line',
    category: 'Ganti Ruang Kerja',
    action: async () => {
      const sp = (authStore.spaces as any[]).find(s => s.category === 'trader' || s.name?.toLowerCase().includes('trader'))
      if (sp) await authStore.selectSpace(sp.id)
      router.push('/')
    },
  },
  {
    id: 'space-teacher',
    title: 'Masuk ke Teacher Space',
    subtitle: 'Mode Pengajar & Manajemen Siswa',
    icon: 'graduation-cap',
    category: 'Ganti Ruang Kerja',
    action: async () => {
      const sp = (authStore.spaces as any[]).find(s => s.category === 'teacher' || s.name?.toLowerCase().includes('teacher'))
      if (sp) await authStore.selectSpace(sp.id)
      router.push('/teacher')
    },
  },
  {
    id: 'space-personal',
    title: 'Masuk ke Personal Space',
    subtitle: 'Mode Produktivitas & Keuangan Pribadi',
    icon: 'heart',
    category: 'Ganti Ruang Kerja',
    action: async () => {
      const sp = (authStore.spaces as any[]).find(s => s.category === 'private' || s.category === 'personal' || s.name?.toLowerCase().includes('personal'))
      if (sp) await authStore.selectSpace(sp.id)
      router.push('/personal')
    },
  },
])

// Filter items by query
const filteredCommands = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return allCommands.value
  return allCommands.value.filter(item =>
    item.title.toLowerCase().includes(q) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
    item.category.toLowerCase().includes(q)
  )
})

// Grouped by category
const groupedCommands = computed(() => {
  const groups: { category: string; items: CommandItem[] }[] = []
  const map: Record<string, CommandItem[]> = {}

  filteredCommands.value.forEach(item => {
    if (!map[item.category]) {
      map[item.category] = []
      groups.push({ category: item.category, items: map[item.category] })
    }
    map[item.category].push(item)
  })

  return groups
})

// Set initial highlighted item
watch(filteredCommands, (items) => {
  if (items.length > 0) {
    highlightedId.value = items[0].id
  } else {
    highlightedId.value = ''
  }
}, { immediate: true })

watch(isOpen, (open) => {
  if (open) {
    query.value = ''
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

function navigateResults(delta: number) {
  const list = filteredCommands.value
  if (list.length === 0) return
  const currentIndex = list.findIndex(item => item.id === highlightedId.value)
  const nextIndex = (currentIndex + delta + list.length) % list.length
  highlightedId.value = list[nextIndex].id
}

function selectHighlighted() {
  const item = filteredCommands.value.find(i => i.id === highlightedId.value)
  if (item) {
    executeItem(item)
  }
}

function executeItem(item: CommandItem) {
  close()
  item.action()
}

// Global Ctrl+K / Cmd+K listener
function handleKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
