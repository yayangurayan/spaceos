import { ref } from 'vue'
import { useAI } from '@/composables/useAI'
import type { Trade } from '@/types'

export function useTradingAI() {
  const { isLoading, error, generateAIResponse } = useAI()
  const isAnalyzing = ref(false)

  /* ============================
     1. Full Journal AI Coach Analysis
     ============================ */
  async function analyzeTrades(trades: Trade[]): Promise<string> {
    isAnalyzing.value = true

    const recentTrades = trades.slice(0, 20)
    const totalCount = recentTrades.length
    const wins = recentTrades.filter(t => (t.pnl || 0) > 0)
    const winRate = totalCount > 0 ? ((wins.length / totalCount) * 100).toFixed(1) : '0'
    const totalPnL = recentTrades.reduce((acc, t) => acc + (t.pnl || 0), 0)

    // Pair breakdown
    const pairStats: Record<string, { count: number; pnl: number; wins: number }> = {}
    recentTrades.forEach(t => {
      if (!pairStats[t.pair]) pairStats[t.pair] = { count: 0, pnl: 0, wins: 0 }
      pairStats[t.pair].count++
      pairStats[t.pair].pnl += t.pnl || 0
      if ((t.pnl || 0) > 0) pairStats[t.pair].wins++
    })

    const pairSummary = Object.entries(pairStats)
      .map(([pair, s]) => `${pair}: ${s.count} trades, Net PnL: $${s.pnl.toFixed(2)} (${((s.wins / s.count) * 100).toFixed(0)}% WR)`)
      .join('\n')

    // Emotion breakdown
    const emotionStats: Record<string, { count: number; lossCount: number }> = {}
    recentTrades.forEach(t => {
      const ems = t.emotions?.length > 0 ? t.emotions : ['Neutral']
      ems.forEach(em => {
        if (!emotionStats[em]) emotionStats[em] = { count: 0, lossCount: 0 }
        emotionStats[em].count++
        if ((t.pnl || 0) < 0) emotionStats[em].lossCount++
      })
    })

    const prompt = `Analisis 20 trade terakhir trader ini:
Total Trades: ${totalCount}
Win Rate: ${winRate}%
Total Net PnL: $${totalPnL.toFixed(2)}
Pair Breakdown:\n${pairSummary}
Emosi:\n${JSON.stringify(emotionStats, null, 2)}`

    const systemPrompt = `Anda adalah AI Trading Performance Coach profesional level institusi (Hedge Fund Risk Manager & Psychology Coach). Berikan analisis mendalam, tajam, dan konstruktif dalam format Markdown yang rapi dengan poin-poin actionable.`

    // Intelligent Offline Generator
    const offlineGenerator = () => {
      const sortedPairs = Object.entries(pairStats).sort((a, b) => b[1].pnl - a[1].pnl)
      const bestPair = sortedPairs[0] ? sortedPairs[0][0] : 'XAU/USD'
      const worstPair = sortedPairs.length > 1 ? sortedPairs[sortedPairs.length - 1][0] : 'EUR/USD'

      let fomoLossRate = '0'
      if (emotionStats['FOMO']) {
        fomoLossRate = ((emotionStats['FOMO'].lossCount / emotionStats['FOMO'].count) * 100).toFixed(0)
      }

      return `## 🧠 Laporan Analisis AI Trading Coach

### 1. 📊 Pola Win Rate & Profitabilitas
* **Evaluasi Win Rate:** Win rate Anda berada di **${winRate}%** pada ${totalCount} trade terakhir dengan Net PnL **$${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}**.
* **Ekspektansi Sistem:** ${
        Number(winRate) >= 50
          ? 'Sistem trading Anda memiliki edge statistik yang positif. Fokus pada konsistensi eksekusi dan membiarkan profit running hingga target TP optimal.'
          : 'Win rate saat ini di bawah 50%. Pastikan Risk to Reward Ratio (R:R) minimal 1:2 untuk menjaga profitabilitas jangka panjang.'
      }

---

### 2. 🎯 Instrumen Terbaik vs Perlu Evaluasi
* 🏆 **Best Performer:** **${bestPair}** menghasilkan performa paling konsisten dengan win rate tertinggi. Pertahankan fokus setup A+ pada instrumen ini.
* ⚠️ **Underperformer:** **${worstPair}** menyumbang drawdown terbesar. Evaluasi volatilitas sesi atau kurangi ukuran lot saat trading di pair ini.

---

### 3. 🧘 Korelasi Psikologi & Emosi
* ${
        emotionStats['FOMO']
          ? `**Pola FOMO:** Terdeteksi ${emotionStats['FOMO'].count} trade dengan emosi FOMO (${fomoLossRate}% berujung kerugian). Ini menandakan Anda sering mengejar harga yang sudah bergerak jauh tanpa konfirmasi retest.`
          : `**Disiplin Eksekusi:** Anda menjaga emosi tetap stabil tanpa indikasi revenge trading yang impulsif.`
      }
* **Rekomendasi:** Terapkan checklist pre-flight wajib: minimal 3 konfirmasi teknikal sebelum klik tombol buy/sell.

---

### 4. 💡 3 Langkah Rekomendasi Mingguan
1. **Perketat Batas Stop Loss:** Jangan pernah menggeser SL menjauh saat harga bergerak berlawanan arah.
2. **Fokus pada Sesi Likuiditas Tinggi:** Hindari membuka posisi baru di akhir sesi New York (low volume).
3. **Daily Loss Limit:** Jika mengalami 2 loss berturut-turut dalam satu hari, tutup terminal dan lakukan evaluasi jurnal.`
    }

    try {
      const response = await generateAIResponse(
        prompt,
        systemPrompt,
        `trading_coach_${recentTrades[0]?.id || 'latest'}`,
        offlineGenerator
      )
      return response
    } finally {
      isAnalyzing.value = false
    }
  }

  /* ============================
     2. Real-time Inline Suggestions
     ============================ */
  function getLiveTradeSuggestion(params: {
    entryPrice: number
    stopLoss: number
    takeProfit: number
    position: 'BUY' | 'SELL'
    lotSize: number
    recentTrades: Trade[]
  }): { message: string; type: 'warning' | 'info' | 'success'; title: string } | null {
    const { entryPrice, stopLoss, takeProfit, position, recentTrades } = params

    // 1. Check Loss Streak
    const last3 = recentTrades.slice(0, 3)
    if (last3.length === 3 && last3.every(t => (t.pnl || 0) < 0)) {
      return {
        title: '⚠️ Peringatan Loss Streak',
        message: 'Anda mengalami 3 loss berturut-turut hari ini. Pertimbangkan istirahat sejenak untuk menghindari revenge trading.',
        type: 'warning',
      }
    }

    // 2. Check R:R Ratio
    if (entryPrice > 0 && stopLoss > 0 && takeProfit > 0) {
      let risk = 0
      let reward = 0

      if (position === 'BUY') {
        risk = entryPrice - stopLoss
        reward = takeProfit - entryPrice
      } else {
        risk = stopLoss - entryPrice
        reward = entryPrice - takeProfit
      }

      if (risk > 0 && reward > 0) {
        const rr = reward / risk
        if (rr < 1.0) {
          return {
            title: '⚠️ Risk to Reward Rendah',
            message: `R:R ratio setup ini hanya 1:${rr.toFixed(2)}. Disarankan minimal 1:1.5 untuk menjaga ekspektansi profit jangka panjang.`,
            type: 'warning',
          }
        } else if (rr >= 2.0) {
          return {
            title: '✨ Setup Berkualitas Tinggi',
            message: `R:R ratio optimal 1:${rr.toFixed(2)}. Setup memenuhi kriteria manajemen risiko ideal.`,
            type: 'success',
          }
        }
      }
    }

    return null
  }

  return {
    isLoading,
    isAnalyzing,
    error,
    analyzeTrades,
    getLiveTradeSuggestion,
  }
}
