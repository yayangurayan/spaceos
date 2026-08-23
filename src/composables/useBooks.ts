import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'
import type {
  Book,
  BookFormData,
  ReadingLog,
  BookShelfTab,
  BookShelfStatus,
  BookLibraryStats,
  GenreStat,
  ReadingHeatmapDay,
} from '@/types'

/* ============================================================
   Default Preset Books
   ============================================================ */
export const DEFAULT_BOOK_PRESETS: Array<Omit<Book, 'id' | 'space_id' | 'created_at'>> = [
  {
    title: 'Trading in the Zone',
    author: 'Mark Douglas',
    cover_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80',
    total_pages: 216,
    current_page: 142,
    status: 'reading',
    start_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    end_date: null,
    rating: 5,
    genres: ['Trading', 'Psychology'],
    review: 'Mastering the market with a strong mindset and discipline.',
    insights: 'Accepting the risk is the absolute foundation of profitable trading. Consistency comes from probabilities, not predictions.',
    quotes: 'When you genuinely accept the risks, you will be at peace with any outcome.',
    recommended_by: 'Senior Trader',
    is_favorite: true,
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    total_pages: 320,
    current_page: 320,
    status: 'completed',
    start_date: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0],
    rating: 5,
    genres: ['Self-Help', 'Psychology'],
    review: 'An easy and proven way to build good habits and break bad ones.',
    insights: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    quotes: 'Every action you take is a vote for the person you wish to become.',
    recommended_by: 'Community',
    is_favorite: true,
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    cover_url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&auto=format&fit=crop&q=80',
    total_pages: 256,
    current_page: 256,
    status: 'completed',
    start_date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() - 70 * 86400000).toISOString().split('T')[0],
    rating: 5,
    genres: ['Business', 'Psychology'],
    review: 'Timeless lessons on wealth, greed, and happiness.',
    insights: 'Doing well with money has a little to do with how smart you are and a lot to do with how you behave.',
    quotes: 'Spending money to show people how much money you have is the fastest way to have less money.',
    recommended_by: 'Mentor',
    is_favorite: true,
  },
  {
    title: 'Reminiscences of a Stock Operator',
    author: 'Edwin Lefèvre',
    cover_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&auto=format&fit=crop&q=80',
    total_pages: 299,
    current_page: 0,
    status: 'want_to_read',
    start_date: null,
    end_date: null,
    rating: null,
    genres: ['Trading', 'Biography'],
    review: null,
    insights: null,
    quotes: null,
    recommended_by: 'Trading Group',
    is_favorite: false,
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    cover_url: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=500&auto=format&fit=crop&q=80',
    total_pages: 304,
    current_page: 0,
    status: 'want_to_read',
    start_date: null,
    end_date: null,
    rating: null,
    genres: ['Self-Help', 'Technology'],
    review: null,
    insights: null,
    quotes: null,
    recommended_by: 'Self',
    is_favorite: false,
  },
]

export const GENRE_OPTIONS = [
  'Business',
  'Trading',
  'Psychology',
  'Self-Help',
  'Fiction',
  'Biography',
  'Technology',
  'Finance',
  'Philosophy',
]

export function useBooks() {
  const authStore = useAuthStore()
  const toast = useToastStore()
  const { currentSpace, user } = storeToRefs(authStore)

  /* ============================
     State
     ============================ */
  const books = ref<Book[]>([])
  const readingLogs = ref<ReadingLog[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

  // Filters & Tabs
  const selectedShelf = ref<BookShelfTab>('reading')
  const searchQuery = ref('')
  const selectedGenre = ref('all')

  /* ============================
     Computed: Shelf Counts
     ============================ */
  const shelfCounts = computed(() => {
    const list = books.value
    return {
      reading: list.filter(b => b.status === 'reading').length,
      completed: list.filter(b => b.status === 'completed').length,
      want_to_read: list.filter(b => b.status === 'want_to_read').length,
      favorites: list.filter(b => b.is_favorite || (b.rating && b.rating >= 4)).length,
      total: list.length,
    }
  })

  /* ============================
     Computed: Filtered Books
     ============================ */
  const filteredBooks = computed(() => {
    return books.value.filter(book => {
      // Shelf Filter
      if (selectedShelf.value === 'reading' && book.status !== 'reading') return false
      if (selectedShelf.value === 'completed' && book.status !== 'completed') return false
      if (selectedShelf.value === 'want_to_read' && book.status !== 'want_to_read') return false
      if (selectedShelf.value === 'favorites' && !book.is_favorite && (!book.rating || book.rating < 4)) return false

      // Search Query (Title or Author or Recommender)
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        const matchTitle = book.title.toLowerCase().includes(q)
        const matchAuthor = book.author.toLowerCase().includes(q)
        const matchRec = book.recommended_by?.toLowerCase().includes(q)
        if (!matchTitle && !matchAuthor && !matchRec) return false
      }

      // Genre Filter
      if (selectedGenre.value !== 'all') {
        if (!book.genres || !book.genres.includes(selectedGenre.value)) return false
      }

      return true
    })
  })

  /* ============================
     Computed: Library Stats
     ============================ */
  const libraryStats = computed<BookLibraryStats>(() => {
    const list = books.value
    const logs = readingLogs.value

    // Total Completed
    const totalRead = list.filter(b => b.status === 'completed').length

    // Currently Reading
    const currentlyReading = list.filter(b => b.status === 'reading').length

    // Books this year
    const currentYear = new Date().getFullYear().toString()
    const booksThisYear = list.filter(b => {
      if (b.status !== 'completed') return false
      if (b.end_date && b.end_date.startsWith(currentYear)) return true
      if (b.created_at && b.created_at.startsWith(currentYear)) return true
      return false
    }).length

    // Pages read this month
    const currentYearMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const pagesReadThisMonth = logs
      .filter(l => l.date && l.date.startsWith(currentYearMonth))
      .reduce((sum, l) => sum + (Number(l.pages_read) || 0), 0)

    // Reading streak (consecutive days with reading logs)
    const logDates = Array.from(new Set(logs.map(l => l.date))).filter(Boolean)
    logDates.sort().reverse()

    let readingStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    let checkDate = new Date(today)
    // If not read today, check from yesterday
    if (!logDates.includes(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0]
      if (logDates.includes(dateKey)) {
        readingStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Average rating
    const ratedBooks = list.filter(b => b.rating && b.rating > 0)
    const averageRating = ratedBooks.length > 0
      ? Number((ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length).toFixed(1))
      : 0

    return {
      totalRead,
      currentlyReading,
      booksThisYear,
      readingStreak,
      pagesReadThisMonth,
      averageRating,
    }
  })

  /* ============================
     Computed: Genre Distribution (Pie/Doughnut)
     ============================ */
  const genreStats = computed<GenreStat[]>(() => {
    const countMap: Record<string, number> = {}
    let totalAssigned = 0

    books.value.forEach(b => {
      if (b.genres && Array.isArray(b.genres)) {
        b.genres.forEach(g => {
          countMap[g] = (countMap[g] || 0) + 1
          totalAssigned++
        })
      }
    })

    return Object.keys(countMap).map(genre => ({
      genre,
      count: countMap[genre],
      percentage: totalAssigned > 0 ? Math.round((countMap[genre] / totalAssigned) * 100) : 0,
    })).sort((a, b) => b.count - a.count)
  })

  /* ============================
     Computed: Books Per Month Chart Data
     ============================ */
  const booksPerMonthData = computed(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const counts = Array(12).fill(0)
    const currentYear = new Date().getFullYear().toString()

    books.value.forEach(b => {
      if (b.status === 'completed' && b.end_date) {
        const [year, monthStr] = b.end_date.split('-')
        if (year === currentYear) {
          const monthIdx = parseInt(monthStr, 10) - 1
          if (monthIdx >= 0 && monthIdx < 12) {
            counts[monthIdx]++
          }
        }
      }
    })

    return { labels: months, data: counts }
  })

  /* ============================
     Computed: 60-Day Reading Heatmap
     ============================ */
  const readingHeatmap = computed<ReadingHeatmapDay[]>(() => {
    const days: ReadingHeatmapDay[] = []
    const logMap: Record<string, { pages: number; count: number }> = {}

    readingLogs.value.forEach(l => {
      if (!logMap[l.date]) logMap[l.date] = { pages: 0, count: 0 }
      logMap[l.date].pages += Number(l.pages_read) || 0
      logMap[l.date].count += 1
    })

    const today = new Date()
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const info = logMap[dateStr] || { pages: 0, count: 0 }

      let level = 0
      if (info.pages >= 50) level = 4
      else if (info.pages >= 30) level = 3
      else if (info.pages >= 15) level = 2
      else if (info.pages > 0) level = 1

      days.push({
        date: dateStr,
        pages: info.pages,
        count: info.count,
        level,
      })
    }

    return days
  })

  /* ============================
     Celebration Trigger
     ============================ */
  function triggerCelebration() {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'],
      })
    } catch {
      // safe fallback
    }
  }

  /* ============================
     Fetch Data (Supabase + LocalStorage Fallback)
     ============================ */
  async function fetchBooksData() {
    isLoading.value = true
    error.value = null

    try {
      const spaceId = currentSpace.value?.id

      if (!spaceId) {
        seedLocalDefaults()
        usingFallback.value = true
        return
      }

      // 1. Fetch books
      const { data: booksData, error: booksErr } = await supabase
        .from('books')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false })

      if (booksErr) {
        console.warn('Books fetch notice, falling back to local store:', booksErr.message)
        loadFromLocalStorage(spaceId)
        usingFallback.value = true
        return
      }

      if (booksData && booksData.length > 0) {
        books.value = booksData
        usingFallback.value = false

        // 2. Fetch reading logs
        const bookIds = booksData.map(b => b.id)
        const { data: logsData } = await supabase
          .from('reading_logs')
          .select('*')
          .in('book_id', bookIds)
          .order('date', { ascending: false })

        if (logsData) {
          readingLogs.value = logsData
        }
      } else {
        // First time space load: auto-seed presets
        await seedPresetsToDb(spaceId)
      }
    } catch (err: any) {
      console.error('fetchBooksData error:', err)
      loadFromLocalStorage(currentSpace.value?.id || 'default')
    } finally {
      isLoading.value = false
    }
  }

  /* ============================
     Seed Database
     ============================ */
  async function seedPresetsToDb(spaceId: string) {
    const userId = user.value?.id || null

    try {
      const toInsert = DEFAULT_BOOK_PRESETS.map(p => ({
        ...p,
        space_id: spaceId,
        user_id: userId,
      }))

      const { data, error: seedErr } = await supabase
        .from('books')
        .insert(toInsert)
        .select()

      if (seedErr || !data) {
        seedLocalDefaults()
      } else {
        books.value = data
        generateSampleLogs(data)
      }
    } catch {
      seedLocalDefaults()
    }
  }

  function seedLocalDefaults() {
    const spaceId = currentSpace.value?.id || 'demo-space'
    const generated: Book[] = DEFAULT_BOOK_PRESETS.map((p, idx) => ({
      ...p,
      id: 'book-' + (idx + 1),
      space_id: spaceId,
      created_at: new Date(Date.now() - (idx + 1) * 86400000 * 5).toISOString(),
    }))
    books.value = generated
    generateSampleLogs(generated)
    saveToLocalStorage(spaceId)
  }

  function generateSampleLogs(bookList: Book[]) {
    const readingBook = bookList.find(b => b.status === 'reading') || bookList[0]
    if (!readingBook) return

    const logs: ReadingLog[] = []
    const today = new Date()

    // Generate logs for past 10 days
    for (let i = 0; i < 10; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      logs.push({
        id: 'log-' + (i + 1),
        book_id: readingBook.id,
        date: dateStr,
        pages_read: 15 + Math.floor(Math.random() * 20),
        notes: i === 0 ? 'Selesai bab 5: Mengontrol bias emosi saat entry' : null,
        created_at: d.toISOString(),
      })
    }

    readingLogs.value = logs
  }

  /* ============================
     LocalStorage Helpers
     ============================ */
  function loadFromLocalStorage(spaceId: string) {
    try {
      const bKey = `spaceos_books_${spaceId}`
      const lKey = `spaceos_reading_logs_${spaceId}`
      const savedBooks = localStorage.getItem(bKey)
      const savedLogs = localStorage.getItem(lKey)

      if (savedBooks) {
        books.value = JSON.parse(savedBooks)
      } else {
        seedLocalDefaults()
        return
      }

      if (savedLogs) {
        readingLogs.value = JSON.parse(savedLogs)
      }
      usingFallback.value = true
    } catch (e) {
      seedLocalDefaults()
    }
  }

  function saveToLocalStorage(spaceId: string) {
    try {
      const bKey = `spaceos_books_${spaceId}`
      const lKey = `spaceos_reading_logs_${spaceId}`
      localStorage.setItem(bKey, JSON.stringify(books.value))
      localStorage.setItem(lKey, JSON.stringify(readingLogs.value))
    } catch {
      // storage full or disabled
    }
  }

  /* ============================
     CRUD: Create Book
     ============================ */
  async function createBook(formData: BookFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'
    const userId = user.value?.id || null

    try {
      const newBookData = {
        space_id: spaceId,
        user_id: userId,
        title: formData.title.trim(),
        author: formData.author.trim(),
        cover_url: formData.cover_url || null,
        total_pages: formData.total_pages ? Number(formData.total_pages) : null,
        current_page: formData.current_page ? Number(formData.current_page) : 0,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        rating: formData.rating ? Number(formData.rating) : null,
        genres: formData.genres || [],
        review: formData.review?.trim() || null,
        insights: formData.insights?.trim() || null,
        quotes: formData.quotes?.trim() || null,
        recommended_by: formData.recommended_by?.trim() || null,
        is_favorite: Boolean(formData.is_favorite),
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('books')
          .insert([newBookData])
          .select()
          .single()

        if (err) throw err
        if (data) {
          books.value.unshift(data)

          // If current page > 0, log initial progress
          if (data.current_page > 0) {
            await addReadingLog(data.id, new Date().toISOString().split('T')[0], data.current_page, 'Initial pages logged')
          }
        }
      } else {
        const mockBook: Book = {
          ...newBookData,
          id: 'b-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        books.value.unshift(mockBook)
        if (mockBook.current_page > 0) {
          await addReadingLog(mockBook.id, new Date().toISOString().split('T')[0], mockBook.current_page, 'Initial pages logged')
        }
        saveToLocalStorage(spaceId)
      }

      toast.success('Buku Berhasil Ditambahkan', `"${formData.title}" tersimpan di perpustakaan.`)
      return { success: true }
    } catch (err: any) {
      console.error('createBook error:', err)
      toast.error('Gagal Menyimpan Buku', err.message || 'Terjadi kesalahan.')
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Update Book
     ============================ */
  async function updateBook(id: string, formData: Partial<BookFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      if (formData.title !== undefined) updates.title = formData.title.trim()
      if (formData.author !== undefined) updates.author = formData.author.trim()
      if (formData.cover_url !== undefined) updates.cover_url = formData.cover_url || null
      if (formData.total_pages !== undefined) updates.total_pages = formData.total_pages ? Number(formData.total_pages) : null
      if (formData.current_page !== undefined) updates.current_page = Number(formData.current_page) || 0
      if (formData.status !== undefined) updates.status = formData.status
      if (formData.start_date !== undefined) updates.start_date = formData.start_date || null
      if (formData.end_date !== undefined) updates.end_date = formData.end_date || null
      if (formData.rating !== undefined) updates.rating = formData.rating ? Number(formData.rating) : null
      if (formData.genres !== undefined) updates.genres = formData.genres
      if (formData.review !== undefined) updates.review = formData.review?.trim() || null
      if (formData.insights !== undefined) updates.insights = formData.insights?.trim() || null
      if (formData.quotes !== undefined) updates.quotes = formData.quotes?.trim() || null
      if (formData.recommended_by !== undefined) updates.recommended_by = formData.recommended_by?.trim() || null
      if (formData.is_favorite !== undefined) updates.is_favorite = Boolean(formData.is_favorite)

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('books')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        if (data) {
          const idx = books.value.findIndex(b => b.id === id)
          if (idx !== -1) books.value[idx] = data
        }
      } else {
        const idx = books.value.findIndex(b => b.id === id)
        if (idx !== -1) {
          books.value[idx] = { ...books.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      toast.success('Buku Diperbarui', 'Data buku berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      console.error('updateBook error:', err)
      toast.error('Gagal Mengupdate Buku', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Delete Book
     ============================ */
  async function deleteBook(id: string) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('books').delete().eq('id', id)
        if (err) throw err
      }

      books.value = books.value.filter(b => b.id !== id)
      readingLogs.value = readingLogs.value.filter(l => l.book_id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Buku Dihapus', 'Buku telah dihapus dari perpustakaan.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Buku', err.message)
      return { success: false, error: err.message }
    }
  }

  /* ============================
     Quick Actions: Move Shelf
     ============================ */
  async function moveShelf(bookId: string, newStatus: BookShelfStatus) {
    const book = books.value.find(b => b.id === bookId)
    if (!book) return

    const updates: Partial<BookFormData> = { status: newStatus }
    if (newStatus === 'completed' && !book.end_date) {
      updates.end_date = new Date().toISOString().split('T')[0]
      if (book.total_pages) {
        updates.current_page = book.total_pages
      }
      triggerCelebration()
    } else if (newStatus === 'reading' && !book.start_date) {
      updates.start_date = new Date().toISOString().split('T')[0]
    }

    await updateBook(bookId, updates)
  }

  /* ============================
     Quick Actions: Toggle Favorite
     ============================ */
  async function toggleFavorite(bookId: string) {
    const book = books.value.find(b => b.id === bookId)
    if (!book) return
    const newState = !book.is_favorite
    await updateBook(bookId, { is_favorite: newState })
  }

  /* ============================
     Update Reading Progress & Log Session
     ============================ */
  async function updateProgress(
    bookId: string,
    newPage: number,
    pagesReadSession?: number,
    sessionNotes?: string
  ) {
    const book = books.value.find(b => b.id === bookId)
    if (!book) return { success: false }

    const sanitizedPage = Math.max(0, Math.min(newPage, book.total_pages || 99999))
    const deltaPages = pagesReadSession !== undefined
      ? Number(pagesReadSession)
      : Math.max(0, sanitizedPage - book.current_page)

    const isNowCompleted = book.total_pages && sanitizedPage >= book.total_pages

    const bookUpdates: Partial<BookFormData> = {
      current_page: sanitizedPage,
    }

    if (isNowCompleted && book.status !== 'completed') {
      bookUpdates.status = 'completed'
      bookUpdates.end_date = new Date().toISOString().split('T')[0]
      triggerCelebration()
      toast.success('🎉 Buku Selesai!', `Selamat! Kamu telah menyelesaikan buku "${book.title}"!`)
    } else if (book.status === 'want_to_read' && sanitizedPage > 0) {
      bookUpdates.status = 'reading'
      bookUpdates.start_date = new Date().toISOString().split('T')[0]
    }

    await updateBook(bookId, bookUpdates)

    // Add reading log entry if pages were read
    if (deltaPages > 0) {
      const todayStr = new Date().toISOString().split('T')[0]
      await addReadingLog(bookId, todayStr, deltaPages, sessionNotes || null)
    }

    return { success: true }
  }

  /* ============================
     Reading Logs: Add & Delete
     ============================ */
  async function addReadingLog(
    bookId: string,
    date: string,
    pagesRead: number,
    notes?: string | null
  ) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      const logData = {
        book_id: bookId,
        date: date || new Date().toISOString().split('T')[0],
        pages_read: Number(pagesRead),
        notes: notes?.trim() || null,
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('reading_logs')
          .insert([logData])
          .select()
          .single()

        if (err) throw err
        if (data) {
          readingLogs.value.unshift(data)
        }
      } else {
        const mockLog: ReadingLog = {
          ...logData,
          id: 'log-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        readingLogs.value.unshift(mockLog)
        saveToLocalStorage(spaceId)
      }

      return { success: true }
    } catch (err: any) {
      console.error('addReadingLog error:', err)
      return { success: false, error: err.message }
    }
  }

  async function deleteReadingLog(logId: string) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('reading_logs').delete().eq('id', logId)
        if (err) throw err
      }

      readingLogs.value = readingLogs.value.filter(l => l.id !== logId)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Log Dihapus', 'Riwayat membaca telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Log', err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    // State
    books,
    readingLogs,
    isLoading,
    isSaving,
    error,
    usingFallback,
    selectedShelf,
    searchQuery,
    selectedGenre,
    // Computed
    shelfCounts,
    filteredBooks,
    libraryStats,
    genreStats,
    booksPerMonthData,
    readingHeatmap,
    // Actions
    fetchBooksData,
    createBook,
    updateBook,
    deleteBook,
    moveShelf,
    toggleFavorite,
    updateProgress,
    addReadingLog,
    deleteReadingLog,
    triggerCelebration,
  }
}
