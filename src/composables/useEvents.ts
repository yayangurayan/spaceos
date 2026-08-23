import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'
import type {
  EventItem,
  EventFormData,
  EventAttachment,
  EventReview,
  EventReviewFormData,
  EventCategory,
  EventStatus,
  EventTrackerStats,
} from '@/types'

/* ============================================================
   Event Categories & Preset Defaults
   ============================================================ */
export const EVENT_CATEGORIES: EventCategory[] = [
  'Trading Event',
  'Seminar',
  'Workshop',
  'Competition',
  'Networking',
  'Personal',
]

export const EVENT_STATUS_OPTIONS: { value: EventStatus; label: string; color: string }[] = [
  { value: 'planning', label: 'Planning', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { value: 'registered', label: 'Registered', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  { value: 'attending', label: 'Attending', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
]

export const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; border: string; badge: string }> = {
  'Trading Event': {
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
  },
  Seminar: {
    bg: 'bg-purple-950/40',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
  },
  Workshop: {
    bg: 'bg-blue-950/40',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  },
  Competition: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
  },
  Networking: {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  },
  Personal: {
    bg: 'bg-rose-950/40',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
  },
}

function getFutureDate(daysAhead: number, hours = 9, minutes = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export const DEFAULT_EVENT_PRESETS: Array<Omit<EventItem, 'id' | 'space_id' | 'created_at'>> = [
  {
    title: 'Asia Trader Summit 2026',
    start_datetime: getFutureDate(5, 10, 0),
    end_datetime: getFutureDate(5, 17, 30),
    location: 'Ritz-Carlton Pacific Place Jakarta & Livestream',
    category: 'Trading Event',
    description: 'Konferensi tahunan trader se-Asia Tenggara. Membahas likuiditas institusional, prop trading risk models, dan AI tools untuk analisa teknikal.',
    status: 'registered',
    cost: 1500000,
    notes: 'Dress code: Smart Casual. Bawa kartu nama dan kartu identitas untuk registration pass.',
    reminder_days: [1, 3, 7],
    checklist: [
      { id: 'c-1', text: 'Cetak E-ticket QR Code', completed: true },
      { id: 'c-2', text: 'Siapkan notebook & tablet untuk catatan', completed: false },
      { id: 'c-3', text: 'Review profil speaker utama di LinkedIn', completed: false },
    ],
  },
  {
    title: 'Advanced Price Action & Orderflow Workshop',
    start_datetime: getFutureDate(12, 14, 0),
    end_datetime: getFutureDate(12, 18, 0),
    location: 'Zoom Interactive (VIP Live Room)',
    category: 'Workshop',
    description: 'Workshop intensif 4 jam mengupas depth of market (DOM), delta volume, and auction market theory untuk precision entry.',
    status: 'attending',
    cost: 750000,
    notes: 'Pastikan koneksi internet stabil & install template chart Bookmap/TradingView.',
    reminder_days: [1, 3],
    checklist: [
      { id: 'c-4', text: 'Download workshop dataset PDF', completed: true },
      { id: 'c-5', text: 'Siapkan pertanyaan seputar market microstructure', completed: false },
    ],
  },
  {
    title: 'Fintech & Web3 Founders Networking Dinner',
    start_datetime: getFutureDate(20, 19, 0),
    end_datetime: getFutureDate(20, 22, 0),
    location: 'SCBD Lounge, Senopati, Jakarta Selatan',
    category: 'Networking',
    description: 'Casual networking dinner bersama para fintech builder, quant dev, dan investor modal ventura.',
    status: 'planning',
    cost: 350000,
    notes: 'RSVP via Luma link sebelum H-3.',
    reminder_days: [1],
    checklist: [
      { id: 'c-6', text: 'Konfirmasi kehadiran via RSVP', completed: false },
      { id: 'c-7', text: 'Update portfolio deck', completed: false },
    ],
  },
  {
    title: 'Global Prop Firm 50K Challenge Live',
    start_datetime: new Date(Date.now() - 15 * 86400000).toISOString(),
    end_datetime: new Date(Date.now() - 10 * 86400000).toISOString(),
    location: 'Online Competition Platform',
    category: 'Competition',
    description: 'Kompetisi trading 5 hari dengan target profit 8% dan maximum daily drawdown 4%.',
    status: 'completed',
    cost: 2000000,
    notes: 'Selesai dengan peringkat Top 5% dan berhasil lolos funded stage.',
    reminder_days: [1],
    checklist: [
      { id: 'c-8', text: 'Setup risk parameter di MetaTrader 5', completed: true },
      { id: 'c-9', text: 'Rekap daily trade journal', completed: true },
    ],
    review: {
      id: 'rev-1',
      event_id: 'preset-4',
      what_learned: 'Kunci melewati evaluasi prop firm bukan mencari profit ratusan persen, tapi menjaga daily drawdown di bawah 2%. Sabar menunggu high probability setup di London/NY overlap.',
      takeaways: '1. Fixed risk 0.5% per trade\n2. Jangan pernah revenge trade saat kena SL pertama\n3. Catat emosi di journal.',
      contacts_made: 'Bertemu 3 rekan trader pro di Discord VIP channel.',
      rating: 5,
      would_attend_again: true,
      created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
  },
  {
    title: 'Quarterly Strategic Life & Trading Review',
    start_datetime: getFutureDate(2, 9, 0),
    end_datetime: getFutureDate(2, 12, 0),
    location: 'Home Studio / SpaceOS Workspace',
    category: 'Personal',
    description: 'Evaluasi performa trading kuartal, alokasi tabungan/investasi, dan penyusunan OKR untuk 3 bulan ke depan.',
    status: 'planning',
    cost: 0,
    notes: 'Siapkan data export P&L dari dashboard.',
    reminder_days: [1],
    checklist: [
      { id: 'c-10', text: 'Ekspor log trade 90 hari terakhir', completed: false },
      { id: 'c-11', text: 'Review winrate dan R:R rata-rata', completed: false },
    ],
  },
]

export function useEvents() {
  const authStore = useAuthStore()
  const toast = useToastStore()
  const { currentSpace, user } = storeToRefs(authStore)

  /* ============================
     State
     ============================ */
  const events = ref<EventItem[]>([])
  const eventAttachments = ref<EventAttachment[]>([])
  const eventReviews = ref<EventReview[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

  // Views & Filters
  const currentView = ref<'month' | 'week' | 'list'>('month')
  const selectedCategory = ref<string>('all')
  const selectedStatus = ref<string>('all')
  const searchQuery = ref('')
  const selectedCalendarDate = ref<string>(new Date().toISOString().split('T')[0])
  const calendarMonth = ref<Date>(new Date())

  /* ============================
     Computed: Filtered & Sorted Lists
     ============================ */
  const allEventsWithDetails = computed<EventItem[]>(() => {
    return events.value.map(evt => {
      const review = eventReviews.value.find(r => r.event_id === evt.id) || evt.review || null
      const attachments = eventAttachments.value.filter(a => a.event_id === evt.id) || evt.attachments || []
      return {
        ...evt,
        review,
        attachments,
      }
    })
  })

  const upcomingEvents = computed<EventItem[]>(() => {
    const now = new Date().toISOString()
    return allEventsWithDetails.value
      .filter(e => e.status !== 'completed' || e.start_datetime >= now)
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
  })

  const pastEvents = computed<EventItem[]>(() => {
    const now = new Date().toISOString()
    return allEventsWithDetails.value
      .filter(e => e.status === 'completed' || e.start_datetime < now)
      .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())
  })

  const filteredEvents = computed<EventItem[]>(() => {
    return allEventsWithDetails.value.filter(evt => {
      // Category Filter
      if (selectedCategory.value !== 'all' && evt.category !== selectedCategory.value) {
        return false
      }

      // Status Filter
      if (selectedStatus.value !== 'all' && evt.status !== selectedStatus.value) {
        return false
      }

      // Search Query
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        const matchTitle = evt.title.toLowerCase().includes(q)
        const matchLoc = evt.location?.toLowerCase().includes(q)
        const matchDesc = evt.description?.toLowerCase().includes(q)
        if (!matchTitle && !matchLoc && !matchDesc) return false
      }

      return true
    })
  })

  /* ============================
     Computed: Events Mapped by Date (YYYY-MM-DD)
     ============================ */
  const eventsByDate = computed<Record<string, EventItem[]>>(() => {
    const map: Record<string, EventItem[]> = {}
    filteredEvents.value.forEach(evt => {
      const dateKey = evt.start_datetime.split('T')[0]
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(evt)
    })
    return map
  })

  /* ============================
     Computed: Stats Overview
     ============================ */
  const eventStats = computed<EventTrackerStats>(() => {
    const list = events.value
    const now = new Date()
    const currentYearMonth = now.toISOString().slice(0, 7) // YYYY-MM

    const upcomingCount = list.filter(e => e.status !== 'completed' && new Date(e.start_datetime) >= now).length
    const thisMonthCount = list.filter(e => e.start_datetime && e.start_datetime.startsWith(currentYearMonth)).length
    const completedCount = list.filter(e => e.status === 'completed').length
    const totalBudget = list.reduce((sum, e) => sum + (Number(e.cost) || 0), 0)

    return {
      upcomingCount,
      thisMonthCount,
      completedCount,
      totalBudget,
    }
  })

  /* ============================
     Celebration Trigger
     ============================ */
  function triggerCelebration() {
    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      })
    } catch {
      // safe fallback
    }
  }

  /* ============================
     Fetch Data (Supabase + LocalStorage Fallback)
     ============================ */
  async function fetchEventsData() {
    isLoading.value = true
    error.value = null

    try {
      const spaceId = currentSpace.value?.id

      if (!spaceId) {
        seedLocalDefaults()
        usingFallback.value = true
        return
      }

      // 1. Fetch events
      const { data: eventsData, error: eventsErr } = await supabase
        .from('events')
        .select('*')
        .eq('space_id', spaceId)
        .order('start_datetime', { ascending: true })

      if (eventsErr) {
        console.warn('Events fetch notice, falling back to local store:', eventsErr.message)
        loadFromLocalStorage(spaceId)
        usingFallback.value = true
        return
      }

      if (eventsData && eventsData.length > 0) {
        events.value = eventsData
        usingFallback.value = false

        // 2. Fetch attachments & reviews
        const eventIds = eventsData.map(e => e.id)
        const [attRes, revRes] = await Promise.all([
          supabase.from('event_attachments').select('*').in('event_id', eventIds),
          supabase.from('event_reviews').select('*').in('event_id', eventIds),
        ])

        if (attRes.data) eventAttachments.value = attRes.data
        if (revRes.data) eventReviews.value = revRes.data
      } else {
        // Auto-seed presets for first time load
        await seedPresetsToDb(spaceId)
      }
    } catch (err: any) {
      console.error('fetchEventsData error:', err)
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
      const toInsert = DEFAULT_EVENT_PRESETS.map(p => ({
        space_id: spaceId,
        user_id: userId,
        title: p.title,
        start_datetime: p.start_datetime,
        end_datetime: p.end_datetime,
        location: p.location,
        category: p.category,
        description: p.description,
        status: p.status,
        cost: p.cost,
        notes: p.notes,
        reminder_days: p.reminder_days,
        checklist: p.checklist,
      }))

      const { data, error: seedErr } = await supabase
        .from('events')
        .insert(toInsert)
        .select()

      if (seedErr || !data) {
        seedLocalDefaults()
      } else {
        events.value = data
        // Insert sample review for completed event
        const completedEvt = data.find(e => e.status === 'completed')
        const presetWithRev = DEFAULT_EVENT_PRESETS.find(p => p.review)
        if (completedEvt && presetWithRev?.review) {
          const revData = {
            event_id: completedEvt.id,
            what_learned: presetWithRev.review.what_learned,
            takeaways: presetWithRev.review.takeaways,
            contacts_made: presetWithRev.review.contacts_made,
            rating: presetWithRev.review.rating,
            would_attend_again: presetWithRev.review.would_attend_again,
          }
          const { data: revRes } = await supabase.from('event_reviews').insert([revData]).select()
          if (revRes) eventReviews.value = revRes
        }
      }
    } catch {
      seedLocalDefaults()
    }
  }

  function seedLocalDefaults() {
    const spaceId = currentSpace.value?.id || 'demo-space'
    const generated: EventItem[] = DEFAULT_EVENT_PRESETS.map((p, idx) => ({
      ...p,
      id: 'event-' + (idx + 1),
      space_id: spaceId,
      created_at: new Date(Date.now() - (idx + 1) * 86400000 * 3).toISOString(),
    }))

    events.value = generated
    const reviews: EventReview[] = []
    generated.forEach(e => {
      if (e.review) {
        reviews.push({
          ...e.review,
          id: 'rev-' + e.id,
          event_id: e.id,
        })
      }
    })
    eventReviews.value = reviews
    saveToLocalStorage(spaceId)
  }

  /* ============================
     LocalStorage Helpers
     ============================ */
  function loadFromLocalStorage(spaceId: string) {
    try {
      const eKey = `spaceos_events_${spaceId}`
      const aKey = `spaceos_event_attachments_${spaceId}`
      const rKey = `spaceos_event_reviews_${spaceId}`

      const savedEvts = localStorage.getItem(eKey)
      const savedAtts = localStorage.getItem(aKey)
      const savedRevs = localStorage.getItem(rKey)

      if (savedEvts) {
        events.value = JSON.parse(savedEvts)
      } else {
        seedLocalDefaults()
        return
      }

      if (savedAtts) eventAttachments.value = JSON.parse(savedAtts)
      if (savedRevs) eventReviews.value = JSON.parse(savedRevs)
      usingFallback.value = true
    } catch {
      seedLocalDefaults()
    }
  }

  function saveToLocalStorage(spaceId: string) {
    try {
      const eKey = `spaceos_events_${spaceId}`
      const aKey = `spaceos_event_attachments_${spaceId}`
      const rKey = `spaceos_event_reviews_${spaceId}`
      localStorage.setItem(eKey, JSON.stringify(events.value))
      localStorage.setItem(aKey, JSON.stringify(eventAttachments.value))
      localStorage.setItem(rKey, JSON.stringify(eventReviews.value))
    } catch {
      // storage full or disabled
    }
  }

  /* ============================
     CRUD: Create Event
     ============================ */
  async function createEvent(formData: EventFormData, attachments?: { file_name: string; file_url: string; file_type: string }[]) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'
    const userId = user.value?.id || null

    try {
      const newEventData = {
        space_id: spaceId,
        user_id: userId,
        title: formData.title.trim(),
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime || null,
        location: formData.location?.trim() || null,
        category: formData.category,
        description: formData.description?.trim() || null,
        status: formData.status || 'planning',
        cost: formData.cost !== null && formData.cost !== undefined ? Number(formData.cost) : null,
        notes: formData.notes?.trim() || null,
        reminder_days: formData.reminder_days || [1],
        checklist: formData.checklist || [],
      }

      let createdEvent: EventItem

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('events')
          .insert([newEventData])
          .select()
          .single()

        if (err) throw err
        createdEvent = data
        events.value.push(createdEvent)

        // Insert attachments if provided
        if (attachments && attachments.length > 0) {
          const toInsertAtt = attachments.map(a => ({
            event_id: createdEvent.id,
            file_url: a.file_url,
            file_name: a.file_name,
            file_type: a.file_type,
          }))
          const { data: attData } = await supabase.from('event_attachments').insert(toInsertAtt).select()
          if (attData) eventAttachments.value.push(...attData)
        }
      } else {
        createdEvent = {
          ...newEventData,
          id: 'evt-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        events.value.push(createdEvent)

        if (attachments && attachments.length > 0) {
          const mockAtts: EventAttachment[] = attachments.map((a, idx) => ({
            id: 'att-' + Date.now() + '-' + idx,
            event_id: createdEvent.id,
            file_url: a.file_url,
            file_name: a.file_name,
            file_type: a.file_type,
            created_at: new Date().toISOString(),
          }))
          eventAttachments.value.push(...mockAtts)
        }

        saveToLocalStorage(spaceId)
      }

      toast.success('Event Dibuat', `"${formData.title}" berhasil ditambahkan ke agenda.`)
      return { success: true, event: createdEvent }
    } catch (err: any) {
      console.error('createEvent error:', err)
      toast.error('Gagal Membuat Event', err.message || 'Terjadi kesalahan.')
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Update Event
     ============================ */
  async function updateEvent(id: string, formData: Partial<EventFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      if (formData.title !== undefined) updates.title = formData.title.trim()
      if (formData.start_datetime !== undefined) updates.start_datetime = formData.start_datetime
      if (formData.end_datetime !== undefined) updates.end_datetime = formData.end_datetime || null
      if (formData.location !== undefined) updates.location = formData.location?.trim() || null
      if (formData.category !== undefined) updates.category = formData.category
      if (formData.description !== undefined) updates.description = formData.description?.trim() || null
      if (formData.status !== undefined) updates.status = formData.status
      if (formData.cost !== undefined) updates.cost = formData.cost !== null ? Number(formData.cost) : null
      if (formData.notes !== undefined) updates.notes = formData.notes?.trim() || null
      if (formData.reminder_days !== undefined) updates.reminder_days = formData.reminder_days
      if (formData.checklist !== undefined) updates.checklist = formData.checklist

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('events')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        if (data) {
          const idx = events.value.findIndex(e => e.id === id)
          if (idx !== -1) events.value[idx] = { ...events.value[idx], ...data }
        }
      } else {
        const idx = events.value.findIndex(e => e.id === id)
        if (idx !== -1) {
          events.value[idx] = { ...events.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      toast.success('Event Diperbarui', 'Perubahan event berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      console.error('updateEvent error:', err)
      toast.error('Gagal Mengupdate Event', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Delete Event
     ============================ */
  async function deleteEvent(id: string) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('events').delete().eq('id', id)
        if (err) throw err
      }

      events.value = events.value.filter(e => e.id !== id)
      eventAttachments.value = eventAttachments.value.filter(a => a.event_id !== id)
      eventReviews.value = eventReviews.value.filter(r => r.event_id !== id)

      if (usingFallback.value) saveToLocalStorage(spaceId)
      toast.info('Event Dihapus', 'Event telah dihapus dari agenda.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Event', err.message)
      return { success: false, error: err.message }
    }
  }

  /* ============================
     Quick Action: Toggle Status
     ============================ */
  async function toggleComplete(eventId: string) {
    const evt = events.value.find(e => e.id === eventId)
    if (!evt) return

    const newStatus: EventStatus = evt.status === 'completed' ? 'registered' : 'completed'
    if (newStatus === 'completed') {
      triggerCelebration()
      toast.success('🎉 Event Selesai!', `Event "${evt.title}" ditandai selesai. Luangkan waktu untuk mengisi review.`)
    }
    await updateEvent(eventId, { status: newStatus })
  }

  /* ============================
     Checklist Item Toggle
     ============================ */
  async function toggleChecklistItem(eventId: string, itemId: string) {
    const evt = events.value.find(e => e.id === eventId)
    if (!evt || !evt.checklist) return

    const updatedChecklist = evt.checklist.map(item => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed }
      }
      return item
    })

    await updateEvent(eventId, { checklist: updatedChecklist })
  }

  /* ============================
     Post-Event Review: Save / Update
     ============================ */
  async function saveEventReview(eventId: string, reviewData: EventReviewFormData) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    isSaving.value = true

    try {
      const payload = {
        event_id: eventId,
        what_learned: reviewData.what_learned?.trim() || null,
        takeaways: reviewData.takeaways?.trim() || null,
        contacts_made: reviewData.contacts_made?.trim() || null,
        rating: reviewData.rating ? Number(reviewData.rating) : null,
        would_attend_again: Boolean(reviewData.would_attend_again),
      }

      const existing = eventReviews.value.find(r => r.event_id === eventId)

      if (!usingFallback.value) {
        if (existing) {
          const { data, error: err } = await supabase
            .from('event_reviews')
            .update(payload)
            .eq('event_id', eventId)
            .select()
            .single()

          if (err) throw err
          const idx = eventReviews.value.findIndex(r => r.event_id === eventId)
          if (idx !== -1 && data) eventReviews.value[idx] = data
        } else {
          const { data, error: err } = await supabase
            .from('event_reviews')
            .insert([payload])
            .select()
            .single()

          if (err) throw err
          if (data) eventReviews.value.push(data)
        }
      } else {
        if (existing) {
          const idx = eventReviews.value.findIndex(r => r.event_id === eventId)
          if (idx !== -1) {
            eventReviews.value[idx] = { ...eventReviews.value[idx], ...payload }
          }
        } else {
          const mockRev: EventReview = {
            ...payload,
            id: 'rev-' + Date.now(),
            created_at: new Date().toISOString(),
          }
          eventReviews.value.push(mockRev)
        }
        saveToLocalStorage(spaceId)
      }

      // Also ensure event is marked as completed
      const evt = events.value.find(e => e.id === eventId)
      if (evt && evt.status !== 'completed') {
        await updateEvent(eventId, { status: 'completed' })
      }

      toast.success('Review Tersimpan', 'Evaluasi dan catatan event berhasil disimpan!')
      return { success: true }
    } catch (err: any) {
      console.error('saveEventReview error:', err)
      toast.error('Gagal Menyimpan Review', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     Attachments: Add & Delete
     ============================ */
  async function addAttachment(eventId: string, attachment: { file_name: string; file_url: string; file_type: string }) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      const payload = {
        event_id: eventId,
        file_name: attachment.file_name,
        file_url: attachment.file_url,
        file_type: attachment.file_type,
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('event_attachments')
          .insert([payload])
          .select()
          .single()

        if (err) throw err
        if (data) eventAttachments.value.push(data)
      } else {
        const mockAtt: EventAttachment = {
          ...payload,
          id: 'att-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        eventAttachments.value.push(mockAtt)
        saveToLocalStorage(spaceId)
      }

      toast.success('Lampiran Ditambahkan', `"${attachment.file_name}" berhasil diunggah.`)
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengunggah Lampiran', err.message)
      return { success: false, error: err.message }
    }
  }

  async function deleteAttachment(attachmentId: string) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('event_attachments').delete().eq('id', attachmentId)
        if (err) throw err
      }

      eventAttachments.value = eventAttachments.value.filter(a => a.id !== attachmentId)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Lampiran Dihapus', 'File lampiran telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Lampiran', err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    // State
    events,
    eventAttachments,
    eventReviews,
    isLoading,
    isSaving,
    error,
    usingFallback,
    currentView,
    selectedCategory,
    selectedStatus,
    searchQuery,
    selectedCalendarDate,
    calendarMonth,
    // Computed
    allEventsWithDetails,
    upcomingEvents,
    pastEvents,
    filteredEvents,
    eventsByDate,
    eventStats,
    // Actions
    fetchEventsData,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
    toggleChecklistItem,
    saveEventReview,
    addAttachment,
    deleteAttachment,
    triggerCelebration,
  }
}
