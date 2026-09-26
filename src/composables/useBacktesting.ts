import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

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


/* ============================================================
   Composable Definition
   ============================================================ */
export function useBacktesting() {
  const authStore = useAuthStore()
  const { currentSpace } = storeToRefs(authStore)
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

  // Rapid form sticky inputs (remembers last choice for maximum speed)
  const activePair = ref<string>('XAUUSD')
  const activeDirection = ref<BacktestDirection>('BUY')
  const activeSession = ref<string>('London')

  /* ============================================================
     Load & Save State
     ============================================================ */
  function loadFromStorage() {
    try {
      // 1. Settings
      const savedSettings = localStorage.getItem(settingsKey.value)
      if (savedSettings) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }
      } else {
        settings.value = { ...DEFAULT_SETTINGS }
      }

      // 2. Trading Plan
      const savedPlan = localStorage.getItem(planKey.value)
      if (savedPlan) {
        tradingPlan.value = { ...DEFAULT_TRADING_PLAN, ...JSON.parse(savedPlan) }
      } else {
        tradingPlan.value = { ...DEFAULT_TRADING_PLAN }
      }

      // 3. Trades
      const savedTrades = localStorage.getItem(tradesKey.value)
      if (savedTrades) {
        const parsed = JSON.parse(savedTrades)
        if (Array.isArray(parsed)) {
          trades.value = parsed
        }
      } else {
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

  // Watch for space change to reload scoped data
  watch(spaceId, () => {
    loadFromStorage()
  }, { immediate: true })

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
        id: t.id || `bt-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
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

  /**
   * Recalculates all balances whenever settings (initial balance / risk) change
   */
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

    // Consecutive calculations
    let currentWinStreak = 0
    let maxWinStreak = 0
    let currentLossStreak = 0
    let maxLossStreak = 0

    // Drawdown calculation
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

      // Track Peak & Drawdown
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

    // Expectancy
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
     Equity Curve Data Points for Chart / Visual Curve
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
     Fast Trade Entry Methods (SPEED IS KING)
     ============================================================ */

  /**
   * One-Click Instant Trade Add
   * Takes 1 single click to record a trade during fast backtesting!
   */
  function addQuickTrade(
    result: BacktestResult,
    rMultiple: number,
    setup?: string,
    notes?: string,
    chartUrl?: string
  ) {
    const newTrade: Partial<BacktestTrade> = {
      pair: activePair.value || 'XAUUSD',
      direction: activeDirection.value || 'BUY',
      session: activeSession.value || 'London',
      date: new Date().toISOString().split('T')[0],
      result,
      rMultiple,
      setup: setup || '',
      notes: notes || '',
      chartUrl: chartUrl || '',
    }

    const updatedList = [...trades.value, newTrade]
    recalculateAndSetTrades(updatedList)

    // Notify user with concise feedback
    const sign = rMultiple > 0 ? '+' : ''
    const msg = `Trade #${trades.value.length}: ${newTrade.pair} (${sign}${rMultiple}R ${result})`
    if (result === 'WIN') {
      toast.success('Trade Win Tersimpan', msg)
    } else if (result === 'LOSS') {
      toast.warning('Trade Loss Tercatat', msg)
    } else {
      toast.info('Trade Breakeven Tercatat', msg)
    }
  }

  /**
   * Add trade with full or custom parameters
   */
  function addCustomTrade(data: Partial<BacktestTrade>) {
    const updatedList = [...trades.value, data]
    recalculateAndSetTrades(updatedList)
    toast.success('Trade Tersimpan', `Trade #${trades.value.length} berhasil ditambahkan!`)
  }

  /**
   * Edit existing trade inline
   */
  function updateTrade(id: string, updates: Partial<BacktestTrade>) {
    const idx = trades.value.findIndex(t => t.id === id)
    if (idx === -1) return

    const updatedList = [...trades.value]
    updatedList[idx] = { ...updatedList[idx], ...updates }
    recalculateAndSetTrades(updatedList)

    toast.info('Trade Diperbarui', 'Perubahan trade berhasil disimpan.')
  }

  /**
   * Delete specific trade
   */
  function deleteTrade(id: string) {
    const filtered = trades.value.filter(t => t.id !== id)
    recalculateAndSetTrades(filtered)
    toast.info('Trade Dihapus', 'Trade telah dihapus dari log backtest.')
  }

  /**
   * Delete latest trade (Undo last trade)
   */
  function undoLastTrade() {
    if (trades.value.length === 0) return
    const popped = trades.value.slice(0, -1)
    recalculateAndSetTrades(popped)
    toast.info('Undo Berhasil', 'Trade terakhir telah dibatalkan.')
  }

  /**
   * Reset all backtest trades to zero
   */
  function resetBacktest(newInitialBalance?: number) {
    if (newInitialBalance !== undefined && newInitialBalance > 0) {
      settings.value.initialBalance = newInitialBalance
      persistSettings()
    }
    trades.value = []
    persistTrades()
    toast.info('Reset Selesai', 'Log backtesting berhasil di-reset ke saldo awal.')
  }



  /**
   * Update Settings
   */
  function updateSettings(newSettings: Partial<BacktestSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    persistSettings()
    recomputeAllTrades()
    toast.success('Pengaturan Disimpan', 'Saldo awal & risiko backtest berhasil diperbarui.')
  }

  /**
   * Update Trading Plan
   */
  function updateTradingPlan(newPlan: Partial<TradingPlan>) {
    tradingPlan.value = {
      ...tradingPlan.value,
      ...newPlan,
      updated_at: new Date().toISOString(),
    }
    persistPlan()
    toast.success('Trading Plan Disimpan', 'Strategi & aturan trading berhasil diperbarui!')
  }

  return {
    trades,
    settings,
    tradingPlan,
    isLoaded,
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
  }
}
