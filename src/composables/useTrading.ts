import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'
import type {
  Trade,
  TradeFormData,
  TradeFilters,
  TradeJournalStats,
} from '@/types'
import {
  calculatePnl,
  calculatePips,
  calculateRR,
  determineStatus,
} from './useTradeCalculations'

/* ============================================================
   Initial Fallback Demo Trades (if no DB rows yet)
   ============================================================ */
const DEMO_TRADES: Trade[] = [
  {
    id: 'demo-1',
    space_id: '',
    user_id: '',
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    pair: 'XAUUSD',
    position: 'BUY',
    entry_price: 2642.50,
    exit_price: 2658.20,
    stop_loss: 2636.00,
    take_profit: 2660.00,
    lot_size: 0.50,
    pnl: 785.00,
    rr_ratio: 2.41,
    pips: 157.0,
    account_type: 'Funded',
    setup: 'Liquidity sweep + Bullish FVG rejection on 15m',
    entry_reason: 'London session low swept, MSB on 5m with high volume',
    exit_reason: 'TP reached near Asian session high',
    what_went_well: 'Stuck to plan, waited for confirmation candle',
    improvements: 'Could have scaled out 50% at 1:2 RR',
    emotions: ['Confident', 'Disciplined'],
    pre_mood: '🎯',
    post_mood: '🚀',
    mistakes: [],
    screenshot_urls: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'Win',
    notes: 'Clean execution during London Open.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    space_id: '',
    user_id: '',
    date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    pair: 'EURUSD',
    position: 'SELL',
    entry_price: 1.08500,
    exit_price: 1.08180,
    stop_loss: 1.08720,
    take_profit: 1.08050,
    lot_size: 1.00,
    pnl: 320.00,
    rr_ratio: 1.45,
    pips: 32.0,
    account_type: 'Real',
    setup: '4H Bearish Order Block retest',
    entry_reason: 'Break of structure after US CPI release',
    exit_reason: 'Support level hit, took manual profit before NY close',
    what_went_well: 'Patient entry without chasing news wick',
    improvements: 'Hold until final target for 2.0 RR',
    emotions: ['Patient', 'Disciplined'],
    pre_mood: '😌',
    post_mood: '😊',
    mistakes: ['Early Exit'],
    screenshot_urls: [],
    status: 'Win',
    notes: 'Managed risk well around news event.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    space_id: '',
    user_id: '',
    date: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    pair: 'GBPUSD',
    position: 'BUY',
    entry_price: 1.29400,
    exit_price: 1.29150,
    stop_loss: 1.29150,
    take_profit: 1.29950,
    lot_size: 1.00,
    pnl: -250.00,
    rr_ratio: -1.00,
    pips: -25.0,
    account_type: 'Funded',
    setup: 'Trendline bounce on 1H',
    entry_reason: 'Expected continuation after pullback',
    exit_reason: 'Hit Stop Loss cleanly',
    what_went_well: 'Respected Stop Loss, no moving SL',
    improvements: 'Looked at DXY higher timeframe divergence before entering',
    emotions: ['Fearful'],
    pre_mood: '🤔',
    post_mood: '😐',
    mistakes: [],
    screenshot_urls: [],
    status: 'Loss',
    notes: 'Loss accepted. Standard 1% risk.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    space_id: '',
    user_id: '',
    date: new Date(Date.now() - 1000 * 60 * 60 * 76).toISOString(),
    pair: 'USDJPY',
    position: 'BUY',
    entry_price: 154.200,
    exit_price: 155.650,
    stop_loss: 153.600,
    take_profit: 156.000,
    lot_size: 0.80,
    pnl: 750.40,
    rr_ratio: 2.42,
    pips: 145.0,
    account_type: 'Real',
    setup: 'Daily bullish trend continuation',
    entry_reason: 'Bounce from 50 EMA on 4H chart',
    exit_reason: 'Trailing stop triggered after 140+ pips expansion',
    what_went_well: 'Trailed stop aggressively to lock in profits',
    improvements: 'None, textbook swing trade execution',
    emotions: ['Confident', 'Patient'],
    pre_mood: '🔥',
    post_mood: '🥳',
    mistakes: [],
    screenshot_urls: [],
    status: 'Win',
    notes: 'Swing trade held for 2 days.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    space_id: '',
    user_id: '',
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    pair: 'BTCUSD',
    position: 'BUY',
    entry_price: 64200.00,
    exit_price: 63750.00,
    stop_loss: 63500.00,
    take_profit: 66000.00,
    lot_size: 0.20,
    pnl: -90.00,
    rr_ratio: -0.64,
    pips: -450.0,
    account_type: 'Real',
    setup: 'Breakout above range resistance',
    entry_reason: 'FOMO into fast green candle on 5m',
    exit_reason: 'Fakeout detected, cut loss manually before SL',
    what_went_well: 'Cut early when thesis was invalidated',
    improvements: 'Do not chase breakout candles without retest',
    emotions: ['FOMO', 'Greedy'],
    pre_mood: '⚡',
    post_mood: '🤦‍♂️',
    mistakes: ['Chasing Price', 'Late Entry'],
    screenshot_urls: [],
    status: 'Loss',
    notes: 'Classic FOMO mistake, reminder to stick to rules.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function useTrading() {
  const authStore = useAuthStore()
  const toast = useToastStore()
  const { currentSpace, user } = storeToRefs(authStore)

  /* ============================
     State
     ============================ */
  const trades = ref<Trade[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

  // Filters
  const filters = ref<TradeFilters>({
    dateRange: 'this_month',
    accountType: 'all',
    pair: '',
    status: 'all',
    search: '',
  })

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)

  /* ============================
     Date Range Helper
     ============================ */
  function getDateRangeBounds(range: TradeFilters['dateRange']): { start?: Date; end?: Date } {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    switch (range) {
      case 'today':
        return { start: todayStart, end: todayEnd }
      case 'this_week': {
        const day = now.getDay()
        const diff = day === 0 ? -6 : 1 - day // Monday
        const weekStart = new Date(todayStart)
        weekStart.setDate(todayStart.getDate() + diff)
        return { start: weekStart, end: todayEnd }
      }
      case 'this_month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        return { start: monthStart, end: todayEnd }
      }
      case 'last_month': {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
        return { start: lastMonthStart, end: lastMonthEnd }
      }
      case 'custom':
        return {
          start: filters.value.startDate ? new Date(filters.value.startDate) : undefined,
          end: filters.value.endDate ? new Date(filters.value.endDate + 'T23:59:59') : undefined,
        }
      case 'all':
      default:
        return {}
    }
  }

  /* ============================
     Filtered Trades (Client side or in-memory)
     ============================ */
  const filteredTrades = computed(() => {
    let list = [...trades.value]
    const { start, end } = getDateRangeBounds(filters.value.dateRange)

    // Date range filter
    if (start || end) {
      list = list.filter(t => {
        const tDate = new Date(t.date)
        if (start && tDate < start) return false
        if (end && tDate > end) return false
        return true
      })
    }

    // Account Type filter
    if (filters.value.accountType !== 'all') {
      list = list.filter(t => t.account_type === filters.value.accountType)
    }

    // Pair filter
    if (filters.value.pair) {
      const p = filters.value.pair.toUpperCase().trim()
      list = list.filter(t => t.pair.toUpperCase().includes(p))
    }

    // Status filter
    if (filters.value.status !== 'all') {
      list = list.filter(t => t.status === filters.value.status)
    }

    // Search query
    if (filters.value.search) {
      const q = filters.value.search.toLowerCase().trim()
      list = list.filter(t => {
        return (
          t.pair.toLowerCase().includes(q) ||
          t.setup?.toLowerCase().includes(q) ||
          t.entry_reason?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.emotions?.some(e => e.toLowerCase().includes(q)) ||
          t.mistakes?.some(m => m.toLowerCase().includes(q))
        )
      })
    }

    // Sort by date descending
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return list
  })

  /* ============================
     Paginated Trades
     ============================ */
  const paginatedTrades = computed(() => {
    const list = filteredTrades.value
    totalItems.value = list.length
    const start = (currentPage.value - 1) * itemsPerPage.value
    return list.slice(start, start + itemsPerPage.value)
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredTrades.value.length / itemsPerPage.value) || 1
  })

  /* ============================
     Aggregated Statistics
     ============================ */
  const stats = computed<TradeJournalStats>(() => {
    const list = filteredTrades.value
    const total = list.length

    let winCount = 0
    let lossCount = 0
    let beCount = 0
    let openCount = 0

    let totalPnl = 0
    let grossProfit = 0
    let grossLoss = 0
    let bestTrade = 0
    let worstTrade = 0
    let totalPips = 0

    let totalRr = 0
    let rrCount = 0

    list.forEach(t => {
      const pnl = t.pnl ?? 0
      const pips = t.pips ?? 0
      const rr = t.rr_ratio

      if (t.status === 'Win') winCount++
      else if (t.status === 'Loss') lossCount++
      else if (t.status === 'Breakeven') beCount++
      else if (t.status === 'Open') openCount++

      totalPnl += pnl
      totalPips += pips

      if (pnl > 0) {
        grossProfit += pnl
        if (pnl > bestTrade) bestTrade = pnl
      } else if (pnl < 0) {
        grossLoss += Math.abs(pnl)
        if (pnl < worstTrade) worstTrade = pnl
      }

      if (rr != null && !isNaN(rr) && t.status !== 'Open') {
        totalRr += rr
        rrCount++
      }
    })

    const closedTrades = winCount + lossCount + beCount
    const winRate = closedTrades > 0 ? Math.round((winCount / closedTrades) * 1000) / 10 : 0
    const avgRrRatio = rrCount > 0 ? Math.round((totalRr / rrCount) * 100) / 100 : 0
    const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : grossProfit > 0 ? 99.9 : 0

    return {
      totalTrades: total,
      winTrades: winCount,
      lossTrades: lossCount,
      breakevenTrades: beCount,
      openTrades: openCount,
      winRate,
      totalPnl: Math.round(totalPnl * 100) / 100,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      avgRrRatio,
      profitFactor,
      totalPips: Math.round(totalPips * 10) / 10,
    }
  })

  /* ============================
     Fetch Trades from Supabase
     ============================ */
  async function fetchTrades() {
    isLoading.value = true
    error.value = null

    try {
      const spaceId = currentSpace.value?.id

      if (!spaceId) {
        // If not in a space, load demo data for preview
        trades.value = [...DEMO_TRADES]
        usingFallback.value = true
        return
      }

      const { data, error: dbError } = await supabase
        .from('trades')
        .select('*')
        .eq('space_id', spaceId)
        .order('date', { ascending: false })

      if (dbError) {
        console.warn('[SpaceOS] Failed to query trades table:', dbError.message)
        // If table doesn't exist yet, fallback to demo/local storage
        loadFromLocalStorage(spaceId)
        usingFallback.value = true
        return
      }

      if (data && data.length > 0) {
        trades.value = data.map(formatDbRowToTrade)
        usingFallback.value = false
      } else {
        // Space has 0 trades yet, check local storage or init with demo
        loadFromLocalStorage(spaceId)
      }
    } catch (err: any) {
      console.error('fetchTrades error:', err)
      error.value = err?.message || 'Failed to load trades.'
      loadFromLocalStorage(currentSpace.value?.id || 'default')
    } finally {
      isLoading.value = false
    }
  }

  /* ============================
     Local Storage Fallback
     ============================ */
  function loadFromLocalStorage(spaceId: string) {
    const isCleanSlate = localStorage.getItem('spaceos_clean_slate') === 'true'
    try {
      const key = `spaceos_trades_${spaceId}`
      const saved = localStorage.getItem(key)
      if (saved) {
        trades.value = JSON.parse(saved)
      } else if (isCleanSlate) {
        trades.value = []
        saveToLocalStorage(spaceId, [])
      } else {
        // Populate default demo trades customized for space
        const initial = DEMO_TRADES.map(t => ({
          ...t,
          space_id: spaceId,
          user_id: user.value?.id || 'demo-user',
        }))
        trades.value = initial
        saveToLocalStorage(spaceId, initial)
      }
      usingFallback.value = true
    } catch {
      trades.value = isCleanSlate ? [] : [...DEMO_TRADES]
      usingFallback.value = true
    }
  }

  function saveToLocalStorage(spaceId: string, list: Trade[]) {
    try {
      const key = `spaceos_trades_${spaceId}`
      localStorage.setItem(key, JSON.stringify(list))
    } catch (err) {
      console.warn('Failed to save trades to localStorage:', err)
    }
  }

  /* ============================
     Data Mapper Helper
     ============================ */
  function formatDbRowToTrade(row: any): Trade {
    return {
      id: row.id,
      space_id: row.space_id,
      user_id: row.user_id,
      date: row.date,
      pair: row.pair,
      position: row.position,
      entry_price: Number(row.entry_price),
      exit_price: row.exit_price != null ? Number(row.exit_price) : null,
      stop_loss: row.stop_loss != null ? Number(row.stop_loss) : null,
      take_profit: row.take_profit != null ? Number(row.take_profit) : null,
      lot_size: Number(row.lot_size),
      pnl: row.pnl != null ? Number(row.pnl) : null,
      rr_ratio: row.rr_ratio != null ? Number(row.rr_ratio) : null,
      pips: row.pips != null ? Number(row.pips) : null,
      account_type: row.account_type || 'Real',
      setup: row.setup || null,
      entry_reason: row.entry_reason || null,
      exit_reason: row.exit_reason || null,
      what_went_well: row.what_went_well || null,
      improvements: row.improvements || null,
      emotions: Array.isArray(row.emotions) ? row.emotions : [],
      pre_mood: row.pre_mood || null,
      post_mood: row.post_mood || null,
      mistakes: Array.isArray(row.mistakes) ? row.mistakes : [],
      screenshot_urls: Array.isArray(row.screenshot_urls) ? row.screenshot_urls : [],
      status: row.status || 'Open',
      notes: row.notes || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  }

  /* ============================
     CRUD: Create Trade
     ============================ */
  async function createTrade(formData: TradeFormData): Promise<{ success: boolean; data?: Trade; error?: string }> {
    isSaving.value = true
    try {
      const spaceId = currentSpace.value?.id
      const userId = user.value?.id

      // Calculate automated fields
      const autoPnl = formData.pnl !== undefined && formData.pnl !== null
        ? formData.pnl
        : calculatePnl(formData.entry_price, formData.exit_price, formData.lot_size, formData.position, formData.pair)

      const autoPips = formData.pips !== undefined && formData.pips !== null
        ? formData.pips
        : calculatePips(formData.entry_price, formData.exit_price, formData.pair, formData.position)

      const autoRr = formData.rr_ratio !== undefined && formData.rr_ratio !== null
        ? formData.rr_ratio
        : calculateRR(formData.entry_price, formData.exit_price, formData.stop_loss, formData.take_profit, formData.position)

      const autoStatus = formData.status || determineStatus(formData.exit_price, autoPnl)

      const newTradePayload = {
        space_id: spaceId || 'demo-space',
        user_id: userId || 'demo-user',
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        pair: formData.pair.toUpperCase().trim(),
        position: formData.position,
        entry_price: formData.entry_price!,
        exit_price: formData.exit_price ?? null,
        stop_loss: formData.stop_loss ?? null,
        take_profit: formData.take_profit ?? null,
        lot_size: formData.lot_size!,
        pnl: autoPnl,
        rr_ratio: autoRr,
        pips: autoPips,
        account_type: formData.account_type,
        setup: formData.setup?.trim() || null,
        entry_reason: formData.entry_reason?.trim() || null,
        exit_reason: formData.exit_reason?.trim() || null,
        what_went_well: formData.what_went_well?.trim() || null,
        improvements: formData.improvements?.trim() || null,
        emotions: formData.emotions || [],
        pre_mood: formData.pre_mood || null,
        post_mood: formData.post_mood || null,
        mistakes: formData.mistakes || [],
        screenshot_urls: formData.screenshot_urls || [],
        status: autoStatus,
        notes: formData.notes?.trim() || null,
      }

      let createdTrade: Trade

      // Try Supabase insert
      if (spaceId && !usingFallback.value) {
        const { data, error: insertError } = await supabase
          .from('trades')
          .insert(newTradePayload)
          .select()
          .single()

        if (insertError) {
          console.warn('Supabase insert failed, falling back to local storage:', insertError.message)
          createdTrade = {
            ...newTradePayload,
            id: 'local-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Trade
        } else {
          createdTrade = formatDbRowToTrade(data)
        }
      } else {
        // Fallback local creation
        createdTrade = {
          ...newTradePayload,
          id: 'local-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Trade
      }

      // Prepend to state
      trades.value = [createdTrade, ...trades.value]
      if (spaceId) saveToLocalStorage(spaceId, trades.value)

      toast.success('Trade Recorded! 🎯', `${createdTrade.pair} (${createdTrade.position}) saved to journal.`)
      return { success: true, data: createdTrade }
    } catch (err: any) {
      console.error('createTrade error:', err)
      const msg = err?.message || 'Failed to create trade.'
      toast.error('Save Failed', msg)
      return { success: false, error: msg }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Update Trade
     ============================ */
  async function updateTrade(id: string, formData: Partial<TradeFormData>): Promise<{ success: boolean; data?: Trade; error?: string }> {
    isSaving.value = true
    try {
      const spaceId = currentSpace.value?.id
      const existing = trades.value.find(t => t.id === id)
      if (!existing) throw new Error('Trade not found')

      const merged = { ...existing, ...formData }

      const autoPnl = formData.pnl !== undefined
        ? formData.pnl
        : calculatePnl(merged.entry_price, merged.exit_price, merged.lot_size, merged.position, merged.pair)

      const autoPips = formData.pips !== undefined
        ? formData.pips
        : calculatePips(merged.entry_price, merged.exit_price, merged.pair, merged.position)

      const autoRr = formData.rr_ratio !== undefined
        ? formData.rr_ratio
        : calculateRR(merged.entry_price, merged.exit_price, merged.stop_loss, merged.take_profit, merged.position)

      const autoStatus = formData.status || determineStatus(merged.exit_price, autoPnl)

      const updatePayload = {
        date: formData.date ? new Date(formData.date).toISOString() : existing.date,
        pair: (formData.pair || existing.pair).toUpperCase().trim(),
        position: formData.position || existing.position,
        entry_price: formData.entry_price ?? existing.entry_price,
        exit_price: formData.exit_price !== undefined ? formData.exit_price : existing.exit_price,
        stop_loss: formData.stop_loss !== undefined ? formData.stop_loss : existing.stop_loss,
        take_profit: formData.take_profit !== undefined ? formData.take_profit : existing.take_profit,
        lot_size: formData.lot_size ?? existing.lot_size,
        pnl: autoPnl,
        rr_ratio: autoRr,
        pips: autoPips,
        account_type: formData.account_type || existing.account_type,
        setup: formData.setup !== undefined ? (formData.setup?.trim() || null) : existing.setup,
        entry_reason: formData.entry_reason !== undefined ? (formData.entry_reason?.trim() || null) : existing.entry_reason,
        exit_reason: formData.exit_reason !== undefined ? (formData.exit_reason?.trim() || null) : existing.exit_reason,
        what_went_well: formData.what_went_well !== undefined ? (formData.what_went_well?.trim() || null) : existing.what_went_well,
        improvements: formData.improvements !== undefined ? (formData.improvements?.trim() || null) : existing.improvements,
        emotions: formData.emotions || existing.emotions,
        pre_mood: formData.pre_mood !== undefined ? (formData.pre_mood || null) : existing.pre_mood,
        post_mood: formData.post_mood !== undefined ? (formData.post_mood || null) : existing.post_mood,
        mistakes: formData.mistakes || existing.mistakes,
        screenshot_urls: formData.screenshot_urls || existing.screenshot_urls,
        status: autoStatus,
        notes: formData.notes !== undefined ? (formData.notes?.trim() || null) : existing.notes,
        updated_at: new Date().toISOString(),
      }

      let updatedTrade: Trade

      if (spaceId && !usingFallback.value && !id.startsWith('demo-') && !id.startsWith('local-')) {
        const { data, error: updateError } = await supabase
          .from('trades')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single()

        if (updateError) {
          console.warn('Supabase update failed, using local update:', updateError.message)
          updatedTrade = { ...existing, ...updatePayload } as Trade
        } else {
          updatedTrade = formatDbRowToTrade(data)
        }
      } else {
        updatedTrade = { ...existing, ...updatePayload } as Trade
      }

      // Update in state
      const idx = trades.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        trades.value[idx] = updatedTrade
      }
      if (spaceId) saveToLocalStorage(spaceId, trades.value)

      toast.success('Trade Updated', `${updatedTrade.pair} trade details updated.`)
      return { success: true, data: updatedTrade }
    } catch (err: any) {
      console.error('updateTrade error:', err)
      const msg = err?.message || 'Failed to update trade.'
      toast.error('Update Failed', msg)
      return { success: false, error: msg }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Delete Trade
     ============================ */
  async function deleteTrade(id: string): Promise<{ success: boolean; error?: string }> {
    isDeleting.value = true
    try {
      const spaceId = currentSpace.value?.id

      if (spaceId && !usingFallback.value && !id.startsWith('demo-') && !id.startsWith('local-')) {
        const { error: delError } = await supabase
          .from('trades')
          .delete()
          .eq('id', id)

        if (delError) {
          console.warn('Supabase delete failed:', delError.message)
        }
      }

      trades.value = trades.value.filter(t => t.id !== id)
      if (spaceId) saveToLocalStorage(spaceId, trades.value)

      toast.info('Trade Deleted', 'The trade entry has been removed.')
      return { success: true }
    } catch (err: any) {
      console.error('deleteTrade error:', err)
      const msg = err?.message || 'Failed to delete trade.'
      toast.error('Delete Failed', msg)
      return { success: false, error: msg }
    } finally {
      isDeleting.value = false
    }
  }

  /* ============================
     Screenshot Upload
     ============================ */
  async function uploadScreenshot(file: File): Promise<{ url: string | null; error: string | null }> {
    try {
      const spaceId = currentSpace.value?.id || 'general'
      const fileExt = file.name.split('.').pop()
      const fileName = `${spaceId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

      const { data, error: uploadErr } = await supabase.storage
        .from('trade-screenshots')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadErr) {
        console.warn('Supabase storage upload error, creating local data URL:', uploadErr.message)
        // Fallback to local Data URL
        return new Promise(resolve => {
          const reader = new FileReader()
          reader.onload = e => resolve({ url: e.target?.result as string, error: null })
          reader.onerror = () => resolve({ url: null, error: 'Failed to read file' })
          reader.readAsDataURL(file)
        })
      }

      const { data: publicUrlData } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(data.path)

      return { url: publicUrlData.publicUrl, error: null }
    } catch (err: any) {
      console.error('uploadScreenshot error:', err)
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = e => resolve({ url: e.target?.result as string, error: null })
        reader.onerror = () => resolve({ url: null, error: err?.message || 'Failed to upload screenshot' })
        reader.readAsDataURL(file)
      })
    }
  }

  /* ============================
     Export to CSV
     ============================ */
  function exportToCSV(customList?: Trade[]) {
    const listToExport = customList || filteredTrades.value
    if (listToExport.length === 0) {
      toast.warning('No Trades to Export', 'There are no trades matching the selected filters.')
      return
    }

    const headers = [
      'ID',
      'Date',
      'Pair',
      'Position',
      'Account Type',
      'Status',
      'Entry Price',
      'Exit Price',
      'Stop Loss',
      'Take Profit',
      'Lot Size',
      'P&L ($)',
      'Pips',
      'R:R Ratio',
      'Setup',
      'Entry Reason',
      'Exit Reason',
      'What Went Well',
      'Improvements',
      'Emotions',
      'Pre Mood',
      'Post Mood',
      'Mistakes',
      'Notes',
    ]

    const rows = listToExport.map(t => [
      t.id,
      new Date(t.date).toISOString().replace('T', ' ').substring(0, 19),
      t.pair,
      t.position,
      t.account_type,
      t.status,
      t.entry_price,
      t.exit_price ?? '',
      t.stop_loss ?? '',
      t.take_profit ?? '',
      t.lot_size,
      t.pnl ?? '',
      t.pips ?? '',
      t.rr_ratio ?? '',
      `"${(t.setup || '').replace(/"/g, '""')}"`,
      `"${(t.entry_reason || '').replace(/"/g, '""')}"`,
      `"${(t.exit_reason || '').replace(/"/g, '""')}"`,
      `"${(t.what_went_well || '').replace(/"/g, '""')}"`,
      `"${(t.improvements || '').replace(/"/g, '""')}"`,
      `"${(t.emotions || []).join(', ')}"`,
      t.pre_mood || '',
      t.post_mood || '',
      `"${(t.mistakes || []).join(', ')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().split('T')[0]

    link.setAttribute('href', url)
    link.setAttribute('download', `SpaceOS_Trading_Journal_${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Export Successful', `Exported ${listToExport.length} trades to CSV.`)
  }

  // Reset page when filters change
  watch(
    () => [filters.value.dateRange, filters.value.accountType, filters.value.pair, filters.value.status, filters.value.search],
    () => {
      currentPage.value = 1
    }
  )

  return {
    trades,
    filteredTrades,
    paginatedTrades,
    stats,
    filters,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    isLoading,
    isSaving,
    isDeleting,
    error,
    usingFallback,
    fetchTrades,
    createTrade,
    updateTrade,
    deleteTrade,
    uploadScreenshot,
    exportToCSV,
  }
}
