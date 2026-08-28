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
  const coupleNames = ref('Alex & Sarah')
  const togetherSince = ref('2023-02-14')

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
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)))
  })

  /**
   * Next anniversary countdown
   */
  const anniversaryCountdown = computed(() => {
    const start = new Date(togetherSince.value)
    const now = new Date()

    const nextAnniversary = new Date(
      now.getFullYear(),
      start.getMonth(),
      start.getDate()
    )

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
   * Load real couple data dynamically
   */
  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const isCleanSlate = localStorage.getItem('spaceos_clean_slate') === 'true'

      let allEvents: any[] = []
      let allJournals: any[] = []
      let allPhotos: any[] = []

      if (!isCleanSlate) {
        // Read couple events
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key === 'spaceos_couple_events' || key.startsWith('spaceos_couple_events_'))) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || '[]')
              if (Array.isArray(parsed) && parsed.length > 0) {
                allEvents = parsed
                break
              }
            } catch {}
          }
        }

        // Read couple journals
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key === 'spaceos_couple_journals' || key.startsWith('spaceos_couple_journals_'))) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || '[]')
              if (Array.isArray(parsed) && parsed.length > 0) {
                allJournals = parsed
                break
              }
            } catch {}
          }
        }

        // Read couple photos
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key === 'spaceos_couple_photos' || key.startsWith('spaceos_couple_photos_'))) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || '[]')
              if (Array.isArray(parsed) && parsed.length > 0) {
                allPhotos = parsed
                break
              }
            } catch {}
          }
        }
      }

      if (allEvents.length > 0) {
        upcomingEvents.value = allEvents.slice(0, 3).map(e => ({
          id: e.id || 'ev-' + Math.random(),
          title: e.title || 'Event Bersama',
          date: e.start_time ? e.start_time.split('T')[0] : (e.date || new Date().toISOString().split('T')[0]),
          icon: e.category === 'Anniversary' ? '🎂' : e.category === 'Date Night' ? '🥂' : e.category === 'Travel' ? '✈️' : '💕',
          type: e.category || 'general',
        }))
      } else {
        upcomingEvents.value = []
      }

      if (allJournals.length > 0) {
        recentJournals.value = allJournals.slice(0, 3).map(j => ({
          id: j.id || 'j-' + Math.random(),
          title: j.title || 'Catatan Bersama',
          preview: (j.content || '').slice(0, 100) + '...',
          date: j.published_at ? j.published_at.split('T')[0] : (j.created_at ? j.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          mood: j.mood || '🥰',
          author: j.author_name || j.author || 'Pasangan',
        }))
      } else {
        recentJournals.value = []
      }

      if (allPhotos.length > 0) {
        recentPhotos.value = allPhotos.slice(0, 4).map(p => ({
          id: p.id || 'p-' + Math.random(),
          url: p.image_url || p.url || '',
          caption: p.caption || 'Momen Kita ✨',
          date: p.taken_at ? p.taken_at.split('T')[0] : (p.date_taken || new Date().toISOString().split('T')[0]),
        }))
        onThisDay.value = recentPhotos.value[0] || null
      } else {
        recentPhotos.value = []
        onThisDay.value = null
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
