import { ref, onMounted } from 'vue'

/* ============================
   Types
   ============================ */
export interface TradeEntry {
  id: string
  date: string
  pair: string
  position: 'Long' | 'Short'
  pnl: number
  status: 'Win' | 'Loss'
}

export interface HabitDay {
  dayLabel: string
  dayShort: string
  date: string
  habits: {
    icon: string
    name: string
    completed: boolean
  }[]
}

export interface TraderStats {
  totalTrades: number
  totalTradesChange: string
  winRate: number
  winRateChange: string
  totalPnl: number
  totalPnlChange: string
  currentStreak: number
  streakChange: string
}

/* ============================
   Composable
   ============================ */
export function useTraderDashboard() {
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  const stats = ref<TraderStats>({
    totalTrades: 0,
    totalTradesChange: '',
    winRate: 0,
    winRateChange: '',
    totalPnl: 0,
    totalPnlChange: '',
    currentStreak: 0,
    streakChange: '',
  })

  const recentTrades = ref<TradeEntry[]>([])
  const habitProgress = ref<HabitDay[]>([])
  const habitStreak = ref(0)

  /**
   * Simulate fetching dashboard data
   */
  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      // Simulated fetch delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stats
      stats.value = {
        totalTrades: 47,
        totalTradesChange: '+8',
        winRate: 72,
        winRateChange: '+3%',
        totalPnl: 2847,
        totalPnlChange: '+12%',
        currentStreak: 5,
        streakChange: '+2',
      }

      // Recent trades (5 entries)
      recentTrades.value = [
        {
          id: '1',
          date: '2026-08-22',
          pair: 'EUR/USD',
          position: 'Long',
          pnl: 245.50,
          status: 'Win',
        },
        {
          id: '2',
          date: '2026-08-21',
          pair: 'GBP/JPY',
          position: 'Short',
          pnl: -120.00,
          status: 'Loss',
        },
        {
          id: '3',
          date: '2026-08-21',
          pair: 'XAU/USD',
          position: 'Long',
          pnl: 580.75,
          status: 'Win',
        },
        {
          id: '4',
          date: '2026-08-20',
          pair: 'USD/JPY',
          position: 'Short',
          pnl: 312.00,
          status: 'Win',
        },
        {
          id: '5',
          date: '2026-08-19',
          pair: 'BTC/USD',
          position: 'Long',
          pnl: -85.25,
          status: 'Loss',
        },
      ]

      // Habit progress (current week)
      const today = new Date()
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
      const dayFull = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

      // Get start of week (Monday)
      const startOfWeek = new Date(today)
      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      startOfWeek.setDate(today.getDate() + diff)

      habitProgress.value = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        const isPast = date <= today
        const dayIdx = date.getDay()

        return {
          dayLabel: dayFull[dayIdx],
          dayShort: dayNames[dayIdx],
          date: date.toISOString().split('T')[0],
          habits: [
            {
              icon: '🏃',
              name: 'Lari',
              completed: isPast && Math.random() > 0.3,
            },
            {
              icon: '🏸',
              name: 'Badminton',
              completed: isPast && Math.random() > 0.5,
            },
            {
              icon: '📚',
              name: 'Membaca',
              completed: isPast && Math.random() > 0.2,
            },
          ],
        }
      })

      // Calculate habit streak (consecutive days with all habits completed, counting backwards)
      let streak = 0
      for (let i = habitProgress.value.length - 1; i >= 0; i--) {
        const day = habitProgress.value[i]
        const dayDate = new Date(day.date)
        if (dayDate > today) continue
        const allCompleted = day.habits.every(h => h.completed)
        if (allCompleted) {
          streak++
        } else {
          break
        }
      }
      habitStreak.value = streak

    } catch (err: any) {
      error.value = err?.message || 'Failed to load trader dashboard data.'
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
    recentTrades,
    habitProgress,
    habitStreak,
    retry,
  }
}
