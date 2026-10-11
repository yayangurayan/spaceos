import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'

/* ============================================================
   Interfaces & Types
   ============================================================ */
export type BacktestResult = 'WIN' | 'LOSS' | 'BE'
export type BacktestDirection = 'BUY' | 'SELL'

export interface BacktestTrade {
  id: string
  tradeNumber: number
  date: string
  pair: string
  direction: BacktestDirection
  result: BacktestResult
  rMultiple: number
  pnl: number
  balanceAfter: number
  setup?: string
  session?: string
  chartUrl?: string
  notes?: string
  created_at: string
}

export interface BacktestSettings {
  initialBalance: number
  riskPercent: number
  riskType: 'percent' | 'fixed'
  fixedRiskAmount: number
  compounding: boolean
  strategyName: string
}

export interface TradingPlan {
  strategyName: string
  marketSession: string
  pairs: string[]
  timeframes: string
  riskPerTrade: string
  entryRules: string
  invalidationRules: string
  exitRules: string
  psychologyRules: string
  updated_at: string
}

export interface EquityPoint {
  tradeNum: number
  balance: number
  pnl: number
  r: number
  result: string
  pair?: string
  date?: string
}

export interface BacktestStats {
  totalTrades: number
  winCount: number
  lossCount: number
  beCount: number
  winRate: number
  netPnl: number
  netPnlPercent: number
  currentBalance: number
  grossProfit: number
  grossLoss: number
  profitFactor: number
  totalR: number
  avgWinR: number
  avgLossR: number
  avgRR: number
  expectancyR: number
  expectancyDollar: number
  maxDrawdownDollar: number
  maxDrawdownPercent: number
  consecutiveWins: number
  consecutiveLosses: number
  bestTrade: number
  worstTrade: number
}

/* ============================================================
   Default Fallbacks
   ============================================================ */
const DEFAULT_SETTINGS: BacktestSettings = {
  initialBalance: 10000,
  riskPercent: 1.0,
  riskType: 'percent',
  fixedRiskAmount: 100,
  compounding: false,
  strategyName: 'Smart Money Concept - Liquidity Sweep',
}

const DEFAULT_TRADING_PLAN: TradingPlan = {
  strategyName: 'SMC Liquidity Sweep & Order Flow',
  marketSession: 'London Open (14:00 - 17:00 WIB) & NY Session (19:30 - 22:30 WIB)',
  pairs: ['XAUUSD', 'EURUSD', 'GBPUSD'],
  timeframes: 'HTF: 4H & 1H (Trend/Bias) | LTF: 15m & 5m (Entry Trigger)',
  riskPerTrade: '1% per trade (Maksimal 2 posisi aktif per sesi)',
  entryRules: '1. Identifikasi Liquidity Pool (Asian High/Low atau Previous Day H/L)\n2. Tunggu sweep liquidity (false breakout / hunt)\n3. Terjadi Market Structure Shift (MSS/CHoCH) pada M5/M15\n4. Konfirmasi displacement candle kuat dengan Fair Value Gap (FVG)\n5. Limit entry pada retest FVG 50% atau Order Block',
  invalidationRules: '1. Stop Loss diletakkan beberapa pips di atas/bawah swing point liquidity sweep\n2. Jika candle close menembus swing invalidasi sebelum trigger fill, setup dibatalkan',
  exitRules: '1. Target profit minimal 1:2 R:R\n2. TP utama diletakkan di unmitigated liquidity pool atau oppposite key level\n3. Geser Stop Loss ke Breakeven (BE) segera setelah harga running 1:1.5 R:R',
  psychologyRules: '1. Maksimal 2x loss berturut-turut dalam satu hari -> Matikan chart & sudahi trading\n2. Dilarang keras melakukan revenge trading / over-leveraging\n3. Hindari open posisi 15 menit sebelum & sesudah berita ekonomi high-impact (NFP, CPI, FOMC)',
  updated_at: new Date().toISOString(),
}

/* Helper to validate UUID RFC 4122 */
function isValidUUID(str?: string | null): boolean {
  if (!str) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

/* ============================================================
   Composable Definition
   ============================================================ */
export function useBacktesting() {
  const authStore = useAuthStore()
  const { currentSpace, user } = storeToRefs(authStore)
  const toast = useToastStore()

  const spaceId = computed(() => currentSpace.value?.id || 'space-trading')

  // Storage Keys scoped by space
  const tradesKey = computed(() => `spaceos_backtest_trades_${spaceId.value}`)
  const settingsKey = computed(() => `spaceos_backtest_settings_${spaceId.value}`)
  const planKey = computed(() => `spaceos_trading_plan_${spaceId.value}`)

  // Reactive State
  const trades = ref<BacktestTrade[]>([])
  const settings = ref<BacktestSettings>({ ...DEFAULT_SETTINGS })
  const tradingPlan = ref<TradingPlan>({ ...DEFAULT_TRADING_PLAN })
  const isLoaded = ref(false)
  const isSyncing = ref(false)
  const isCloudSynced = ref(false)
  const syncError = ref<string | null>(null)

  // Rapid form sticky inputs (remembers last choice for maximum speed)
  const activePair = ref<string>('XAUUSD')
  const activeDirection = ref<BacktestDirection>('BUY')
  const activeSession = ref<string>('London')

  /* ============================================================
     Database Row Mappers
     ============================================================ */
  function formatDbRowToTrade(row: any): BacktestTrade {
    return {
      id: row.id,
      tradeNumber: Number(row.trade_number) || 1,
      date: row.date,
      pair: row.pair,
      direction: row.direction as BacktestDirection,
      result: row.result as BacktestResult,
      rMultiple: Number(row.r_multiple) || 0,
      pnl: Number(row.pnl) || 0,
      balanceAfter: Number(row.balance_after) || 0,
      setup: row.setup || '',
      session: row.session || 'London',
      chartUrl: row.chart_url || '',
      notes: row.notes || '',
      created_at: row.created_at || new Date().toISOString(),
    }
  }

  function formatTradeToDbRow(t: BacktestTrade, targetSpaceId: string, targetUserId: string) {
    return {
      id: isValidUUID(t.id) ? t.id : crypto.randomUUID(),
      space_id: targetSpaceId,
      user_id: targetUserId,
      trade_number: t.tradeNumber,
      date: t.date || new Date().toISOString().split('T')[0],
      pair: t.pair || 'XAUUSD',
      direction: t.direction || 'BUY',
      result: t.result || 'WIN',
      r_multiple: t.rMultiple,
      pnl: t.pnl,
      balance_after: t.balanceAfter,
      setup: t.setup || null,
      session: t.session || 'London',
      chart_url: t.chartUrl || null,
      notes: t.notes || null,
      created_at: t.created_at || new Date().toISOString(),
    }
  }

  /* ============================================================
     Resolve Supabase Space ID (UUID)
     Guarantees that an authenticated user has a real remote space
     in Postgres `spaces` table so foreign keys and RLS succeed.
     ============================================================ */
  async function resolveSpaceId(): Promise<string | null> {
    const currentId = currentSpace.value?.id
    if (isValidUUID(currentId)) {
      return currentId!
    }

    const userId = user.value?.id
    if (!userId || !isValidUUID(userId) || userId.startsWith('demo-user')) {
      return null
    }

    try {
      // 1. Check if user belongs to any space in space_members
      const { data: members, error: memErr } = await supabase
        .from('space_members')
        .select('space_id, spaces(id, name, category)')
        .eq('user_id', userId)

      if (!memErr && members && members.length > 0) {
        const tradingMem = members.find((m: any) =>
          m.spaces?.category === 'trading' ||
          m.spaces?.name?.toLowerCase().includes('trading')
        )
        if (tradingMem && isValidUUID(tradingMem.space_id)) {
          return tradingMem.space_id
        }
        const firstValid = members.find((m: any) => isValidUUID(m.space_id))
        if (firstValid) {
          return firstValid.space_id
        }
      }

      // 2. Check if user owns any spaces in spaces table
      const { data: ownedSpaces, error: ownErr } = await supabase
        .from('spaces')
        .select('id, name, category')
        .eq('owner_id', userId)

      if (!ownErr && ownedSpaces && ownedSpaces.length > 0) {
        const tradingSpace = ownedSpaces.find(s =>
          s.category === 'trading' || s.name.toLowerCase().includes('trading')
        )
        if (tradingSpace && isValidUUID(tradingSpace.id)) {
          return tradingSpace.id
        }
        if (isValidUUID(ownedSpaces[0].id)) {
          return ownedSpaces[0].id
        }
      }

      // 3. If no space exists in Supabase yet, auto-create a Trading Space in Supabase
      const { data: newSpace, error: createErr } = await supabase
        .from('spaces')
        .insert({
          name: 'Trading Space',
          type: 'personal',
          category: 'trading',
          icon: '📈',
          owner_id: userId,
        })
        .select()
        .single()

      if (!createErr && newSpace && isValidUUID(newSpace.id)) {
        await supabase.from('space_members').insert({
          space_id: newSpace.id,
          user_id: userId,
          role: 'owner',
        })
        if (currentSpace.value && currentSpace.value.id === 'space-trading') {
          currentSpace.value.id = newSpace.id
        }
        return newSpace.id
      }
    } catch (e) {
      console.warn('[Backtesting] Error resolving Supabase space ID:', e)
    }

    return null
  }

  /* ============================================================
     Load & Save State (Local Preservation First)
     ============================================================ */
  function loadFromStorage() {
    try {
      // 1. Settings (Check current space, fallback to space-trading if missing)
      let savedSettings = localStorage.getItem(settingsKey.value)
      if (!savedSettings && settingsKey.value !== 'spaceos_backtest_settings_space-trading') {
        savedSettings = localStorage.getItem('spaceos_backtest_settings_space-trading')
      }
      if (savedSettings) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }
      } else {
        settings.value = { ...DEFAULT_SETTINGS }
      }

      // 2. Trading Plan
      let savedPlan = localStorage.getItem(planKey.value)
      if (!savedPlan && planKey.value !== 'spaceos_trading_plan_space-trading') {
        savedPlan = localStorage.getItem('spaceos_trading_plan_space-trading')
      }
      if (savedPlan) {
        tradingPlan.value = { ...DEFAULT_TRADING_PLAN, ...JSON.parse(savedPlan) }
      } else {
        tradingPlan.value = { ...DEFAULT_TRADING_PLAN }
      }

      // 3. Trades (Safely load existing user trades, NEVER wipe them)
      let savedTrades = localStorage.getItem(tradesKey.value)
      if (!savedTrades && tradesKey.value !== 'spaceos_backtest_trades_space-trading') {
        savedTrades = localStorage.getItem('spaceos_backtest_trades_space-trading')
      }
      if (savedTrades) {
        const parsed = JSON.parse(savedTrades)
        if (Array.isArray(parsed) && parsed.length > 0) {
          trades.value = parsed.map((t, idx) => ({
            ...t,
            id: isValidUUID(t.id) ? t.id : (t.id || crypto.randomUUID()),
            tradeNumber: t.tradeNumber || (idx + 1),
          }))
          // Ensure backed up to current tradesKey
          persistTrades()
        }
      } else if (trades.value.length === 0) {
        trades.value = []
      }
    } catch (e) {
      console.error('Failed to load backtest data from localStorage:', e)
    } finally {
      isLoaded.value = true
    }
  }

  function persistTrades() {
    try {
      localStorage.setItem(tradesKey.value, JSON.stringify(trades.value))
    } catch (e) {
      console.error('Failed to save backtest trades:', e)
    }
  }

  function persistSettings() {
    try {
      localStorage.setItem(settingsKey.value, JSON.stringify(settings.value))
    } catch (e) {
      console.error('Failed to save backtest settings:', e)
    }
  }

  function persistPlan() {
    try {
      localStorage.setItem(planKey.value, JSON.stringify(tradingPlan.value))
    } catch (e) {
      console.error('Failed to save trading plan:', e)
    }
  }

  /* ============================================================
     Cloud Synchronization with Supabase
     Guarantees local data is migrated & uploaded to database
     without duplicating or losing any recorded backtest.
     ============================================================ */
  async function syncWithSupabase() {
    if (isSyncing.value) return
    isSyncing.value = true
    syncError.value = null

    try {
      const targetSpaceId = await resolveSpaceId()
      const userId = user.value?.id

      if (!targetSpaceId || !userId || !isValidUUID(userId) || userId.startsWith('demo-user')) {
        // Guest or offline mode: Local memory remains 100% active and safe
        isCloudSynced.value = false
        return
      }

      // 1. Sync Settings with Supabase
      try {
        const { data: remoteSettings, error: sErr } = await supabase
          .from('backtest_settings')
          .select('*')
          .eq('space_id', targetSpaceId)
          .maybeSingle()

        if (!sErr && remoteSettings) {
          settings.value = {
            initialBalance: Number(remoteSettings.initial_balance) || 10000,
            riskPercent: Number(remoteSettings.risk_percent) || 1.0,
            riskType: (remoteSettings.risk_type as 'percent' | 'fixed') || 'percent',
            fixedRiskAmount: Number(remoteSettings.fixed_risk_amount) || 100,
            compounding: Boolean(remoteSettings.compounding),
            strategyName: remoteSettings.strategy_name || DEFAULT_SETTINGS.strategyName,
          }
          persistSettings()
        } else if (!remoteSettings && !sErr) {
          await supabase.from('backtest_settings').upsert({
            space_id: targetSpaceId,
            user_id: userId,
            initial_balance: settings.value.initialBalance,
            risk_percent: settings.value.riskPercent,
            risk_type: settings.value.riskType,
            fixed_risk_amount: settings.value.fixedRiskAmount,
            compounding: settings.value.compounding,
            strategy_name: settings.value.strategyName,
          }, { onConflict: 'space_id' })
        }
      } catch (e) {
        console.warn('[Backtesting] Settings sync warning:', e)
      }

      // 2. Sync Trading Plan with Supabase
      try {
        const { data: remotePlan, error: pErr } = await supabase
          .from('trading_plans')
          .select('*')
          .eq('space_id', targetSpaceId)
          .maybeSingle()

        if (!pErr && remotePlan) {
          tradingPlan.value = {
            strategyName: remotePlan.strategy_name || DEFAULT_TRADING_PLAN.strategyName,
            marketSession: remotePlan.market_session || DEFAULT_TRADING_PLAN.marketSession,
            pairs: Array.isArray(remotePlan.pairs) ? remotePlan.pairs : DEFAULT_TRADING_PLAN.pairs,
            timeframes: remotePlan.timeframes || DEFAULT_TRADING_PLAN.timeframes,
            riskPerTrade: remotePlan.risk_per_trade || DEFAULT_TRADING_PLAN.riskPerTrade,
            entryRules: remotePlan.entry_rules || DEFAULT_TRADING_PLAN.entryRules,
            invalidationRules: remotePlan.invalidation_rules || DEFAULT_TRADING_PLAN.invalidationRules,
            exitRules: remotePlan.exit_rules || DEFAULT_TRADING_PLAN.exitRules,
            psychologyRules: remotePlan.psychology_rules || DEFAULT_TRADING_PLAN.psychologyRules,
            updated_at: remotePlan.updated_at || new Date().toISOString(),
          }
          persistPlan()
        } else if (!remotePlan && !pErr) {
          await supabase.from('trading_plans').upsert({
            space_id: targetSpaceId,
            user_id: userId,
            strategy_name: tradingPlan.value.strategyName,
            market_session: tradingPlan.value.marketSession,
            pairs: tradingPlan.value.pairs,
            timeframes: tradingPlan.value.timeframes,
            risk_per_trade: tradingPlan.value.riskPerTrade,
            entry_rules: tradingPlan.value.entryRules,
            invalidation_rules: tradingPlan.value.invalidationRules,
            exit_rules: tradingPlan.value.exitRules,
            psychology_rules: tradingPlan.value.psychologyRules,
          }, { onConflict: 'space_id' })
        }
      } catch (e) {
        console.warn('[Backtesting] Plan sync warning:', e)
      }

      // 3. Sync Backtest Trades with Supabase
      const { data: remoteTrades, error: tErr } = await supabase
        .from('backtest_trades')
        .select('*')
        .eq('space_id', targetSpaceId)
        .order('trade_number', { ascending: true })

      if (tErr) {
        console.warn('[Backtesting] Query remote trades notice:', tErr.message)
        isCloudSynced.value = false
        return
      }

      const remoteList: BacktestTrade[] = (remoteTrades || []).map(formatDbRowToTrade)

      // CASE A: Remote has NO trades, but user has existing local trades
      // -> Upload ALL local trades to Supabase so they are permanently backed up!
      if (remoteList.length === 0 && trades.value.length > 0) {
        const validatedLocalTrades = trades.value.map((t, idx) => ({
          ...t,
          id: isValidUUID(t.id) ? t.id : crypto.randomUUID(),
          tradeNumber: idx + 1,
        }))
        trades.value = validatedLocalTrades
        persistTrades()

        const payload = validatedLocalTrades.map(t => formatTradeToDbRow(t, targetSpaceId, userId))
        const { error: insErr } = await supabase.from('backtest_trades').insert(payload)
        if (insErr) {
          console.warn('[Backtesting] Failed to upload local trades to Supabase:', insErr.message)
          isCloudSynced.value = false
        } else {
          isCloudSynced.value = true
          toast.success('Pencadangan Berhasil', `${validatedLocalTrades.length} trade lokal berhasil dicadangkan ke database Supabase!`)
        }
      }
      // CASE B: Remote has trades
      else if (remoteList.length > 0) {
        const remoteIds = new Set(remoteList.map(t => t.id))
        const unsavedLocalTrades = trades.value.filter(t => !remoteIds.has(t.id))

        if (unsavedLocalTrades.length > 0) {
          const validatedUnsaved = unsavedLocalTrades.map(t => ({
            ...t,
            id: isValidUUID(t.id) ? t.id : crypto.randomUUID(),
          }))
          const payload = validatedUnsaved.map(t => formatTradeToDbRow(t, targetSpaceId, userId))
          await supabase.from('backtest_trades').insert(payload)

          const merged = [...remoteList, ...validatedUnsaved]
          recalculateAndSetTrades(merged)
          isCloudSynced.value = true
        } else {
          // Local is fully synchronized with remote
          recalculateAndSetTrades(remoteList)
          isCloudSynced.value = true
        }
      } else {
        isCloudSynced.value = true
      }
    } catch (err: any) {
      console.error('[Backtesting] syncWithSupabase error:', err)
      syncError.value = err?.message || 'Gagal sinkronisasi data cloud.'
      isCloudSynced.value = false
    } finally {
      isSyncing.value = false
    }
  }

  // Watch for space change to reload and sync
  watch(spaceId, () => {
    loadFromStorage()
    syncWithSupabase()
  }, { immediate: true })

  // Watch user authentication changes
  watch(user, () => {
    syncWithSupabase()
  })

  /* ============================================================
     Core Calculation Engine
     ============================================================ */
  function recalculateAndSetTrades(rawList: Array<Partial<BacktestTrade>>) {
    let runningBalance = Number(settings.value.initialBalance) || 10000
    const riskPct = Number(settings.value.riskPercent) || 1.0
    const fixedRisk = Number(settings.value.fixedRiskAmount) || 100
    const isCompounding = Boolean(settings.value.compounding)
    const isFixedAmount = settings.value.riskType === 'fixed'

    const calculated: BacktestTrade[] = []

    rawList.forEach((t, idx) => {
      const tradeNumber = idx + 1
      const r = Number(t.rMultiple) ?? (t.result === 'WIN' ? 2 : t.result === 'LOSS' ? -1 : 0)

      // Calculate risk amount for this trade
      let riskDollars = isFixedAmount
        ? fixedRisk
        : isCompounding
          ? runningBalance * (riskPct / 100)
          : (Number(settings.value.initialBalance) || 10000) * (riskPct / 100)

      // Ensure riskDollars is positive
      riskDollars = Math.max(1, riskDollars)

      // Calculate PnL
      const pnl = Math.round(riskDollars * r * 100) / 100
      runningBalance = Math.round((runningBalance + pnl) * 100) / 100

      calculated.push({
        id: isValidUUID(t.id) ? t.id! : (t.id || crypto.randomUUID()),
        tradeNumber,
        date: t.date || new Date().toISOString().split('T')[0],
        pair: t.pair || 'XAUUSD',
        direction: t.direction || 'BUY',
        result: t.result || (r > 0 ? 'WIN' : r < 0 ? 'LOSS' : 'BE'),
        rMultiple: Math.round(r * 100) / 100,
        pnl,
        balanceAfter: runningBalance,
        setup: t.setup || '',
        session: t.session || 'London',
        chartUrl: t.chartUrl || '',
        notes: t.notes || '',
        created_at: t.created_at || new Date().toISOString(),
      })
    })

    trades.value = calculated
    persistTrades()
  }

  function recomputeAllTrades() {
    recalculateAndSetTrades(trades.value)
  }

  /* ============================================================
     Computed Statistics & Ratios
     ============================================================ */
  const stats = computed((): BacktestStats => {
    const list = trades.value
    const initial = Number(settings.value.initialBalance) || 10000
    const total = list.length

    if (total === 0) {
      return {
        totalTrades: 0,
        winCount: 0,
        lossCount: 0,
        beCount: 0,
        winRate: 0,
        netPnl: 0,
        netPnlPercent: 0,
        currentBalance: initial,
        grossProfit: 0,
        grossLoss: 0,
        profitFactor: 0,
        totalR: 0,
        avgWinR: 0,
        avgLossR: 0,
        avgRR: 0,
        expectancyR: 0,
        expectancyDollar: 0,
        maxDrawdownDollar: 0,
        maxDrawdownPercent: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        bestTrade: 0,
        worstTrade: 0,
      }
    }

    let winCount = 0
    let lossCount = 0
    let beCount = 0
    let grossProfit = 0
    let grossLoss = 0
    let totalR = 0
    let winRSum = 0
    let lossRSum = 0
    let bestTrade = -Infinity
    let worstTrade = Infinity

    let currentWinStreak = 0
    let maxWinStreak = 0
    let currentLossStreak = 0
    let maxLossStreak = 0

    let peakBalance = initial
    let maxDrawdownDollar = 0
    let maxDrawdownPercent = 0

    list.forEach(t => {
      totalR += t.rMultiple
      if (t.pnl > bestTrade) bestTrade = t.pnl
      if (t.pnl < worstTrade) worstTrade = t.pnl

      if (t.result === 'WIN') {
        winCount++
        grossProfit += t.pnl
        winRSum += t.rMultiple
        currentWinStreak++
        currentLossStreak = 0
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak
      } else if (t.result === 'LOSS') {
        lossCount++
        grossLoss += Math.abs(t.pnl)
        lossRSum += Math.abs(t.rMultiple)
        currentLossStreak++
        currentWinStreak = 0
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak
      } else {
        beCount++
        currentWinStreak = 0
        currentLossStreak = 0
      }

      if (t.balanceAfter > peakBalance) {
        peakBalance = t.balanceAfter
      } else {
        const ddDollar = peakBalance - t.balanceAfter
        const ddPct = (ddDollar / peakBalance) * 100
        if (ddDollar > maxDrawdownDollar) maxDrawdownDollar = ddDollar
        if (ddPct > maxDrawdownPercent) maxDrawdownPercent = ddPct
      }
    })

    const lastTrade = list[list.length - 1]
    const currentBalance = lastTrade ? lastTrade.balanceAfter : initial
    const netPnl = Math.round((currentBalance - initial) * 100) / 100
    const netPnlPercent = Math.round((netPnl / initial) * 10000) / 100

    const winRate = Math.round((winCount / total) * 1000) / 10
    const profitFactor = grossLoss > 0
      ? Math.round((grossProfit / grossLoss) * 100) / 100
      : grossProfit > 0 ? 99.99 : 0

    const avgWinR = winCount > 0 ? Math.round((winRSum / winCount) * 100) / 100 : 0
    const avgLossR = lossCount > 0 ? Math.round((lossRSum / lossCount) * 100) / 100 : 0
    const avgRR = avgLossR > 0 ? Math.round((avgWinR / avgLossR) * 100) / 100 : avgWinR

    const winProb = winCount / total
    const lossProb = lossCount / total
    const expectancyR = Math.round(((winProb * avgWinR) - (lossProb * avgLossR)) * 100) / 100
    const expectancyDollar = Math.round((netPnl / total) * 100) / 100

    return {
      totalTrades: total,
      winCount,
      lossCount,
      beCount,
      winRate,
      netPnl,
      netPnlPercent,
      currentBalance,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossLoss: Math.round(grossLoss * 100) / 100,
      profitFactor,
      totalR: Math.round(totalR * 100) / 100,
      avgWinR,
      avgLossR,
      avgRR,
      expectancyR,
      expectancyDollar,
      maxDrawdownDollar: Math.round(maxDrawdownDollar * 100) / 100,
      maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100,
      consecutiveWins: maxWinStreak,
      consecutiveLosses: maxLossStreak,
      bestTrade: bestTrade === -Infinity ? 0 : Math.round(bestTrade * 100) / 100,
      worstTrade: worstTrade === Infinity ? 0 : Math.round(worstTrade * 100) / 100,
    }
  })

  /* ============================================================
     Equity Curve Data Points for Chart
     ============================================================ */
  const equityCurve = computed((): EquityPoint[] => {
    const initial = Number(settings.value.initialBalance) || 10000
    const points: EquityPoint[] = [
      {
        tradeNum: 0,
        balance: initial,
        pnl: 0,
        r: 0,
        result: 'START',
      },
    ]

    trades.value.forEach(t => {
      points.push({
        tradeNum: t.tradeNumber,
        balance: t.balanceAfter,
        pnl: t.pnl,
        r: t.rMultiple,
        result: t.result,
        pair: t.pair,
        date: t.date,
      })
    })

    return points
  })

  /* ============================================================
     Fast Trade Entry Methods
     ============================================================ */
  async function addQuickTrade(
    result: BacktestResult,
    rMultiple: number,
    setup?: string,
    notes?: string,
    chartUrl?: string
  ) {
    const newTrade: Partial<BacktestTrade> = {
      id: crypto.randomUUID(),
      pair: activePair.value || 'XAUUSD',
      direction: activeDirection.value || 'BUY',
      session: activeSession.value || 'London',
      date: new Date().toISOString().split('T')[0],
      result,
      rMultiple,
      setup: setup || '',
      notes: notes || '',
      chartUrl: chartUrl || '',
      created_at: new Date().toISOString(),
    }

    const updatedList = [...trades.value, newTrade]
    recalculateAndSetTrades(updatedList)

    const sign = rMultiple > 0 ? '+' : ''
    const msg = `Trade #${trades.value.length}: ${newTrade.pair} (${sign}${rMultiple}R ${result})`
    if (result === 'WIN') {
      toast.success('Trade Win Tersimpan', msg)
    } else if (result === 'LOSS') {
      toast.warning('Trade Loss Tercatat', msg)
    } else {
      toast.info('Trade Breakeven Tercatat', msg)
    }

    // Background push to Supabase
    try {
      const targetSpaceId = await resolveSpaceId()
      const userId = user.value?.id
      if (targetSpaceId && userId && isValidUUID(userId) && !userId.startsWith('demo-user')) {
        const latest = trades.value[trades.value.length - 1]
        if (latest) {
          const payload = formatTradeToDbRow(latest, targetSpaceId, userId)
          await supabase.from('backtest_trades').insert(payload)
          isCloudSynced.value = true
        }
      }
    } catch (e) {
      console.warn('[Backtesting] Async insert to Supabase notice:', e)
    }
  }

  async function addCustomTrade(data: Partial<BacktestTrade>) {
    const tradeWithId: Partial<BacktestTrade> = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...data,
    }
    const updatedList = [...trades.value, tradeWithId]
    recalculateAndSetTrades(updatedList)
    toast.success('Trade Tersimpan', `Trade #${trades.value.length} berhasil ditambahkan!`)

    try {
      const targetSpaceId = await resolveSpaceId()
      const userId = user.value?.id
      if (targetSpaceId && userId && isValidUUID(userId) && !userId.startsWith('demo-user')) {
        const latest = trades.value[trades.value.length - 1]
        if (latest) {
          const payload = formatTradeToDbRow(latest, targetSpaceId, userId)
          await supabase.from('backtest_trades').insert(payload)
          isCloudSynced.value = true
        }
      }
    } catch (e) {
      console.warn('[Backtesting] Async insert to Supabase notice:', e)
    }
  }

  async function updateTrade(id: string, updates: Partial<BacktestTrade>) {
    const idx = trades.value.findIndex(t => t.id === id)
    if (idx === -1) return

    const updatedList = [...trades.value]
    updatedList[idx] = { ...updatedList[idx], ...updates }
    recalculateAndSetTrades(updatedList)
    toast.info('Trade Diperbarui', 'Perubahan trade berhasil disimpan.')

    try {
      const targetSpaceId = await resolveSpaceId()
      const userId = user.value?.id
      if (targetSpaceId && userId && isValidUUID(userId) && !userId.startsWith('demo-user')) {
        const updated = trades.value[idx]
        if (updated) {
          await supabase.from('backtest_trades').update({
            pair: updated.pair,
            direction: updated.direction,
            session: updated.session,
            date: updated.date,
            result: updated.result,
            r_multiple: updated.rMultiple,
            pnl: updated.pnl,
            balance_after: updated.balanceAfter,
            setup: updated.setup || null,
            notes: updated.notes || null,
            chart_url: updated.chartUrl || null,
            updated_at: new Date().toISOString(),
          }).eq('id', id)
          isCloudSynced.value = true
        }
      }
    } catch (e) {
      console.warn('[Backtesting] Async update to Supabase notice:', e)
    }
  }

  async function deleteTrade(id: string) {
    const filtered = trades.value.filter(t => t.id !== id)
    recalculateAndSetTrades(filtered)
    toast.info('Trade Dihapus', 'Trade telah dihapus dari log backtest.')

    try {
      const targetSpaceId = await resolveSpaceId()
      if (targetSpaceId) {
        await supabase.from('backtest_trades').delete().eq('id', id)
        isCloudSynced.value = true
      }
    } catch (e) {
      console.warn('[Backtesting] Async delete from Supabase notice:', e)
    }
  }

  async function undoLastTrade() {
    if (trades.value.length === 0) return
    const last = trades.value[trades.value.length - 1]
    const popped = trades.value.slice(0, -1)
    recalculateAndSetTrades(popped)
    toast.info('Undo Berhasil', 'Trade terakhir telah dibatalkan.')

    try {
      const targetSpaceId = await resolveSpaceId()
      if (targetSpaceId && last) {
        await supabase.from('backtest_trades').delete().eq('id', last.id)
        isCloudSynced.value = true
      }
    } catch (e) {
      console.warn('[Backtesting] Async undo from Supabase notice:', e)
    }
  }

  async function resetBacktest(newInitialBalance?: number) {
    if (newInitialBalance !== undefined && newInitialBalance > 0) {
      settings.value.initialBalance = newInitialBalance
      persistSettings()
    }
    trades.value = []
    persistTrades()
    toast.info('Reset Selesai', 'Log backtesting berhasil di-reset ke saldo awal.')

    try {
      const targetSpaceId = await resolveSpaceId()
      if (targetSpaceId) {
        await supabase.from('backtest_trades').delete().eq('space_id', targetSpaceId)
        isCloudSynced.value = true
      }
    } catch (e) {
      console.warn('[Backtesting] Async reset in Supabase notice:', e)
    }
  }

  async function updateSettings(newSettings: Partial<BacktestSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    persistSettings()
    recomputeAllTrades()
    toast.success('Pengaturan Disimpan', 'Saldo awal & risiko backtest berhasil diperbarui.')

    try {
      const targetSpaceId = await resolveSpaceId()
      const userId = user.value?.id
      if (targetSpaceId && userId && isValidUUID(userId) && !userId.startsWith('demo-user')) {
        await supabase.from('backtest_settings').upsert({
          space_id: targetSpaceId,
          user_id: userId,
          initial_balance: settings.value.initialBalance,
          risk_percent: settings.value.riskPercent,
          risk_type: settings.value.riskType,
          fixed_risk_amount: settings.value.fixedRiskAmount,
          compounding: settings.value.compounding,
          strategy_name: settings.value.strategyName,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'space_id' })
        isCloudSynced.value = true
      }
    } catch (e) {
      console.warn('[Backtesting] Async settings update notice:', e)
    }
  }

  async function updateTradingPlan(newPlan: Partial<TradingPlan>) {
    tradingPlan.value = {
      ...tradingPlan.value,
      ...newPlan,
      updated_at: new Date().toISOString(),
    }
    persistPlan()
    toast.success('Trading Plan Disimpan', 'Strategi & aturan trading berhasil diperbarui!')

    try {
      const targetSpaceId = await resolveSpaceId()
      const userId = user.value?.id
      if (targetSpaceId && userId && isValidUUID(userId) && !userId.startsWith('demo-user')) {
        await supabase.from('trading_plans').upsert({
          space_id: targetSpaceId,
          user_id: userId,
          strategy_name: tradingPlan.value.strategyName,
          market_session: tradingPlan.value.marketSession,
          pairs: tradingPlan.value.pairs,
          timeframes: tradingPlan.value.timeframes,
          risk_per_trade: tradingPlan.value.riskPerTrade,
          entry_rules: tradingPlan.value.entryRules,
          invalidation_rules: tradingPlan.value.invalidationRules,
          exit_rules: tradingPlan.value.exitRules,
          psychology_rules: tradingPlan.value.psychologyRules,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'space_id' })
        isCloudSynced.value = true
      }
    } catch (e) {
      console.warn('[Backtesting] Async plan update notice:', e)
    }
  }

  /* ============================================================
     Reliable CSV Export
     - UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
     - RFC 4180 quote escaping
     - Blob + URL.createObjectURL for 100% browser/mobile reliability
     ============================================================ */
  function exportToCsv() {
    if (trades.value.length === 0) {
      toast.warning('Data Kosong', 'Tidak ada data trade backtest untuk diekspor.')
      return
    }

    const headers = [
      'Trade #',
      'Tanggal',
      'Pair',
      'Arah',
      'Sesi',
      'Hasil',
      'R-Multiple',
      'P&L ($)',
      'Saldo ($)',
      'Setup',
      'Catatan',
      'Link Chart',
      'Waktu Dicatat'
    ]

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""'
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    }

    const rows = trades.value.map(t => [
      t.tradeNumber,
      escapeCsv(t.date),
      escapeCsv(t.pair),
      escapeCsv(t.direction),
      escapeCsv(t.session || 'London'),
      escapeCsv(t.result),
      t.rMultiple,
      t.pnl,
      t.balanceAfter,
      escapeCsv(t.setup || ''),
      escapeCsv(t.notes || ''),
      escapeCsv(t.chartUrl || ''),
      escapeCsv(t.created_at || ''),
    ])

    // Prepend UTF-8 BOM (\uFEFF) for seamless Excel UTF-8 support
    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `spaceos_backtest_${activePair.value || 'all'}_${timestamp}.csv`

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)

    toast.success('Export Berhasil', `File ${filename} berhasil diunduh.`)
  }

  return {
    trades,
    settings,
    tradingPlan,
    isLoaded,
    isSyncing,
    isCloudSynced,
    syncError,
    stats,
    equityCurve,
    activePair,
    activeDirection,
    activeSession,
    addQuickTrade,
    addCustomTrade,
    updateTrade,
    deleteTrade,
    undoLastTrade,
    resetBacktest,
    updateSettings,
    updateTradingPlan,
    recomputeAllTrades,
    syncWithSupabase,
    exportToCsv,
  }
}
