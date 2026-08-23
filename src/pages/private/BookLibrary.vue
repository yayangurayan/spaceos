<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📚</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Book Library
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Koleksi bacaan, catatan pembelajaran, dan pelacak konsistensi membaca di SpaceOS.
        </p>
      </div>

      <!-- Header Action Buttons -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="showStats = !showStats"
          class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center justify-center gap-2"
          :class="showStats
            ? 'bg-slate-700 text-white border-slate-600'
            : 'bg-dark/60 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'"
        >
          <span>{{ showStats ? '📕 Tutup Statistik' : '📊 Statistik & Heatmap' }}</span>
        </button>

        <button
          type="button"
          @click="openAddModal"
          class="btn-primary flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <Icon name="plus" :size="16" />
          <span>Tambah Buku</span>
        </button>
      </div>
    </div>

    <!-- 2. Library Stats Overview Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <!-- Total Books Read -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">✅</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Total</span>
        </div>
        <p class="text-2xl font-bold font-mono text-emerald-400">
          <AnimatedNumber :value="libraryStats.totalRead" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Buku Selesai</p>
      </div>

      <!-- Currently Reading -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">📖</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">Aktif</span>
        </div>
        <p class="text-2xl font-bold font-mono text-cyan-300">
          <AnimatedNumber :value="libraryStats.currentlyReading" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Sedang Dibaca</p>
      </div>

      <!-- Books This Year -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">🗓️</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">Tahun Ini</span>
        </div>
        <p class="text-2xl font-bold font-mono text-white">
          <AnimatedNumber :value="libraryStats.booksThisYear" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Buku di {{ currentYear }}</p>
      </div>

      <!-- Reading Streak -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">🔥</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Streak</span>
        </div>
        <p class="text-2xl font-bold font-mono text-amber-400">
          <AnimatedNumber :value="libraryStats.readingStreak" suffix=" Hari" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Konsistensi Membaca</p>
      </div>

      <!-- Pages Read This Month -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 transition-transform hover:-translate-y-0.5 col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl">📄</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300">Bulan Ini</span>
        </div>
        <p class="text-2xl font-bold font-mono text-accent">
          <AnimatedNumber :value="libraryStats.pagesReadThisMonth" />
        </p>
        <p class="text-[11px] text-slate-400 mt-0.5">Halaman Dibaca</p>
      </div>
    </div>

    <!-- 3. Collapsible Reading Stats & Heatmap Section -->
    <BookStatsCharts
      v-if="showStats"
      :total-books="shelfCounts.total"
      :average-rating="libraryStats.averageRating"
      :genre-stats="genreStats"
      :books-per-month-data="booksPerMonthData"
      :reading-heatmap="readingHeatmap"
      :reading-logs="readingLogs"
    />

    <!-- 4. Book Shelves Tabs & Filters Toolbar -->
    <div class="space-y-3 pt-2">
      <!-- Shelves Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <!-- Tabs -->
        <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar pb-1">
          <!-- Currently Reading -->
          <button
            type="button"
            @click="selectedShelf = 'reading'"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0"
            :class="selectedShelf === 'reading'
              ? 'bg-accent text-dark font-bold shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
          >
            <span>📖</span>
            <span>Sedang Baca</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
              :class="selectedShelf === 'reading' ? 'bg-dark/30 text-dark' : 'bg-slate-800 text-slate-400'"
            >
              {{ shelfCounts.reading }}
            </span>
          </button>

          <!-- Completed -->
          <button
            type="button"
            @click="selectedShelf = 'completed'"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0"
            :class="selectedShelf === 'completed'
              ? 'bg-emerald-500 text-dark font-bold shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
          >
            <span>✅</span>
            <span>Selesai</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
              :class="selectedShelf === 'completed' ? 'bg-dark/30 text-dark' : 'bg-slate-800 text-slate-400'"
            >
              {{ shelfCounts.completed }}
            </span>
          </button>

          <!-- Want to Read -->
          <button
            type="button"
            @click="selectedShelf = 'want_to_read'"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0"
            :class="selectedShelf === 'want_to_read'
              ? 'bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
          >
            <span>📚</span>
            <span>Ingin Dibaca</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
              :class="selectedShelf === 'want_to_read' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'"
            >
              {{ shelfCounts.want_to_read }}
            </span>
          </button>

          <!-- Favorites -->
          <button
            type="button"
            @click="selectedShelf = 'favorites'"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0"
            :class="selectedShelf === 'favorites'
              ? 'bg-amber-400 text-dark font-bold shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
          >
            <span>⭐</span>
            <span>Favorit</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
              :class="selectedShelf === 'favorites' ? 'bg-dark/30 text-dark' : 'bg-slate-800 text-slate-400'"
            >
              {{ shelfCounts.favorites }}
            </span>
          </button>
        </div>

        <!-- Search & Filter Controls -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Search Bar -->
          <div class="relative flex-1 sm:w-56">
            <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari judul, penulis..."
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
            />
          </div>

          <!-- Genre Dropdown -->
          <select
            v-model="selectedGenre"
            class="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
          >
            <option value="all">Semua Genre</option>
            <option v-for="genre in availableGenres" :key="genre" :value="genre">
              {{ genre }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 5. Books Grid -->
    <div v-if="filteredBooks.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block mb-1">📖</span>
      <h3 class="text-base font-bold text-white">Tidak ada buku di rak ini</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        {{ searchQuery || selectedGenre !== 'all' ? 'Coba ubah kata kunci pencarian atau filter genre.' : 'Mulai tambahkan buku untuk mengisi rak ini.' }}
      </p>
      <button
        type="button"
        @click="openAddModal"
        class="btn-primary mt-2 px-5 py-2 text-xs font-bold rounded-xl"
      >
        + Tambah Buku Sekarang
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
      <BookCard
        v-for="book in filteredBooks"
        :key="book.id"
        :book="book"
        @edit="openEditModal"
        @delete="confirmDelete"
        @update-progress="openProgressModal"
        @move-shelf="handleMoveShelf"
        @toggle-favorite="handleToggleFavorite"
        @view-detail="openDetailModal"
      />
    </div>

    <!-- Modals -->
    <!-- 1. Add / Edit Book Modal -->
    <BookFormModal
      v-if="showBookModal"
      :book="selectedBook"
      @close="closeBookModal"
      @save="handleSaveBook"
    />

    <!-- 2. Reading Progress Modal -->
    <ReadingProgressModal
      v-if="showProgressModal && activeProgressBook"
      :book="activeProgressBook"
      :reading-logs="readingLogs"
      @close="closeProgressModal"
      @save="handleSaveProgress"
      @delete-log="deleteReadingLog"
    />

    <!-- 3. Book Detail Modal -->
    <BookDetailModal
      v-if="showDetailModal && activeDetailBook"
      :book="activeDetailBook"
      :reading-logs="readingLogs"
      @close="closeDetailModal"
      @edit="handleDetailEdit"
      @update-progress="handleDetailProgress"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import Icon from '@/components/ui/Icon.vue'
import BookCard from '@/components/books/BookCard.vue'
import BookFormModal from '@/components/books/BookFormModal.vue'
import ReadingProgressModal from '@/components/books/ReadingProgressModal.vue'
import BookStatsCharts from '@/components/books/BookStatsCharts.vue'
import BookDetailModal from '@/components/books/BookDetailModal.vue'
import { useBooks, GENRE_OPTIONS } from '@/composables/useBooks'
import type { Book, BookFormData, BookShelfStatus } from '@/types'

const {
  books,
  readingLogs,
  shelfCounts,
  filteredBooks,
  libraryStats,
  genreStats,
  booksPerMonthData,
  readingHeatmap,
  selectedShelf,
  searchQuery,
  selectedGenre,
  fetchBooksData,
  createBook,
  updateBook,
  deleteBook,
  moveShelf,
  toggleFavorite,
  updateProgress,
  deleteReadingLog,
} = useBooks()

const showStats = ref(false)
const availableGenres = GENRE_OPTIONS
const currentYear = new Date().getFullYear()

// Modal States
const showBookModal = ref(false)
const selectedBook = ref<Book | null>(null)

const showProgressModal = ref(false)
const activeProgressBook = ref<Book | null>(null)

const showDetailModal = ref(false)
const activeDetailBook = ref<Book | null>(null)

function openAddModal() {
  selectedBook.value = null
  showBookModal.value = true
}

function openEditModal(book: Book) {
  selectedBook.value = book
  showBookModal.value = true
}

function closeBookModal() {
  showBookModal.value = false
  selectedBook.value = null
}

async function handleSaveBook(formData: BookFormData) {
  if (selectedBook.value) {
    const res = await updateBook(selectedBook.value.id, formData)
    if (res.success) closeBookModal()
  } else {
    const res = await createBook(formData)
    if (res.success) closeBookModal()
  }
}

function openProgressModal(book: Book) {
  activeProgressBook.value = book
  showProgressModal.value = true
}

function closeProgressModal() {
  showProgressModal.value = false
  activeProgressBook.value = null
}

async function handleSaveProgress(newPage: number, pagesReadSession: number, notes: string) {
  if (!activeProgressBook.value) return
  await updateProgress(activeProgressBook.value.id, newPage, pagesReadSession, notes)
  closeProgressModal()
}

function openDetailModal(book: Book) {
  activeDetailBook.value = book
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  activeDetailBook.value = null
}

function handleDetailEdit(book: Book) {
  closeDetailModal()
  openEditModal(book)
}

function handleDetailProgress(book: Book) {
  closeDetailModal()
  openProgressModal(book)
}

async function handleMoveShelf(bookId: string, status: BookShelfStatus) {
  await moveShelf(bookId, status)
}

async function handleToggleFavorite(bookId: string) {
  await toggleFavorite(bookId)
}

async function confirmDelete(bookId: string) {
  const b = books.value.find(item => item.id === bookId)
  if (confirm(`Hapus buku "${b?.title || 'ini'}" beserta semua riwayat membacanya?`)) {
    await deleteBook(bookId)
  }
}

onMounted(() => {
  fetchBooksData()
})
</script>
