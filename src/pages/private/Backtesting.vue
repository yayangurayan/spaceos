<template>
  <div class="space-y-6 animate-fade-in w-full max-w-full pb-12">
    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-2xl sm:text-3xl">🔬</span>
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Backtesting Engine & Strategy Lab
          </h1>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Speed Entry
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-400">
          Uji strategi masa lalu dengan input data super cepat, kalkulasi rasio otomatis, dan saldo awal dinamis.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Settings Button -->
        <button
          type="button"
          @click="isSettingsModalOpen = true"
          class="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
        >
          <span>⚙️</span>
          <span>Saldo & Risiko</span>
          <span class="px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 font-mono text-[10px] font-bold">
            ${{ Number(settings.initialBalance).toLocaleString('en-US') }}
          </span>
        </button>

        <!-- Demo Dataset Button (if empty) -->
        <button
          v-if="trades.length === 0"
          type="button"
          @click="loadDemoDataset"
          class="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 flex items-center gap-1.5 transition-all"
        >
          <span>📥</span>
          <span>Muat Demo</span>
        </button>

        <!-- Export CSV -->
        <button
          v-if="trades.length > 0"
          type="button"
          @click="exportToCsv"
          class="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          title="Download log trade backtest (.csv)"
        >
          <span>📊</span>
          <span class="hidden sm:inline">Export CSV</span>
        </button>

        <!-- Reset Button -->
        <button
          v-if="trades.length > 0"
          type="button"
          @click="confirmReset"
          class="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all flex items-center gap-1.5"
        >
          <span>🗑️</span>
          <span>Reset</span>
        </button>
      </div>
    </div>

    <!-- ============================================================
         1. KEY RATIOS & STATS STRIP
         ============================================================ -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <!-- 1. Saldo Akhir & PnL -->
      <div class="glass rounded-xl p-4 border border-slate-700/60 relative overflow-hidden">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Saldo Akhir</span>
          <span class="text-xs">💰</span>
        </div>
        <div class="text-base sm:text-lg font-mono font-extrabold" :class="stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'">
          ${{ stats.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
        </div>
        <div class="text-[11px] font-mono mt-0.5" :class="stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'">
          {{ stats.netPnl >= 0 ? '+' : '' }}${{ stats.netPnl.toLocaleString('en-US') }} ({{ stats.netPnlPercent >= 0 ? '+' : '' }}{{ stats.netPnlPercent }}%)
        </div>
      </div>

      <!-- 2. Win Rate -->
      <div class="glass rounded-xl p-4 border border-slate-700/60">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Win Rate</span>
          <span class="text-xs">🎯</span>
        </div>
        <div class="text-base sm:text-lg font-mono font-extrabold text-cyan-300">
          {{ stats.winRate }}%
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5 font-mono">
          <span class="text-emerald-400 font-bold">{{ stats.winCount }}W</span> -
          <span class="text-rose-400 font-bold">{{ stats.lossCount }}L</span> -
          <span class="text-slate-400 font-bold">{{ stats.beCount }}BE</span>
        </div>
      </div>

      <!-- 3. Profit Factor -->
      <div class="glass rounded-xl p-4 border border-slate-700/60">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Profit Factor</span>
          <span class="text-xs">⚖️</span>
        </div>
        <div class="text-base sm:text-lg font-mono font-extrabold" :class="stats.profitFactor >= 1.5 ? 'text-emerald-400' : stats.profitFactor >= 1 ? 'text-cyan-300' : 'text-rose-400'">
          {{ stats.profitFactor.toFixed(2) }}
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5 font-mono">
          Gross: ${{ stats.grossProfit.toFixed(0) }} / ${{ stats.grossLoss.toFixed(0) }}
        </div>
      </div>

      <!-- 4. Total Net R & Avg R:R -->
      <div class="glass rounded-xl p-4 border border-slate-700/60">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Total Net R</span>
          <span class="text-xs">📐</span>
        </div>
        <div class="text-base sm:text-lg font-mono font-extrabold" :class="stats.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'">
          {{ stats.totalR >= 0 ? '+' : '' }}{{ stats.totalR }}R
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5 font-mono">
          Avg R:R: <span class="text-cyan-300 font-bold">1:{{ stats.avgRR.toFixed(1) }}</span>
        </div>
      </div>

      <!-- 5. Expectancy per Trade -->
      <div class="glass rounded-xl p-4 border border-slate-700/60">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Expectancy</span>
          <span class="text-xs">✨</span>
        </div>
        <div class="text-base sm:text-lg font-mono font-extrabold" :class="stats.expectancyR >= 0 ? 'text-emerald-400' : 'text-rose-400'">
          {{ stats.expectancyR >= 0 ? '+' : '' }}{{ stats.expectancyR }}R
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5 font-mono">
          {{ stats.expectancyDollar >= 0 ? '+' : '' }}${{ stats.expectancyDollar }} / trade
        </div>
      </div>

      <!-- 6. Max Drawdown -->
      <div class="glass rounded-xl p-4 border border-slate-700/60">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Max Drawdown</span>
          <span class="text-xs">🛡️</span>
        </div>
        <div class="text-base sm:text-lg font-mono font-extrabold text-rose-400">
          -{{ stats.maxDrawdownPercent.toFixed(1) }}%
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5 font-mono">
          -${{ stats.maxDrawdownDollar.toFixed(0) }} (Streak: {{ stats.consecutiveLosses }}L)
        </div>
      </div>
    </div>

    <!-- ============================================================
         2. SPEED LOG: RAPID 1-CLICK ENTRY BAR (SPEED IS KING)
         ============================================================ -->
    <div class="glass rounded-2xl p-5 sm:p-6 border-2 border-cyan-500/40 shadow-xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/40 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚡</span>
          <h2 class="text-base font-bold text-white tracking-tight">Rapid Log (Input 1-Klik Cepat)</h2>
          <span class="text-[11px] text-slate-400 hidden md:inline">
            — Pilih pair, klik tombol hasil, trade langsung tercatat otomatis!
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="isCustomModeOpen = !isCustomModeOpen"
            class="text-xs font-semibold px-2.5 py-1 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            {{ isCustomModeOpen ? '▲ Tutup Detail Kustom' : '▼ Mode Detail & Chart' }}
          </button>

          <button
            v-if="trades.length > 0"
            type="button"
            @click="undoLastTrade"
            class="text-xs font-semibold px-2.5 py-1 rounded-lg text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1"
            title="Hapus trade terakhir yang baru saja diinput"
          >
            <span>↩</span>
            <span class="hidden sm:inline">Undo</span>
          </button>
        </div>
      </div>

      <!-- Quick Selector Controls (Pair, Direction, Session) -->
      <div class="flex flex-wrap items-center gap-4">
        <!-- Pair Pills -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold text-slate-400 mr-1">Pair:</span>
          <button
            v-for="p in ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD', 'US30', 'NAS100']"
            :key="p"
            type="button"
            @click="activePair = p"
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
            :class="activePair === p ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'"
          >
            {{ p }}
          </button>
        </div>

        <!-- Direction Toggle -->
        <div class="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            @click="activeDirection = 'BUY'"
            class="px-3 py-1 rounded-lg text-xs font-bold transition-all"
            :class="activeDirection === 'BUY' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'"
          >
            🟢 BUY / LONG
          </button>
          <button
            type="button"
            @click="activeDirection = 'SELL'"
            class="px-3 py-1 rounded-lg text-xs font-bold transition-all"
            :class="activeDirection === 'SELL' ? 'bg-rose-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'"
          >
            🔴 SELL / SHORT
          </button>
        </div>

        <!-- Session Pills -->
        <div class="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            v-for="s in ['London', 'New York', 'Asia']"
            :key="s"
            type="button"
            @click="activeSession = s"
            class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
            :class="activeSession === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- ONE-CLICK OUTCOME BUTTONS (INSTANT LOGGING) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
        <!-- +3R Win -->
        <button
          type="button"
          @click="handleQuickLog('WIN', 3.0)"
          class="group py-3 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-md shadow-emerald-500/5 hover:shadow-emerald-500/20"
        >
          <span class="text-xs font-bold group-hover:scale-110 transition-transform">🚀 +3.0 R</span>
          <span class="text-[10px] text-emerald-400/80 font-mono">Win Besar</span>
        </button>

        <!-- +2R Win (Most Standard TP) -->
        <button
          type="button"
          @click="handleQuickLog('WIN', 2.0)"
          class="group py-3 px-3 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border-2 border-emerald-500/60 hover:border-emerald-400 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30"
        >
          <span class="text-sm font-extrabold group-hover:scale-110 transition-transform">🎯 +2.0 R</span>
          <span class="text-[10px] text-emerald-300 font-mono">Target Standar</span>
        </button>

        <!-- +1.5R Win -->
        <button
          type="button"
          @click="handleQuickLog('WIN', 1.5)"
          class="group py-3 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-md shadow-emerald-500/5"
        >
          <span class="text-xs font-bold group-hover:scale-110 transition-transform">✓ +1.5 R</span>
          <span class="text-[10px] text-emerald-400/80 font-mono">Win Menengah</span>
        </button>

        <!-- +1R Win -->
        <button
          type="button"
          @click="handleQuickLog('WIN', 1.0)"
          class="group py-3 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
        >
          <span class="text-xs font-bold group-hover:scale-110 transition-transform">✓ +1.0 R</span>
          <span class="text-[10px] text-emerald-400/80 font-mono">TP 1 / Scalp</span>
        </button>

        <!-- -1R Loss (Discipline Stop Loss) -->
        <button
          type="button"
          @click="handleQuickLog('LOSS', -1.0)"
          class="group py-3 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border-2 border-rose-500/50 hover:border-rose-400 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-lg shadow-rose-500/10"
        >
          <span class="text-sm font-extrabold group-hover:scale-110 transition-transform">🛑 -1.0 R</span>
          <span class="text-[10px] text-rose-300 font-mono">Hit Stop Loss</span>
        </button>

        <!-- 0R Breakeven -->
        <button
          type="button"
          @click="handleQuickLog('BE', 0.0)"
          class="group py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-500 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
        >
          <span class="text-xs font-bold group-hover:scale-110 transition-transform">⚪ 0.0 R</span>
          <span class="text-[10px] text-slate-400 font-mono">Breakeven (BE)</span>
        </button>
      </div>

      <!-- EXPANDABLE: Custom / Detailed Inputs (Setup tag, custom R, chart preview link, notes) -->
      <transition name="fade">
        <div v-if="isCustomModeOpen" class="pt-3 border-t border-slate-800 space-y-3 bg-slate-950/40 p-4 rounded-xl">
          <div class="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span>📝</span>
            <span>Detail Tambahan & Lampiran Setup (Opsional)</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Custom Pair -->
            <div>
              <label class="block text-[10px] font-semibold text-slate-400 mb-1">Pair Kustom</label>
              <input
                v-model="customPairInput"
                type="text"
                class="input-field w-full text-xs font-mono"
                placeholder="Misal: AUDUSD, USDJPY"
              />
            </div>

            <!-- Custom R -->
            <div>
              <label class="block text-[10px] font-semibold text-slate-400 mb-1">Kustom Nilai R-Multiple</label>
              <input
                v-model.number="customRInput"
                type="number"
                step="0.1"
                class="input-field w-full text-xs font-mono"
                placeholder="Misal: 2.8 atau -0.8"
              />
            </div>

            <!-- Setup Tag -->
            <div>
              <label class="block text-[10px] font-semibold text-slate-400 mb-1">Setup / Alasan Entri</label>
              <input
                v-model="customSetupInput"
                type="text"
                class="input-field w-full text-xs"
                placeholder="Misal: Asian Sweep + FVG M5"
              />
            </div>

            <!-- Google Drive / Chart URL -->
            <div>
              <label class="block text-[10px] font-semibold text-slate-400 mb-1">Link Chart (Google Drive)</label>
              <input
                v-model="customChartUrlInput"
                type="text"
                class="input-field w-full text-xs font-mono"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          <!-- Notes & Save Button -->
          <div class="flex flex-col sm:flex-row items-center gap-2">
            <input
              v-model="customNotesInput"
              type="text"
              class="input-field flex-1 text-xs"
              placeholder="Catatan psikologi atau eksekusi trade (tekan Enter untuk simpan)..."
              @keyup.enter="handleCustomSubmit"
            />
            <button
              type="button"
              @click="handleCustomSubmit"
              class="btn-primary px-5 py-2 rounded-xl text-xs font-bold shrink-0 w-full sm:w-auto shadow-md"
            >
              + Simpan Trade Kustom
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- ============================================================
         3. VISUAL EQUITY CURVE (DYNAMIC SVG CHART)
         ============================================================ -->
    <div class="glass rounded-2xl p-5 sm:p-6 border border-slate-700/60 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">📈</span>
          <h2 class="text-base font-bold text-white tracking-tight">Kurva Pertumbuhan Saldo (Equity Curve)</h2>
          <span class="text-xs text-slate-400 font-mono">
            ({{ trades.length }} Trades Selesai)
          </span>
        </div>

        <div class="flex items-center gap-3 text-xs font-mono">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-0.5 bg-slate-500 border-dashed"></span>
            <span class="text-slate-400">Modal Awal: ${{ Number(settings.initialBalance).toLocaleString('en-US') }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-0.5" :class="stats.netPnl >= 0 ? 'bg-emerald-400' : 'bg-rose-400'"></span>
            <span :class="stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              Saldo: ${{ stats.currentBalance.toLocaleString('en-US') }}
            </span>
          </div>
        </div>
      </div>

      <!-- SVG Chart Viewport -->
      <div class="relative w-full h-56 sm:h-64 bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
        <svg
          v-if="chartData.points.length > 1"
          class="w-full h-full overflow-visible"
          viewBox="0 0 800 240"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="stats.netPnl >= 0 ? '#10b981' : '#f43f5e'" stop-opacity="0.35" />
              <stop offset="100%" :stop-color="stats.netPnl >= 0 ? '#10b981' : '#f43f5e'" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Breakeven Initial Baseline -->
          <line
            x1="0"
            :y1="chartData.baselineY"
            x2="800"
            :y2="chartData.baselineY"
            stroke="#64748b"
            stroke-dasharray="4 4"
            stroke-width="1.5"
            opacity="0.6"
          />

          <!-- Area Gradient Fill -->
          <polygon
            :points="chartData.areaPoints"
            fill="url(#equityGradient)"
          />

          <!-- Equity Line -->
          <polyline
            :points="chartData.polylinePoints"
            fill="none"
            :stroke="stats.netPnl >= 0 ? '#10b981' : '#f43f5e'"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Data Points -->
          <g v-for="(pt, idx) in chartData.points" :key="idx">
            <circle
              :cx="pt.x"
              :cy="pt.y"
              r="4"
              :fill="pt.result === 'WIN' ? '#10b981' : pt.result === 'LOSS' ? '#f43f5e' : '#94a3b8'"
              stroke="#0f172a"
              stroke-width="2"
              class="cursor-pointer hover:r-6 transition-all"
              @mouseenter="hoveredPoint = pt"
              @mouseleave="hoveredPoint = null"
            />
          </g>
        </svg>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <span class="text-3xl block mb-2">📊</span>
          <p class="text-xs sm:text-sm text-slate-300 font-semibold">Belum Ada Trade Tercatat</p>
          <p class="text-[11px] text-slate-500 mt-1 max-w-sm">
            Klik salah satu tombol 1-klik di atas atau muat dataset contoh untuk melihat grafik pertumbuhan akun.
          </p>
          <button
            type="button"
            @click="loadDemoDataset"
            class="mt-3 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
          >
            Muat Dataset Contoh Sekarang
          </button>
        </div>

        <!-- Tooltip overlay on hover -->
        <div
          v-if="hoveredPoint"
          class="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700 px-3 py-2 rounded-xl text-xs shadow-2xl backdrop-blur-sm pointer-events-none flex items-center gap-3 font-mono"
        >
          <div>
            <span class="text-slate-400 text-[10px] block">Trade #{{ hoveredPoint.tradeNum }} ({{ hoveredPoint.pair || 'START' }})</span>
            <span class="font-bold text-white">${{ hoveredPoint.balance.toLocaleString('en-US') }}</span>
          </div>
          <div v-if="hoveredPoint.tradeNum > 0">
            <span class="text-[10px] block" :class="hoveredPoint.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ hoveredPoint.pnl >= 0 ? '+' : '' }}${{ hoveredPoint.pnl }} ({{ hoveredPoint.r >= 0 ? '+' : '' }}{{ hoveredPoint.r }}R)
            </span>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded" :class="hoveredPoint.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400' : hoveredPoint.result === 'LOSS' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'">
              {{ hoveredPoint.result }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         4. EDITABLE TRADING PLAN CARD
         ============================================================ -->
    <TradingPlanCard :show-backtest-link="false" />

    <!-- ============================================================
         5. BACKTEST TRADE LOG TABLE
         ============================================================ -->
    <div class="glass rounded-2xl p-5 sm:p-6 border border-slate-700/60 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/40 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-xl">📋</span>
          <h2 class="text-base font-bold text-white tracking-tight">Log Riwayat Trade Backtest</h2>
          <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
            {{ filteredTrades.length }} Trades
          </span>
        </div>

        <!-- Filters (Result pills & Search) -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Filter Result Pills -->
          <div class="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              v-for="f in ['ALL', 'WIN', 'LOSS', 'BE']"
              :key="f"
              type="button"
              @click="filterResult = f"
              class="px-2.5 py-1 rounded-lg font-bold transition-all"
              :class="filterResult === f ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'"
            >
              {{ f }}
            </button>
          </div>

          <!-- Pair Search / Filter -->
          <input
            v-model="searchQuery"
            type="text"
            class="input-field text-xs py-1.5 px-3 w-36 font-mono"
            placeholder="Cari pair / setup..."
          />
        </div>
      </div>

      <!-- Table Container -->
      <div v-if="filteredTrades.length > 0" class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <th class="py-3 px-3">#</th>
              <th class="py-3 px-3">Tanggal / Sesi</th>
              <th class="py-3 px-3">Pair & Arah</th>
              <th class="py-3 px-3">Setup / Catatan</th>
              <th class="py-3 px-3 text-center">Hasil</th>
              <th class="py-3 px-3 text-right">R-Multiple</th>
              <th class="py-3 px-3 text-right">P&L ($)</th>
              <th class="py-3 px-3 text-right">Saldo</th>
              <th class="py-3 px-3 text-center">Chart</th>
              <th class="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr
              v-for="trade in filteredTrades"
              :key="trade.id"
              class="hover:bg-slate-800/40 transition-colors"
            >
              <!-- Trade # -->
              <td class="py-3 px-3 font-mono font-bold text-slate-400">
                #{{ trade.tradeNumber }}
              </td>

              <!-- Date & Session -->
              <td class="py-3 px-3">
                <div class="text-slate-200 font-mono">{{ trade.date }}</div>
                <div class="text-[10px] text-slate-500">{{ trade.session || 'London' }}</div>
              </td>

              <!-- Pair & Direction -->
              <td class="py-3 px-3">
                <div class="font-mono font-bold text-white">{{ trade.pair }}</div>
                <span
                  class="text-[10px] font-bold px-1.5 py-0.2 rounded"
                  :class="trade.direction === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'"
                >
                  {{ trade.direction }}
                </span>
              </td>

              <!-- Setup & Notes -->
              <td class="py-3 px-3 max-w-xs">
                <div v-if="trade.setup" class="text-cyan-300 font-semibold truncate" :title="trade.setup">
                  {{ trade.setup }}
                </div>
                <div v-if="trade.notes" class="text-[11px] text-slate-400 truncate" :title="trade.notes">
                  {{ trade.notes }}
                </div>
                <div v-if="!trade.setup && !trade.notes" class="text-slate-600 text-[11px] italic">
                  -
                </div>
              </td>

              <!-- Result Badge -->
              <td class="py-3 px-3 text-center">
                <span
                  class="text-[11px] font-bold px-2.5 py-1 rounded-full inline-block"
                  :class="trade.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : trade.result === 'LOSS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-700/60 text-slate-300 border border-slate-600'"
                >
                  {{ trade.result === 'WIN' ? '✓ WIN' : trade.result === 'LOSS' ? '✗ LOSS' : '⚪ BE' }}
                </span>
              </td>

              <!-- R-Multiple -->
              <td class="py-3 px-3 text-right font-mono font-bold text-xs" :class="trade.rMultiple > 0 ? 'text-emerald-400' : trade.rMultiple < 0 ? 'text-rose-400' : 'text-slate-400'">
                {{ trade.rMultiple > 0 ? '+' : '' }}{{ trade.rMultiple }}R
              </td>

              <!-- P&L ($) -->
              <td class="py-3 px-3 text-right font-mono font-bold text-xs" :class="trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-rose-400' : 'text-slate-400'">
                {{ trade.pnl > 0 ? '+' : '' }}${{ trade.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </td>

              <!-- Balance After -->
              <td class="py-3 px-3 text-right font-mono text-slate-300 text-xs">
                ${{ trade.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </td>

              <!-- Chart Preview (GDrive) -->
              <td class="py-3 px-3 text-center">
                <GDriveImagePreview
                  v-if="trade.chartUrl"
                  :url="trade.chartUrl"
                  thumbnail-class="w-8 h-8 rounded-lg mx-auto"
                  :title="`Lihat Chart Trade #${trade.tradeNumber}`"
                />
                <span v-else class="text-slate-600 text-xs">-</span>
              </td>

              <!-- Actions (Delete) -->
              <td class="py-3 px-3 text-center">
                <button
                  type="button"
                  @click="deleteTrade(trade.id)"
                  class="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Hapus Trade"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
        <span class="text-3xl block mb-2">📋</span>
        <p class="text-xs sm:text-sm text-slate-300 font-semibold">Tidak Ada Trade yang Sesuai Filter</p>
        <p class="text-[11px] text-slate-500 mt-1">Coba reset filter atau gunakan tombol Rapid Log di atas untuk menambah trade.</p>
      </div>
    </div>

    <!-- ============================================================
         MODAL: SETTINGS (SALDO AWAL & RISIKO)
         ============================================================ -->
    <teleport to="body">
      <div
        v-if="isSettingsModalOpen"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        @click.self="isSettingsModalOpen = false"
      >
        <div class="glass-modal max-w-lg w-full rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-5 animate-scale-in">
          <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">⚙️</span>
              <h3 class="text-base sm:text-lg font-bold text-white">Pengaturan Saldo Awal & Risiko</h3>
            </div>
            <button
              type="button"
              @click="isSettingsModalOpen = false"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <!-- Saldo Awal (Initial Capital) -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">
                Saldo Awal Akun (Initial Capital)
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  v-model.number="tempSettings.initialBalance"
                  type="number"
                  step="100"
                  min="10"
                  class="input-field w-full pl-8 font-mono text-sm"
                  placeholder="10000"
                />
              </div>

              <!-- Quick Presets -->
              <div class="flex flex-wrap items-center gap-1.5 mt-2">
                <button
                  v-for="amt in [1000, 5000, 10000, 25000, 50000, 100000]"
                  :key="amt"
                  type="button"
                  @click="tempSettings.initialBalance = amt"
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all"
                  :class="tempSettings.initialBalance === amt ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400 hover:text-white'"
                >
                  ${{ amt >= 1000 ? `${amt / 1000}k` : amt }}
                </button>
              </div>
            </div>

            <!-- Risk per Trade -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-semibold text-slate-300">Toleransi Risiko Per 1R</label>
                <div class="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    @click="tempSettings.riskType = 'percent'"
                    class="px-2 py-0.5 rounded font-bold transition-colors"
                    :class="tempSettings.riskType === 'percent' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500'"
                  >
                    % Persen
                  </button>
                  <button
                    type="button"
                    @click="tempSettings.riskType = 'fixed'"
                    class="px-2 py-0.5 rounded font-bold transition-colors"
                    :class="tempSettings.riskType === 'fixed' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500'"
                  >
                    $ Nominal Tetap
                  </button>
                </div>
              </div>

              <div class="relative">
                <span v-if="tempSettings.riskType === 'fixed'" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  v-if="tempSettings.riskType === 'percent'"
                  v-model.number="tempSettings.riskPercent"
                  type="number"
                  step="0.25"
                  min="0.1"
                  max="100"
                  class="input-field w-full pr-8 font-mono text-sm"
                  placeholder="1.0"
                />
                <input
                  v-else
                  v-model.number="tempSettings.fixedRiskAmount"
                  type="number"
                  step="10"
                  min="1"
                  class="input-field w-full pl-8 font-mono text-sm"
                  placeholder="100"
                />
                <span v-if="tempSettings.riskType === 'percent'" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
              </div>

              <div v-if="tempSettings.riskType === 'percent'" class="flex items-center gap-1.5 mt-2">
                <button
                  v-for="p in [0.5, 1.0, 1.5, 2.0, 3.0]"
                  :key="p"
                  type="button"
                  @click="tempSettings.riskPercent = p"
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all"
                  :class="tempSettings.riskPercent === p ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400 hover:text-white'"
                >
                  {{ p }}%
                </button>
              </div>
            </div>

            <!-- Compounding Toggle -->
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-white">Mode Compounding (Bunga Berbunga)</p>
                <p class="text-[10px] text-slate-400">Risiko 1R dihitung dinamis dari saldo berjalan terakhir</p>
              </div>
              <input
                v-model="tempSettings.compounding"
                type="checkbox"
                class="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500/30"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/60">
            <button
              type="button"
              @click="isSettingsModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              @click="saveSettingsAndRecalculate"
              class="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg"
            >
              Simpan & Hitung Ulang
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useBacktesting } from '@/composables/useBacktesting'
import TradingPlanCard from '@/components/trading/TradingPlanCard.vue'
import GDriveImagePreview from '@/components/ui/GDriveImagePreview.vue'

const {
  trades,
  settings,
  stats,
  equityCurve,
  activePair,
  activeDirection,
  activeSession,
  addQuickTrade,
  addCustomTrade,
  deleteTrade,
  undoLastTrade,
  resetBacktest,
  loadDemoDataset,
  updateSettings,
} = useBacktesting()

/* ============================
   UI States
   ============================ */
const isCustomModeOpen = ref(false)
const isSettingsModalOpen = ref(false)
const hoveredPoint = ref<any>(null)
const filterResult = ref('ALL')
const searchQuery = ref('')

// Custom Detailed Inputs
const customPairInput = ref('')
const customRInput = ref<number | null>(null)
const customSetupInput = ref('')
const customChartUrlInput = ref('')
const customNotesInput = ref('')

// Settings Modal Form State
const tempSettings = reactive({
  initialBalance: settings.value.initialBalance,
  riskPercent: settings.value.riskPercent,
  riskType: settings.value.riskType,
  fixedRiskAmount: settings.value.fixedRiskAmount,
  compounding: settings.value.compounding,
  strategyName: settings.value.strategyName,
})

/* ============================
   Filtered Trades Table
   ============================ */
const filteredTrades = computed(() => {
  return trades.value.filter(t => {
    // 1. Result filter
    if (filterResult.value !== 'ALL' && t.result !== filterResult.value) {
      return false
    }
    // 2. Search query filter
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchPair = t.pair.toLowerCase().includes(q)
      const matchSetup = (t.setup || '').toLowerCase().includes(q)
      const matchNotes = (t.notes || '').toLowerCase().includes(q)
      if (!matchPair && !matchSetup && !matchNotes) return false
    }
    return true
  }).slice().reverse() // Show newest first
})

/* ============================
   Equity Curve Chart Coordinates
   ============================ */
const chartData = computed(() => {
  const points = equityCurve.value
  if (points.length <= 1) {
    return { points: [], polylinePoints: '', areaPoints: '', baselineY: 120 }
  }

  // Find min and max balance for scaling
  let minBal = Infinity
  let maxBal = -Infinity

  points.forEach(pt => {
    if (pt.balance < minBal) minBal = pt.balance
    if (pt.balance > maxBal) maxBal = pt.balance
  })

  // Add padding around min and max
  const padding = Math.max((maxBal - minBal) * 0.15, 200)
  const domainMin = Math.max(0, minBal - padding)
  const domainMax = maxBal + padding
  const range = domainMax - domainMin || 1

  const width = 800
  const height = 240
  const padX = 20
  const padY = 20
  const usableWidth = width - padX * 2
  const usableHeight = height - padY * 2

  const mappedPoints = points.map((pt, idx) => {
    const x = padX + (idx / (points.length - 1)) * usableWidth
    // In SVG, y=0 is top, y=height is bottom
    const y = padY + (1 - (pt.balance - domainMin) / range) * usableHeight
    return {
      ...pt,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    }
  })

  // Baseline Y for initial balance
  const initial = Number(settings.value.initialBalance) || 10000
  const baselineY = Math.round((padY + (1 - (initial - domainMin) / range) * usableHeight) * 10) / 10

  const polylinePoints = mappedPoints.map(p => `${p.x},${p.y}`).join(' ')
  const lastPoint = mappedPoints[mappedPoints.length - 1]
  const firstPoint = mappedPoints[0]
  const areaPoints = `${firstPoint.x},${height} ${polylinePoints} ${lastPoint.x},${height}`

  return {
    points: mappedPoints,
    polylinePoints,
    areaPoints,
    baselineY,
  }
})

/* ============================
   Event Handlers
   ============================ */
function handleQuickLog(result: 'WIN' | 'LOSS' | 'BE', r: number) {
  addQuickTrade(
    result,
    r,
    customSetupInput.value || undefined,
    customNotesInput.value || undefined,
    customChartUrlInput.value || undefined
  )
}

function handleCustomSubmit() {
  const pair = (customPairInput.value || activePair.value || 'XAUUSD').toUpperCase().trim()
  let r = customRInput.value

  if (r === null || isNaN(r)) {
    r = activeDirection.value === 'BUY' ? 2.0 : 2.0
  }

  const result = r > 0 ? 'WIN' : r < 0 ? 'LOSS' : 'BE'

  addCustomTrade({
    pair,
    direction: activeDirection.value,
    session: activeSession.value,
    date: new Date().toISOString().split('T')[0],
    result,
    rMultiple: r,
    setup: customSetupInput.value,
    chartUrl: customChartUrlInput.value,
    notes: customNotesInput.value,
  })

  // Reset custom text inputs
  customSetupInput.value = ''
  customNotesInput.value = ''
  customChartUrlInput.value = ''
  customRInput.value = null
}

function saveSettingsAndRecalculate() {
  updateSettings({
    initialBalance: tempSettings.initialBalance,
    riskPercent: tempSettings.riskPercent,
    riskType: tempSettings.riskType,
    fixedRiskAmount: tempSettings.fixedRiskAmount,
    compounding: tempSettings.compounding,
  })
  isSettingsModalOpen.value = false
}

function confirmReset() {
  if (confirm('Yakin ingin mereset seluruh log backtesting? Data trade yang ada akan dihapus.')) {
    resetBacktest()
  }
}

function exportToCsv() {
  if (trades.value.length === 0) return

  const headers = ['Trade #', 'Date', 'Pair', 'Direction', 'Session', 'Result', 'R-Multiple', 'PnL ($)', 'Balance After', 'Setup', 'Notes', 'Chart URL']
  const rows = trades.value.map(t => [
    t.tradeNumber,
    t.date,
    t.pair,
    t.direction,
    t.session,
    t.result,
    t.rMultiple,
    t.pnl,
    t.balanceAfter,
    `"${(t.setup || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    t.chartUrl || '',
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `spaceos_backtest_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.glass-modal {
  background: rgba(15, 23, 42, 0.95);
  border-color: rgba(51, 65, 85, 0.8);
}
</style>
