<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ isEdit ? '✏️' : '🗓️' }}</span>
          <div>
            <h2 class="text-lg font-bold text-white">
              {{ isEdit ? 'Edit Event / Kegiatan' : 'Buat Event Baru' }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ isEdit ? 'Perbarui informasi tanggal, checklist, atau anggaran event.' : 'Jadwalkan kegiatan seminar, kompetisi, atau agenda penting kamu.' }}
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
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        <!-- 1. Title & Category -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Title -->
          <div class="space-y-1.5 sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-300">
              Nama Event / Agenda <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="e.g. Asia Trader Summit 2026, Price Action Workshop"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Category -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Kategori <span class="text-rose-400">*</span>
            </label>
            <select
              v-model="form.category"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option v-for="cat in availableCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
        </div>

        <!-- 2. Date & Time (Start & End) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Start DateTime -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Waktu Mulai <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="startDateTimeInput"
              type="datetime-local"
              required
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
            />
          </div>

          <!-- End DateTime -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Waktu Selesai (Opsional)
            </label>
            <input
              v-model="endDateTimeInput"
              type="datetime-local"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
            />
          </div>
        </div>

        <!-- 3. Location, Status, Cost -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Location -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Lokasi / Platform
            </label>
            <input
              v-model="form.location"
              type="text"
              placeholder="e.g. Jakarta / Zoom Online"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Status -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Status Partisipasi
            </label>
            <select
              v-model="form.status"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="planning">📝 Planning (Rencana)</option>
              <option value="registered">🎟️ Registered (Terdaftar)</option>
              <option value="attending">📍 Attending (Hadir)</option>
              <option value="completed">✅ Completed (Selesai)</option>
            </select>
          </div>

          <!-- Cost / Budget -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Biaya / Budget (IDR)
            </label>
            <input
              v-model.number="form.cost"
              type="number"
              min="0"
              placeholder="e.g. 500000"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <!-- 4. Reminders -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-300">
            Pengingat (Reminder)
          </label>
          <div class="flex flex-wrap gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                :checked="form.reminder_days.includes(1)"
                @change="toggleReminder(1)"
                class="w-4 h-4 rounded text-accent bg-slate-800 border-slate-700 focus:ring-accent"
              />
              <span>1 Hari Sebelumnya</span>
            </label>

            <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                :checked="form.reminder_days.includes(3)"
                @change="toggleReminder(3)"
                class="w-4 h-4 rounded text-accent bg-slate-800 border-slate-700 focus:ring-accent"
              />
              <span>3 Hari Sebelumnya</span>
            </label>

            <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                :checked="form.reminder_days.includes(7)"
                @change="toggleReminder(7)"
                class="w-4 h-4 rounded text-accent bg-slate-800 border-slate-700 focus:ring-accent"
              />
              <span>1 Minggu Sebelumnya</span>
            </label>
          </div>
        </div>

        <!-- 5. Description -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Deskripsi & Agenda Acara
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Tuliskan gambaran acara, pembicara, topik, atau link registrasi..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          ></textarea>
        </div>

        <!-- 6. Preparation Checklist Builder -->
        <div class="space-y-2.5 pt-2 border-t border-slate-800">
          <label class="block text-xs font-semibold text-slate-300">
            Checklist Persiapan Event
          </label>

          <!-- Add checklist item input -->
          <div class="flex items-center gap-2">
            <input
              v-model="newChecklistText"
              type="text"
              placeholder="e.g. Cetak tiket, bawa kartu nama, siapkan pertanyaan..."
              @keydown.enter.prevent="addChecklistItem"
              class="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              @click="addChecklistItem"
              class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-colors"
            >
              + Tambah Item
            </button>
          </div>

          <!-- Checklist items list -->
          <div v-if="form.checklist.length > 0" class="space-y-1.5 mt-2">
            <div
              v-for="(item, idx) in form.checklist"
              :key="item.id || idx"
              class="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs"
            >
              <label class="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-2">
                <input
                  type="checkbox"
                  v-model="item.completed"
                  class="w-4 h-4 rounded text-accent bg-slate-800 border-slate-700 focus:ring-accent"
                />
                <span :class="{ 'line-through text-slate-500': item.completed, 'text-slate-200': !item.completed }" class="truncate">
                  {{ item.text }}
                </span>
              </label>

              <button
                type="button"
                @click="removeChecklistItem(idx)"
                class="text-slate-500 hover:text-rose-400 p-1"
              >
                <Icon name="trash" :size="13" />
              </button>
            </div>
          </div>
        </div>

        <!-- 7. Attachments (PDF / Images) -->
        <div class="space-y-2.5 pt-2 border-t border-slate-800">
          <label class="block text-xs font-semibold text-slate-300">
            Lampiran Berkas (PDF, Gambar E-ticket, dsb)
          </label>

          <div class="flex items-center gap-2">
            <label class="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium transition-colors">
              <Icon name="upload" :size="14" />
              <span>Unggah Dokumen / Gambar</span>
              <input type="file" multiple class="hidden" @change="handleFileUpload" />
            </label>
          </div>

          <!-- Attachment List -->
          <div v-if="attachmentsList.length > 0" class="space-y-1.5 mt-2">
            <div
              v-for="(att, idx) in attachmentsList"
              :key="idx"
              class="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs"
            >
              <div class="flex items-center gap-2 truncate pr-2">
                <Icon name="file-text" :size="14" class="text-accent flex-shrink-0" />
                <span class="text-slate-200 truncate">{{ att.file_name }}</span>
                <span class="text-[10px] text-slate-500 uppercase">({{ att.file_type }})</span>
              </div>
              <button
                type="button"
                @click="attachmentsList.splice(idx, 1)"
                class="text-slate-500 hover:text-rose-400 p-1"
              >
                <Icon name="trash" :size="13" />
              </button>
            </div>
          </div>
        </div>

        <!-- 8. Notes -->
        <div class="space-y-1.5 pt-2 border-t border-slate-800">
          <label class="block text-xs font-semibold text-slate-300">
            Catatan Tambahan
          </label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="e.g. Parkir di basement B2, kontak panitia di 0812..."
            class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
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
          class="btn-primary px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 flex items-center gap-2"
        >
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Buat Event' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { EVENT_CATEGORIES } from '@/composables/useEvents'
import type { EventItem, EventFormData } from '@/types'

const props = defineProps<{
  event: EventItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: EventFormData, attachments?: { file_name: string; file_url: string; file_type: string }[]): void
}>()

const isEdit = computed(() => Boolean(props.event))
const availableCategories = EVENT_CATEGORIES

function formatForDatetimeLocal(isoStr?: string | null) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  // Format to YYYY-MM-DDTHH:MM local time
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

const startDateTimeInput = ref(
  props.event?.start_datetime
    ? formatForDatetimeLocal(props.event.start_datetime)
    : formatForDatetimeLocal(new Date(Date.now() + 86400000).toISOString())
)

const endDateTimeInput = ref(
  props.event?.end_datetime ? formatForDatetimeLocal(props.event.end_datetime) : ''
)

const newChecklistText = ref('')
const attachmentsList = ref<{ file_name: string; file_url: string; file_type: string }[]>(
  props.event?.attachments
    ? props.event.attachments.map(a => ({ file_name: a.file_name, file_url: a.file_url, file_type: a.file_type }))
    : []
)

const form = reactive<EventFormData>({
  title: props.event?.title || '',
  start_datetime: props.event?.start_datetime || new Date(Date.now() + 86400000).toISOString(),
  end_datetime: props.event?.end_datetime || '',
  location: props.event?.location || '',
  category: props.event?.category || 'Trading Event',
  status: props.event?.status || 'planning',
  cost: props.event?.cost !== undefined && props.event?.cost !== null ? props.event.cost : null,
  description: props.event?.description || '',
  reminder_days: props.event?.reminder_days ? [...props.event.reminder_days] : [1],
  checklist: props.event?.checklist ? JSON.parse(JSON.stringify(props.event.checklist)) : [],
  notes: props.event?.notes || '',
})

function toggleReminder(days: number) {
  const idx = form.reminder_days.indexOf(days)
  if (idx > -1) {
    form.reminder_days.splice(idx, 1)
  } else {
    form.reminder_days.push(days)
  }
}

function addChecklistItem() {
  if (!newChecklistText.value.trim()) return
  form.checklist.push({
    id: 'c-' + Date.now(),
    text: newChecklistText.value.trim(),
    completed: false,
  })
  newChecklistText.value = ''
}

function removeChecklistItem(idx: number) {
  form.checklist.splice(idx, 1)
}

function handleFileUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = () => {
      attachmentsList.value.push({
        file_name: file.name,
        file_url: reader.result as string,
        file_type: file.type || 'file',
      })
    }
    reader.readAsDataURL(file)
  })
}

function handleSubmit() {
  if (!form.title.trim() || !startDateTimeInput.value) return

  form.start_datetime = new Date(startDateTimeInput.value).toISOString()
  form.end_datetime = endDateTimeInput.value ? new Date(endDateTimeInput.value).toISOString() : ''

  emit('save', { ...form }, attachmentsList.value)
}
</script>
