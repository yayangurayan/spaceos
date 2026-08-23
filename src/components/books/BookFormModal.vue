<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div
      class="relative w-full max-w-2xl bg-surface border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-surface/50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ isEdit ? '✏️' : '📚' }}</span>
          <div>
            <h2 class="text-lg font-bold text-white">
              {{ isEdit ? 'Edit Informasi Buku' : 'Tambah Buku ke Library' }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ isEdit ? 'Perbarui progres, catatan, atau rating buku ini.' : 'Simpan buku yang ingin atau sedang kamu baca.' }}
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

      <!-- Form Body (Scrollable) -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        <!-- 1. Basic Info: Title & Author -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Title -->
          <div class="space-y-1.5 sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-300">
              Judul Buku <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="e.g. Trading in the Zone, Atomic Habits"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <!-- Author -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Penulis / Author <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.author"
              type="text"
              required
              placeholder="e.g. Mark Douglas"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <!-- Recommended By -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Rekomendasi Dari (Opsional)
            </label>
            <input
              v-model="form.recommended_by"
              type="text"
              placeholder="e.g. Rekan Trader, Podcast, Teman"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <!-- 2. Cover Image (URL or Upload Preview) -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-300">
            Cover Buku (URL atau Unggah)
          </label>
          <div class="flex items-start gap-4">
            <!-- Cover Preview -->
            <div class="w-16 h-24 rounded-lg bg-slate-900 border border-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-slate-500">
              <img
                v-if="form.cover_url"
                :src="form.cover_url"
                alt="Preview"
                class="w-full h-full object-cover"
                @error="previewError = true"
              />
              <span v-else class="text-xl">🖼️</span>
            </div>

            <!-- Inputs -->
            <div class="flex-1 space-y-2">
              <input
                v-model="form.cover_url"
                type="url"
                placeholder="Paste URL gambar (https://...)"
                class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
              />
              <div class="flex items-center gap-2">
                <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium transition-colors">
                  <Icon name="upload" :size="13" />
                  <span>Pilih File Gambar</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
                </label>
                <button
                  v-if="form.cover_url"
                  type="button"
                  @click="form.cover_url = ''"
                  class="text-xs text-rose-400 hover:underline"
                >
                  Hapus Cover
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Shelves & Status -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Status -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Status Rak
            </label>
            <select
              v-model="form.status"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="reading">📖 Sedang Dibaca</option>
              <option value="completed">✅ Selesai Dibaca</option>
              <option value="want_to_read">📚 Ingin Dibaca</option>
            </select>
          </div>

          <!-- Total Pages -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Total Halaman
            </label>
            <input
              v-model.number="form.total_pages"
              type="number"
              min="1"
              placeholder="e.g. 320"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Current Page -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Halaman Saat Ini
            </label>
            <input
              v-model.number="form.current_page"
              type="number"
              min="0"
              :max="form.total_pages || 9999"
              placeholder="0"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <!-- 4. Reading Dates & Rating -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Start Date -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Mulai Baca
            </label>
            <input
              v-model="form.start_date"
              type="date"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <!-- End Date -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Selesai Baca
            </label>
            <input
              v-model="form.end_date"
              type="date"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Rating -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Rating Pribadi
            </label>
            <div class="flex items-center gap-1 py-1">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="form.rating = form.rating === star ? null : star"
                class="text-xl transition-transform hover:scale-125 focus:outline-none"
                :class="(form.rating || 0) >= star ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400/50'"
              >
                ★
              </button>
              <span v-if="form.rating" class="text-xs text-slate-400 ml-1 font-mono">
                ({{ form.rating }}/5)
              </span>
            </div>
          </div>
        </div>

        <!-- 5. Genre Multi-Select Pills -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-300">
            Genre / Kategori (Pilih satu atau lebih)
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="genre in availableGenres"
              :key="genre"
              type="button"
              @click="toggleGenre(genre)"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="form.genres.includes(genre)
                ? 'bg-accent text-dark font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'"
            >
              {{ genre }}
            </button>
          </div>
        </div>

        <!-- 6. Favorite Toggle -->
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <input
            id="fav-check"
            v-model="form.is_favorite"
            type="checkbox"
            class="w-4 h-4 rounded text-accent bg-slate-800 border-slate-700 focus:ring-accent"
          />
          <label for="fav-check" class="text-xs text-slate-300 font-medium cursor-pointer select-none">
            ⭐ Tandai sebagai <strong>Buku Favorit</strong> (Ditampilkan di rak Favorit)
          </label>
        </div>

        <!-- 7. Review, Key Insights, Quotes -->
        <div class="space-y-4 pt-2 border-t border-slate-800">
          <!-- Review -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Review / Catatan Evaluasi Buku
            </label>
            <textarea
              v-model="form.review"
              rows="3"
              placeholder="Tulis ulasan, ringkasan umum, atau kesan kamu tentang buku ini..."
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            ></textarea>
          </div>

          <!-- Key Insights -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Key Insights (Poin-poin Pembelajaran Utama)
            </label>
            <textarea
              v-model="form.insights"
              rows="3"
              placeholder="1. Insight pertama...&#10;2. Insight kedua..."
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent font-mono text-[11px]"
            ></textarea>
          </div>

          <!-- Quotes I Love -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">
              Kutipan Favorit (Quotes I Love)
            </label>
            <textarea
              v-model="form.quotes"
              rows="2"
              placeholder="&quot;Kutipan yang berkesan dari buku ini...&quot;"
              class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent italic"
            ></textarea>
          </div>
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
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Tambah Buku' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { GENRE_OPTIONS } from '@/composables/useBooks'
import type { Book, BookFormData } from '@/types'

const props = defineProps<{
  book: Book | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: BookFormData): void
}>()

const isEdit = computed(() => Boolean(props.book))
const availableGenres = GENRE_OPTIONS
const previewError = ref(false)

const form = reactive<BookFormData>({
  title: props.book?.title || '',
  author: props.book?.author || '',
  cover_url: props.book?.cover_url || '',
  total_pages: props.book?.total_pages || null,
  current_page: props.book?.current_page || 0,
  status: props.book?.status || 'want_to_read',
  start_date: props.book?.start_date || '',
  end_date: props.book?.end_date || '',
  rating: props.book?.rating || null,
  genres: props.book?.genres ? [...props.book.genres] : ['Trading'],
  review: props.book?.review || '',
  insights: props.book?.insights || '',
  quotes: props.book?.quotes || '',
  recommended_by: props.book?.recommended_by || '',
  is_favorite: props.book?.is_favorite || false,
})

function toggleGenre(genre: string) {
  const idx = form.genres.indexOf(genre)
  if (idx > -1) {
    form.genres.splice(idx, 1)
  } else {
    form.genres.push(genre)
  }
}

function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Convert file to Base64 data URL for instant offline preview & persistence
  const reader = new FileReader()
  reader.onload = () => {
    form.cover_url = reader.result as string
    previewError.value = false
  }
  reader.readAsDataURL(file)
}

function handleSubmit() {
  if (!form.title.trim() || !form.author.trim()) return

  // If status is completed and end_date is missing, set today
  if (form.status === 'completed' && !form.end_date) {
    form.end_date = new Date().toISOString().split('T')[0]
  }

  // If status is completed and total_pages is present, set current_page = total_pages
  if (form.status === 'completed' && form.total_pages && (!form.current_page || form.current_page < form.total_pages)) {
    form.current_page = form.total_pages
  }

  emit('save', { ...form })
}
</script>
