import { ref, onMounted } from 'vue'

/* ============================
   Types
   ============================ */
export interface TeacherStats {
  totalStudents: number
  totalStudentsChange: string
  lessonsThisWeek: number
  lessonsThisWeekChange: string
  monthlyIncome: number
  monthlyIncomeChange: string
  upcomingLessons: number
  upcomingLabel: string
}

export interface LessonSchedule {
  id: string
  time: string
  studentName: string
  subject: string
  duration: string
  status: 'upcoming' | 'in-progress' | 'done'
}

export interface StudentProgress {
  id: string
  name: string
  avatar: string
  subject: string
  progressNote: string
  lastLesson: string
  overallProgress: number
}

/* ============================
   Composable
   ============================ */
export function useTeacherDashboard() {
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  const stats = ref<TeacherStats>({
    totalStudents: 0,
    totalStudentsChange: '',
    lessonsThisWeek: 0,
    lessonsThisWeekChange: '',
    monthlyIncome: 0,
    monthlyIncomeChange: '',
    upcomingLessons: 0,
    upcomingLabel: '',
  })

  const todaySchedule = ref<LessonSchedule[]>([])
  const recentStudents = ref<StudentProgress[]>([])

  /**
   * Simulate fetching dashboard data
   */
  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stats
      stats.value = {
        totalStudents: 24,
        totalStudentsChange: '+3',
        lessonsThisWeek: 18,
        lessonsThisWeekChange: '+2',
        monthlyIncome: 8500000,
        monthlyIncomeChange: '+15%',
        upcomingLessons: 4,
        upcomingLabel: 'Hari ini',
      }

      // Today's schedule
      todaySchedule.value = [
        {
          id: '1',
          time: '09:00',
          studentName: 'Anisa Rahmawati',
          subject: 'Matematika Kelas 10',
          duration: '90 menit',
          status: 'done',
        },
        {
          id: '2',
          time: '11:00',
          studentName: 'Budi Santoso',
          subject: 'Fisika Kelas 11',
          duration: '60 menit',
          status: 'in-progress',
        },
        {
          id: '3',
          time: '14:00',
          studentName: 'Citra Dewi',
          subject: 'Kimia Kelas 12',
          duration: '90 menit',
          status: 'upcoming',
        },
        {
          id: '4',
          time: '16:30',
          studentName: 'Dimas Pratama',
          subject: 'Matematika Kelas 9',
          duration: '60 menit',
          status: 'upcoming',
        },
      ]

      // Recent student progress
      recentStudents.value = [
        {
          id: '1',
          name: 'Anisa Rahmawati',
          avatar: '👩‍🎓',
          subject: 'Matematika',
          progressNote: 'Sudah menguasai integral dasar. Perlu latihan soal cerita.',
          lastLesson: '2026-08-22',
          overallProgress: 78,
        },
        {
          id: '2',
          name: 'Budi Santoso',
          avatar: '👨‍🎓',
          subject: 'Fisika',
          progressNote: 'Hukum Newton sudah paham. Mulai materi Usaha & Energi.',
          lastLesson: '2026-08-22',
          overallProgress: 65,
        },
        {
          id: '3',
          name: 'Citra Dewi',
          avatar: '👩‍🎓',
          subject: 'Kimia',
          progressNote: 'Perlu review ulang stoikiometri. Latihan soal SBMPTN.',
          lastLesson: '2026-08-20',
          overallProgress: 52,
        },
      ]

    } catch (err: any) {
      error.value = err?.message || 'Failed to load teacher dashboard data.'
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
    stats,
    todaySchedule,
    recentStudents,
    retry,
  }
}
