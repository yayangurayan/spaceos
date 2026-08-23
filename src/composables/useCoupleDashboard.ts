import { ref, computed, onMounted } from 'vue'

/* ============================
   Types
   ============================ */
export interface CoupleEvent {
  id: string
  title: string
  date: string
  icon: string
  type: 'date' | 'anniversary' | 'trip' | 'general'
}

export interface JournalEntry {
  id: string
  title: string
  preview: string
  date: string
  mood: string
  author: string
}

export interface CouplePhoto {
  id: string
  url: string
  caption: string
  date: string
}

/* ============================
   Composable
   ============================ */
export function useCoupleDashboard() {
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // Couple info
  const coupleNames = ref('Rizky & Sarah')
  const togetherSince = ref('2023-02-14') // Valentine's Day 2023

  const upcomingEvents = ref<CoupleEvent[]>([])
  const recentJournals = ref<JournalEntry[]>([])
  const recentPhotos = ref<CouplePhoto[]>([])
  const onThisDay = ref<CouplePhoto | null>(null)

  /**
   * Dynamic greeting based on time of day
   */
  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  })

  /**
   * Days together counter
   */
  const daysTogether = computed(() => {
    const start = new Date(togetherSince.value)
    const now = new Date()
    const diff = now.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  })

  /**
   * Next anniversary countdown
   */
  const anniversaryCountdown = computed(() => {
    const start = new Date(togetherSince.value)
    const now = new Date()

    // Next anniversary date
    const nextAnniversary = new Date(
      now.getFullYear(),
      start.getMonth(),
      start.getDate()
    )

    // If already passed this year, go to next year
    if (nextAnniversary <= now) {
      nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1)
    }

    const diff = nextAnniversary.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    const yearsTogether = nextAnniversary.getFullYear() - start.getFullYear()

    return {
      days,
      years: yearsTogether,
      date: nextAnniversary.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }
  })

  /**
   * Simulate fetching dashboard data
   */
  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      // Upcoming events
      upcomingEvents.value = [
        {
          id: '1',
          title: 'Date Night - Dinner',
          date: '2026-08-25',
          icon: '🍽️',
          type: 'date',
        },
        {
          id: '2',
          title: 'Weekend Trip ke Bandung',
          date: '2026-08-30',
          icon: '✈️',
          type: 'trip',
        },
        {
          id: '3',
          title: 'Anniversary ke-4',
          date: '2027-02-14',
          icon: '💕',
          type: 'anniversary',
        },
      ]

      // Recent journal entries
      recentJournals.value = [
        {
          id: '1',
          title: 'Weekend yang Indah',
          preview: 'Hari ini kita jalan-jalan ke taman kota. Cuaca cerah dan kita ngobrol banyak tentang rencana masa depan...',
          date: '2026-08-21',
          mood: '🥰',
          author: 'Sarah',
        },
        {
          id: '2',
          title: 'Masak Bersama',
          preview: 'Coba resep baru pasta carbonara. Agak gosong tapi tetap enak karena masak bareng 😂...',
          date: '2026-08-19',
          mood: '😂',
          author: 'Rizky',
        },
      ]

      // Recent photos (using placeholder gradients instead of actual images)
      recentPhotos.value = [
        {
          id: '1',
          url: '',
          caption: 'Sunset di pantai 🌅',
          date: '2026-08-20',
        },
        {
          id: '2',
          url: '',
          caption: 'Coffee date ☕',
          date: '2026-08-18',
        },
        {
          id: '3',
          url: '',
          caption: 'Hiking together 🏔️',
          date: '2026-08-15',
        },
        {
          id: '4',
          url: '',
          caption: 'Movie night 🎬',
          date: '2026-08-12',
        },
      ]

      // "On this day" - a memory from the past
      onThisDay.value = {
        id: 'memory-1',
        url: '',
        caption: 'Pertama kali ke Bali bersama! 🏖️ — 1 tahun lalu',
        date: '2025-08-22',
      }

    } catch (err: any) {
      error.value = err?.message || 'Failed to load couple dashboard data.'
    } finally {
      isLoading.value = false
    }
  }

  function retry() {
    fetchData()
  }

  onMounted(() => {
    fetchData()
  })

  return {
    isLoading,
    error,
    greeting,
    coupleNames,
    daysTogether,
    anniversaryCountdown,
    togetherSince,
    upcomingEvents,
    recentJournals,
    recentPhotos,
    onThisDay,
    retry,
  }
}
