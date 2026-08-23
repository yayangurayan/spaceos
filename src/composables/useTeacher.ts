import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'
import type {
  Student,
  StudentFormData,
  Lesson,
  LessonFormData,
  LessonPlan,
  LessonPlanFormData,
  TeacherMaterial,
  MaterialFormData,
  TeacherPayment,
  PaymentFormData,
  TeacherOverviewStats,
} from '@/types'

export const TEACHER_SUBJECTS = [
  'Matematika',
  'Fisika',
  'Kimia',
  'Biologi',
  'Bahasa Inggris',
  'Bahasa Indonesia',
  'Ekonomi / Akuntansi',
  'Coding / Komputer',
  'General / Tematik',
]

export const GRADE_LEVELS = [
  'SD Kelas 1-3',
  'SD Kelas 4-6',
  'SMP Kelas 7',
  'SMP Kelas 8',
  'SMP Kelas 9',
  'SMA Kelas 10',
  'SMA Kelas 11',
  'SMA Kelas 12 / UTBK',
  'Kuliah / Umum',
]

export const DAYS_OF_WEEK = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
]

/* ============================================================
   Presets
   ============================================================ */
function getFutureDate(daysAhead: number, hours = 16, minutes = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export const DEFAULT_STUDENT_PRESETS: Array<Omit<Student, 'id' | 'space_id' | 'created_at'>> = [
  {
    name: 'Anisa Rahmawati',
    grade: 'SMA Kelas 10',
    subjects: ['Matematika', 'Fisika'],
    parent_contact: {
      name: 'Ibu Ratna',
      phone: '081234567890',
      email: 'ratna.anisa@gmail.com',
      relationship: 'Ibu',
    },
    schedule: [
      { day: 'Senin', start_time: '16:00', end_time: '17:30', duration: 90 },
      { day: 'Rabu', start_time: '16:00', end_time: '17:30', duration: 90 },
    ],
    monthly_fee: 950000,
    payment_method: 'Transfer',
    payment_due_date: 5,
    notes: 'Sangat cepat memahami konsep visual & grafik aljabar. Perlu latihan soal cerita bergradasi.',
    status: 'active',
    start_date: '2026-01-10',
  },
  {
    name: 'Budi Santoso',
    grade: 'SMP Kelas 9',
    subjects: ['Matematika', 'Bahasa Inggris'],
    parent_contact: {
      name: 'Bapak Hendra',
      phone: '081398765432',
      email: 'hendra.budi@yahoo.com',
      relationship: 'Ayah',
    },
    schedule: [
      { day: 'Selasa', start_time: '15:30', end_time: '17:00', duration: 90 },
      { day: 'Kamis', start_time: '15:30', end_time: '17:00', duration: 90 },
    ],
    monthly_fee: 800000,
    payment_method: 'Transfer',
    payment_due_date: 10,
    notes: 'Persiapan Ujian Sekolah & Asesmen Standarisasi. Kuat di grammar, perlu drill aritmatika sosial.',
    status: 'active',
    start_date: '2026-02-01',
  },
  {
    name: 'Citra Dewi',
    grade: 'SMA Kelas 12 / UTBK',
    subjects: ['Kimia', 'Fisika'],
    parent_contact: {
      name: 'Ibu Wulandari',
      phone: '081722334455',
      email: 'wulan.citra@gmail.com',
      relationship: 'Ibu',
    },
    schedule: [
      { day: 'Jumat', start_time: '16:30', end_time: '18:00', duration: 90 },
      { day: 'Sabtu', start_time: '10:00', end_time: '11:30', duration: 90 },
    ],
    monthly_fee: 1200000,
    payment_method: 'Transfer',
    payment_due_date: 5,
    notes: 'Target SNBT Kedokteran. Fokus stoikiometri lanjutan, termokimia, dan mekanika kuantum.',
    status: 'active',
    start_date: '2025-11-15',
  },
  {
    name: 'Dimas Pratama',
    grade: 'SD Kelas 5',
    subjects: ['Matematika', 'General / Tematik'],
    parent_contact: {
      name: 'Ibu Maya',
      phone: '081899887766',
      email: 'maya.dimas@gmail.com',
      relationship: 'Ibu',
    },
    schedule: [
      { day: 'Senin', start_time: '14:00', end_time: '15:15', duration: 75 },
      { day: 'Kamis', start_time: '14:00', end_time: '15:15', duration: 75 },
    ],
    monthly_fee: 650000,
    payment_method: 'Cash',
    payment_due_date: 1,
    notes: 'Senang belajar dengan alat peraga atau kuis interaktif. Belajar pecahan & volume kubus.',
    status: 'active',
    start_date: '2026-03-01',
  },
  {
    name: 'Eko Wijaya',
    grade: 'SMA Kelas 11',
    subjects: ['Fisika'],
    parent_contact: {
      name: 'Bapak Gunawan',
      phone: '085611223344',
      relationship: 'Ayah',
    },
    schedule: [
      { day: 'Rabu', start_time: '19:00', end_time: '20:30', duration: 90 },
    ],
    monthly_fee: 500000,
    payment_method: 'E-wallet',
    payment_due_date: 15,
    notes: 'Sedang istirahat 2 minggu karena turnamen basket sekolah.',
    status: 'paused',
    start_date: '2025-10-01',
  },
]

export const DEFAULT_LESSON_PLAN_PRESETS: Array<Omit<LessonPlan, 'id' | 'space_id' | 'created_at'>> = [
  {
    title: 'Trigonometri & Aturan Sinus-Cosinus',
    subject: 'Matematika',
    grade: 'SMA Kelas 10',
    duration_minutes: 90,
    objectives: '1. Memahami perbandingan trigonometri pada segitiga siku-siku\n2. Menerapkan aturan sinus dan cosinus untuk mencari sisi/sudut\n3. Menyelesaikan soal aplikasi kontekstual elevasi.',
    materials: 'Modul Trigonometri Hal 12-25, Geogebra visualizer, Lembar Soal Tantangan.',
    activities: '1. Review konsep segitiga (15 mnt)\n2. Penjelasan rumus aturan Sinus & Cosinus (25 mnt)\n3. Latihan soal mandiri terpandu 5 nomor (35 mnt)\n4. Kesimpulan & tugas rumah (15 mnt)',
    assessment: 'Kuis 3 soal cepat di akhir sesi + 5 nomor PR.',
  },
  {
    title: 'Hukum Newton & Analisis Gaya Gesek',
    subject: 'Fisika',
    grade: 'SMA Kelas 11',
    duration_minutes: 90,
    objectives: '1. Membedakan gaya gesek statis dan kinetis\n2. Menggambar diagram benda bebas (Free Body Diagram) pada bidang miring\n3. Menghitung percepatan sistem benda terhubung katrol.',
    materials: 'Worksheet Hukum Newton, Slide PhET Simulation Bidang Miring.',
    activities: '1. Brainstorming fenomena gesekan ban mobil (10 mnt)\n2. Gambar FBD bidang datar & miring (30 mnt)\n3. Latihan variasi soal katrol & benda bertumpuk (40 mnt)\n4. Review rumus kunci (10 mnt)',
    assessment: 'Ketepatan membuat Free Body Diagram dan penurunan rumus F=m.a.',
  },
  {
    title: 'Tenses Mastery: Present Perfect vs Simple Past',
    subject: 'Bahasa Inggris',
    grade: 'SMP Kelas 9',
    duration_minutes: 90,
    objectives: '1. Membedakan penggunaan Have/Has + V3 dengan V2\n2. Memahami time signal (since, for, yesterday, ago)\n3. Menyusun 5 kalimat pengalaman pribadi.',
    materials: 'Flashcards Irregular Verbs, Worksheet Fill-in-the-Blanks, Dialog kartu.',
    activities: '1. Warm-up game verb 3 bingo (15 mnt)\n2. Pola kalimat & makna perbedaan waktu (25 mnt)\n3. Practice reading comprehension (30 mnt)\n4. Speaking practice: "Have you ever...?" (20 mnt)',
    assessment: 'Skor worksheet minimal 80% dan partisipasi aktif dialog.',
  },
]

export const DEFAULT_MATERIALS_PRESETS: Array<Omit<TeacherMaterial, 'id' | 'space_id' | 'created_at'>> = [
  {
    title: 'Bank Soal Latihan Aljabar & Fungsi Kuadrat',
    subject: 'Matematika',
    grade: 'SMA Kelas 10',
    type: 'Worksheet',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Kumpulan 50 soal pilihan ganda dan esai lengkap dengan pembahasan langkah demi langkah.',
    tags: ['Aljabar', 'Fungsi Kuadrat', 'Latihan Mandiri', 'PDF'],
    is_favorite: true,
  },
  {
    title: 'Slide Presentasi Dinamika Gerak & Gravitasi',
    subject: 'Fisika',
    grade: 'SMA Kelas 10',
    type: 'Slides',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Slide visual interaktif dengan animasi vektor gaya dan hukum Kepler.',
    tags: ['Dinamika', 'Gravitasi', 'Slide PPT'],
    is_favorite: true,
  },
  {
    title: 'Tabel Irregular Verbs Lengkap & Kuis Kosakata',
    subject: 'Bahasa Inggris',
    grade: 'SMP Kelas 9',
    type: 'Notes',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Daftar 200 kata kerja tidak beraturan paling sering muncul dalam ujian.',
    tags: ['Vocabulary', 'Grammar', 'Irregular Verbs'],
    is_favorite: false,
  },
  {
    title: 'Modul Stoikiometri & Konsep Mol Praktis',
    subject: 'Kimia',
    grade: 'SMA Kelas 12 / UTBK',
    type: 'Worksheet',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Rumus cepat menghitung massa molar, gas ideal, dan pereaksi pembatas.',
    tags: ['Kimia', 'Stoikiometri', 'UTBK'],
    is_favorite: true,
  },
]

export function useTeacher() {
  const authStore = useAuthStore()
  const toast = useToastStore()
  const { currentSpace, user } = storeToRefs(authStore)

  /* ============================
     State
     ============================ */
  const students = ref<Student[]>([])
  const lessons = ref<Lesson[]>([])
  const lessonPlans = ref<LessonPlan[]>([])
  const materials = ref<TeacherMaterial[]>([])
  const payments = ref<TeacherPayment[]>([])

  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

  // Filters
  const searchQuery = ref('')
  const selectedSubject = ref('all')
  const selectedGrade = ref('all')
  const selectedStatus = ref('all')

  /* ============================
     Computed: Students with Meta
     ============================ */
  const studentsWithMeta = computed(() => {
    return students.value.map(student => {
      const studentLessons = lessons.value.filter(l => l.student_id === student.id)
      const completedLessons = studentLessons.filter(l => l.status === 'completed').length

      // Find next upcoming lesson
      const now = new Date().toISOString()
      const upcoming = studentLessons
        .filter(l => l.status === 'scheduled' && l.datetime >= now)
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0]

      // Current month unpaid balance
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const currentPayment = payments.value.find(
        p => p.student_id === student.id && p.month === currentMonth && p.year === currentYear
      )

      return {
        ...student,
        totalLessons: studentLessons.length,
        completedLessons,
        nextLesson: upcoming ? upcoming.datetime : null,
        paymentStatus: currentPayment ? currentPayment.status : 'pending',
      }
    })
  })

  const filteredStudents = computed(() => {
    return studentsWithMeta.value.filter(s => {
      // Status
      if (selectedStatus.value !== 'all' && s.status !== selectedStatus.value) return false
      // Grade
      if (selectedGrade.value !== 'all' && s.grade !== selectedGrade.value) return false
      // Subject
      if (selectedSubject.value !== 'all' && !s.subjects.includes(selectedSubject.value)) return false
      // Search
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(q)
        const matchParent = s.parent_contact?.name?.toLowerCase().includes(q)
        const matchPhone = s.parent_contact?.phone?.includes(q)
        if (!matchName && !matchParent && !matchPhone) return false
      }
      return true
    })
  })

  /* ============================
     Computed: Lessons with Student Meta
     ============================ */
  const lessonsWithStudent = computed<Lesson[]>(() => {
    const studentMap: Record<string, Student> = {}
    students.value.forEach(s => {
      studentMap[s.id] = s
    })

    return lessons.value.map(l => ({
      ...l,
      student: studentMap[l.student_id],
    }))
  })

  const upcomingLessons = computed(() => {
    const now = new Date().toISOString()
    return lessonsWithStudent.value
      .filter(l => l.status === 'scheduled' && l.datetime >= now)
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
  })

  const todayLessons = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return lessonsWithStudent.value
      .filter(l => l.datetime.startsWith(todayStr))
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
  })

  const pastLessons = computed(() => {
    const now = new Date().toISOString()
    return lessonsWithStudent.value
      .filter(l => l.status === 'completed' || l.datetime < now)
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
  })

  /* ============================
     Computed: Schedule Conflicts
     ============================ */
  const scheduleConflicts = computed(() => {
    const conflicts: { lessonA: Lesson; lessonB: Lesson; message: string }[] = []
    const scheduled = upcomingLessons.value

    for (let i = 0; i < scheduled.length; i++) {
      for (let j = i + 1; j < scheduled.length; j++) {
        const a = scheduled[i]
        const b = scheduled[j]

        const aStart = new Date(a.datetime).getTime()
        const aEnd = aStart + a.duration_minutes * 60000
        const bStart = new Date(b.datetime).getTime()
        const bEnd = bStart + b.duration_minutes * 60000

        // Check overlap
        if (aStart < bEnd && bStart < aEnd) {
          conflicts.push({
            lessonA: a,
            lessonB: b,
            message: `Jadwal bentrok antara ${a.student?.name || 'Siswa A'} (${a.topic || a.student?.subjects[0]}) dan ${b.student?.name || 'Siswa B'} (${b.topic || b.student?.subjects[0]})`,
          })
        }
      }
    }
    return conflicts
  })

  /* ============================
     Computed: Teacher Overview Stats
     ============================ */
  const teacherStats = computed<TeacherOverviewStats>(() => {
    const active = students.value.filter(s => s.status === 'active')
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const currentMonthPayments = payments.value.filter(
      p => p.month === currentMonth && p.year === currentYear
    )

    const monthlyIncomeCollected = currentMonthPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    const monthlyIncomePending = currentMonthPayments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    // Lessons this week calculation
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const lessonsThisWeek = lessons.value.filter(l => {
      const dt = new Date(l.datetime)
      return dt >= startOfWeek && dt <= endOfWeek
    }).length

    return {
      totalStudents: students.value.length,
      activeStudents: active.length,
      monthlyIncomeCollected,
      monthlyIncomePending,
      lessonsThisWeek,
      lessonsToday: todayLessons.value.length,
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
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'],
      })
    } catch {
      // ignore
    }
  }

  /* ============================
     Fetch Data (Supabase + LocalStorage Fallback)
     ============================ */
  async function fetchTeacherData() {
    isLoading.value = true
    error.value = null

    try {
      const spaceId = currentSpace.value?.id

      if (!spaceId) {
        seedLocalDefaults()
        usingFallback.value = true
        return
      }

      // 1. Fetch students
      const { data: stData, error: stErr } = await supabase
        .from('students')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: true })

      if (stErr) {
        console.warn('Teacher fetch notice, fallback to local:', stErr.message)
        loadFromLocalStorage(spaceId)
        usingFallback.value = true
        return
      }

      if (stData && stData.length > 0) {
        students.value = stData
        usingFallback.value = false

        // 2. Fetch lessons, lesson plans, materials, payments in parallel
        const [lessRes, planRes, matRes, payRes] = await Promise.all([
          supabase.from('lessons').select('*').eq('space_id', spaceId).order('datetime', { ascending: true }),
          supabase.from('lesson_plans').select('*').eq('space_id', spaceId).order('created_at', { ascending: false }),
          supabase.from('materials').select('*').eq('space_id', spaceId).order('created_at', { ascending: false }),
          supabase.from('payments').select('*').eq('space_id', spaceId).order('month', { ascending: false }),
        ])

        if (lessRes.data) lessons.value = lessRes.data
        if (planRes.data) lessonPlans.value = planRes.data
        if (matRes.data) materials.value = matRes.data
        if (payRes.data) payments.value = payRes.data
      } else {
        // Auto-seed presets for teacher space
        await seedPresetsToDb(spaceId)
      }
    } catch (err: any) {
      console.error('fetchTeacherData error:', err)
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
      // 1. Insert students
      const toInsertStudents = DEFAULT_STUDENT_PRESETS.map(s => ({
        ...s,
        space_id: spaceId,
        user_id: userId,
      }))

      const { data: seededStudents, error: sErr } = await supabase
        .from('students')
        .insert(toInsertStudents)
        .select()

      if (sErr || !seededStudents) {
        seedLocalDefaults()
        return
      }

      students.value = seededStudents

      // 2. Generate lessons for seeded students
      const sampleLessons: any[] = []
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      seededStudents.forEach((st, idx) => {
        // 1 upcoming lesson
        sampleLessons.push({
          space_id: spaceId,
          student_id: st.id,
          datetime: getFutureDate(idx + 1, 16, 0),
          duration_minutes: 90,
          topic: `Latihan & Pemahaman ${st.subjects[0]}`,
          material_covered: 'Pembahasan konsep dasar & latihan soal',
          status: 'scheduled',
        })

        // 1 completed lesson in the past
        sampleLessons.push({
          space_id: spaceId,
          student_id: st.id,
          datetime: new Date(Date.now() - (idx + 2) * 86400000).toISOString(),
          duration_minutes: 90,
          topic: `Evaluasi Bab 2: ${st.subjects[0]}`,
          material_covered: 'Selesai bab 2 dengan pemahaman 85%',
          activities: 'Review PR, penjelasan materi, kuis 5 soal',
          homework: 'Kerjakan soal latihan nomor 1-10',
          performance: 'Good',
          status: 'completed',
        })
      })

      // 3. Insert lessons, plans, materials, payments
      const toInsertPlans = DEFAULT_LESSON_PLAN_PRESETS.map(p => ({ ...p, space_id: spaceId }))
      const toInsertMats = DEFAULT_MATERIALS_PRESETS.map(m => ({ ...m, space_id: spaceId }))
      const toInsertPays = seededStudents.map((st, idx) => ({
        space_id: spaceId,
        student_id: st.id,
        amount: st.monthly_fee,
        month: currentMonth,
        year: currentYear,
        status: idx === 0 ? 'paid' : idx === 4 ? 'overdue' : 'pending',
        paid_date: idx === 0 ? new Date().toISOString().split('T')[0] : null,
        payment_method: st.payment_method,
        category: 'Les Income',
      }))

      const [lRes, pRes, mRes, pyRes] = await Promise.all([
        supabase.from('lessons').insert(sampleLessons).select(),
        supabase.from('lesson_plans').insert(toInsertPlans).select(),
        supabase.from('materials').insert(toInsertMats).select(),
        supabase.from('payments').insert(toInsertPays).select(),
      ])

      if (lRes.data) lessons.value = lRes.data
      if (pRes.data) lessonPlans.value = pRes.data
      if (mRes.data) materials.value = mRes.data
      if (pyRes.data) payments.value = pyRes.data
    } catch {
      seedLocalDefaults()
    }
  }

  function seedLocalDefaults() {
    const spaceId = currentSpace.value?.id || 'demo-space'
    const generatedStudents: Student[] = DEFAULT_STUDENT_PRESETS.map((s, idx) => ({
      ...s,
      id: 'student-' + (idx + 1),
      space_id: spaceId,
      created_at: new Date(Date.now() - (idx + 1) * 86400000 * 10).toISOString(),
    }))
    students.value = generatedStudents

    const sampleLessons: Lesson[] = []
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    generatedStudents.forEach((st, idx) => {
      sampleLessons.push({
        id: 'lesson-' + (idx + 1) + '-up',
        space_id: spaceId,
        student_id: st.id,
        datetime: getFutureDate(idx + 1, 16, 0),
        duration_minutes: 90,
        topic: `Latihan & Pemahaman ${st.subjects[0]}`,
        material_covered: 'Pembahasan konsep dasar & latihan soal',
        status: 'scheduled',
        created_at: new Date().toISOString(),
      })

      sampleLessons.push({
        id: 'lesson-' + (idx + 1) + '-past',
        space_id: spaceId,
        student_id: st.id,
        datetime: new Date(Date.now() - (idx + 2) * 86400000).toISOString(),
        duration_minutes: 90,
        topic: `Evaluasi Bab 2: ${st.subjects[0]}`,
        material_covered: 'Selesai bab 2 dengan pemahaman 85%',
        activities: 'Review PR, penjelasan materi, kuis 5 soal',
        homework: 'Kerjakan soal latihan nomor 1-10',
        performance: 'Good',
        status: 'completed',
        created_at: new Date(Date.now() - (idx + 2) * 86400000).toISOString(),
      })
    })
    lessons.value = sampleLessons

    lessonPlans.value = DEFAULT_LESSON_PLAN_PRESETS.map((p, idx) => ({
      ...p,
      id: 'plan-' + (idx + 1),
      space_id: spaceId,
      created_at: new Date().toISOString(),
    }))

    materials.value = DEFAULT_MATERIALS_PRESETS.map((m, idx) => ({
      ...m,
      id: 'mat-' + (idx + 1),
      space_id: spaceId,
      created_at: new Date().toISOString(),
    }))

    payments.value = generatedStudents.map((st, idx) => ({
      id: 'pay-' + (idx + 1),
      space_id: spaceId,
      student_id: st.id,
      amount: st.monthly_fee,
      month: currentMonth,
      year: currentYear,
      status: idx === 0 ? 'paid' : idx === 4 ? 'overdue' : 'pending',
      paid_date: idx === 0 ? new Date().toISOString().split('T')[0] : null,
      payment_method: st.payment_method,
      category: 'Les Income',
      created_at: new Date().toISOString(),
    }))

    saveToLocalStorage(spaceId)
  }

  /* ============================
     LocalStorage Helpers
     ============================ */
  function loadFromLocalStorage(spaceId: string) {
    try {
      const sKey = `spaceos_teacher_students_${spaceId}`
      const lKey = `spaceos_teacher_lessons_${spaceId}`
      const pKey = `spaceos_teacher_plans_${spaceId}`
      const mKey = `spaceos_teacher_materials_${spaceId}`
      const pyKey = `spaceos_teacher_payments_${spaceId}`

      const sData = localStorage.getItem(sKey)
      if (sData) {
        students.value = JSON.parse(sData)
        lessons.value = JSON.parse(localStorage.getItem(lKey) || '[]')
        lessonPlans.value = JSON.parse(localStorage.getItem(pKey) || '[]')
        materials.value = JSON.parse(localStorage.getItem(mKey) || '[]')
        payments.value = JSON.parse(localStorage.getItem(pyKey) || '[]')
        usingFallback.value = true
      } else {
        seedLocalDefaults()
      }
    } catch {
      seedLocalDefaults()
    }
  }

  function saveToLocalStorage(spaceId: string) {
    try {
      localStorage.setItem(`spaceos_teacher_students_${spaceId}`, JSON.stringify(students.value))
      localStorage.setItem(`spaceos_teacher_lessons_${spaceId}`, JSON.stringify(lessons.value))
      localStorage.setItem(`spaceos_teacher_plans_${spaceId}`, JSON.stringify(lessonPlans.value))
      localStorage.setItem(`spaceos_teacher_materials_${spaceId}`, JSON.stringify(materials.value))
      localStorage.setItem(`spaceos_teacher_payments_${spaceId}`, JSON.stringify(payments.value))
    } catch {
      // ignore
    }
  }

  /* ============================
     CRUD: Students
     ============================ */
  async function createStudent(formData: StudentFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'
    const userId = user.value?.id || null

    try {
      const payload = {
        space_id: spaceId,
        user_id: userId,
        name: formData.name.trim(),
        grade: formData.grade || null,
        subjects: formData.subjects || ['Matematika'],
        parent_contact: {
          name: formData.parent_name || '',
          phone: formData.parent_phone || '',
          email: formData.parent_email || '',
        },
        schedule: formData.schedule || [],
        monthly_fee: Number(formData.monthly_fee) || 0,
        payment_method: formData.payment_method || 'Transfer',
        payment_due_date: Number(formData.payment_due_date) || 5,
        notes: formData.notes?.trim() || null,
        status: formData.status || 'active',
        start_date: formData.start_date || new Date().toISOString().split('T')[0],
      }

      let created: Student

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('students')
          .insert([payload])
          .select()
          .single()

        if (err) throw err
        created = data
        students.value.push(created)
      } else {
        created = {
          ...payload,
          id: 'st-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        students.value.push(created)
        saveToLocalStorage(spaceId)
      }

      toast.success('Siswa Ditambahkan', `"${formData.name}" berhasil terdaftar.`)
      return { success: true, student: created }
    } catch (err: any) {
      toast.error('Gagal Menambah Siswa', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function updateStudent(id: string, formData: Partial<StudentFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      if (formData.name !== undefined) updates.name = formData.name.trim()
      if (formData.grade !== undefined) updates.grade = formData.grade
      if (formData.subjects !== undefined) updates.subjects = formData.subjects
      if (formData.parent_name !== undefined || formData.parent_phone !== undefined || formData.parent_email !== undefined) {
        const existing = students.value.find(s => s.id === id)
        updates.parent_contact = {
          name: formData.parent_name ?? existing?.parent_contact?.name ?? '',
          phone: formData.parent_phone ?? existing?.parent_contact?.phone ?? '',
          email: formData.parent_email ?? existing?.parent_contact?.email ?? '',
        }
      }
      if (formData.schedule !== undefined) updates.schedule = formData.schedule
      if (formData.monthly_fee !== undefined) updates.monthly_fee = Number(formData.monthly_fee) || 0
      if (formData.payment_method !== undefined) updates.payment_method = formData.payment_method
      if (formData.payment_due_date !== undefined) updates.payment_due_date = Number(formData.payment_due_date) || 5
      if (formData.notes !== undefined) updates.notes = formData.notes?.trim() || null
      if (formData.status !== undefined) updates.status = formData.status
      if (formData.start_date !== undefined) updates.start_date = formData.start_date

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('students')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const idx = students.value.findIndex(s => s.id === id)
        if (idx !== -1 && data) students.value[idx] = data
      } else {
        const idx = students.value.findIndex(s => s.id === id)
        if (idx !== -1) {
          students.value[idx] = { ...students.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      toast.success('Data Siswa Diperbarui', 'Perubahan berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengupdate Siswa', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function deleteStudent(id: string) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('students').delete().eq('id', id)
        if (err) throw err
      }

      students.value = students.value.filter(s => s.id !== id)
      lessons.value = lessons.value.filter(l => l.student_id !== id)
      payments.value = payments.value.filter(p => p.student_id !== id)

      if (usingFallback.value) saveToLocalStorage(spaceId)
      toast.info('Siswa Dihapus', 'Data siswa dan riwayat jadwalnya telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Siswa', err.message)
      return { success: false, error: err.message }
    }
  }

  /* ============================
     CRUD: Lessons
     ============================ */
  async function createLesson(formData: LessonFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const payload = {
        space_id: spaceId,
        student_id: formData.student_id,
        datetime: formData.datetime,
        duration_minutes: Number(formData.duration_minutes) || 60,
        topic: formData.topic?.trim() || null,
        material_covered: formData.material_covered?.trim() || null,
        activities: formData.activities?.trim() || null,
        homework: formData.homework?.trim() || null,
        performance: formData.performance || 'Good',
        next_lesson_notes: formData.next_lesson_notes?.trim() || null,
        attachments: formData.attachments || [],
        status: formData.status || 'scheduled',
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('lessons')
          .insert([payload])
          .select()
          .single()

        if (err) throw err
        if (data) lessons.value.push(data)
      } else {
        const mockLesson: Lesson = {
          ...payload,
          id: 'ls-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        lessons.value.push(mockLesson)
        saveToLocalStorage(spaceId)
      }

      if (formData.status === 'completed') {
        triggerCelebration()
        toast.success('🎉 Lesson Selesai!', 'Catatan pembelajaran berhasil disimpan.')
      } else {
        toast.success('Jadwal Dibuat', 'Sesi les berhasil dijadwalkan.')
      }

      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menyimpan Lesson', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function updateLesson(id: string, formData: Partial<LessonFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      if (formData.student_id !== undefined) updates.student_id = formData.student_id
      if (formData.datetime !== undefined) updates.datetime = formData.datetime
      if (formData.duration_minutes !== undefined) updates.duration_minutes = Number(formData.duration_minutes)
      if (formData.topic !== undefined) updates.topic = formData.topic?.trim() || null
      if (formData.material_covered !== undefined) updates.material_covered = formData.material_covered?.trim() || null
      if (formData.activities !== undefined) updates.activities = formData.activities?.trim() || null
      if (formData.homework !== undefined) updates.homework = formData.homework?.trim() || null
      if (formData.performance !== undefined) updates.performance = formData.performance
      if (formData.next_lesson_notes !== undefined) updates.next_lesson_notes = formData.next_lesson_notes?.trim() || null
      if (formData.attachments !== undefined) updates.attachments = formData.attachments
      if (formData.status !== undefined) updates.status = formData.status

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('lessons')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const idx = lessons.value.findIndex(l => l.id === id)
        if (idx !== -1 && data) lessons.value[idx] = data
      } else {
        const idx = lessons.value.findIndex(l => l.id === id)
        if (idx !== -1) {
          lessons.value[idx] = { ...lessons.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      toast.success('Lesson Diperbarui', 'Data sesi les berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengupdate Lesson', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function deleteLesson(id: string) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('lessons').delete().eq('id', id)
        if (err) throw err
      }

      lessons.value = lessons.value.filter(l => l.id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Lesson Dihapus', 'Jadwal sesi telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Lesson', err.message)
      return { success: false, error: err.message }
    }
  }

  /* ============================
     CRUD: Lesson Plans
     ============================ */
  async function createLessonPlan(formData: LessonPlanFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const payload = {
        space_id: spaceId,
        title: formData.title.trim(),
        subject: formData.subject,
        grade: formData.grade || null,
        duration_minutes: Number(formData.duration_minutes) || 60,
        objectives: formData.objectives?.trim() || null,
        materials: formData.materials?.trim() || null,
        activities: formData.activities?.trim() || null,
        assessment: formData.assessment?.trim() || null,
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('lesson_plans')
          .insert([payload])
          .select()
          .single()

        if (err) throw err
        if (data) lessonPlans.value.unshift(data)
      } else {
        const mockPlan: LessonPlan = {
          ...payload,
          id: 'lp-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        lessonPlans.value.unshift(mockPlan)
        saveToLocalStorage(spaceId)
      }

      toast.success('Rencana Pembelajaran Dibuat', `"${formData.title}" tersimpan di library.`)
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menyimpan Lesson Plan', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function updateLessonPlan(id: string, formData: Partial<LessonPlanFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      if (formData.title !== undefined) updates.title = formData.title.trim()
      if (formData.subject !== undefined) updates.subject = formData.subject
      if (formData.grade !== undefined) updates.grade = formData.grade
      if (formData.duration_minutes !== undefined) updates.duration_minutes = Number(formData.duration_minutes)
      if (formData.objectives !== undefined) updates.objectives = formData.objectives?.trim() || null
      if (formData.materials !== undefined) updates.materials = formData.materials?.trim() || null
      if (formData.activities !== undefined) updates.activities = formData.activities?.trim() || null
      if (formData.assessment !== undefined) updates.assessment = formData.assessment?.trim() || null

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('lesson_plans')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const idx = lessonPlans.value.findIndex(p => p.id === id)
        if (idx !== -1 && data) lessonPlans.value[idx] = data
      } else {
        const idx = lessonPlans.value.findIndex(p => p.id === id)
        if (idx !== -1) {
          lessonPlans.value[idx] = { ...lessonPlans.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      toast.success('Lesson Plan Diperbarui', 'Perubahan berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengupdate Lesson Plan', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function deleteLessonPlan(id: string) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('lesson_plans').delete().eq('id', id)
        if (err) throw err
      }

      lessonPlans.value = lessonPlans.value.filter(p => p.id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Lesson Plan Dihapus', 'Template rencana pembelajaran telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Lesson Plan', err.message)
      return { success: false, error: err.message }
    }
  }

  /* ============================
     CRUD: Materials
     ============================ */
  async function createMaterial(formData: MaterialFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const payload = {
        space_id: spaceId,
        title: formData.title.trim(),
        subject: formData.subject,
        grade: formData.grade || null,
        type: formData.type || 'Worksheet',
        file_url: formData.file_url || '',
        description: formData.description?.trim() || null,
        tags: formData.tags || [],
        is_favorite: Boolean(formData.is_favorite),
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('materials')
          .insert([payload])
          .select()
          .single()

        if (err) throw err
        if (data) materials.value.unshift(data)
      } else {
        const mockMat: TeacherMaterial = {
          ...payload,
          id: 'mat-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        materials.value.unshift(mockMat)
        saveToLocalStorage(spaceId)
      }

      toast.success('Materi Ditambahkan', `"${formData.title}" tersimpan di library modul.`)
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menyimpan Materi', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function updateMaterial(id: string, formData: Partial<MaterialFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      if (formData.title !== undefined) updates.title = formData.title.trim()
      if (formData.subject !== undefined) updates.subject = formData.subject
      if (formData.grade !== undefined) updates.grade = formData.grade
      if (formData.type !== undefined) updates.type = formData.type
      if (formData.file_url !== undefined) updates.file_url = formData.file_url
      if (formData.description !== undefined) updates.description = formData.description?.trim() || null
      if (formData.tags !== undefined) updates.tags = formData.tags
      if (formData.is_favorite !== undefined) updates.is_favorite = formData.is_favorite

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('materials')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const idx = materials.value.findIndex(m => m.id === id)
        if (idx !== -1 && data) materials.value[idx] = data
      } else {
        const idx = materials.value.findIndex(m => m.id === id)
        if (idx !== -1) {
          materials.value[idx] = { ...materials.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      toast.success('Materi Diperbarui', 'Data materi berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengupdate Materi', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function deleteMaterial(id: string) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('materials').delete().eq('id', id)
        if (err) throw err
      }

      materials.value = materials.value.filter(m => m.id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Materi Dihapus', 'File materi telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Materi', err.message)
      return { success: false, error: err.message }
    }
  }

  async function toggleMaterialFavorite(id: string) {
    const mat = materials.value.find(m => m.id === id)
    if (!mat) return
    await updateMaterial(id, { is_favorite: !mat.is_favorite })
  }

  /* ============================
     CRUD: Payments
     ============================ */
  async function createPayment(formData: PaymentFormData) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const payload = {
        space_id: spaceId,
        student_id: formData.student_id,
        amount: Number(formData.amount) || 0,
        month: Number(formData.month),
        year: Number(formData.year),
        status: formData.status || 'pending',
        paid_date: formData.paid_date || (formData.status === 'paid' ? new Date().toISOString().split('T')[0] : null),
        payment_method: formData.payment_method || 'Transfer',
        category: formData.category || 'Les Income',
        notes: formData.notes?.trim() || null,
      }

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('payments')
          .insert([payload])
          .select()
          .single()

        if (err) throw err
        if (data) payments.value.unshift(data)
      } else {
        const mockPay: TeacherPayment = {
          ...payload,
          id: 'pay-' + Date.now(),
          created_at: new Date().toISOString(),
        }
        payments.value.unshift(mockPay)
        saveToLocalStorage(spaceId)
      }

      if (formData.status === 'paid') {
        triggerCelebration()
        toast.success('Pembayaran Tercatat', 'Status pembayaran telah diperbarui menjadi Lunas.')
      } else {
        toast.success('Tagihan Dibuat', 'Data tagihan berhasil disimpan.')
      }

      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menyimpan Pembayaran', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function updatePayment(id: string, formData: Partial<PaymentFormData>) {
    isSaving.value = true
    const spaceId = currentSpace.value?.id || 'demo-space'

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      if (formData.amount !== undefined) updates.amount = Number(formData.amount)
      if (formData.month !== undefined) updates.month = Number(formData.month)
      if (formData.year !== undefined) updates.year = Number(formData.year)
      if (formData.status !== undefined) {
        updates.status = formData.status
        if (formData.status === 'paid' && !formData.paid_date) {
          updates.paid_date = new Date().toISOString().split('T')[0]
        }
      }
      if (formData.paid_date !== undefined) updates.paid_date = formData.paid_date
      if (formData.payment_method !== undefined) updates.payment_method = formData.payment_method
      if (formData.category !== undefined) updates.category = formData.category
      if (formData.notes !== undefined) updates.notes = formData.notes?.trim() || null

      if (!usingFallback.value) {
        const { data, error: err } = await supabase
          .from('payments')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const idx = payments.value.findIndex(p => p.id === id)
        if (idx !== -1 && data) payments.value[idx] = data
      } else {
        const idx = payments.value.findIndex(p => p.id === id)
        if (idx !== -1) {
          payments.value[idx] = { ...payments.value[idx], ...updates }
          saveToLocalStorage(spaceId)
        }
      }

      if (formData.status === 'paid') {
        triggerCelebration()
      }

      toast.success('Status Pembayaran Diperbarui', 'Data tagihan berhasil diupdate.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengupdate Pembayaran', err.message)
      return { success: false, error: err.message }
    } finally {
      isSaving.value = false
    }
  }

  async function deletePayment(id: string) {
    const spaceId = currentSpace.value?.id || 'demo-space'
    try {
      if (!usingFallback.value) {
        const { error: err } = await supabase.from('payments').delete().eq('id', id)
        if (err) throw err
      }

      payments.value = payments.value.filter(p => p.id !== id)
      if (usingFallback.value) saveToLocalStorage(spaceId)

      toast.info('Tagihan Dihapus', 'Data pembayaran telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Menghapus Pembayaran', err.message)
      return { success: false, error: err.message }
    }
  }

  /* ============================
     Helper: Generate WhatsApp Reminder Message
     ============================ */
  function generateWhatsAppReminder(studentId: string, month: number, year: number) {
    const student = students.value.find(s => s.id === studentId)
    if (!student) return ''

    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ]
    const monthName = months[month - 1]
    const parentName = student.parent_contact?.name || 'Bapak/Ibu Orang Tua'
    const feeFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(student.monthly_fee)

    const text = `Halo Selamat Siang ${parentName} 🙏

Berikut rincian tagihan biaya bimbingan les ananda *${student.name}* untuk periode *${monthName} ${year}*:

• Siswa: ${student.name} (${student.grade || '-'})
• Mata Pelajaran: ${student.subjects.join(', ')}
• Jumlah Tagihan: *${feeFormatted}*
• Tanggal Jatuh Tempo: Tanggal ${student.payment_due_date} ${monthName}
• Metode Pembayaran: ${student.payment_method}

Pembayaran dapat dikonfirmasikan setelah transfer. Terima kasih atas kerja samanya! Semoga ananda terus berprestasi 🌟.`

    return text
  }

  return {
    // State
    students,
    lessons,
    lessonPlans,
    materials,
    payments,
    isLoading,
    isSaving,
    error,
    usingFallback,
    searchQuery,
    selectedSubject,
    selectedGrade,
    selectedStatus,
    // Computed
    studentsWithMeta,
    filteredStudents,
    lessonsWithStudent,
    upcomingLessons,
    todayLessons,
    pastLessons,
    scheduleConflicts,
    teacherStats,
    // Actions
    fetchTeacherData,
    createStudent,
    updateStudent,
    deleteStudent,
    createLesson,
    updateLesson,
    deleteLesson,
    createLessonPlan,
    updateLessonPlan,
    deleteLessonPlan,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    toggleMaterialFavorite,
    createPayment,
    updatePayment,
    deletePayment,
    generateWhatsAppReminder,
    triggerCelebration,
  }
}
