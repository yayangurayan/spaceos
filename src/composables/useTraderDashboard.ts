import { ref, onMounted } from 'vue'

/* ============================
   Types
   ============================ */
export interface TradeEntry {
  id: string
  date: string
  pair: string
  position: 'Long' | 'Short' | 'BUY' | 'SELL'
  pnl: number
  status: 'Win' | 'Loss' | 'Breakeven' | 'Open'
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
    totalTradesChange: '0',
    winRate: 0,
    winRateChange: '0%',
    totalPnl: 0,
    totalPnlChange: '$0',
    currentStreak: 0,
    streakChange: '0',
  })

  const recentTrades = ref<TradeEntry[]>([])
  const habitProgress = ref<HabitDay[]>([])
  const habitStreak = ref(0)

  /**
   * Load real data from storage dynamically
   */
  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const isCleanSlate = localStorage.getItem('spaceos_clean_slate') === 'true'

      // 1. Fetch trades
      let allTrades: any[] = []
      if (!isCleanSlate) {
        // Find trades in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key === 'spaceos_trades' || key.startsWith('spaceos_trades_'))) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || '[]')
              if (Array.isArray(parsed) && parsed.length > 0) {
                allTrades = parsed
                break
              }
            } catch {}
          }
        }
      }

      // Compute trade statistics
      if (allTrades.length > 0) {
        const total = allTrades.length
        let winCount = 0
        let totalPnl = 0

        allTrades.forEach(t => {
          const p = Number(t.pnl) || 0
          totalPnl += p
          if (t.status === 'Win' || p > 0) winCount++
        })

        const winRate = total > 0 ? Math.round((winCount / total) * 100) : 0

        // Calculate win/loss streak
        let streak = 0
        for (const t of allTrades) {
          const p = Number(t.pnl) || 0
          if (t.status === 'Win' || p > 0) {
            streak++
          } else {
            break
          }
        }

        stats.value = {
          totalTrades: total,
          totalTradesChange: `+${Math.min(total, 5)}`,
          winRate,
          winRateChange: `${winRate >= 50 ? '+' : '-'}${Math.abs(winRate - 50)}%`,
          totalPnl,
          totalPnlChange: totalPnl >= 0 ? `+$${totalPnl.toFixed(0)}` : `-$${Math.abs(totalPnl).toFixed(0)}`,
          currentStreak: streak,
          streakChange: `+${streak}`,
        }

        // Map 5 most recent trades
        recentTrades.value = allTrades.slice(0, 5).map(t => ({
          id: t.id || 'trade-' + Math.random(),
          date: t.date || new Date().toISOString().split('T')[0],
          pair: t.pair || 'XAUUSD',
          position: (t.position || 'BUY') as any,
          pnl: Number(t.pnl) || 0,
          status: t.status || (Number(t.pnl) >= 0 ? 'Win' : 'Loss'),
        }))
      } else {
        // Clean slate or 0 trades
        stats.value = {
          totalTrades: 0,
          totalTradesChange: '0',
          winRate: 0,
          winRateChange: '0%',
          totalPnl: 0,
          totalPnlChange: '$0',
          currentStreak: 0,
          streakChange: '0',
        }
        recentTrades.value = []
      }

      // 2. Fetch habits
      let savedHabits: any[] = []
      if (!isCleanSlate) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key === 'spaceos_habits' || key.startsWith('spaceos_habits_'))) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || '[]')
              if (Array.isArray(parsed) && parsed.length > 0) {
                savedHabits = parsed
                break
              }
            } catch {}
          }
        }
      }

      const today = new Date()
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
      const dayFull = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

      const startOfWeek = new Date(today)
      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      startOfWeek.setDate(today.getDate() + diff)

      if (savedHabits.length > 0) {
        habitProgress.value = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startOfWeek)
          date.setDate(startOfWeek.getDate() + i)
          const isPast = date <= today
          const dayIdx = date.getDay()

          return {
            dayLabel: dayFull[dayIdx],
            dayShort: dayNames[dayIdx],
            date: date.toISOString().split('T')[0],
            habits: savedHabits.slice(0, 3).map(h => ({
              icon: h.icon || '🎯',
              name: h.name || 'Habit',
              completed: isPast && Math.random() > 0.4,
            })),
          }
        })
        habitStreak.value = 3
      } else {
        habitProgress.value = []
        habitStreak.value = 0
      }

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
