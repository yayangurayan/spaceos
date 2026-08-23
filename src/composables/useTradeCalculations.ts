import type { TradePosition, TradeStatus } from '@/types'

/**
 * Common Forex / Indices / Commodity Pip Multipliers
 */
export function getPipMultiplier(pair: string): number {
  const p = (pair || '').toUpperCase().replace(/[\/\-_]/g, '')
  if (p.includes('JPY')) return 100 // 0.01 = 1 pip
  if (p.includes('XAU') || p.includes('GOLD')) return 10 // 0.10 = 1 pip (or 1 point)
  if (p.includes('BTC') || p.includes('ETH') || p.includes('US30') || p.includes('NAS') || p.includes('SPX')) return 1
  return 10000 // 0.0001 = 1 pip for standard forex pairs (EURUSD, GBPUSD, etc.)
}

/**
 * Standard Lot contract size per asset class
 */
export function getContractMultiplier(pair: string): number {
  const p = (pair || '').toUpperCase().replace(/[\/\-_]/g, '')
  if (p.includes('XAU') || p.includes('GOLD')) return 100 // 100 oz per standard lot
  if (p.includes('BTC') || p.includes('ETH') || p.includes('US30') || p.includes('NAS')) return 1
  return 100000 // 100,000 base currency for forex
}

/**
 * Number of decimal places to show for a pair
 */
export function getPriceDecimals(pair: string): number {
  const p = (pair || '').toUpperCase().replace(/[\/\-_]/g, '')
  if (p.includes('JPY')) return 3
  if (p.includes('XAU') || p.includes('GOLD')) return 2
  if (p.includes('BTC') || p.includes('ETH') || p.includes('US30') || p.includes('NAS')) return 2
  return 5
}

/**
 * Calculate Pips gain or loss
 */
export function calculatePips(
  entry: number | null | undefined,
  exit: number | null | undefined,
  pair: string,
  position: TradePosition
): number | null {
  if (entry == null || exit == null || isNaN(entry) || isNaN(exit)) return null
  const multiplier = getPipMultiplier(pair)
  const diff = position === 'BUY' ? exit - entry : entry - exit
  return Math.round(diff * multiplier * 10) / 10
}

/**
 * Calculate estimated P&L in USD
 */
export function calculatePnl(
  entry: number | null | undefined,
  exit: number | null | undefined,
  lotSize: number | null | undefined,
  position: TradePosition,
  pair: string
): number | null {
  if (
    entry == null ||
    exit == null ||
    lotSize == null ||
    isNaN(entry) ||
    isNaN(exit) ||
    isNaN(lotSize) ||
    lotSize <= 0
  ) {
    return null
  }

  const p = (pair || '').toUpperCase().replace(/[\/\-_]/g, '')
  const priceDiff = position === 'BUY' ? exit - entry : entry - exit

  // Commodity / Index / Crypto calculation
  if (p.includes('XAU') || p.includes('GOLD')) {
    // 1 lot of XAU = 100 oz -> $1 move = $100 with 1 lot
    return Math.round(priceDiff * 100 * lotSize * 100) / 100
  }

  if (p.includes('BTC') || p.includes('ETH') || p.includes('US30') || p.includes('NAS')) {
    return Math.round(priceDiff * lotSize * 100) / 100
  }

  if (p.includes('JPY')) {
    // JPY pairs: (diff in JPY * 100,000 * lotSize) / exit price
    const jpyAmount = priceDiff * 100000 * lotSize
    return Math.round((jpyAmount / exit) * 100) / 100
  }

  // Standard Forex pairs: (exit - entry) * 100,000 * lotSize
  return Math.round(priceDiff * 100000 * lotSize * 100) / 100
}

/**
 * Calculate Risk to Reward ratio
 */
export function calculateRR(
  entry: number | null | undefined,
  exit: number | null | undefined,
  stopLoss: number | null | undefined,
  takeProfit: number | null | undefined,
  position: TradePosition
): number | null {
  if (entry == null || isNaN(entry)) return null

  // If Stop Loss is provided, calculate Risk distance
  if (stopLoss != null && !isNaN(stopLoss)) {
    const riskDistance = Math.abs(entry - stopLoss)
    if (riskDistance === 0) return null

    // If exit price is available, calculate actual realized R:R
    if (exit != null && !isNaN(exit)) {
      const rewardDistance = position === 'BUY' ? exit - entry : entry - exit
      return Math.round((rewardDistance / riskDistance) * 100) / 100
    }

    // Otherwise calculate planned R:R from TP
    if (takeProfit != null && !isNaN(takeProfit)) {
      const plannedReward = position === 'BUY' ? takeProfit - entry : entry - takeProfit
      return Math.round((plannedReward / riskDistance) * 100) / 100
    }
  }

  return null
}

/**
 * Determine trade status based on exit and P&L
 */
export function determineStatus(
  exit: number | null | undefined,
  pnl: number | null | undefined
): TradeStatus {
  if (exit == null || isNaN(exit) || pnl == null || isNaN(pnl)) return 'Open'
  if (pnl > 0.01) return 'Win'
  if (pnl < -0.01) return 'Loss'
  return 'Breakeven'
}

/**
 * Formatting utilities
 */
export function formatPrice(price: number | null | undefined, pair: string): string {
  if (price == null || isNaN(price)) return '-'
  const decimals = getPriceDecimals(pair)
  return price.toFixed(decimals)
}

export function formatPnl(pnl: number | null | undefined, prefix = '$'): string {
  if (pnl == null || isNaN(pnl)) return '-'
  const sign = pnl > 0 ? '+' : pnl < 0 ? '-' : ''
  const absVal = Math.abs(pnl).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${sign}${prefix}${absVal}`
}

export function formatPips(pips: number | null | undefined): string {
  if (pips == null || isNaN(pips)) return '-'
  const sign = pips > 0 ? '+' : ''
  return `${sign}${pips.toFixed(1)} pips`
}

export function formatRR(rr: number | null | undefined): string {
  if (rr == null || isNaN(rr)) return '-'
  return `1:${rr >= 0 ? rr.toFixed(2) : `(${Math.abs(rr).toFixed(2)})`}`
}

export function useTradeCalculations() {
  return {
    getPipMultiplier,
    getPriceDecimals,
    calculatePips,
    calculatePnl,
    calculateRR,
    determineStatus,
    formatPrice,
    formatPnl,
    formatPips,
    formatRR,
  }
}
