import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'
import type {
  Album,
  AlbumFormData,
  Photo,
  PhotoFormData,
  JournalEntry,
  JournalEntryFormData,
  JournalComment,
  CoupleCalendarEvent,
  CoupleEventFormData,
  LoveNote,
  LoveNoteFormData,
  LoveNoteColor,
} from '@/types'

/* ============================================================
   Couple Presets
   ============================================================ */
export const DEFAULT_ALBUM_PRESETS: Array<Omit<Album, 'id' | 'space_id' | 'created_at'>> = [
  {
    name: 'Liburan Pertama ke Bali 🌴',
    description: 'Kenangan manis 4 hari 3 malam di Seminyak, Ubud, dan sunset dinner di Jimbaran.',
    cover_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    tags: ['Bali', 'Liburan', 'Pantai', 'Sunset'],
  },
  {
    name: 'Kencan & Anniversary ke-2 💕',
    description: 'Momen perayaan dua tahun bersama di rooftop restaurant dan photobooth seru.',
    cover_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    tags: ['Anniversary', 'DateNight', 'Romantic'],
  },
  {
    name: 'Jelajah Kuliner & Weekend Vibes ☕',
    description: 'Kumpulan foto hunting coffee shop, ramen date, dan piknik sore di taman kota.',
    cover_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tags: ['Kuliner', 'Cafe', 'Weekend', 'Picnic'],
  },
]

export const DEFAULT_PHOTO_PRESETS = [
  {
    albumIdx: 0,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    caption: 'Sunset pertama kita di Pantai Kuta 🌅 Langitnya ungu indah banget!',
    taken_at: '2026-06-12T17:45:00Z',
    location: 'Pantai Kuta, Bali',
    tagged_partner: true,
  },
  {
    albumIdx: 0,
    image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
    caption: 'Sarapan pagi dengan pemandangan sawah terasering di Ubud 🍃',
    taken_at: '2026-06-13T08:30:00Z',
    location: 'Tegalalang Rice Terrace, Ubud',
    tagged_partner: true,
  },
  {
    albumIdx: 0,
    image_url: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=800&q=80',
    caption: 'Candlelight seafood dinner tepi pantai Jimbaran 🕯️✨',
    taken_at: '2026-06-14T19:15:00Z',
    location: 'Jimbaran Bay, Bali',
    tagged_partner: true,
  },
  {
    albumIdx: 1,
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    caption: 'Selamat ulang tahun jadian ke-2 kesayangan! Makasih hadiah scrapbooknya ❤️',
    taken_at: '2026-07-20T20:00:00Z',
    location: 'Skye Rooftop Dining, Jakarta',
    tagged_partner: true,
  },
  {
    albumIdx: 1,
    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    caption: 'Foto photobooth lucu kita setelah nonton bioskop 😂',
    taken_at: '2026-07-20T21:45:00Z',
    location: 'Grand Indonesia Mall',
    tagged_partner: true,
  },
  {
    albumIdx: 2,
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    caption: 'Matcha latte date di coffeeshop tersembunyi ☕💚',
    taken_at: '2026-08-05T15:20:00Z',
    location: 'Senopati, Jakarta Selatan',
    tagged_partner: true,
  },
]

export const DEFAULT_JOURNAL_PRESETS: Array<{
  title: string
  content: string
  mood: 'Happy' | 'Neutral' | 'Sad' | 'Loving' | 'Excited' | 'Thoughtful'
  tags: string[]
  is_published: boolean
  published_at: string
  comments: Array<{ id: string; entry_id: string; author_name: string; content: string; created_at: string }>
  reactions: { [emoji: string]: number }
}> = [
  {
    title: 'Hari Anniversary ke-2 Kita yang Tak Terlupakan 💕',
    content: `Hari ini resmi 2 tahun kita bersama. Rasanya waktu cepat banget berlalu! Masih ingat waktu pertama kali kita ketemu di toko buku dua tahun lalu, canggung tapi langsung nyambung ngobrol berjam-jam.

Terima kasih ya sudah selalu ada, selalu dengerin keluh kesahku, dan selalu sabar kalau aku lagi ngambek. Scrapbook foto yang kamu buat bener-bener bikin terharu 🥺❤️.

Semoga langkah-langkah ke depan kita semakin solid, saling dukung mimpi masing-masing, dan makin banyak petualangan seru yang kita jelajahi bareng. I love you!`,
    mood: 'Loving',
    tags: ['Anniversary', 'DateNight', 'Love', 'Milestone'],
    is_published: true,
    published_at: '2026-07-20T22:00:00Z',
    comments: [
      {
        id: 'jc-1',
        entry_id: '',
        author_name: 'Pasanganmu',
        content: 'Happy 2nd Anniversary sayang! Makasih juga udah jadi partner hidup paling suportif 🥰 Next trip Labuan Bajo yaa!',
        created_at: '2026-07-20T22:30:00Z',
      },
    ],
    reactions: { '❤️': 4, '💕': 2 },
  },
  {
    title: 'Liburan Santai & Sunset Terbaik di Seminyak 🌅',
    content: `Akhirnya liburan yang kita rencanain 3 bulan lalu terwujud juga! Suasana pantai Bali sore ini tenang banget. Kita jalan-jalan di tepi pantai tanpa mikirin kerjaan sama sekali.

Makan jagung bakar sambil dengerin deburan ombak, ketawa-tawa bareng ngeliat anjing pantai yang lucu. Momen sederhana kayak gini yang paling berharga.`,
    mood: 'Excited',
    tags: ['Bali', 'Travel', 'Sunset', 'Relax'],
    is_published: true,
    published_at: '2026-06-12T19:00:00Z',
    comments: [],
    reactions: { '❤️': 3, '😊': 1 },
  },
  {
    title: 'Obrolan Masa Depan di Kedai Kopi Hujan ☕🌧️',
    content: `Sore ini hujan deras di luar, kita neduh di kedai kopi favorit. Ditemani suara rintik hujan dan secangkir cokelat hangat, kita mulai ngobrolin rencana 5 tahun ke depan: rumah impian, karir, dan mimpi traveling keliling dunia.

Senang banget punya pasangan yang satu visi dan selalu optimis. Rasanya masa depan ga lagi menakutkan kalau dijalanin berdua.`,
    mood: 'Thoughtful',
    tags: ['DeepTalk', 'Coffee', 'Future', 'Dreams'],
    is_published: true,
    published_at: '2026-08-05T17:00:00Z',
    comments: [],
    reactions: { '❤️': 2, '✨': 1 },
  },
]

export const DEFAULT_CALENDAR_PRESETS = [
  {
    title: 'Anniversary Dinner & Surprise 🎂',
    description: 'Makan malam romantis di Skye Rooftop. Dresscode: Formal elegan.',
    start_time: '2026-08-25T19:00:00Z',
    end_time: '2026-08-25T21:30:00Z',
    all_day: false,
    location: 'Skye Rooftop Dining Jakarta',
    category: 'Anniversary' as const,
    color: '#f43f5e',
    reminder_minutes: [1440, 60],
  },
  {
    title: 'Nonton Bioskop: Movie Night 🎬🍿',
    description: 'Nonton film terbaru di IMAX bareng popcorn caramel.',
    start_time: '2026-08-28T18:30:00Z',
    end_time: '2026-08-28T21:00:00Z',
    all_day: false,
    location: 'Cinema XXI Grand Indonesia',
    category: 'Date Night' as const,
    color: '#e11d48',
    reminder_minutes: [60],
  },
  {
    title: 'Trip ke Labuan Bajo & Komodo ✈️🏝️',
    description: 'Sailing trip 3D2N naik kapal phinisi, snorkeling di Pink Beach & Manta Point.',
    start_time: '2026-09-15T06:00:00Z',
    end_time: '2026-09-18T18:00:00Z',
    all_day: true,
    location: 'Labuan Bajo, NTT',
    category: 'Travel' as const,
    color: '#8b5cf6',
    reminder_minutes: [4320, 1440],
  },
  {
    title: 'Beli Kado Ulang Tahun Mama 🎁',
    description: 'Cari hampers kue atau tas favorit mama di mall.',
    start_time: '2026-09-02T14:00:00Z',
    end_time: '2026-09-02T16:30:00Z',
    all_day: false,
    location: 'Central Park Mall',
    category: 'Reminder' as const,
    color: '#f59e0b',
    reminder_minutes: [1440],
  },
]

export const DEFAULT_LOVE_NOTES_PRESETS = [
  {
    message: 'Jangan lupa sarapan dan minum vitamin ya cintaa! Semangat kerjanya hari ini, I believe in you! 🥰✨',
    color: 'pink' as LoveNoteColor,
    is_pinned: true,
    is_read: true,
  },
  {
    message: 'Makasih banyak udah nemenin marathon film semalam walau kamu ngantuk hehe. You are the sweetest! 💖',
    color: 'yellow' as LoveNoteColor,
    is_pinned: false,
    is_read: true,
  },
  {
    message: 'Nanti sore jam 17:30 aku jemput yaa, kita jajan es krim matcha favorit kamu 🍦😋',
    color: 'mint' as LoveNoteColor,
    is_pinned: false,
    is_read: false,
  },
  {
    message: 'Setiap hari bersamamu selalu terasa istimewa. I love you to the moon and back ❤️🌙',
    color: 'purple' as LoveNoteColor,
    is_pinned: true,
    is_read: true,
  },
]

// ============================================================
// Module-level Singleton State for Couple Space
// Ensures live sync across all components in the application
// ============================================================
const albums = ref<Album[]>([])
const photos = ref<Photo[]>([])
const journalEntries = ref<JournalEntry[]>([])
const calendarEvents = ref<CoupleCalendarEvent[]>([])
const loveNotes = ref<LoveNote[]>([])

const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)
const usingFallback = ref(false)

// Lightbox State
const activeLightboxIndex = ref<number | null>(null)
const lightboxPhotos = ref<Photo[]>([])
const isSlideshowActive = ref(false)

// Realtime Channel Tracker
let activeChannelSpaceId: string | null = null
let currentRealtimeChannel: any = null

export function useCouple() {
  const authStore = useAuthStore()
  const toast = useToastStore()
  const { currentSpace, user } = storeToRefs(authStore)

  /* ============================
     Computed: Albums with Photo Count
     ============================ */
  const albumsWithMeta = computed<Album[]>(() => {
    return albums.value.map(alb => {
      const albPhotos = photos.value.filter(p => p.album_id === alb.id)
      let cover = alb.cover_url
      if (!cover && albPhotos.length > 0) {
        cover = albPhotos[0].image_url
      }

      // Date range
      let dateRange = 'Belum ada foto'
      if (albPhotos.length > 0) {
        const sorted = [...albPhotos].sort((a, b) => new Date(a.taken_at || a.created_at).getTime() - new Date(b.taken_at || b.created_at).getTime())
        const first = new Date(sorted[0].taken_at || sorted[0].created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
        const last = new Date(sorted[sorted.length - 1].taken_at || sorted[sorted.length - 1].created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
        dateRange = first === last ? first : `${first} - ${last}`
      }

      return {
        ...alb,
        cover_url: cover,
        photo_count: albPhotos.length,
        date_range: dateRange,
      }
    })
  })

  /* ============================
     Computed: Photos Timeline
     ============================ */
  const timelinePhotos = computed(() => {
    return [...photos.value].sort((a, b) => new Date(b.taken_at || b.created_at).getTime() - new Date(a.taken_at || a.created_at).getTime())
  })

  /* ============================
     Computed: Memory Lane ("On This Day")
     ============================ */
  const onThisDayItems = computed(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentDay = today.getDate()

    const matchingPhotos = photos.value.filter(p => {
      if (!p.taken_at) return false
      const d = new Date(p.taken_at)
      return d.getMonth() === currentMonth && d.getDate() === currentDay && d.getFullYear() < today.getFullYear()
    })

    const matchingJournals = journalEntries.value.filter(j => {
      const d = new Date(j.published_at || j.created_at)
      return d.getMonth() === currentMonth && d.getDate() === currentDay && d.getFullYear() < today.getFullYear()
    })

    return {
      photos: matchingPhotos,
      journals: matchingJournals,
      hasMemory: matchingPhotos.length > 0 || matchingJournals.length > 0,
    }
  })

  /* ============================
     Heart Burst Animation
     ============================ */
  function triggerHeartBurst(x = 0.5, y = 0.6) {
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x, y },
        shapes: ['circle'],
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#e11d48'],
        ticks: 120,
      })
    } catch {
      // ignore
    }
  }

  /* ============================
     Setup Supabase Realtime
     ============================ */
  function setupRealtime(spaceId: string) {
    if (!spaceId || spaceId === 'space-couple' || spaceId.startsWith('demo-')) return

    if (activeChannelSpaceId === spaceId && currentRealtimeChannel) {
      return
    }

    if (currentRealtimeChannel) {
      try {
        supabase.removeChannel(currentRealtimeChannel)
      } catch (err) {
        console.warn('Realtime cleanup note:', err)
      }
      currentRealtimeChannel = null
    }

    activeChannelSpaceId = spaceId

    currentRealtimeChannel = supabase
      .channel(`couple_space_${spaceId}`)
      // 1. Journal entries live sync
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries', filter: `space_id=eq.${spaceId}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any
            if (!journalEntries.value.some(j => j.id === newRow.id)) {
              let authorName = newRow.author_id === user.value?.id ? (user.value?.full_name || 'Kamu') : 'Pasangan'
              if (newRow.author_id && newRow.author_id !== user.value?.id) {
                const { data: prof } = await supabase.from('profiles').select('full_name, email').eq('id', newRow.author_id).single()
                if (prof) authorName = prof.full_name || prof.email || authorName
              }
              journalEntries.value.unshift({
                ...newRow,
                author_name: authorName,
                comments: [],
                reactions: {},
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as any
            const idx = journalEntries.value.findIndex(j => j.id === updatedRow.id)
            if (idx !== -1) {
              journalEntries.value[idx] = { ...journalEntries.value[idx], ...updatedRow }
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any
            journalEntries.value = journalEntries.value.filter(j => j.id !== oldRow.id)
          }
        }
      )
      // 2. Journal comments live sync
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_comments' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any
            const entry = journalEntries.value.find(j => j.id === newRow.entry_id)
            if (entry) {
              if (!entry.comments) entry.comments = []
              if (!entry.comments.some(c => c.id === newRow.id)) {
                let authorName = newRow.author_id === user.value?.id ? (user.value?.full_name || 'Kamu') : 'Pasangan'
                if (newRow.author_id && newRow.author_id !== user.value?.id) {
                  const { data: prof } = await supabase.from('profiles').select('full_name, email').eq('id', newRow.author_id).single()
                  if (prof) authorName = prof.full_name || prof.email || authorName
                }
                entry.comments.push({
                  id: newRow.id,
                  entry_id: newRow.entry_id,
                  author_name: authorName,
                  content: newRow.content,
                  parent_id: newRow.parent_id,
                  created_at: newRow.created_at,
                })
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any
            for (const j of journalEntries.value) {
              if (j.comments) {
                j.comments = j.comments.filter(c => c.id !== oldRow.id)
              }
            }
          }
        }
      )
      // 3. Journal reactions live sync
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_reactions' },
        async (payload) => {
          const entryId = (payload.new as any)?.entry_id || (payload.old as any)?.entry_id
          if (!entryId) return
          const entry = journalEntries.value.find(j => j.id === entryId)
          if (entry) {
            const { data: rList } = await supabase
              .from('journal_reactions')
              .select('*')
              .eq('entry_id', entryId)
            if (rList) {
              const counts: Record<string, number> = {}
              let userReaction: string | undefined = undefined
              rList.forEach((r: any) => {
                counts[r.emoji] = (counts[r.emoji] || 0) + 1
                if (r.user_id === user.value?.id) userReaction = r.emoji
              })
              entry.reactions = counts
              entry.userReaction = userReaction
            }
          }
        }
      )
      // 4. Calendar events live sync
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_events', filter: `space_id=eq.${spaceId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any
            if (!calendarEvents.value.some(e => e.id === newRow.id)) {
              calendarEvents.value.push(newRow)
              calendarEvents.value.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as any
            const idx = calendarEvents.value.findIndex(e => e.id === updatedRow.id)
            if (idx !== -1) calendarEvents.value[idx] = { ...calendarEvents.value[idx], ...updatedRow }
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any
            calendarEvents.value = calendarEvents.value.filter(e => e.id !== oldRow.id)
          }
        }
      )
      // 5. Love notes live sync
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'love_notes', filter: `space_id=eq.${spaceId}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any
            if (!loveNotes.value.some(n => n.id === newRow.id)) {
              let fromName = newRow.from_user === user.value?.id ? (user.value?.full_name || 'Kamu') : 'Pasanganmu 💕'
              if (newRow.from_user && newRow.from_user !== user.value?.id) {
                const { data: prof } = await supabase.from('profiles').select('full_name, email').eq('id', newRow.from_user).single()
                if (prof) fromName = prof.full_name || prof.email || fromName
              }
              loveNotes.value.unshift({ ...newRow, from_name: fromName })
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as any
            const idx = loveNotes.value.findIndex(n => n.id === updatedRow.id)
            if (idx !== -1) loveNotes.value[idx] = { ...loveNotes.value[idx], ...updatedRow }
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any
            loveNotes.value = loveNotes.value.filter(n => n.id !== oldRow.id)
          }
        }
      )
      // 6. Photos live sync
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'photos', filter: `space_id=eq.${spaceId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any
            if (!photos.value.some(p => p.id === newRow.id)) photos.value.unshift(newRow)
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as any
            const idx = photos.value.findIndex(p => p.id === updatedRow.id)
            if (idx !== -1) photos.value[idx] = { ...photos.value[idx], ...updatedRow }
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any
            photos.value = photos.value.filter(p => p.id !== oldRow.id)
          }
        }
      )
      // 7. Photo reactions live sync
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'photo_reactions' },
        async (payload) => {
          const photoId = (payload.new as any)?.photo_id || (payload.old as any)?.photo_id
          if (!photoId) return
          const p = photos.value.find(item => item.id === photoId)
          if (p) {
            const { data: prList } = await supabase
              .from('photo_reactions')
              .select('*')
              .eq('photo_id', photoId)
            if (prList) {
              const counts: Record<string, number> = {}
              let userReaction: string | undefined = undefined
              prList.forEach((r: any) => {
                counts[r.reaction] = (counts[r.reaction] || 0) + 1
                if (r.user_id === user.value?.id) userReaction = r.reaction
              })
              p.reactions = counts
              p.userReaction = userReaction
            }
          }
        }
      )
      // 8. Albums live sync
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'albums', filter: `space_id=eq.${spaceId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any
            if (!albums.value.some(a => a.id === newRow.id)) albums.value.unshift(newRow)
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as any
            const idx = albums.value.findIndex(a => a.id === updatedRow.id)
            if (idx !== -1) albums.value[idx] = { ...albums.value[idx], ...updatedRow }
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any
            albums.value = albums.value.filter(a => a.id !== oldRow.id)
          }
        }
      )
      .subscribe()
  }

  /* ============================
     Fetch Data (Supabase + LocalStorage Fallback)
     ============================ */
  async function fetchCoupleData(_force = false) {
    isLoading.value = true
    error.value = null

    try {
      const spaceId = currentSpace.value?.id

      if (!spaceId) {
        albums.value = []
        photos.value = []
        journalEntries.value = []
        calendarEvents.value = []
        loveNotes.value = []
        return
      }

      const isRealUser = user.value && !user.value.id.startsWith('demo-user')
      const isLegacyDemoSpace = spaceId === 'space-couple'

      if (isRealUser && spaceId) {
        // Fetch ALL couple entities independently so an empty album NEVER wipes journals or events!
        const [aRes, phRes, jRes, calRes, lnRes] = await Promise.all([
          supabase.from('albums').select('*').eq('space_id', spaceId).order('created_at', { ascending: false }),
          supabase.from('photos').select('*').eq('space_id', spaceId).order('taken_at', { ascending: false }),
          supabase.from('journal_entries').select('*, profiles:author_id(full_name, email, avatar_url)').eq('space_id', spaceId).order('created_at', { ascending: false }),
          supabase.from('calendar_events').select('*').eq('space_id', spaceId).order('start_time', { ascending: true }),
          supabase.from('love_notes').select('*, sender:from_user(full_name, email)').eq('space_id', spaceId).order('is_pinned', { ascending: false }),
        ])

        if (!aRes.error && aRes.data) albums.value = aRes.data

        // Photos + Reactions
        if (!phRes.error && phRes.data) {
          const photoIds = phRes.data.map((p: any) => p.id)
          let allPhotoReactions: any[] = []
          if (photoIds.length > 0) {
            const { data: prData } = await supabase.from('photo_reactions').select('*').in('photo_id', photoIds)
            if (prData) allPhotoReactions = prData
          }

          photos.value = phRes.data.map((p: any) => {
            const reactionsCount: Record<string, number> = {}
            let userReaction: string | undefined = undefined
            allPhotoReactions.filter((r: any) => r.photo_id === p.id).forEach((r: any) => {
              reactionsCount[r.reaction] = (reactionsCount[r.reaction] || 0) + 1
              if (r.user_id === user.value?.id) userReaction = r.reaction
            })
            return {
              ...p,
              reactions: reactionsCount,
              userReaction,
            }
          })
        }

        // Journal Entries + Comments + Reactions
        if (!jRes.error && jRes.data) {
          const entryIds = jRes.data.map((j: any) => j.id)
          let allComments: any[] = []
          let allReactions: any[] = []

          if (entryIds.length > 0) {
            const [commentsRes, reactionsRes] = await Promise.all([
              supabase
                .from('journal_comments')
                .select('*, profiles:author_id(full_name, email)')
                .in('entry_id', entryIds)
                .order('created_at', { ascending: true }),
              supabase
                .from('journal_reactions')
                .select('*')
                .in('entry_id', entryIds)
            ])
            if (!commentsRes.error && commentsRes.data) allComments = commentsRes.data
            if (!reactionsRes.error && reactionsRes.data) allReactions = reactionsRes.data
          }

          journalEntries.value = jRes.data.map((j: any) => {
            const entryComments = allComments
              .filter((c: any) => c.entry_id === j.id)
              .map((c: any) => ({
                id: c.id,
                entry_id: c.entry_id,
                author_name: c.profiles?.full_name || c.profiles?.email || (c.author_id === user.value?.id ? (user.value?.full_name || 'Kamu') : 'Pasangan'),
                content: c.content,
                parent_id: c.parent_id,
                created_at: c.created_at,
              }))

            const reactionsCount: Record<string, number> = {}
            let userReaction: string | undefined = undefined

            allReactions
              .filter((r: any) => r.entry_id === j.id)
              .forEach((r: any) => {
                reactionsCount[r.emoji] = (reactionsCount[r.emoji] || 0) + 1
                if (r.user_id === user.value?.id) userReaction = r.emoji
              })

            return {
              ...j,
              author_name: j.profiles?.full_name || j.profiles?.email || (j.author_id === user.value?.id ? (user.value?.full_name || 'Kamu') : 'Pasangan'),
              comments: entryComments,
              reactions: reactionsCount,
              userReaction,
            }
          })
        }

        if (!calRes.error && calRes.data) calendarEvents.value = calRes.data
        if (!lnRes.error && lnRes.data) {
          loveNotes.value = lnRes.data.map((n: any) => ({
            ...n,
            from_name: n.sender?.full_name || n.sender?.email || (n.from_user === user.value?.id ? (user.value?.full_name || 'Kamu') : 'Pasanganmu 💕'),
          }))
        }

        usingFallback.value = false
        setupRealtime(spaceId)
        return
      }

      // If legacy demo space and unseeded, seed defaults; otherwise load clean local storage
      const isCleanSlate = localStorage.getItem('spaceos_clean_slate') === 'true'
      const hasBeenSeeded = localStorage.getItem(`spaceos_couple_seeded_${spaceId}`) === 'true'
      if (!isCleanSlate && isLegacyDemoSpace && !hasBeenSeeded) {
        seedLocalDefaults()
      } else {
        loadFromLocalStorage(spaceId)
      }
    } catch (err: any) {
      console.error('fetchCoupleData error:', err)
      loadFromLocalStorage(currentSpace.value?.id || 'couple-demo')
    } finally {
      isLoading.value = false
    }
  }




  function seedLocalDefaults() {
    const spaceId = currentSpace.value?.id || 'couple-demo'

    albums.value = DEFAULT_ALBUM_PRESETS.map((a, idx) => ({
      ...a,
      id: 'album-' + (idx + 1),
      space_id: spaceId,
      created_at: new Date(Date.now() - (idx + 1) * 86400000 * 10).toISOString(),
    }))

    photos.value = DEFAULT_PHOTO_PRESETS.map((p, idx) => ({
      id: 'photo-' + (idx + 1),
      space_id: spaceId,
      album_id: 'album-' + (p.albumIdx + 1),
      image_url: p.image_url,
      caption: p.caption,
      taken_at: p.taken_at,
      location: p.location,
      tagged_partner: p.tagged_partner,
      created_at: p.taken_at,
      reactions: { '❤️': 2 },
    }))

    journalEntries.value = DEFAULT_JOURNAL_PRESETS.map((j, idx) => ({
      id: 'journal-' + (idx + 1),
      space_id: spaceId,
      author_name: 'Kamu',
      title: j.title,
      content: j.content,
      mood: j.mood,
      tags: j.tags,
      is_published: j.is_published,
      published_at: j.published_at,
      created_at: j.published_at,
      comments: j.comments.map(c => ({ ...c, entry_id: 'journal-' + (idx + 1) })),
      reactions: j.reactions,
    }))

    calendarEvents.value = DEFAULT_CALENDAR_PRESETS.map((e, idx) => ({
      ...e,
      id: 'calevt-' + (idx + 1),
      space_id: spaceId,
      created_at: new Date().toISOString(),
    }))

    loveNotes.value = DEFAULT_LOVE_NOTES_PRESETS.map((n, idx) => ({
      ...n,
      id: 'ln-' + (idx + 1),
      space_id: spaceId,
      from_name: 'Pasanganmu',
      created_at: new Date(Date.now() - idx * 3600000 * 4).toISOString(),
    }))

    saveToLocalStorage(spaceId)
  }

  /* ============================
     LocalStorage Helpers
     ============================ */
  function loadFromLocalStorage(spaceId: string) {
    const isCleanSlate = localStorage.getItem('spaceos_clean_slate') === 'true'
    try {
      const aKey = `spaceos_couple_albums_${spaceId}`
      const pKey = `spaceos_couple_photos_${spaceId}`
      const jKey = `spaceos_couple_journals_${spaceId}`
      const cKey = `spaceos_couple_events_${spaceId}`
      const lKey = `spaceos_couple_notes_${spaceId}`

      const aData = localStorage.getItem(aKey)
      if (aData) {
        albums.value = JSON.parse(aData)
        photos.value = JSON.parse(localStorage.getItem(pKey) || '[]')
        journalEntries.value = JSON.parse(localStorage.getItem(jKey) || '[]')
        calendarEvents.value = JSON.parse(localStorage.getItem(cKey) || '[]')
        loveNotes.value = JSON.parse(localStorage.getItem(lKey) || '[]')
        usingFallback.value = true
      } else if (!isCleanSlate && spaceId === 'space-couple' && !localStorage.getItem(`spaceos_couple_seeded_${spaceId}`)) {
        seedLocalDefaults()
      } else {
        albums.value = []
        photos.value = []
        journalEntries.value = []
        calendarEvents.value = []
        loveNotes.value = []
        saveToLocalStorage(spaceId)
        usingFallback.value = true
      }
    } catch {
      albums.value = []
      photos.value = []
      journalEntries.value = []
      calendarEvents.value = []
      loveNotes.value = []
      usingFallback.value = true
    }
  }

  function saveToLocalStorage(spaceId: string) {
    try {
      localStorage.setItem(`spaceos_couple_albums_${spaceId}`, JSON.stringify(albums.value))
      localStorage.setItem(`spaceos_couple_photos_${spaceId}`, JSON.stringify(photos.value))
      localStorage.setItem(`spaceos_couple_journals_${spaceId}`, JSON.stringify(journalEntries.value))
      localStorage.setItem(`spaceos_couple_events_${spaceId}`, JSON.stringify(calendarEvents.value))
      localStorage.setItem(`spaceos_couple_notes_${spaceId}`, JSON.stringify(loveNotes.value))
    } catch {
      // ignore
    }
  }

  /* ============================
     CRUD: Albums
     ============================ */
  async function createAlbum(formData: AlbumFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'couple-demo'
    const userId = user.value?.id || null

    try {
      const payload = {
        space_id: spaceId,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        cover_url: formData.cover_url || null,
        tags: formData.tags || [],
        created_by: userId,
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('albums')
          .insert([payload])
          .select()
          .single()

        if (err) throw err
        if (data) albums.value.unshift(data)
      } else {
        const mockAlbum: Album = {
          ...payload,
          id: 'alb-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        albums.value.unshift(mockAlbum)
        saveToLocalStorage(spaceId)
      }

      toast.success('Album Dibuat 💕', `"${formData.name}" berhasil dibuat.`)
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Membuat Album', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function updateAlbum(id: string, formData: Partial<AlbumFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'couple-demo'

    try {
      const updates: any = { updated_at: new Date().toISOString() }
      if (formData.name !== undefined) updates.name = formData.name.trim()
      if (formData.description !== undefined) updates.description = formData.description?.trim() || null
      if (formData.cover_url !== undefined) updates.cover_url = formData.cover_url
      if (formData.tags !== undefined) updates.tags = formData.tags

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('albums')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const idx = albums.value.findIndex(a => a.id === id)
        if (idx !== -1 && data) albums.value[idx] = data
      } else {
        const idx = albums.value.findIndex(a => a.id === id)
        if (idx !== -1) {
          albums.value[idx] = { ...albums.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      toast.success('Album Diperbarui', 'Perubahan berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengupdate Album', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function deleteAlbum(id: string) {
    const spaceId = currentSpace.value?.id || 'couple-demo'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('albums').delete().eq('id', id)
        if (err) throw err
      }

      albums.value = albums.value.filter(a => a.id !== id)
      photos.value = photos.value.filter(p => p.album_id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Album Dihapus', 'Album foto telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Album', err.message)
      return { success: false, error: err.message }
    }
  }

  /* ============================
     CRUD: Photos
     ============================ */
  async function addPhotos(photosData: PhotoFormData[]) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'couple-demo'
    const userId = user.value?.id || null

    try {
      const payloads = photosData.map(p => ({
        space_id: spaceId,
        album_id: p.album_id || null,
        image_url: p.image_url,
        caption: p.caption?.trim() || null,
        taken_at: p.taken_at || new Date().toISOString(),
        location: p.location?.trim() || null,
        tagged_partner: Boolean(p.tagged_partner),
        created_by: userId,
      }))

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('photos')
          .insert(payloads)
          .select()

        if (err) throw err
        if (data) photos.value.unshift(...data)
      } else {
        const mockPhotos: Photo[] = payloads.map((p, idx) => ({
          ...p,
          id: 'ph-' + (Date.now() + idx),
          created_at: new Date().toISOString(),
        }))
        photos.value.unshift(...mockPhotos)
        saveToLocalStorage(spaceId)
      }

      triggerHeartBurst()
      toast.success('Foto Diunggah 📸', `${photosData.length} foto berhasil ditambahkan ke galeri.`)
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengunggah Foto', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function deletePhoto(id: string) {
    const spaceId = currentSpace.value?.id || 'couple-demo'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('photos').delete().eq('id', id)
        if (err) throw err
      }

      photos.value = photos.value.filter(p => p.id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Foto Dihapus', 'Foto telah dihapus dari album.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Foto', err.message)
      return { success: false, error: err.message }
    }
  }

  async function reactToPhoto(photoId: string, emoji = '❤️') {
    const p = photos.value.find(item => item.id === photoId)
    if (!p) return

    if (!p.reactions) p.reactions = {}
    const currentReaction = p.userReaction
    const userId = user.value?.id
    const isRealUser = Boolean(userId && !userId.startsWith('demo-user') && !usingFallback.value)

    if (currentReaction === emoji) {
      // Toggle off
      if (p.reactions[emoji] && p.reactions[emoji] > 0) {
        p.reactions[emoji] -= 1
      }
      p.userReaction = undefined

      if (isRealUser && userId) {
        try {
          await supabase
            .from('photo_reactions')
            .delete()
            .match({ photo_id: photoId, user_id: userId })
        } catch (e) {
          console.warn('Error removing photo reaction:', e)
        }
      }
    } else {
      triggerHeartBurst()
      if (currentReaction && p.reactions[currentReaction] && p.reactions[currentReaction] > 0) {
        p.reactions[currentReaction] -= 1
      }
      p.reactions[emoji] = (p.reactions[emoji] || 0) + 1
      p.userReaction = emoji

      if (isRealUser && userId) {
        try {
          await supabase
            .from('photo_reactions')
            .upsert({
              photo_id: photoId,
              user_id: userId,
              reaction: emoji,
            }, { onConflict: 'photo_id,user_id' })
        } catch (e) {
          console.warn('Error saving photo reaction:', e)
        }
      }
    }

    if (usingFallback.value) {
      saveToLocalStorage(currentSpace.value?.id || 'couple-demo')
    }
  }

  /* ============================
     Lightbox Controls
     ============================ */
  function openLightbox(photosList: Photo[], startIndex = 0) {
    lightboxPhotos.value = photosList
    activeLightboxIndex.value = startIndex
  }

  function closeLightbox() {
    activeLightboxIndex.value = null
    lightboxPhotos.value = []
    isSlideshowActive.value = false
  }

  /* ============================
     CRUD: Journal Entries
     ============================ */
  async function createJournalEntry(formData: JournalEntryFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'couple-demo'
    const userId = user.value?.id || null

    try {
      const payload = {
        space_id: spaceId,
        author_id: userId,
        title: formData.title?.trim() || null,
        content: formData.content.trim(),
        mood: formData.mood || 'Happy',
        tags: formData.tags || [],
        is_published: Boolean(formData.is_published),
        published_at: formData.is_published ? new Date().toISOString() : null,
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('journal_entries')
          .insert([payload])
          .select('*, profiles:author_id(full_name, email, avatar_url)')
          .single()

        if (err) throw err
        if (data) {
          const entryWithMeta: JournalEntry = {
            ...data,
            author_name: data.profiles?.full_name || data.profiles?.email || (user.value?.full_name || 'Kamu'),
            comments: [],
            reactions: {},
          }
          if (!journalEntries.value.some(j => j.id === entryWithMeta.id)) {
            journalEntries.value.unshift(entryWithMeta)
          }
        }
      } else {
        const mockEntry: JournalEntry = {
          ...payload,
          id: 'jr-' + Date.now(),
          author_name: user.value?.full_name || 'Kamu',
          created_at: new Date().toISOString(),
          comments: [],
          reactions: {},
        }
        journalEntries.value.unshift(mockEntry)
        saveToLocalStorage(spaceId)
      }


      if (formData.is_published) {
        triggerHeartBurst()
        toast.success('Journal Dipublikasikan 💕', 'Catatan manis berhasil dibagikan dengan pasangan.')
      } else {
        toast.info('Draft Tersimpan', 'Journal disimpan sebagai draft pribadi.')
      }

      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menyimpan Journal', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function updateJournalEntry(id: string, formData: Partial<JournalEntryFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'couple-demo'

    try {
      const updates: any = { updated_at: new Date().toISOString() }
      if (formData.title !== undefined) updates.title = formData.title?.trim() || null
      if (formData.content !== undefined) updates.content = formData.content.trim()
      if (formData.mood !== undefined) updates.mood = formData.mood
      if (formData.tags !== undefined) updates.tags = formData.tags
      if (formData.is_published !== undefined) {
        updates.is_published = formData.is_published
        if (formData.is_published && !updates.published_at) {
          updates.published_at = new Date().toISOString()
        }
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('journal_entries')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const idx = journalEntries.value.findIndex(j => j.id === id)
        if (idx !== -1 && data) journalEntries.value[idx] = data
      } else {
        const idx = journalEntries.value.findIndex(j => j.id === id)
        if (idx !== -1) {
          journalEntries.value[idx] = { ...journalEntries.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      toast.success('Journal Diperbarui', 'Perubahan berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengupdate Journal', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function deleteJournalEntry(id: string) {
    const spaceId = currentSpace.value?.id || 'couple-demo'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('journal_entries').delete().eq('id', id)
        if (err) throw err
      }

      journalEntries.value = journalEntries.value.filter(j => j.id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Journal Dihapus', 'Catatan telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Journal', err.message)
      return { success: false, error: err.message }
    }
  }

  async function reactToJournal(entryId: string, emoji: string) {
    const j = journalEntries.value.find(item => item.id === entryId)
    if (!j) return

    if (!j.reactions) j.reactions = {}
    const currentReaction = j.userReaction
    const userId = user.value?.id
    const isRealUser = Boolean(userId && !userId.startsWith('demo-user') && !usingFallback.value)

    if (currentReaction === emoji) {
      // Toggle off (un-react)
      if (j.reactions[emoji] && j.reactions[emoji] > 0) {
        j.reactions[emoji] -= 1
      }
      j.userReaction = undefined

      if (isRealUser && userId) {
        try {
          await supabase
            .from('journal_reactions')
            .delete()
            .match({ entry_id: entryId, user_id: userId })
        } catch (e) {
          console.warn('Error removing reaction:', e)
        }
      }
    } else {
      triggerHeartBurst()
      // Switch reaction or add for first time
      if (currentReaction && j.reactions[currentReaction] && j.reactions[currentReaction] > 0) {
        j.reactions[currentReaction] -= 1
      }
      j.reactions[emoji] = (j.reactions[emoji] || 0) + 1
      j.userReaction = emoji

      if (isRealUser && userId) {
        try {
          await supabase
            .from('journal_reactions')
            .upsert({
              entry_id: entryId,
              user_id: userId,
              emoji,
            }, { onConflict: 'entry_id,user_id' })
        } catch (e) {
          console.warn('Error saving reaction:', e)
        }
      }
    }

    if (usingFallback.value) {
      saveToLocalStorage(currentSpace.value?.id || 'couple-demo')
    }
  }

  async function addJournalComment(entryId: string, content: string, parentId?: string) {
    const trimmed = content.trim()
    if (!trimmed) return
    const j = journalEntries.value.find(item => item.id === entryId)
    if (!j) return

    const userId = user.value?.id
    const isRealUser = Boolean(userId && !userId.startsWith('demo-user') && !usingFallback.value)

    if (isRealUser && userId) {
      try {
        const { data, error: err } = await supabase
          .from('journal_comments')
          .insert({
            entry_id: entryId,
            author_id: userId,
            content: trimmed,
            parent_id: parentId || null,
          })
          .select('*, profiles:author_id(full_name, email, avatar_url)')
          .single()

        if (err) throw err

        if (data) {
          const newComment: JournalComment = {
            id: data.id,
            entry_id: entryId,
            author_name: data.profiles?.full_name || data.profiles?.email || user.value?.full_name || 'Kamu',
            content: data.content,
            parent_id: data.parent_id,
            created_at: data.created_at,
          }

          if (!j.comments) j.comments = []
          if (!j.comments.some(c => c.id === newComment.id)) {
            j.comments.push(newComment)
          }
        }
      } catch (err: any) {
        console.error('Error adding comment:', err)
        toast.error('Gagal Mengirim Komentar', err.message)
        return
      }
    } else {
      const newComment: JournalComment = {
        id: 'jc-' + Date.now(),
        entry_id: entryId,
        author_name: user.value?.full_name || 'Kamu',
        content: trimmed,
        parent_id: parentId || null,
        created_at: new Date().toISOString(),
      }
      if (!j.comments) j.comments = []
      j.comments.push(newComment)
      if (usingFallback.value) saveToLocalStorage(currentSpace.value?.id || 'couple-demo')
    }

    triggerHeartBurst()
    toast.success('Komentar Terkirim 💕', 'Pesan kamu berhasil ditambahkan.')
  }


  /* ============================
     CRUD: Calendar Events & ICS
     ============================ */
  async function createCalendarEvent(formData: CoupleEventFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'couple-demo'
    const userId = user.value?.id || null

    try {
      const payload = {
        space_id: spaceId,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        all_day: Boolean(formData.all_day),
        location: formData.location?.trim() || null,
        category: formData.category || 'Date Night',
        color: formData.color || '#f43f5e',
        reminder_minutes: formData.reminder_minutes || [15],
        repeat_rule: formData.repeat_rule || 'none',
        created_by: userId,
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('calendar_events')
          .insert([payload])
          .select()
          .single()

        if (err) throw err
        if (data) {
          if (!calendarEvents.value.some(e => e.id === data.id)) {
            calendarEvents.value.push(data)
            calendarEvents.value.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
          }
        }
      } else {
        const mockEvt: CoupleCalendarEvent = {
          ...payload,
          id: 'cal-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        calendarEvents.value.push(mockEvt)
        saveToLocalStorage(spaceId)
      }


      triggerHeartBurst()
      toast.success('Event Terjadwal 💕', `"${formData.title}" berhasil ditambahkan ke kalender.`)
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Membuat Event', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function updateCalendarEvent(id: string, formData: Partial<CoupleEventFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'couple-demo'

    try {
      const updates: any = { updated_at: new Date().toISOString() }
      if (formData.title !== undefined) updates.title = formData.title.trim()
      if (formData.description !== undefined) updates.description = formData.description?.trim() || null
      if (formData.start_time !== undefined) updates.start_time = formData.start_time
      if (formData.end_time !== undefined) updates.end_time = formData.end_time
      if (formData.all_day !== undefined) updates.all_day = formData.all_day
      if (formData.location !== undefined) updates.location = formData.location?.trim() || null
      if (formData.category !== undefined) updates.category = formData.category
      if (formData.color !== undefined) updates.color = formData.color
      if (formData.reminder_minutes !== undefined) updates.reminder_minutes = formData.reminder_minutes
      if (formData.repeat_rule !== undefined) updates.repeat_rule = formData.repeat_rule

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('calendar_events')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const idx = calendarEvents.value.findIndex(e => e.id === id)
        if (idx !== -1 && data) calendarEvents.value[idx] = data
      } else {
        const idx = calendarEvents.value.findIndex(e => e.id === id)
        if (idx !== -1) {
          calendarEvents.value[idx] = { ...calendarEvents.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      toast.success('Event Diperbarui', 'Perubahan jadwal berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengupdate Event', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function deleteCalendarEvent(id: string) {
    const spaceId = currentSpace.value?.id || 'couple-demo'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('calendar_events').delete().eq('id', id)
        if (err) throw err
      }

      calendarEvents.value = calendarEvents.value.filter(e => e.id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Event Dihapus', 'Jadwal telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Event', err.message)
      return { success: false, error: err.message }
    }
  }

  function exportToICS(eventsList: CoupleCalendarEvent[]) {
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SpaceOS//Couple Calendar//ID\nCALSCALE:GREGORIAN\n'

    eventsList.forEach(e => {
      const dtStart = new Date(e.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const dtEnd = e.end_time ? new Date(e.end_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : dtStart

      icsContent += 'BEGIN:VEVENT\n'
      icsContent += `SUMMARY:${e.title}\n`
      if (e.description) icsContent += `DESCRIPTION:${e.description.replace(/\n/g, '\\n')}\n`
      if (e.location) icsContent += `LOCATION:${e.location}\n`
      icsContent += `DTSTART:${dtStart}\n`
      icsContent += `DTEND:${dtEnd}\n`
      icsContent += `UID:${e.id}@spaceos.app\n`
      icsContent += 'STATUS:CONFIRMED\n'
      icsContent += 'END:VEVENT\n'
    })

    icsContent += 'END:VCALENDAR'

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', 'couple-calendar.ics')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Kalender Diekspor (.ICS)', 'File kalender berhasil diunduh.')
  }

  /* ============================
     CRUD: Love Notes
     ============================ */
  async function createLoveNote(formData: LoveNoteFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'couple-demo'
    const userId = user.value?.id || null

    try {
      const payload = {
        space_id: spaceId,
        from_user: userId,
        message: formData.message.trim(),
        color: formData.color || 'yellow',
        is_read: false,
        is_pinned: Boolean(formData.is_pinned),
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('love_notes')
          .insert([payload])
          .select('*, sender:from_user(full_name, email)')
          .single()

        if (err) throw err
        if (data) {
          const noteWithSender: LoveNote = {
            ...data,
            from_name: data.sender?.full_name || data.sender?.email || (user.value?.full_name || 'Kamu 💕'),
          }
          if (!loveNotes.value.some(n => n.id === noteWithSender.id)) {
            loveNotes.value.unshift(noteWithSender)
          }
        }
      } else {
        const mockNote: LoveNote = {
          ...payload,
          id: 'ln-' + Date.now(),
          from_name: user.value?.full_name || 'Kamu 💕',
          created_at: new Date().toISOString(),
        }
        loveNotes.value.unshift(mockNote)
        saveToLocalStorage(spaceId)
      }


      triggerHeartBurst()
      toast.success('Love Note Dikirim 💌', 'Pesan manis berhasil ditempelkan di board!')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menempelkan Love Note', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function togglePinLoveNote(id: string) {
    const note = loveNotes.value.find(n => n.id === id)
    if (!note) return
    const newPinned = !note.is_pinned

    if (!usingFallback.value) {
      await supabase.from('love_notes').update({ is_pinned: newPinned }).eq('id', id)
    }

    note.is_pinned = newPinned
    // Re-sort with pinned first
    loveNotes.value.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
    if (usingFallback.value) saveToLocalStorage(currentSpace.value?.id || 'couple-demo')
  }

  async function markLoveNoteAsRead(id: string) {
    const note = loveNotes.value.find(n => n.id === id)
    if (!note) return
    note.is_read = true
    if (!usingFallback.value) {
      await supabase.from('love_notes').update({ is_read: true }).eq('id', id)
    } else {
      saveToLocalStorage(currentSpace.value?.id || 'couple-demo')
    }
  }

  async function deleteLoveNote(id: string) {
    const spaceId = currentSpace.value?.id || 'couple-demo'
    try {
      if (!usingFallback.value) {
        await supabase.from('love_notes').delete().eq('id', id)
      }
      loveNotes.value = loveNotes.value.filter(n => n.id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)
      toast.info('Catatan Dihapus', 'Sticky note telah dilepas.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Note', err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    // State
    albums,
    photos,
    journalEntries,
    calendarEvents,
    loveNotes,
    isLoading,
    isSaving,
    error,
    usingFallback,
    activeLightboxIndex,
    lightboxPhotos,
    isSlideshowActive,
    // Computed
    albumsWithMeta,
    timelinePhotos,
    onThisDayItems,
    // Actions
    fetchCoupleData,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    addPhotos,
    deletePhoto,
    reactToPhoto,
    openLightbox,
    closeLightbox,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    reactToJournal,
    addJournalComment,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    exportToICS,
    createLoveNote,
    togglePinLoveNote,
    markLoveNoteAsRead,
    deleteLoveNote,
    triggerHeartBurst,
  }
}
