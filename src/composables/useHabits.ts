import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'
import type {
  Habit,
  HabitLog,
  HabitFormData,
  HabitWithStats,
  HabitStreakOverview,
  HabitCategory,
} from '@/types'

/* ============================================================
   Default Preset Habits for Trader & Teacher Personas
   ============================================================ */
export const DEFAULT_HABITS_PRESETS = {
  trader: [
    { name: 'Lari Sore / Olahraga', icon: '🏃', frequency: 'daily', category: 'Health' as HabitCategory, target: '30 Menit' },
    { name: 'Badminton / Cardio', icon: '🏸', frequency: 'custom', frequency_days: ['Selasa', 'Kamis', 'Sabtu'], category: 'Health' as HabitCategory, target: '1 Jam' },
    { name: 'Membaca Buku Trading / Mindset', icon: '📚', frequency: 'daily', category: 'Learning' as HabitCategory, target: '30 Menit' },
    { name: 'Trading Journal (Daily Review)', icon: '💹', frequency: 'daily', category: 'Trading' as HabitCategory, target: 'Evaluasi 100%' },
    { name: 'Market Analysis (Pre-Market Prep)', icon: '📈', frequency: 'daily', category: 'Trading' as HabitCategory, target: 'Chart HTF' },
    { name: 'Meditasi / Mindfulness', icon: '🧘', frequency: 'daily', category: 'Spiritual' as HabitCategory, target: '15 Menit' },
  ],
  teacher: [
    { name: 'Lesson Preparation', icon: '📚', frequency: 'daily', category: 'Teaching' as HabitCategory, target: 'Siapkan Silabus' },
    { name: 'Grade Assignments & Quizzes', icon: '📝', frequency: 'daily', category: 'Teaching' as HabitCategory, target: 'Koreksi Tugas' },
    { name: 'Professional Development', icon: '🎯', frequency: 'custom', frequency_days: ['Rabu', 'Sabtu'], category: 'Learning' as HabitCategory, target: 'Pelatihan Guru' },
    { name: 'Exercise & Stretching', icon: '💪', frequency: 'daily', category: 'Health' as HabitCategory, target: '30 Menit' },
  ],
}

export function useHabits() {
  const authStore = useAuthStore()
  const toast = useToastStore()
  const { currentSpace, user } = storeToRefs(authStore)

  /* ============================
     State
     ============================ */
  const habits = ref<Habit[]>([])
  const habitLogs = ref<HabitLog[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

  // Selected date for calendar view (YYYY-MM-DD, default today)
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const currentCalendarMonth = ref(new Date())

  /* ============================
     Helper Date Formats
     ============================ */
  const todayStr = computed(() => new Date().toISOString().split('T')[0])

  /* ============================
     Habits with Computed Stats
     ============================ */
  const habitsWithStats = computed<HabitWithStats[]>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayString = today.toISOString().split('T')[0]

    // Create log map: habit_id -> (date -> completed)
    const logsMap: Record<string, Record<string, boolean>> = {}
    habitLogs.value.forEach(l => {
      if (!logsMap[l.habit_id]) logsMap[l.habit_id] = {}
      logsMap[l.habit_id][l.date] = l.completed
    })

    return habits.value
      .filter(h => h.is_active)
      .map(habit => {
        const habitLogMap = logsMap[habit.id] || {}
        const completedDates = Object.keys(habitLogMap).filter(d => habitLogMap[d])
        completedDates.sort()

        const isCompletedToday = Boolean(habitLogMap[todayString])
        const lastCompletedDate = completedDates.length > 0 ? completedDates[completedDates.length - 1] : null

        // Calculate Current Streak
        let currentStreak = 0
        let checkDate = new Date(today)

        // If not completed today, start checking from yesterday
        if (!isCompletedToday) {
          checkDate.setDate(checkDate.getDate() - 1)
        }

        while (true) {
          const dateKey = checkDate.toISOString().split('T')[0]
          if (habitLogMap[dateKey]) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }

        // Calculate Best Streak
        let bestStreak = 0
        let tempStreak = 0
        let prevDate: Date | null = null

        completedDates.forEach(dStr => {
          const d = new Date(dStr)
          if (!prevDate) {
            tempStreak = 1
          } else {
            const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
            if (diffDays === 1) {
              tempStreak++
            } else if (diffDays > 1) {
              tempStreak = 1
            }
          }
          if (tempStreak > bestStreak) bestStreak = tempStreak
          prevDate = d
        })
        if (currentStreak > bestStreak) bestStreak = currentStreak

        // Completion Rate (past 30 days)
        let past30Total = 0
        let past30Completed = 0
        for (let i = 0; i < 30; i++) {
          const d = new Date(today.getTime() - i * 86400000)
          const key = d.toISOString().split('T')[0]
          past30Total++
          if (habitLogMap[key]) past30Completed++
        }
        const completionRate = past30Total > 0 ? Math.round((past30Completed / past30Total) * 100) : 0

        return {
          ...habit,
          currentStreak,
          bestStreak,
          totalCompletions: completedDates.length,
          completionRate,
          isCompletedToday,
          lastCompletedDate,
          logs: habitLogMap,
        }
      })
  })

  /* ============================
     Overall Streak & Heatmap Overview
     ============================ */
  const streakOverview = computed<HabitStreakOverview>(() => {
    const list = habitsWithStats.value
    const total = list.length
    const completedToday = list.filter(h => h.isCompletedToday).length
    const todayRate = total > 0 ? Math.round((completedToday / total) * 100) : 0

    const avgRate = total > 0
      ? Math.round(list.reduce((acc, h) => acc + h.completionRate, 0) / total)
      : 0

    const longestStreak = list.reduce((acc, h) => Math.max(acc, h.bestStreak), 0)

    // Build GitHub-style Heatmap for past 84 days (12 weeks)
    const heatmap: { date: string; count: number; level: number }[] = []
    const now = new Date()

    // Find all completed logs count per date
    const dateCountMap: Record<string, number> = {}
    habitLogs.value.forEach(l => {
      if (l.completed) {
        dateCountMap[l.date] = (dateCountMap[l.date] || 0) + 1
      }
    })

    for (let i = 83; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000)
      const dateStr = d.toISOString().split('T')[0]
      const count = dateCountMap[dateStr] || 0

      // Level 0 to 4
      let level = 0
      if (count > 0) {
        const ratio = total > 0 ? count / total : 1
        if (ratio >= 0.75) level = 4
        else if (ratio >= 0.5) level = 3
        else if (ratio >= 0.25) level = 2
        else level = 1
      }

      heatmap.push({ date: dateStr, count, level })
    }

    return {
      totalActiveHabits: total,
      completedTodayCount: completedToday,
      todayCompletionRate: todayRate,
      averageCompletionRate: avgRate,
      longestStreak,
      heatmapData: heatmap,
    }
  })

  /* ============================
     Confetti Trigger Animation
     ============================ */
  function triggerCelebration() {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      })
    } catch {
      // ignore in environments without canvas
    }
  }

  /* ============================
     Fetch Habits & Logs from Supabase
     ============================ */
  async function fetchHabitsData() {
    isLoading.value = true
    error.value = null

    try {
      const spaceId = currentSpace.value?.id

      if (!spaceId) {
        seedLocalPreset('trader')
        usingFallback.value = true
        return
      }

      // 1. Fetch habits
      const { data: habitsData, error: habitsErr } = await supabase
        .from('habits')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: true })

      if (habitsErr) {
        console.warn('Habits fetch notice, using local storage:', habitsErr.message)
        loadFromLocalStorage(spaceId)
        usingFallback.value = true
        return
      }

      if (habitsData && habitsData.length > 0) {
        habits.value = habitsData
        usingFallback.value = false

        // 2. Fetch habit logs
        const habitIds = habitsData.map(h => h.id)
        const { data: logsData } = await supabase
          .from('habit_logs')
          .select('*')
          .in('habit_id', habitIds)

        if (logsData) {
          habitLogs.value = logsData
        }
      } else {
        const isCleanSlate = localStorage.getItem('spaceos_clean_slate') === 'true'
        if (isCleanSlate) {
          habits.value = []
          habitLogs.value = []
        } else {
          const isTeacher = currentSpace.value?.category === 'teacher' || currentSpace.value?.name?.toLowerCase().includes('guru')
          await seedPresetToDb(spaceId, isTeacher ? 'teacher' : 'trader')
        }
      }
    } catch (err: any) {
      console.error('fetchHabitsData error:', err)
      loadFromLocalStorage(currentSpace.value?.id || 'default')
    } finally {
      isLoading.value = false
    }
  }

  /* ============================
     Preset Seeding
     ============================ */
  async function seedPresetToDb(spaceId: string, type: 'trader' | 'teacher') {
    const preset = DEFAULT_HABITS_PRESETS[type]
    const userId = user.value?.id || 'demo-user'

    try {
      const toInsert = preset.map((p, idx) => ({
        space_id: spaceId,
        user_id: userId,
        name: p.name,
        icon: p.icon,
        frequency: p.frequency,
        frequency_days: (p as any).frequency_days || [],
        target: p.target,
        category: p.category,
        sort_order: idx,
        is_active: true,
      }))

      const { data, error: seedErr } = await supabase
        .from('habits')
        .insert(toInsert)
        .select()

      if (seedErr || !data) {
        seedLocalPreset(type)
      } else {
        habits.value = data
        // Generate simulated completed logs for past week
        generateSampleLogs(data)
      }
    } catch {
      seedLocalPreset(type)
    }
  }

  function seedLocalPreset(type: 'trader' | 'teacher') {
    const preset = DEFAULT_HABITS_PRESETS[type]
    const generated: Habit[] = preset.map((p, idx) => ({
      id: 'h-' + (idx + 1),
      space_id: currentSpace.value?.id || 'demo-space',
      name: p.name,
      icon: p.icon,
      frequency: p.frequency as any,
      frequency_days: (p as any).frequency_days || [],
      reminder_time: null,
      target: p.target,
      category: p.category,
      is_active: true,
      sort_order: idx,
      created_at: new Date().toISOString(),
    }))

    habits.value = generated
    generateSampleLogs(generated)
    saveToLocalStorage(currentSpace.value?.id || 'demo-space')
    usingFallback.value = true
  }

  function generateSampleLogs(habitsList: Habit[]) {
    const sampleLogs: HabitLog[] = []
    const now = new Date()

    habitsList.forEach((h, hIdx) => {
      for (let i = 0; i < 14; i++) {
        const d = new Date(now.getTime() - i * 86400000)
        const dateStr = d.toISOString().split('T')[0]
        // Higher completion for first habits
        const isDone = Math.random() > (hIdx * 0.12)
        if (isDone) {
          sampleLogs.push({
            id: `log-${h.id}-${dateStr}`,
            habit_id: h.id,
            date: dateStr,
            completed: true,
            notes: null,
          })
        }
      }
    })

    habitLogs.value = sampleLogs
  }

  function loadFromLocalStorage(spaceId: string) {
    const isCleanSlate = localStorage.getItem('spaceos_clean_slate') === 'true'
    try {
      const savedHabits = localStorage.getItem(`spaceos_habits_${spaceId}`)
      const savedLogs = localStorage.getItem(`spaceos_logs_${spaceId}`)
      const isDefaultDemoSpace = spaceId === 'space-trader' || spaceId === 'space-teacher'
      if (savedHabits) {
        habits.value = JSON.parse(savedHabits)
        habitLogs.value = savedLogs ? JSON.parse(savedLogs) : []
      } else if (!isCleanSlate && isDefaultDemoSpace) {
        const isTeacher = spaceId === 'space-teacher'
        seedLocalPreset(isTeacher ? 'teacher' : 'trader')
      } else {
        habits.value = []
        habitLogs.value = []
        saveToLocalStorage(spaceId)
      }
    } catch {
      habits.value = []
      habitLogs.value = []
    }
  }

  function saveToLocalStorage(spaceId: string) {
    try {
      localStorage.setItem(`spaceos_habits_${spaceId}`, JSON.stringify(habits.value))
      localStorage.setItem(`spaceos_logs_${spaceId}`, JSON.stringify(habitLogs.value))
    } catch (err) {
      console.warn('Failed saving habits to localStorage:', err)
    }
  }

  /* ============================
     Toggle Habit Completion
     ============================ */
  async function toggleHabit(habitId: string, date: string): Promise<boolean> {
    const spaceId = currentSpace.value?.id
    const existingIdx = habitLogs.value.findIndex(l => l.habit_id === habitId && l.date === date)
    const currentCompleted = existingIdx !== -1 ? habitLogs.value[existingIdx].completed : false
    const newCompleted = !currentCompleted

    // Optimistic UI update
    if (existingIdx !== -1) {
      habitLogs.value[existingIdx].completed = newCompleted
    } else {
      habitLogs.value.push({
        id: `log-${habitId}-${date}`,
        habit_id: habitId,
        date,
        completed: newCompleted,
        notes: null,
      })
    }

    if (newCompleted) {
      triggerCelebration()
      toast.success('Habit Selesai! 🔥', 'Pertahankan streak konsistensi kamu.')
    }

    // Persist to Supabase or LocalStorage
    if (spaceId && !usingFallback.value) {
      await supabase.from('habit_logs').upsert(
        {
          habit_id: habitId,
          date,
          completed: newCompleted,
        },
        { onConflict: 'habit_id,date' }
      )
    }

    if (spaceId) saveToLocalStorage(spaceId)
    return newCompleted
  }

  /* ============================
     CRUD: Add Habit
     ============================ */
  async function createHabit(formData: HabitFormData): Promise<{ success: boolean; data?: Habit }> {
    isSaving.value = true
    try {
      const spaceId = currentSpace.value?.id || 'demo-space'
      const userId = user.value?.id || 'demo-user'

      const newPayload = {
        space_id: spaceId,
        user_id: userId,
        name: formData.name.trim(),
        icon: formData.icon || '✨',
        frequency: formData.frequency,
        frequency_days: formData.frequency_days || [],
        reminder_time: formData.reminder_time || null,
        target: formData.target?.trim() || null,
        category: formData.category || 'Health',
        is_active: true,
        sort_order: habits.value.length,
      }

      let created: Habit

      if (spaceId && !usingFallback.value) {
        const { data, error: insertErr } = await supabase
          .from('habits')
          .insert(newPayload)
          .select()
          .single()

        if (insertErr) {
          created = { ...newPayload, id: 'h-' + Date.now(), created_at: new Date().toISOString() } as Habit
        } else {
          created = data
        }
      } else {
        created = { ...newPayload, id: 'h-' + Date.now(), created_at: new Date().toISOString() } as Habit
      }

      habits.value = [...habits.value, created]
      if (spaceId) saveToLocalStorage(spaceId)

      toast.success('Habit Baru Dibuat! 🎯', `${created.icon} ${created.name}`)
      return { success: true, data: created }
    } catch (err: any) {
      toast.error('Gagal Membuat Habit', err?.message || 'Terjadi kesalahan.')
      return { success: false }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Update Habit
     ============================ */
  async function updateHabit(id: string, formData: Partial<HabitFormData>): Promise<{ success: boolean }> {
    isSaving.value = true
    try {
      const spaceId = currentSpace.value?.id
      const existing = habits.value.find(h => h.id === id)
      if (!existing) throw new Error('Habit not found')

      const updated = { ...existing, ...formData }

      if (spaceId && !usingFallback.value && !id.startsWith('h-')) {
        await supabase.from('habits').update(formData).eq('id', id)
      }

      const idx = habits.value.findIndex(h => h.id === id)
      if (idx !== -1) habits.value[idx] = updated
      if (spaceId) saveToLocalStorage(spaceId)

      toast.success('Habit Diperbarui', 'Detail kebiasaan berhasil disimpan.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Update', err?.message || 'Terjadi kesalahan.')
      return { success: false }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Delete Habit
     ============================ */
  async function deleteHabit(id: string): Promise<{ success: boolean }> {
    try {
      const spaceId = currentSpace.value?.id
      if (spaceId && !usingFallback.value && !id.startsWith('h-')) {
        await supabase.from('habits').delete().eq('id', id)
      }

      habits.value = habits.value.filter(h => h.id !== id)
      habitLogs.value = habitLogs.value.filter(l => l.habit_id !== id)
      if (spaceId) saveToLocalStorage(spaceId)

      toast.info('Habit Dihapus', 'Kebiasaan telah dihapus dari daftar.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Hapus', err?.message || 'Terjadi kesalahan.')
      return { success: false }
    }
  }

  return {
    habits,
    habitLogs,
    habitsWithStats,
    streakOverview,
    selectedDate,
    currentCalendarMonth,
    todayStr,
    isLoading,
    isSaving,
    error,
    fetchHabitsData,
    toggleHabit,
    createHabit,
    updateHabit,
    deleteHabit,
    triggerCelebration,
  }
}
