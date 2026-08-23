<template>
  <div
    class="group relative glass rounded-2xl p-5 border border-slate-700/60 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between"
  >
    <!-- Top Row: Avatar, Name, Grade & Status -->
    <div>
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-3">
          <!-- Student Avatar / Initials -->
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shadow-md border border-white/10 flex-shrink-0"
            :class="avatarBg"
          >
            <span class="text-white">{{ getInitials(student.name) }}</span>
          </div>

          <div class="min-w-0">
            <h3
              class="text-base font-bold text-white group-hover:text-accent transition-colors truncate cursor-pointer"
              @click="$emit('view-detail', student)"
            >
              {{ student.name }}
            </h3>
            <p class="text-xs text-slate-400 truncate">
              {{ student.grade || 'Umum / Les Privat' }}
            </p>
          </div>
        </div>

        <!-- Status Badge -->
        <span
          class="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize"
          :class="statusClasses"
        >
          <span>{{ statusIcon }}</span>
          <span>{{ student.status }}</span>
        </span>
      </div>

      <!-- Subject Badges -->
      <div class="flex flex-wrap gap-1.5 mb-3">
        <span
          v-for="sub in student.subjects"
          :key="sub"
          class="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/70"
        >
          {{ sub }}
        </span>
      </div>

      <!-- Schedule Info -->
      <div class="space-y-1.5 text-xs text-slate-300 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div class="flex items-center gap-2 text-slate-300">
          <Icon name="calendar-days" :size="13" class="text-accent flex-shrink-0" />
          <span class="truncate font-medium">{{ formattedSchedule }}</span>
        </div>

        <div v-if="student.nextLesson" class="flex items-center gap-2 text-cyan-300 text-[11px]">
          <Icon name="clock" :size="13" class="flex-shrink-0" />
          <span>Next: {{ formatDateTime(student.nextLesson) }}</span>
        </div>
        <div v-else class="text-[11px] text-slate-500 italic pl-5">
          Belum ada jadwal terdekat
        </div>
      </div>
    </div>

    <!-- Bottom: Monthly Fee & Actions -->
    <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
      <!-- Fee & Due Status -->
      <div>
        <span class="text-[10px] text-slate-400 block font-medium">SPP / Biaya Bulanan:</span>
        <span class="text-xs sm:text-sm font-mono font-bold text-emerald-400">
          {{ formatCurrency(student.monthly_fee) }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          @click.stop="$emit('schedule-lesson', student)"
          class="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
          title="Jadwalkan Lesson"
        >
          <Icon name="plus" :size="13" />
          <span class="hidden sm:inline">Jadwal</span>
        </button>

        <button
          type="button"
          @click.stop="$emit('view-detail', student)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Lihat Detail Profil & Riwayat"
        >
          <Icon name="eye" :size="15" />
        </button>

        <button
          type="button"
          @click.stop="$emit('edit', student)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-slate-800 transition-colors"
          title="Edit Siswa"
        >
          <Icon name="edit" :size="15" />
        </button>

        <button
          type="button"
          @click.stop="$emit('delete', student.id)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="Hapus Siswa"
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
import type { Student } from '@/types'

const props = defineProps<{
  student: Student & { nextLesson?: string | null; totalLessons?: number; paymentStatus?: string }
}>()

defineEmits<{
  (e: 'view-detail', student: Student): void
  (e: 'edit', student: Student): void
  (e: 'schedule-lesson', student: Student): void
  (e: 'delete', id: string): void
}>()

function getInitials(name: string) {
  if (!name) return 'S'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const avatarBg = computed(() => {
  const charCode = props.student.name.charCodeAt(0) || 0
  const colors = [
    'bg-gradient-to-br from-cyan-600 to-blue-700',
    'bg-gradient-to-br from-indigo-600 to-purple-700',
    'bg-gradient-to-br from-emerald-600 to-teal-700',
    'bg-gradient-to-br from-amber-600 to-orange-700',
    'bg-gradient-to-br from-rose-600 to-pink-700',
  ]
  return colors[charCode % colors.length]
})

const statusClasses = computed(() => {
  switch (props.student.status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    case 'paused':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    case 'graduated':
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700'
  }
})

const statusIcon = computed(() => {
  switch (props.student.status) {
    case 'active': return '🟢'
    case 'paused': return '⏸️'
    case 'graduated': return '🎓'
    default: return '•'
  }
})

const formattedSchedule = computed(() => {
  if (!props.student.schedule || props.student.schedule.length === 0) {
    return 'Jadwal belum diatur'
  }
  return props.student.schedule
    .map(s => `${s.day} (${s.start_time}-${s.end_time})`)
    .join(', ')
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateTime(datetimeStr: string) {
  if (!datetimeStr) return ''
  const d = new Date(datetimeStr)
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
