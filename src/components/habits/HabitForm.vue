<template>
  <teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" @click="onClose"></div>

      <div class="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 animate-modal-pop">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center text-xl">
              {{ form.icon || '✨' }}
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-white">
                {{ isEditing ? 'Edit Habit' : 'Buat Habit Baru' }}
              </h2>
              <p class="text-xs text-slate-400">
                Bangun rutinitas positif dan lacak konsistensi harian
              </p>
            </div>
          </div>
          <button @click="onClose" class="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll">
          <!-- Icon Picker + Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              Nama Habit / Kebiasaan <span class="text-rose-400">*</span>
            </label>
            <div class="flex gap-2">
              <div class="relative">
                <button
                  type="button"
                  @click="showEmojiPicker = !showEmojiPicker"
                  class="w-11 h-11 rounded-xl bg-dark border border-slate-700 flex items-center justify-center text-xl hover:border-accent transition-colors"
                  title="Pilih Icon"
                >
                  {{ form.icon }}
                </button>
                <!-- Quick Emoji Picker Dropdown -->
                <div
                  v-if="showEmojiPicker"
                  class="absolute left-0 top-12 z-20 p-2.5 rounded-xl bg-slate-800 border border-slate-700 shadow-xl grid grid-cols-6 gap-1.5 w-64"
                >
                  <button
                    v-for="e in popularEmojis"
                    :key="e"
                    type="button"
                    @click="form.icon = e; showEmojiPicker = false"
                    class="w-8 h-8 rounded-lg hover:bg-slate-700 flex items-center justify-center text-lg"
                  >
                    {{ e }}
                  </button>
                </div>
              </div>

              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g. Lari Pagi, Baca Buku 30 Menit, Trading Journal..."
                class="input-field text-xs h-11 flex-1 font-semibold"
              />
            </div>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
            <select v-model="form.category" class="input-field text-xs h-10" required>
              <option value="Health">🏃 Health & Fitness (Kesehatan/Olahraga)</option>
              <option value="Learning">📚 Learning & Mindset (Belajar/Membaca)</option>
              <option value="Trading">📈 Trading & Finance (Analisis/Journaling)</option>
              <option value="Teaching">🎓 Teaching & Academic (Mengajar/Persiapan)</option>
              <option value="Spiritual">🧘 Spiritual & Mindfulness (Ibadah/Meditasi)</option>
              <option value="Social">🤝 Social & Relationships (Keluarga/Teman)</option>
              <option value="General">✨ General Routine (Rutinitas Umum)</option>
            </select>
          </div>

          <!-- Frequency Toggle: Daily vs Weekly vs Custom -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Frekuensi Eksekusi</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="form.frequency = 'daily'"
                class="py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center"
                :class="form.frequency === 'daily'
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-dark border-slate-800 text-slate-400 hover:border-slate-700'"
              >
                Setiap Hari (Daily)
              </button>
              <button
                type="button"
                @click="form.frequency = 'weekly'"
                class="py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center"
                :class="form.frequency === 'weekly'
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-dark border-slate-800 text-slate-400 hover:border-slate-700'"
              >
                Mingguan (Weekly)
              </button>
              <button
                type="button"
                @click="form.frequency = 'custom'"
                class="py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center"
                :class="form.frequency === 'custom'
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-dark border-slate-800 text-slate-400 hover:border-slate-700'"
              >
                Hari Tertentu
              </button>
            </div>
          </div>

          <!-- Custom Days Selector (if custom chosen) -->
          <div v-if="form.frequency === 'custom'" class="p-3 rounded-xl bg-dark/60 border border-slate-800 space-y-2">
            <label class="block text-[11px] font-semibold text-slate-400">Pilih Hari Aktif:</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="d in daysList"
                :key="d"
                type="button"
                @click="toggleDay(d)"
                class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
                :class="form.frequency_days.includes(d)
                  ? 'bg-accent text-dark border-accent font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700'"
              >
                {{ d }}
              </button>
            </div>
          </div>

          <!-- Target & Reminder Time -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Target Harian (Opsional)</label>
              <input
                v-model="form.target"
                type="text"
                placeholder="e.g. 30 Menit, 10 Halaman"
                class="input-field text-xs h-10"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Waktu Pengingat (Opsional)</label>
              <input
                v-model="form.reminder_time"
                type="time"
                class="input-field text-xs h-10"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              @click="onClose"
              class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold"
            >
              {{ isEditing ? 'Simpan Perubahan' : 'Buat Habit' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Habit, HabitFormData, HabitCategory, HabitFrequency } from '@/types'

const props = defineProps<{
  habit?: Habit | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: HabitFormData): void
}>()

const isEditing = computed(() => !!props.habit)
const showEmojiPicker = ref(false)

const popularEmojis = [
  '🏃', '🏸', '🏋️', '🚴', '🧘', '💧',
  '📚', '📖', '✍️', '💡', '🧠', '🎯',
  '📈', '💹', '💰', '📊', '💼', '🚀',
  '🍎', '🥗', '🥦', '☕', '🛌', '⏰',
  '🎓', '📝', '🎨', '🎸', '🌱', '✨',
]

const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const form = reactive<HabitFormData>({
  name: '',
  icon: '🏃',
  frequency: 'daily' as HabitFrequency,
  frequency_days: ['Senin', 'Rabu', 'Jumat'],
  reminder_time: '',
  target: '30 Menit',
  category: 'Health' as HabitCategory,
})

function toggleDay(day: string) {
  const idx = form.frequency_days.indexOf(day)
  if (idx > -1) {
    form.frequency_days.splice(idx, 1)
  } else {
    form.frequency_days.push(day)
  }
}

function handleSubmit() {
  if (!form.name.trim()) {
    alert('Mohon isi nama habit.')
    return
  }

  emit('save', { ...form })
}

function onClose() {
  emit('close')
}

onMounted(() => {
  if (props.habit) {
    const h = props.habit
    form.name = h.name
    form.icon = h.icon || '✨'
    form.frequency = h.frequency
    form.frequency_days = [...(h.frequency_days || [])]
    form.reminder_time = h.reminder_time || ''
    form.target = h.target || ''
    form.category = h.category || 'Health'
  }
})
</script>

<style scoped>
@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.animate-modal-pop {
  animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
