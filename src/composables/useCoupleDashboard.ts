import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useCouple } from '@/composables/useCouple'

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
  const authStore = useAuthStore()
  const { currentSpace } = storeToRefs(authStore)
  const {
    isLoading,
    error,
    photos,
    journalEntries,
    calendarEvents,
    fetchCoupleData,
  } = useCouple()

  // Couple info
  const coupleNames = computed(() => currentSpace.value?.name || 'Couple Space')
  const togetherSince = ref(new Date().toISOString().split('T')[0])

  /**
   * Dynamic greeting based on time of day
   */
  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 11) return 'greeting_morning'
    if (hour < 15) return 'greeting_afternoon'
    if (hour < 18) return 'greeting_evening'
    return 'greeting_night'
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
   * Upcoming Events mapped from calendarEvents
   */
  const upcomingEvents = computed<CoupleEvent[]>(() => {
    const sorted = [...calendarEvents.value].sort((a, b) => {
      const timeA = a.start_time ? new Date(a.start_time).getTime() : 0
      const timeB = b.start_time ? new Date(b.start_time).getTime() : 0
      return timeA - timeB
    })
    return sorted.slice(0, 3).map(e => ({
      id: e.id,
      title: e.title || 'Agenda Bersama',
      date: e.start_time ? e.start_time.split('T')[0] : new Date().toISOString().split('T')[0],
      icon: e.category === 'Anniversary' ? '🎂' : e.category === 'Date Night' ? '🥂' : e.category === 'Travel' ? '✈️' : '💕',
      type: (e.category === 'Date Night' ? 'date' : e.category === 'Travel' ? 'trip' : e.category === 'Anniversary' ? 'anniversary' : 'general') as any,
    }))
  })

  /**
   * Recent Journals mapped from journalEntries
   */
  const recentJournals = computed<JournalEntry[]>(() => {
    const sorted = [...journalEntries.value].sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at || 0).getTime()
      const timeB = new Date(b.published_at || b.created_at || 0).getTime()
      return timeB - timeA
    })
    return sorted.slice(0, 3).map(j => ({
      id: j.id,
      title: j.title || 'Catatan Bersama',
      preview: (j.content || '').slice(0, 100) + ((j.content || '').length > 100 ? '...' : ''),
      date: j.published_at ? j.published_at.split('T')[0] : (j.created_at ? j.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
      mood: j.mood === 'Loving' ? '🥰' : j.mood === 'Excited' ? '🎉' : j.mood === 'Thoughtful' ? '💭' : j.mood === 'Sad' ? '🥺' : '😊',
      author: (j as any).author_name || (j.author_id === authStore.user?.id ? (authStore.user?.full_name || 'Kamu') : 'Pasangan'),
    }))
  })

  /**
   * Recent Photos mapped from photos
   */
  const recentPhotos = computed<CouplePhoto[]>(() => {
    const sorted = [...photos.value].sort((a, b) => {
      const timeA = new Date(a.taken_at || a.created_at || 0).getTime()
      const timeB = new Date(b.taken_at || b.created_at || 0).getTime()
      return timeB - timeA
    })
    return sorted.slice(0, 4).map(p => ({
      id: p.id,
      url: p.image_url,
      caption: p.caption || 'Momen Kita ✨',
      date: p.taken_at ? p.taken_at.split('T')[0] : (p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    }))
  })

  /**
   * On this day photo
   */
  const onThisDay = computed<CouplePhoto | null>(() => {
    return recentPhotos.value[0] || null
  })

  async function loadData() {
    const spaceId = currentSpace.value?.id
    if (spaceId) {
      const savedTogetherSince = localStorage.getItem(`spaceos_couple_together_since_${spaceId}`)
      togetherSince.value = savedTogetherSince || currentSpace.value?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    }
    await fetchCoupleData()
  }

  function retry() {
    fetchCoupleData(true)
  }

  onMounted(() => {
    loadData()
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
