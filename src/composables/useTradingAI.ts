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
    // Session breakdown (Asia: 0-7 UTC, London: 7-13 UTC, NY: 13-21 UTC, Off-hours: 21-24 UTC)
    const sessionStats: Record<string, { count: number; pnl: number; wins: number }> = {
      'Asia (Tokyo)': { count: 0, pnl: 0, wins: 0 },
      'London (Europe)': { count: 0, pnl: 0, wins: 0 },
      'New York (US)': { count: 0, pnl: 0, wins: 0 },
      'Off-hours': { count: 0, pnl: 0, wins: 0 },
    }
    // Lot sizing metrics
    const lotSizes: number[] = []

    recentTrades.forEach(t => {
      // Pair
      if (!pairStats[t.pair]) pairStats[t.pair] = { count: 0, pnl: 0, wins: 0 }
      pairStats[t.pair].count++
      pairStats[t.pair].pnl += t.pnl || 0
      if ((t.pnl || 0) > 0) pairStats[t.pair].wins++

      // Session
      const dateObj = new Date(t.date)
      const hourUTC = isNaN(dateObj.getTime()) ? 14 : dateObj.getUTCHours()
      let sessionName = 'Off-hours'
      if (hourUTC >= 0 && hourUTC < 7) sessionName = 'Asia (Tokyo)'
      else if (hourUTC >= 7 && hourUTC < 13) sessionName = 'London (Europe)'
      else if (hourUTC >= 13 && hourUTC < 21) sessionName = 'New York (US)'

      sessionStats[sessionName].count++
      sessionStats[sessionName].pnl += t.pnl || 0
      if ((t.pnl || 0) > 0) sessionStats[sessionName].wins++

      // Lot size
      if (t.lot_size && t.lot_size > 0) {
        lotSizes.push(t.lot_size)
      }
    })

    const avgLot = lotSizes.length > 0 ? (lotSizes.reduce((a, b) => a + b, 0) / lotSizes.length).toFixed(2) : '0.10'
    const maxLot = lotSizes.length > 0 ? Math.max(...lotSizes).toFixed(2) : '0.10'
    const minLot = lotSizes.length > 0 ? Math.min(...lotSizes).toFixed(2) : '0.10'
    const hasLotSpike = Number(maxLot) > Number(avgLot) * 2

    const pairSummary = Object.entries(pairStats)
      .map(([pair, s]) => `${pair}: ${s.count} trades, Net PnL: $${s.pnl.toFixed(2)} (${((s.wins / s.count) * 100).toFixed(0)}% WR)`)
      .join('\n')

    const sessionSummary = Object.entries(sessionStats)
      .filter(([_, s]) => s.count > 0)
      .map(([session, s]) => `${session}: ${s.count} trades, Net PnL: $${s.pnl.toFixed(2)} (${((s.wins / s.count) * 100).toFixed(0)}% WR)`)
      .join('\n')

    // Emotion & Mistake breakdown
    const emotionStats: Record<string, { count: number; lossCount: number; netPnL: number }> = {}
    recentTrades.forEach(t => {
      const ems = t.emotions?.length > 0 ? t.emotions : ['Neutral']
      ems.forEach(em => {
        if (!emotionStats[em]) emotionStats[em] = { count: 0, lossCount: 0, netPnL: 0 }
        emotionStats[em].count++
        emotionStats[em].netPnL += t.pnl || 0
        if ((t.pnl || 0) < 0) emotionStats[em].lossCount++
      })
    })

    const prompt = `Analisis 20 trade terakhir trader ini secara institusional:
Total Trades: ${totalCount}
Win Rate: ${winRate}%
Total Net PnL: $${totalPnL.toFixed(2)}
Lot Sizing: Min ${minLot}, Avg ${avgLot}, Max ${maxLot} (Lot Spike Detected: ${hasLotSpike ? 'YES' : 'NO'})
Session Breakdown:\n${sessionSummary}
Pair Breakdown:\n${pairSummary}
Emosi & Dampak Kerugian:\n${JSON.stringify(emotionStats, null, 2)}`

    const systemPrompt = `Anda adalah AI Trading Performance Coach profesional level institusional (Hedge Fund Risk Manager & Trading Psychologist). Berikan analisis mendalam, tajam, dan konstruktif dalam format Markdown yang rapi dengan poin-poin actionable meliputi: Edge & Winrate, Analisis Sesi Waktu (Asia/London/NY), Disiplin Lot Sizing, Korelasi Emosi-Drawdown, dan 3 Rekomendasi Konkret.`

    // Intelligent Offline Generator
    const offlineGenerator = () => {
      const sortedPairs = Object.entries(pairStats).sort((a, b) => b[1].pnl - a[1].pnl)
      const bestPair = sortedPairs[0] ? sortedPairs[0][0] : 'XAU/USD'
      const worstPair = sortedPairs.length > 1 ? sortedPairs[sortedPairs.length - 1][0] : 'EUR/USD'

      const sortedSessions = Object.entries(sessionStats).filter(([_, s]) => s.count > 0).sort((a, b) => b[1].pnl - a[1].pnl)
      const bestSession = sortedSessions[0] ? sortedSessions[0][0] : 'London (Europe)'
      const worstSession = sortedSessions.length > 1 ? sortedSessions[sortedSessions.length - 1][0] : 'Asia (Tokyo)'

      let toxicEmotion = ''
      let highestLossRate = 0
      Object.entries(emotionStats).forEach(([em, s]) => {
        const lossRate = (s.lossCount / s.count) * 100
        if (s.count >= 2 && lossRate > highestLossRate) {
          highestLossRate = lossRate
          toxicEmotion = em
        }
      })

      return `## 🧠 Laporan Analisis AI Trading Coach (Institusional)

### 1. 📊 Pola Win Rate & Profitabilitas
* **Evaluasi Win Rate:** Win rate Anda berada di **${winRate}%** pada ${totalCount} trade terakhir dengan Net PnL **$${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}**.
* **Ekspektansi Sistem:** ${
        Number(winRate) >= 50
          ? 'Sistem trading Anda memiliki statistical edge positif. Pertahankan kesabaran menunggu setup konfirmasi dan biarkan posisi profitable mencapai target R:R penuh.'
          : 'Win rate saat ini di bawah 50%. Pastikan Risk to Reward Ratio (R:R) minimal 1:2 dan pangkas kerugian dengan cepat (cut loss segera saat skenario invalidated).'
      }

---

### 2. 🌍 Analisis Per-Sesi (Asia vs London vs New York)
* 🌟 **Sesi Terbaik:** **${bestSession}** (${sessionStats[bestSession]?.count || 0} trades, Net PnL: $${sessionStats[bestSession]?.pnl.toFixed(2) || '0.00'}) — Likuiditas dan volatilitas pada sesi ini sangat sesuai dengan karakteristik entry Anda.
* ⚠️ **Sesi Berisiko:** **${worstSession}** (${sessionStats[worstSession]?.count || 0} trades) — Sesi ini kerap menyumbang false breakout atau slippage. Disarankan kurangi frekuensi trade di sesi ini.

---

### 3. ⚖️ Manajemen Lot Sizing & Risiko Akun
* **Profil Ukuran Lot:** Min: **${minLot}**, Rata-rata: **${avgLot}**, Max: **${maxLot}**.
* **Konsistensi Risiko:** ${
        hasLotSpike
          ? `⚠️ **Peringatan Lot Sizing Spike!** Terdeteksi trade dengan lot hingga **${maxLot}** (>2x rata-rata). Ini mengindikasikan lonjakan risiko impulsif atau usaha balas dendam (revenge trading). Wajib standarisasi risiko maksimal 1-2% modal per trade.`
          : `✅ **Lot Sizing Disiplin:** Ukuran lot Anda konsisten di kisaran rata-rata ${avgLot}, menjaga kurva ekuitas akun dari lonjakan drawdown tak terduga.`
      }

---

### 4. 🧘 Korelasi Psikologi & Emosi Terhadap Drawdown
* ${
        toxicEmotion
          ? `**Emosi Paling Berisiko (${toxicEmotion}):** Menghasilkan **${highestLossRate.toFixed(0)}% kerugian** dengan drawdown $${emotionStats[toxicEmotion].netPnL.toFixed(2)}. Emosi ini memicu entry prematur sebelum candle close.`
          : `**Stabilitas Psikologis:** Pola emosi relatif terkendali. Tidak terdeteksi perilaku revenge trading berulang.`
      }
* **Instrumen:** Fokus pada instrumen **${bestPair}** dan kurangi paparan pada **${worstPair}**.

---

### 5. 💡 3 Langkah Rekomendasi Taktis
1. **Rule 1% Risk Rule:** Kunci ukuran lot maksimal Anda agar tidak melebihi persentase risiko tetap per posisi.
2. **Prioritas Sesi ${bestSession}:** Alokasikan fokus eksekusi terbaik Anda pada window waktu likuiditas prima ini.
3. **Cooling-down Protocol:** Jika mengalami 2 loss berurutan pada satu sesi, kunci terminal trading minimal selama 2 jam.`
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
