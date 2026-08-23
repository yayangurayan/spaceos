<template>
  <div
    class="group relative glass rounded-2xl p-4 sm:p-5 border border-slate-700/60 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between"
  >
    <!-- Top Row: Category Badge + Status Badge -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <!-- Category Badge -->
      <span
        class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border"
        :class="categoryStyle.badge"
      >
        <span>{{ categoryIcon }}</span>
        <span>{{ event.category }}</span>
      </span>

      <!-- Status Badge -->
      <span
        class="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
        :class="statusStyle.color"
      >
        <span>{{ statusIcon }}</span>
        <span class="capitalize">{{ event.status }}</span>
      </span>
    </div>

    <!-- Middle: Title, Datetime, Location -->
    <div class="space-y-3 cursor-pointer" @click="$emit('view-detail', event)">
      <div>
        <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-accent transition-colors line-clamp-2 leading-snug">
          {{ event.title }}
        </h3>
        <p v-if="event.description" class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {{ event.description }}
        </p>
      </div>

      <!-- Date, Time & Location Meta -->
      <div class="space-y-1.5 text-xs text-slate-300">
        <!-- Datetime -->
        <div class="flex items-center gap-2 text-slate-300">
          <Icon name="clock" :size="14" class="text-accent flex-shrink-0" />
          <span class="font-medium">{{ formatDateTime(event.start_datetime) }}</span>
          <span v-if="event.end_datetime" class="text-slate-500 text-[11px]">
            - {{ formatEndTime(event.end_datetime) }}
          </span>
        </div>

        <!-- Location -->
        <div v-if="event.location" class="flex items-center gap-2 text-slate-400 text-xs truncate">
          <Icon name="map-pin" :size="14" class="text-rose-400 flex-shrink-0" />
          <span class="truncate">{{ event.location }}</span>
        </div>

        <!-- Cost / Budget if present -->
        <div v-if="event.cost !== null && event.cost !== undefined && event.cost > 0" class="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
          <Icon name="dollar-sign" :size="14" class="text-emerald-400 flex-shrink-0" />
          <span>{{ formatCurrency(event.cost) }}</span>
        </div>
      </div>

      <!-- Live Flip Countdown (for upcoming events) -->
      <div
        v-if="isUpcoming"
        class="pt-2 border-t border-slate-700/50 flex flex-col items-center sm:items-start"
      >
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
          <Icon name="sparkles" :size="12" class="text-accent" />
          <span>Countdown Event</span>
        </span>
        <FlipCountdown :target-datetime="event.start_datetime" />
      </div>

      <!-- Post-event review summary badge if completed -->
      <div
        v-else-if="event.review"
        class="pt-2 border-t border-slate-700/50 p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
      >
        <div class="flex items-center gap-1 text-amber-400">
          <span v-for="s in 5" :key="s" class="text-xs">
            {{ s <= (event.review.rating || 5) ? '★' : '☆' }}
          </span>
          <span class="text-slate-400 text-[10px] ml-1 font-mono">({{ event.review.rating }}/5)</span>
        </div>
        <span class="text-[11px] text-emerald-400 font-semibold">Review Selesai</span>
      </div>

      <!-- Checklist & Attachments pills -->
      <div class="flex items-center gap-2 text-[11px] pt-1">
        <span
          v-if="event.checklist && event.checklist.length > 0"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
        >
          <Icon name="check-circle" :size="12" class="text-cyan-400" />
          <span>{{ completedChecklistCount }}/{{ event.checklist.length }} Checklist</span>
        </span>

        <span
          v-if="event.attachments && event.attachments.length > 0"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
        >
          <Icon name="file-text" :size="12" class="text-purple-400" />
          <span>{{ event.attachments.length }} File</span>
        </span>
      </div>
    </div>

    <!-- Footer Action Bar -->
    <div class="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
      <!-- Quick Detail / Complete Button -->
      <button
        type="button"
        @click.stop="$emit('toggle-complete', event.id)"
        class="text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
        :class="event.status === 'completed'
          ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
          : 'bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30'"
      >
        <Icon :name="event.status === 'completed' ? 'check-circle' : 'check'" :size="13" />
        <span>{{ event.status === 'completed' ? 'Selesai ✓' : 'Tandai Selesai' }}</span>
      </button>

      <!-- Right Action Icons -->
      <div class="flex items-center gap-1">
        <!-- View Detail Button -->
        <button
          type="button"
          @click.stop="$emit('view-detail', event)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Lihat Detail & Checklist"
        >
          <Icon name="eye" :size="15" />
        </button>

        <!-- Edit Button -->
        <button
          type="button"
          @click.stop="$emit('edit', event)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-slate-800 transition-colors"
          title="Edit Event"
        >
          <Icon name="edit" :size="15" />
        </button>

        <!-- Delete Button -->
        <button
          type="button"
          @click.stop="$emit('delete', event.id)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="Hapus Event"
        >
          <Icon name="trash" :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import FlipCountdown from '@/components/events/FlipCountdown.vue'
import { CATEGORY_COLORS, EVENT_STATUS_OPTIONS } from '@/composables/useEvents'
import type { EventItem } from '@/types'

const props = defineProps<{
  event: EventItem
}>()

defineEmits<{
  (e: 'view-detail', event: EventItem): void
  (e: 'edit', event: EventItem): void
  (e: 'delete', id: string): void
  (e: 'toggle-complete', id: string): void
}>()

const isUpcoming = computed(() => {
  return props.event.status !== 'completed' && new Date(props.event.start_datetime).getTime() > Date.now()
})

const categoryStyle = computed(() => {
  return CATEGORY_COLORS[props.event.category] || CATEGORY_COLORS['Personal']
})

const categoryIcon = computed(() => {
  switch (props.event.category) {
    case 'Trading Event': return '📈'
    case 'Seminar': return '🎙️'
    case 'Workshop': return '🛠️'
    case 'Competition': return '🏆'
    case 'Networking': return '🤝'
    case 'Personal': return '🎯'
    default: return '📅'
  }
})

const statusStyle = computed(() => {
  return EVENT_STATUS_OPTIONS.find(s => s.value === props.event.status) || EVENT_STATUS_OPTIONS[0]
})

const statusIcon = computed(() => {
  switch (props.event.status) {
    case 'planning': return '📝'
    case 'registered': return '🎟️'
    case 'attending': return '📍'
    case 'completed': return '✅'
    default: return '•'
  }
})

const completedChecklistCount = computed(() => {
  if (!props.event.checklist) return 0
  return props.event.checklist.filter(c => c.completed).length
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
</script>
