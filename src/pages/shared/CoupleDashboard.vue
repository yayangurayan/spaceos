<template>
  <div>
    <!-- Error State -->
    <div v-if="error" class="glass rounded-xl p-8 text-center animate-fade-in">
      <span class="text-4xl block mb-3">⚠️</span>
      <p class="text-white font-medium mb-1">Gagal memuat data</p>
      <p class="text-sm text-slate-400 mb-4">{{ error }}</p>
      <button class="btn-primary" @click="retry">Coba Lagi</button>
    </div>

    <template v-else>
      <!-- ============================
           Hero Header
           ============================ -->
      <div class="couple-header glass rounded-2xl p-6 sm:p-8 mb-8 animate-fade-in overflow-hidden relative">
        <!-- Floating hearts background -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <span
            v-for="i in 6"
            :key="i"
            class="floating-heart absolute text-rose-500/10"
            :style="{
              left: `${15 + i * 14}%`,
              top: `${10 + (i % 3) * 25}%`,
              fontSize: `${18 + (i % 3) * 8}px`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + (i % 2)}s`,
            }"
          >♥</span>
        </div>

        <div class="relative z-10">
          <!-- Greeting -->
          <p class="text-rose-400/80 text-sm font-medium mb-1">{{ greeting }} 💕</p>
          <h1 class="text-2xl sm:text-3xl font-bold text-white mb-4">
            {{ coupleNames }}
          </h1>

          <!-- Days together + Anniversary countdown -->
          <div class="flex flex-wrap gap-6">
            <!-- Days together -->
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-rose-500/15 flex items-center justify-center text-xl">
                💕
              </div>
              <div>
                <p class="text-2xl font-bold text-white">
                  <AnimatedNumber :value="daysTogether" :duration="1500" />
                </p>
                <p class="text-xs text-slate-400">Hari bersama</p>
              </div>
            </div>

            <!-- Anniversary countdown -->
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl">
                🎂
              </div>
              <div>
                <p class="text-2xl font-bold text-white">
                  <AnimatedNumber :value="anniversaryCountdown.days" :duration="1500" />
                </p>
                <p class="text-xs text-slate-400">
                  Hari menuju Anniversary ke-{{ anniversaryCountdown.years }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================
           Memory Lane
           ============================ -->
      <div class="mb-8 animate-fade-in" :style="{ animationDelay: '200ms', opacity: 0 }">
        <h2 class="text-lg font-semibold text-white mb-4">📸 Memory Lane</h2>

        <SkeletonLoader v-if="isLoading" type="table" :rows="2" :columns="4" />

        <template v-else>
          <!-- On This Day -->
          <div v-if="onThisDay" class="glass rounded-xl p-4 mb-4 flex items-center gap-4">
            <div class="w-16 h-16 rounded-lg on-this-day-gradient shrink-0 flex items-center justify-center text-2xl">
              📅
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-0.5">On This Day</p>
              <p class="text-sm text-white truncate">{{ onThisDay.caption }}</p>
              <p class="text-[11px] text-slate-500">{{ formatDate(onThisDay.date) }}</p>
            </div>
          </div>

          <!-- Photo grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              v-for="(photo, idx) in recentPhotos"
              :key="photo.id"
              class="photo-card rounded-xl overflow-hidden aspect-square relative group cursor-pointer"
              :class="`photo-gradient-${(idx % 4) + 1}`"
            >
              <!-- Gradient placeholder (since no real photos) -->
              <div class="absolute inset-0 flex items-center justify-center text-3xl">
                {{ ['🌅', '☕', '🏔️', '🎬'][idx % 4] }}
              </div>

              <!-- Caption overlay -->
              <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p class="text-xs text-white font-medium">{{ photo.caption }}</p>
                <p class="text-[10px] text-slate-300">{{ formatDate(photo.date) }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ============================
           Upcoming Events + Recent Journals
           ============================ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Upcoming Events -->
        <div class="animate-fade-in" :style="{ animationDelay: '350ms', opacity: 0 }">
          <h2 class="text-lg font-semibold text-white mb-4">📅 Upcoming Events</h2>

          <SkeletonLoader v-if="isLoading" type="circle" />

          <div v-else class="space-y-3">
            <div
              v-for="event in upcomingEvents"
              :key="event.id"
              class="event-card glass rounded-xl p-4 flex items-center gap-4"
            >
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                :class="{
                  'bg-rose-500/15': event.type === 'date',
                  'bg-violet-500/15': event.type === 'trip',
                  'bg-pink-500/15': event.type === 'anniversary',
                  'bg-slate-500/15': event.type === 'general',
                }"
              >
                {{ event.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ event.title }}</p>
                <p class="text-xs text-slate-400">{{ formatFullDate(event.date) }}</p>
              </div>
              <div class="shrink-0">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300">
                  {{ daysUntil(event.date) }}
                </span>
              </div>
            </div>

            <div v-if="upcomingEvents.length === 0" class="glass rounded-xl p-8 text-center">
              <span class="text-3xl block mb-2">📅</span>
              <p class="text-sm text-slate-400">Belum ada event mendatang.</p>
            </div>
          </div>
        </div>

        <!-- Recent Journal Entries -->
        <div class="animate-fade-in" :style="{ animationDelay: '450ms', opacity: 0 }">
          <h2 class="text-lg font-semibold text-white mb-4">📖 Journal Terakhir</h2>

          <SkeletonLoader v-if="isLoading" type="text" />

          <div v-else class="space-y-3">
            <div
              v-for="journal in recentJournals"
              :key="journal.id"
              class="journal-card glass rounded-xl p-4 cursor-pointer"
            >
              <!-- Header -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{{ journal.mood }}</span>
                  <span class="text-sm font-medium text-white">{{ journal.title }}</span>
                </div>
                <span class="text-[11px] text-slate-500">{{ formatDate(journal.date) }}</span>
              </div>
              <!-- Preview -->
              <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {{ journal.preview }}
              </p>
              <!-- Author -->
              <p class="text-[10px] text-slate-500 mt-2">
                ditulis oleh <span class="text-slate-400 font-medium">{{ journal.author }}</span>
              </p>
            </div>

            <div v-if="recentJournals.length === 0" class="glass rounded-xl p-8 text-center">
              <span class="text-3xl block mb-2">📖</span>
              <p class="text-sm text-slate-400">Belum ada journal entry.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================
           Quick Actions
           ============================ -->
      <div class="animate-fade-in" :style="{ animationDelay: '550ms', opacity: 0 }">
        <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button class="couple-btn-primary flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium text-white transition-all duration-150 hover:opacity-90">
            <span class="text-lg">📷</span>
            Tambah Foto
          </button>
          <button class="glass rounded-lg py-3 px-5 text-sm font-medium text-slate-300 hover:text-white hover:border-rose-500/30 transition-all duration-150 hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <span class="text-lg">📖</span>
            Tulis Journal
          </button>
          <button class="glass rounded-lg py-3 px-5 text-sm font-medium text-slate-300 hover:text-white hover:border-rose-500/30 transition-all duration-150 hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <span class="text-lg">📅</span>
            Buat Event
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { useCoupleDashboard } from '@/composables/useCoupleDashboard'

const {
  isLoading,
  error,
  greeting,
  coupleNames,
  daysTogether,
  anniversaryCountdown,
  upcomingEvents,
  recentJournals,
  recentPhotos,
  onThisDay,
  retry,
} = useCoupleDashboard()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
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
  if (diff === 0) return 'Hari ini'
  if (diff === 1) return 'Besok'
  return `${diff} hari lagi`
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

.photo-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.photo-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.4);
}

/* On this day gradient */
.on-this-day-gradient {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1));
}

/* Event cards */
.event-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.25);
}

/* Journal cards */
.journal-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.journal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.25);
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
