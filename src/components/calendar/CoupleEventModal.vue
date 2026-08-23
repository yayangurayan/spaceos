<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-lg bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ isEdit ? '✏️' : '🗓️' }}</span>
          <div>
            <h2 class="text-lg font-bold text-white">
              {{ isEdit ? 'Edit Jadwal Acara' : 'Buat Agenda Bersama Baru' }}
            </h2>
            <p class="text-xs text-slate-400">
              Jadwalkan kencan, perjalanan, ulang tahun, atau rencana spesial berdua.
            </p>
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

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <!-- 1. Category -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Kategori Agenda
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="cat in categories"
              :key="cat.name"
              type="button"
              @click="selectCategory(cat)"
              class="py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              :class="form.category === cat.name
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'"
            >
              <span>{{ cat.icon }}</span>
              <span>{{ cat.name }}</span>
            </button>
          </div>
        </div>

        <!-- 2. Title -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Nama Acara / Kegiatan <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="e.g. Dinner Anniversary, Nonton Bioskop, Trip Bali"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <!-- 3. All Day Toggle & Datetime -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Acara Sepanjang Hari (All Day)</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.all_day" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[11px] text-slate-400">Waktu Mulai <span class="text-rose-400">*</span></label>
              <input
                v-model="startTimeInput"
                :type="form.all_day ? 'date' : 'datetime-local'"
                required
                class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-[11px] text-slate-400">Waktu Selesai</label>
              <input
                v-model="endTimeInput"
                :type="form.all_day ? 'date' : 'datetime-local'"
                class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        <!-- 4. Location -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Lokasi / Tempat
          </label>
          <input
            v-model="form.location"
            type="text"
            placeholder="📍 e.g. Skye Rooftop, CGV Grand Indonesia, Rumah"
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <!-- 5. Repeat & Color -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">Ulangi Acara (Recurrence)</label>
            <select
              v-model="form.repeat_rule"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="none">Tidak berulang</option>
              <option value="weekly">Setiap Minggu</option>
              <option value="monthly">Setiap Bulan</option>
              <option value="yearly">Setiap Tahun (Anniversary/Birthday)</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">Warna Label</label>
            <div class="flex items-center gap-2 pt-1">
              <button
                v-for="c in colorChoices"
                :key="c"
                type="button"
                @click="form.color = c"
                class="w-6 h-6 rounded-full transition-transform"
                :class="{ 'scale-125 ring-2 ring-white': form.color === c }"
                :style="{ backgroundColor: c }"
              ></button>
            </div>
          </div>
        </div>

        <!-- 6. Description -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Catatan / Rincian Tambahan
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Dresscode, persiapan kado, tiket bioskop..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          ></textarea>
        </div>
      </form>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/60 bg-surface/50">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSubmit"
          class="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all"
        >
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Jadwalkan Acara 💕' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import type { CoupleCalendarEvent, CoupleEventFormData, CoupleEventCategory } from '@/types'

const props = defineProps<{
  event: CoupleCalendarEvent | null
  initialDate?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: CoupleEventFormData): void
}>()

const isEdit = computed(() => Boolean(props.event))

const categories: { name: CoupleEventCategory; icon: string; defaultColor: string }[] = [
  { name: 'Date Night', icon: '🍷', defaultColor: '#f43f5e' },
  { name: 'Travel', icon: '✈️', defaultColor: '#8b5cf6' },
  { name: 'Anniversary', icon: '🎂', defaultColor: '#ec4899' },
  { name: 'Together', icon: '💕', defaultColor: '#06b6d4' },
  { name: 'Reminder', icon: '⏰', defaultColor: '#f59e0b' },
  { name: 'Personal', icon: '👤', defaultColor: '#10b981' },
]

const colorChoices = ['#f43f5e', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']

function formatDateTimeLocal(isoStr?: string) {
  const d = isoStr ? new Date(isoStr) : (props.initialDate ? new Date(props.initialDate) : new Date())
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

const startTimeInput = ref(formatDateTimeLocal(props.event?.start_time))
const endTimeInput = ref(props.event?.end_time ? formatDateTimeLocal(props.event.end_time) : '')

const form = reactive<CoupleEventFormData>({
  title: props.event?.title || '',
  description: props.event?.description || '',
  start_time: props.event?.start_time || new Date().toISOString(),
  end_time: props.event?.end_time || '',
  all_day: props.event?.all_day || false,
  location: props.event?.location || '',
  category: props.event?.category || 'Date Night',
  color: props.event?.color || '#f43f5e',
  repeat_rule: props.event?.repeat_rule || 'none',
})

function selectCategory(cat: { name: CoupleEventCategory; defaultColor: string }) {
  form.category = cat.name
  form.color = cat.defaultColor
}

function handleSubmit() {
  if (!form.title.trim() || !startTimeInput.value) return
  form.start_time = new Date(startTimeInput.value).toISOString()
  if (endTimeInput.value) {
    form.end_time = new Date(endTimeInput.value).toISOString()
  }
  emit('save', { ...form })
}
</script>
