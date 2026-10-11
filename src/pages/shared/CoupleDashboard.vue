<template>
  <div>
    <!-- Error State -->
    <div v-if="error" class="surface-card rounded-2xl p-8 text-center animate-fade-in">
      <span class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-3">
        <Icon name="alert-triangle" :size="24" />
      </span>
      <p class="text-slate-900 dark:text-white font-medium mb-1">{{ t('failed_load_data') }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
      <button class="btn-primary" @click="retry">{{ t('try_again') }}</button>
    </div>

    <template v-else>
      <!-- ============================
           Hero Header
           ============================ -->
      <div class="couple-header surface-card rounded-2xl p-6 sm:p-8 mb-8 animate-fade-in overflow-hidden relative">
        <div class="relative z-10">
          <!-- Greeting -->
          <p class="text-rose-500 dark:text-rose-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-1 flex items-center gap-1.5">
            <Icon name="heart" :size="14" class="text-rose-500 fill-rose-500/20" />
            <span>{{ t(greeting) }}</span>
          </p>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            {{ coupleNames }}
          </h1>

          <!-- Days together + Anniversary countdown -->
          <div class="flex flex-wrap gap-6">
            <!-- Days together -->
            <div
              class="flex items-center gap-3 group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
              @click="openDateModal"
              title="Klik untuk ubah tanggal jadian / mulai bersama"
            >
              <div class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20 flex items-center justify-center transition-colors">
                <Icon name="heart" :size="22" class="fill-rose-500/30" />
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <p class="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    <AnimatedNumber :value="daysTogether" :duration="1500" />
                  </p>
                  <Icon name="edit" :size="13" class="text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>{{ t('days_together') }}</span>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">(sejak {{ formatDate(togetherSince) }})</span>
                </p>
              </div>
            </div>

            <!-- Anniversary countdown -->
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Icon name="calendar-heart" :size="22" />
              </div>
              <div>
                <p class="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  <AnimatedNumber :value="anniversaryCountdown.days" :duration="1500" />
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ t('days_to_anniversary', { years: anniversaryCountdown.years }) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================
           Partner Connection & Shared Space Info
           ============================ -->
      <div class="surface-card rounded-2xl p-5 mb-8 border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shadow-sm">
            <Icon name="users" :size="20" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 dark:text-white">{{ t('active_account', { name: currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Akun Anda' }) }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 font-semibold border border-rose-500/25">
                {{ isSpaceOwner ? 'Pemilik Ruang' : 'Pasangan' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ t('invite_code') }}: <strong class="text-rose-500 dark:text-rose-300 font-mono tracking-wider">{{ coupleInviteCode }}</strong>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            @click="copyInviteCode"
            class="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <Icon name="clipboard" :size="14" />
            <span>{{ t('copy_invite_code') }}</span>
          </button>

          <button
            type="button"
            @click="copyInviteLink"
            class="btn-primary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Icon name="external-link" :size="14" />
            <span>Bagi Link Undangan</span>
          </button>
        </div>
      </div>

      <!-- ============================
           Memory Lane
           ============================ -->
      <div class="mb-8 animate-fade-in" :style="{ animationDelay: '200ms', opacity: 0 }">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ t('memory_lane') }}</h2>

        <SkeletonLoader v-if="isLoading" type="table" :rows="2" :columns="4" />

        <template v-else>
          <!-- On This Day -->
          <div v-if="onThisDay" class="surface-card rounded-2xl p-4 mb-4 flex items-center gap-4">
            <div class="w-16 h-16 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 flex items-center justify-center overflow-hidden">
              <img v-if="onThisDay.url" :src="onThisDay.url" class="w-full h-full object-cover rounded-xl" />
              <Icon v-else name="calendar" :size="24" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">{{ t('on_this_day') }}</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ onThisDay.caption }}</p>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">{{ formatDate(onThisDay.date) }}</p>
            </div>
          </div>

          <!-- Photo grid -->
          <div v-if="recentPhotos.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              v-for="photo in recentPhotos"
              :key="photo.id"
              class="photo-card rounded-2xl overflow-hidden aspect-square relative group cursor-pointer bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <img
                v-if="photo.url"
                :src="photo.url"
                :alt="photo.caption"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
                <Icon name="images" :size="28" />
              </div>

              <!-- Caption overlay -->
              <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p class="text-xs text-white font-medium truncate">{{ photo.caption }}</p>
                <p class="text-[10px] text-rose-300 font-mono tabular-nums">{{ formatDate(photo.date) }}</p>
              </div>
            </div>
          </div>

          <!-- Empty state if no photos yet -->
          <div v-else class="surface-card rounded-2xl p-8 text-center border-dashed border-rose-500/20">
            <span class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-2">
              <Icon name="images" :size="24" />
            </span>
            <p class="text-sm font-bold text-slate-900 dark:text-white mb-1">Belum Ada Foto Kenangan</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Abadikan momen pertama kalian bersama di Galeri Ruang Cinta.</p>
            <router-link
              to="/gallery"
              class="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
            >
              <Icon name="plus" :size="14" />
              <span>Tambah Foto Pertama</span>
            </router-link>
          </div>
        </template>
      </div>

      <!-- ============================
           Upcoming Events + Recent Journals
           ============================ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Upcoming Events -->
        <div class="animate-fade-in" :style="{ animationDelay: '350ms', opacity: 0 }">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ t('upcoming_events') }}</h2>

          <SkeletonLoader v-if="isLoading" type="circle" />

          <div v-else class="space-y-3">
            <div
              v-for="event in upcomingEvents"
              :key="event.id"
              class="event-card surface-card rounded-2xl p-4 flex items-center gap-4"
            >
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                :class="{
                  'bg-rose-500/15 text-rose-500': event.type === 'date',
                  'bg-violet-500/15 text-violet-500': event.type === 'trip',
                  'bg-pink-500/15 text-pink-500': event.type === 'anniversary',
                  'bg-slate-500/15 text-slate-500': event.type === 'general',
                }"
              >
                <Icon name="calendar-heart" :size="20" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ event.title }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">{{ formatFullDate(event.date) }}</p>
              </div>
              <div class="shrink-0">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                  {{ daysUntil(event.date) }}
                </span>
              </div>
            </div>

            <div v-if="upcomingEvents.length === 0" class="surface-card rounded-2xl p-8 text-center text-slate-500">
              <span class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-2">
                <Icon name="calendar" :size="20" />
              </span>
              <p class="text-sm">Belum ada event mendatang.</p>
            </div>
          </div>
        </div>

        <!-- Recent Journal Entries -->
        <div class="animate-fade-in" :style="{ animationDelay: '450ms', opacity: 0 }">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ t('recent_journals') }}</h2>

          <SkeletonLoader v-if="isLoading" type="text" />

          <div v-else class="space-y-3">
            <div
              v-for="journal in recentJournals"
              :key="journal.id"
              class="journal-card surface-card rounded-2xl p-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <!-- Header -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-semibold">{{ journal.mood }}</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ journal.title }}</span>
                </div>
                <span class="text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">{{ formatDate(journal.date) }}</span>
              </div>
              <!-- Preview -->
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {{ journal.preview }}
              </p>
              <!-- Author -->
              <p class="text-[10px] text-slate-400 mt-2">
                ditulis oleh <span class="text-slate-700 dark:text-slate-300 font-medium">{{ journal.author }}</span>
              </p>
            </div>

            <div v-if="recentJournals.length === 0" class="surface-card rounded-2xl p-8 text-center text-slate-500">
              <span class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-2">
                <Icon name="book-heart" :size="20" />
              </span>
              <p class="text-sm">Belum ada journal entry.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================
           Quick Actions
           ============================ -->
      <div class="animate-fade-in" :style="{ animationDelay: '550ms', opacity: 0 }">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ t('quick_actions') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <router-link
            to="/gallery"
            class="btn-primary flex items-center justify-center gap-2 py-3 text-xs font-bold"
          >
            <Icon name="images" :size="16" />
            <span>Galeri & Tambah Foto</span>
          </router-link>
          <router-link
            to="/journal"
            class="btn-secondary py-3 px-5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Icon name="edit" :size="16" />
            <span>Tulis Journal</span>
          </router-link>
          <router-link
            to="/love-notes"
            class="btn-secondary py-3 px-5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Icon name="message-heart" :size="16" />
            <span>Love Notes</span>
          </router-link>
        </div>
      </div>
    </template>

    <!-- Modal Atur Tanggal Mulai Bersama -->
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="showDateModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          @click.self="showDateModal = false"
        >
          <div class="surface-card rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-slide-in">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="heart" :size="18" class="text-rose-500" />
                <span>Tanggal Mulai Bersama</span>
              </h3>
              <button @click="showDateModal = false" class="text-slate-400 hover:text-slate-900 dark:hover:text-white"><Icon name="x" :size="18" /></button>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal Jadian / Bersama Sejak
              </label>
              <input
                v-model="tempDate"
                type="date"
                class="input-field w-full text-sm font-mono"
              />
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Tanggal ini digunakan untuk menghitung jumlah hari bersama dan hitung mundur anniversary secara otomatis.
              </p>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                @click="showDateModal = false"
                class="btn-secondary px-3.5 py-1.5 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                @click="handleSaveDate"
                class="btn-primary px-4 py-1.5 text-xs font-bold"
              >
                Simpan Tanggal
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import Icon from '@/components/ui/Icon.vue'
import { useCoupleDashboard } from '@/composables/useCoupleDashboard'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'

const authStore = useAuthStore()
const toast = useToastStore()
const { currentLang, t } = useI18n()
const { user: currentUser, currentSpace } = storeToRefs(authStore)

const showDateModal = ref(false)
const tempDate = ref('')

const isSpaceOwner = computed(() => {
  return currentSpace.value?.owner_id === currentUser.value?.id || !currentSpace.value?.owner_id
})

const coupleInviteCode = computed(() => {
  const code = (currentSpace.value as any)?.invite_code
  if (code && code !== 'COUPLE-8888') return code
  if (currentSpace.value?.id) {
    return `COUPLE-${currentSpace.value.id.slice(0, 6).toUpperCase()}`
  }
  return 'COUPLE-SPACE'
})

function copyInviteCode() {
  navigator.clipboard.writeText(coupleInviteCode.value)
  toast.success(t('copy_invite_code_success'), t('copy_invite_code_desc', { code: coupleInviteCode.value }))
}

function copyInviteLink() {
  const joinUrl = `${window.location.origin}/space-selector?join=${coupleInviteCode.value}`
  navigator.clipboard.writeText(joinUrl)
  toast.success('Link Undangan Disalin', 'Kirimkan tautan ini ke pasanganmu untuk bergabung.')
}

const {
  isLoading,
  error,
  greeting,
  coupleNames,
  daysTogether,
  anniversaryCountdown,
  togetherSince,
  updateTogetherSince,
  upcomingEvents,
  recentJournals,
  recentPhotos,
  onThisDay,
  retry,
} = useCoupleDashboard()

function openDateModal() {
  tempDate.value = togetherSince.value || '2026-08-01'
  showDateModal.value = true
}

function handleSaveDate() {
  if (tempDate.value) {
    updateTogetherSince(tempDate.value)
    toast.success('Tanggal Diperbarui', 'Tanggal mulai bersama berhasil diperbarui.')
    showDateModal.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(currentLang.value === 'de' ? 'de-DE' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(currentLang.value === 'de' ? 'de-DE' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function daysUntil(dateStr: string): string {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return t('today')
  if (diff === 1) return t('tomorrow')
  return t('days_left', { days: diff })
}
</script>

<style scoped>
/* Couple header gradient border */
.couple-header {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(30, 41, 59, 0.6), rgba(244, 63, 94, 0.05));
  border-color: rgba(244, 63, 94, 0.15);
}

/* Couple primary button */
.couple-btn-primary {
  background: linear-gradient(135deg, #e11d48, #f43f5e);
}

/* Floating hearts */
.floating-heart {
  animation: floatHeart 3s ease-in-out infinite alternate;
}

@keyframes floatHeart {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-12px) scale(1.15); }
}

/* Photo card gradients */
.photo-gradient-1 { background: linear-gradient(135deg, #1e293b, #0f766e); }
.photo-gradient-2 { background: linear-gradient(135deg, #1e293b, #7c2d12); }
.photo-gradient-3 { background: linear-gradient(135deg, #1e293b, #1e3a5f); }
.photo-gradient-4 { background: linear-gradient(135deg, #1e293b, #581c87); }

/* Photo cards */
.photo-card {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
}
.photo-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.4);
}

/* On this day gradient */
.on-this-day-gradient {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08));
  border: 1px solid rgba(245, 158, 11, 0.1);
}

/* Event cards */
.event-card {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}
.event-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

/* Journal cards */
.journal-card {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}
.journal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border-color: rgba(244, 63, 94, 0.2);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
