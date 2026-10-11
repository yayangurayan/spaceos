<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📚</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {{ t('book_library_title') }}
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          {{ t('book_library_desc') }}
        </p>
      </div>

      <!-- Header Action Buttons -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="showStats = !showStats"
          class="btn-secondary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center justify-center gap-2"
        >
          <Icon :name="showStats ? 'book-open' : 'bar-chart-2'" :size="16" />
          <span>{{ showStats ? t('close_statistics') : t('stats_heatmap') }}</span>
        </button>

        <button
          type="button"
          @click="openAddModal"
          class="btn-primary flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10"
        >
          <Icon name="plus" :size="16" />
          <span>{{ t('add_book') }}</span>
        </button>
      </div>
    </div>

    <!-- 2. Library Stats Overview Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <!-- Total Books Read -->
      <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <Icon name="check-circle" class="w-5 h-5 text-emerald-500" />
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">{{ t('total_trades') }}</span>
        </div>
        <p class="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
          <AnimatedNumber :value="libraryStats.totalRead" />
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ t('books_finished') }}</p>
      </div>

      <!-- Currently Reading -->
      <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <Icon name="book-open" class="w-5 h-5 text-sky-500" />
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-cyan-400">{{ t('active') }}</span>
        </div>
        <p class="text-2xl font-bold font-mono text-sky-600 dark:text-cyan-300">
          <AnimatedNumber :value="libraryStats.currentlyReading" />
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ t('currently_reading') }}</p>
      </div>

      <!-- Books This Year -->
      <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <Icon name="calendar" class="w-5 h-5 text-indigo-500" />
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">{{ t('this_year') }}</span>
        </div>
        <p class="text-2xl font-bold font-mono text-slate-900 dark:text-white">
          <AnimatedNumber :value="libraryStats.booksThisYear" />
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ t('books_this_year') }} {{ currentYear }}</p>
      </div>

      <!-- Reading Streak -->
      <div class="surface-card p-4 transition-transform hover:-translate-y-0.5">
        <div class="flex items-center justify-between mb-2">
          <Icon name="flame" class="w-5 h-5 text-amber-500" />
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">{{ t('streak') }}</span>
        </div>
        <p class="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
          <AnimatedNumber :value="libraryStats.readingStreak" suffix=" Hari" />
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ t('reading_consistency') }}</p>
      </div>

      <!-- Pages Read This Month -->
      <div class="surface-card p-4 transition-transform hover:-translate-y-0.5 col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between mb-2">
          <Icon name="file-text" class="w-5 h-5 text-rose-500" />
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-300">{{ t('this_month') }}</span>
        </div>
        <p class="text-2xl font-bold font-mono text-sky-600 dark:text-accent">
          <AnimatedNumber :value="libraryStats.pagesReadThisMonth" />
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ t('pages_read') }}</p>
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
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <!-- Tabs -->
        <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar pb-1">
          <!-- Currently Reading -->
          <button
            type="button"
            @click="selectedShelf = 'reading'"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0"
            :class="selectedShelf === 'reading'
              ? 'bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'"
          >
            <Icon name="book-open" :size="15" />
            <span>{{ t('currently_reading') }}</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
              :class="selectedShelf === 'reading' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
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
              ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'"
          >
            <Icon name="check-circle" :size="15" />
            <span>{{ t('completed') }}</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
              :class="selectedShelf === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
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
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'"
          >
            <Icon name="bookmark" :size="15" />
            <span>{{ t('want_to_read') }}</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
              :class="selectedShelf === 'want_to_read' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
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
              ? 'bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'"
          >
            <Icon name="star" :size="15" />
            <span>{{ t('favorite') }}</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
              :class="selectedShelf === 'favorites' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
            >
              {{ shelfCounts.favorites }}
            </span>
          </button>
        </div>

        <!-- Search & Filter Controls -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Search Bar -->
          <div class="relative flex-1 sm:w-56">
            <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari judul, penulis..."
              class="input-field pl-9 pr-3 py-1.5 text-xs"
            />
          </div>

          <!-- Genre Dropdown -->
          <select
            v-model="selectedGenre"
            class="input-field px-3 py-1.5 text-xs"
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
    <div v-if="filteredBooks.length === 0" class="surface-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
      <Icon name="book-open" class="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-60" />
      <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ t('no_books_on_shelf') }}</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        {{ searchQuery || selectedGenre !== 'all' ? t('change_search_filter') : t('add_book_to_shelf') }}
      </p>
      <button
        type="button"
        @click="openAddModal"
        class="btn-primary mt-2 px-5 py-2 text-xs font-bold rounded-xl"
      >
        + {{ t('add_book_now') }}
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
import { useI18n } from '@/composables/useI18n'
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
const { t } = useI18n()

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
