<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header with Category & Status -->
      <div class="p-6 border-b border-slate-700/60 bg-slate-900/50 flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span
              class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg border"
              :class="categoryStyle.badge"
            >
              <span>{{ event.category }}</span>
            </span>

            <span
              class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize"
              :class="statusStyle.color"
            >
              <span>{{ event.status }}</span>
            </span>
          </div>

          <h2 class="text-xl sm:text-2xl font-bold text-white leading-tight">
            {{ event.title }}
          </h2>

          <div class="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
            <div class="flex items-center gap-1.5 text-slate-300">
              <Icon name="clock" :size="14" class="text-accent" />
              <span>{{ formatDateTime(event.start_datetime) }}</span>
              <span v-if="event.end_datetime" class="text-slate-400">- {{ formatEndTime(event.end_datetime) }}</span>
            </div>

            <div v-if="event.location" class="flex items-center gap-1.5 text-slate-300">
              <Icon name="map-pin" :size="14" class="text-rose-400" />
              <span>{{ event.location }}</span>
            </div>

            <div v-if="event.cost" class="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
              <Icon name="dollar-sign" :size="14" />
              <span>{{ formatCurrency(event.cost) }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Icon name="x" :size="18" />
        </button>
      </div>

      <!-- Body (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <!-- 1. Countdown (for upcoming events) -->
        <div
          v-if="isUpcoming"
          class="glass rounded-xl p-4 border border-cyan-500/30 bg-cyan-950/20 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <span class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Icon name="sparkles" :size="14" />
              <span>Countdown Menuju Event Dimulai</span>
            </span>
            <p class="text-[11px] text-slate-400 mt-0.5">Persiapkan perlengkapan dan cek daftar tugas di bawah.</p>
          </div>
          <FlipCountdown :target-datetime="event.start_datetime" />
        </div>

        <!-- 2. Description -->
        <div v-if="event.description" class="space-y-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>📋</span>
            <span>Deskripsi & Gambaran Acara</span>
          </h3>
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            {{ event.description }}
          </div>
        </div>

        <!-- 3. Preparation Checklist -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>✅</span>
              <span>Checklist Persiapan Event</span>
            </h3>
            <span class="text-[11px] font-mono text-cyan-400 font-bold">
              {{ completedCount }} / {{ (event.checklist || []).length }} Selesai
            </span>
          </div>

          <div v-if="!event.checklist || event.checklist.length === 0" class="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            Belum ada checklist persiapan. Edit event untuk menambahkan item checklist.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="item in event.checklist"
              :key="item.id"
              @click="$emit('toggle-checklist', event.id, item.id)"
              class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                :checked="item.completed"
                class="w-4 h-4 rounded text-accent bg-slate-800 border-slate-700 pointer-events-none"
              />
              <span
                class="text-xs select-none"
                :class="item.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'"
              >
                {{ item.text }}
              </span>
            </div>
          </div>
        </div>

        <!-- 4. Attachments -->
        <div v-if="event.attachments && event.attachments.length > 0" class="space-y-2.5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>📎</span>
            <span>Berkas & Dokumen Lampiran</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              v-for="att in event.attachments"
              :key="att.id"
              :href="att.file_url"
              target="_blank"
              download
              class="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-accent/40 text-xs transition-colors group"
            >
              <div class="flex items-center gap-2 truncate pr-2">
                <Icon name="file-text" :size="16" class="text-accent flex-shrink-0" />
                <span class="text-slate-200 truncate group-hover:text-accent font-medium">{{ att.file_name }}</span>
              </div>
              <Icon name="external-link" :size="13" class="text-slate-500 group-hover:text-white flex-shrink-0" />
            </a>
          </div>
        </div>

        <!-- 5. Post-Event Review Section -->
        <div class="space-y-4 pt-4 border-t border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>⭐</span>
              <span>Post-Event Review & Evaluasi</span>
            </h3>
            <span v-if="event.review" class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Review Tersimpan
            </span>
          </div>

          <!-- Review Form -->
          <div class="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-700/80">
            <!-- Rating & Would attend again -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-800">
              <!-- Rating -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-300">
                  Rating Manfaat (Worth it or not?)
                </label>
                <div class="flex items-center gap-1.5 py-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="reviewForm.rating = star"
                    class="text-2xl transition-transform hover:scale-125 focus:outline-none"
                    :class="(reviewForm.rating || 0) >= star ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400/50'"
                  >
                    ★
                  </button>
                  <span v-if="reviewForm.rating" class="text-xs text-slate-400 ml-1 font-mono">
                    ({{ reviewForm.rating }}/5)
                  </span>
                </div>
              </div>

              <!-- Would Attend Again -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-300">
                  Apakah Bersedia Hadir Lagi?
                </label>
                <div class="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    @click="reviewForm.would_attend_again = true"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border"
                    :class="reviewForm.would_attend_again
                      ? 'bg-emerald-500 text-dark border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'"
                  >
                    👍 Ya, Sangat Bermanfaat
                  </button>
                  <button
                    type="button"
                    @click="reviewForm.would_attend_again = false"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border"
                    :class="!reviewForm.would_attend_again
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'"
                  >
                    👎 Tidak
                  </button>
                </div>
              </div>
            </div>

            <!-- What I Learned -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-300">
                What I Learned (Apa yang saya pelajari dari event ini?)
              </label>
              <textarea
                v-model="reviewForm.what_learned"
                rows="3"
                placeholder="Tulis ringkasan materi, studi kasus, atau insight pembicara..."
                class="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
              ></textarea>
            </div>

            <!-- Key Takeaways -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-300">
                Key Takeaways (Poin aksi yang bisa langsung dipraktekkan)
              </label>
              <textarea
                v-model="reviewForm.takeaways"
                rows="3"
                placeholder="1. Action item pertama...&#10;2. Action item kedua..."
                class="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-xs text-cyan-200 font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:border-accent"
              ></textarea>
            </div>

            <!-- Contacts Made -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-300">
                Contacts Made (Kenalan baru & jejaring networking)
              </label>
              <input
                v-model="reviewForm.contacts_made"
                type="text"
                placeholder="e.g. John Doe (Trader di XYZ), Sarah (Founder FinApp - LinkedIn)"
                class="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
              />
            </div>

            <div class="flex justify-end pt-1">
              <button
                type="button"
                @click="handleSaveReview"
                class="btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <span>💾 Simpan Review Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Action Buttons -->
      <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-700/60 bg-surface/50">
        <button
          type="button"
          @click="$emit('edit', event)"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Icon name="edit" :size="14" />
          <span>Edit Event</span>
        </button>

        <button
          type="button"
          @click="$emit('close')"
          class="px-5 py-2 rounded-xl text-xs font-bold bg-slate-700 text-white hover:bg-slate-600 transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import FlipCountdown from '@/components/events/FlipCountdown.vue'
import { CATEGORY_COLORS, EVENT_STATUS_OPTIONS } from '@/composables/useEvents'
import type { EventItem, EventReviewFormData } from '@/types'

const props = defineProps<{
  event: EventItem
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', event: EventItem): void
  (e: 'toggle-checklist', eventId: string, itemId: string): void
  (e: 'save-review', eventId: string, reviewData: EventReviewFormData): void
}>()

const isUpcoming = computed(() => {
  return props.event.status !== 'completed' && new Date(props.event.start_datetime).getTime() > Date.now()
})

const categoryStyle = computed(() => {
  return CATEGORY_COLORS[props.event.category] || CATEGORY_COLORS['Personal']
})

const statusStyle = computed(() => {
  return EVENT_STATUS_OPTIONS.find(s => s.value === props.event.status) || EVENT_STATUS_OPTIONS[0]
})

const completedCount = computed(() => {
  if (!props.event.checklist) return 0
  return props.event.checklist.filter(c => c.completed).length
})

const reviewForm = reactive<EventReviewFormData>({
  what_learned: props.event.review?.what_learned || '',
  takeaways: props.event.review?.takeaways || '',
  contacts_made: props.event.review?.contacts_made || '',
  rating: props.event.review?.rating || 5,
  would_attend_again: props.event.review?.would_attend_again !== undefined ? props.event.review.would_attend_again : true,
})

function formatDateTime(datetimeStr: string) {
  if (!datetimeStr) return ''
  const d = new Date(datetimeStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatEndTime(datetimeStr: string) {
  if (!datetimeStr) return ''
  const d = new Date(datetimeStr)
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function handleSaveReview() {
  emit('save-review', props.event.id, { ...reviewForm })
}
</script>
