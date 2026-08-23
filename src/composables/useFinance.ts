import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'
import type {
  Transaction,
  TransactionFormData,
  TransactionFilters,
  Budget,
  BudgetCategoryProgress,
  FinanceOverviewStats,
} from '@/types'

/* ============================================================
   Category Presets based on User Persona / Space
   ============================================================ */
export const FINANCE_CATEGORIES = {
  trader: [
    { id: 'Trading Profit', name: 'Trading Profit', type: 'income', icon: '📈', color: '#10b981' },
    { id: 'Prop Firm Payout', name: 'Prop Firm Payout', type: 'income', icon: '💰', color: '#06b6d4' },
    { id: 'Trading Capital', name: 'Modal Trading', type: 'expense', icon: '💼', color: '#3b82f6' },
    { id: 'Funded Account Fee', name: 'Biaya Akun Funded', type: 'expense', icon: '🛡️', color: '#8b5cf6' },
    { id: 'Trading Tools & Subscriptions', name: 'Tools (TradingView/VPS)', type: 'expense', icon: '🖥️', color: '#ec4899' },
    { id: 'Education & Mentorship', name: 'Edukasi & Buku', type: 'expense', icon: '📚', color: '#f59e0b' },
  ],
  teacher: [
    { id: 'Honor Mengajar', name: 'Honor Mengajar', type: 'income', icon: '💵', color: '#10b981' },
    { id: 'Private Tutoring', name: 'Les Privat', type: 'income', icon: '🎓', color: '#06b6d4' },
    { id: 'Teaching Materials', name: 'Alat & Bahan Ajar', type: 'expense', icon: '📖', color: '#3b82f6' },
    { id: 'Transportation', name: 'Transport Mengajar', type: 'expense', icon: '🛵', color: '#f59e0b' },
    { id: 'Course & Certifications', name: 'Pelatihan Guru', type: 'expense', icon: '📜', color: '#8b5cf6' },
  ],
  general: [
    { id: 'Salary / Income', name: 'Gaji / Penghasilan', type: 'income', icon: '💵', color: '#10b981' },
    { id: 'Freelance / Side Gig', name: 'Freelance / Side Hustle', type: 'income', icon: '⚡', color: '#06b6d4' },
    { id: 'Investments', name: 'Investasi & Dividen', type: 'income', icon: '📊', color: '#6366f1' },
    { id: 'Food & Dining', name: 'Makanan & Minuman', type: 'expense', icon: '🍔', color: '#ef4444' },
    { id: 'Transportation', name: 'Transportasi & Bensin', type: 'expense', icon: '🚗', color: '#f97316' },
    { id: 'Housing & Utilities', name: 'Tempat Tinggal & Tagihan', type: 'expense', icon: '🏠', color: '#eab308' },
    { id: 'Shopping & Groceries', name: 'Belanja & Kebutuhan', type: 'expense', icon: '🛒', color: '#a855f7' },
    { id: 'Entertainment', name: 'Hiburan & Hobi', type: 'expense', icon: '🎮', color: '#ec4899' },
    { id: 'Health & Fitness', name: 'Kesehatan & Olahraga', type: 'expense', icon: '💊', color: '#14b8a6' },
    { id: 'Other', name: 'Lain-lain', type: 'expense', icon: '🏷️', color: '#64748b' },
  ],
}

/* ============================================================
   Initial Demo Transactions
   ============================================================ */
const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    space_id: '',
    type: 'income',
    amount: 1250.00,
    category: 'Prop Firm Payout',
    description: 'Payout perdana dari funded account 50k',
    date: new Date().toISOString().split('T')[0],
    wallet: 'Bank BCA',
    receipt_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    space_id: '',
    type: 'expense',
    amount: 145.00,
    category: 'Funded Account Fee',
    description: 'Beli challenge akun 100k discount 20%',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    wallet: 'Crypto USDT',
    receipt_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    space_id: '',
    type: 'expense',
    amount: 29.99,
    category: 'Trading Tools & Subscriptions',
    description: 'TradingView Premium Monthly',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    wallet: 'Kartu Kredit',
    receipt_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-4',
    space_id: '',
    type: 'expense',
    amount: 65.00,
    category: 'Food & Dining',
    description: 'Makan malam + kopi mingguan',
    date: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
    wallet: 'Cash / GoPay',
    receipt_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-5',
    space_id: '',
    type: 'income',
    amount: 580.00,
    category: 'Trading Profit',
    description: 'Withdraw profit personal account swing trade Gold',
    date: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0],
    wallet: 'Bank BCA',
    receipt_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-6',
    space_id: '',
    type: 'expense',
    amount: 85.00,
    category: 'Education & Mentorship',
    description: 'Beli buku Trading in the Zone & Market Wizards',
    date: new Date(Date.now() - 86400000 * 18).toISOString().split('T')[0],
    wallet: 'Bank BCA',
    receipt_url: null,
    created_at: new Date().toISOString(),
  },
]

const DEMO_BUDGETS: Budget[] = [
  {
    id: 'b-1',
    space_id: '',
    category: 'Funded Account Fee',
    monthly_limit: 300.00,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  {
    id: 'b-2',
    space_id: '',
    category: 'Trading Tools & Subscriptions',
    monthly_limit: 50.00,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  {
    id: 'b-3',
    space_id: '',
    category: 'Food & Dining',
    monthly_limit: 250.00,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  {
    id: 'b-4',
    space_id: '',
    category: 'Education & Mentorship',
    monthly_limit: 150.00,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
]

export function useFinance() {
  const authStore = useAuthStore()
  const toast = useToastStore()
  const { currentSpace, user } = storeToRefs(authStore)

  /* ============================
     State
     ============================ */
  const transactions = ref<Transaction[]>([])
  const budgets = ref<Budget[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

  // Filters
  const filters = ref<TransactionFilters>({
    dateRange: 'this_month',
    category: 'all',
    type: 'all',
    wallet: 'all',
    search: '',
  })

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  /* ============================
     Categories list depending on space
     ============================ */
  const availableCategories = computed(() => {
    const space = currentSpace.value
    const isTeacher = space?.category === 'teacher' || space?.name?.toLowerCase().includes('guru')
    const list = [
      ...FINANCE_CATEGORIES.general,
      ...(isTeacher ? FINANCE_CATEGORIES.teacher : FINANCE_CATEGORIES.trader),
    ]
    // Dedup by id
    const seen = new Set<string>()
    return list.filter(c => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  })

  /* ============================
     Date Range Helper
     ============================ */
  function getDateRangeBounds(range: TransactionFilters['dateRange']): { start?: string; end?: string } {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const formatDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

    const todayStr = formatDateStr(now)

    switch (range) {
      case 'today':
        return { start: todayStr, end: todayStr }
      case 'this_week': {
        const day = now.getDay()
        const diff = day === 0 ? -6 : 1 - day
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() + diff)
        return { start: formatDateStr(weekStart), end: todayStr }
      }
      case 'this_month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { start: formatDateStr(monthStart), end: formatDateStr(monthEnd) }
      }
      case 'last_month': {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        return { start: formatDateStr(lastMonthStart), end: formatDateStr(lastMonthEnd) }
      }
      case 'last_30_days': {
        const d30 = new Date(now.getTime() - 86400000 * 30)
        return { start: formatDateStr(d30), end: todayStr }
      }
      case 'custom':
        return {
          start: filters.value.startDate,
          end: filters.value.endDate,
        }
      case 'all':
      default:
        return {}
    }
  }

  /* ============================
     Filtered Transactions
     ============================ */
  const filteredTransactions = computed(() => {
    let list = [...transactions.value]
    const { start, end } = getDateRangeBounds(filters.value.dateRange)

    if (start) {
      list = list.filter(t => t.date >= start)
    }
    if (end) {
      list = list.filter(t => t.date <= end)
    }

    if (filters.value.type !== 'all') {
      list = list.filter(t => t.type === filters.value.type)
    }

    if (filters.value.category && filters.value.category !== 'all') {
      list = list.filter(t => t.category === filters.value.category)
    }

    if (filters.value.wallet && filters.value.wallet !== 'all') {
      list = list.filter(t => t.wallet === filters.value.wallet)
    }

    if (filters.value.search) {
      const q = filters.value.search.toLowerCase().trim()
      list = list.filter(t => {
        return (
          t.description?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.wallet?.toLowerCase().includes(q)
        )
      })
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return list
  })

  /* ============================
     Paginated Transactions
     ============================ */
  const paginatedTransactions = computed(() => {
    const list = filteredTransactions.value
    const start = (currentPage.value - 1) * itemsPerPage.value
    return list.slice(start, start + itemsPerPage.value)
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredTransactions.value.length / itemsPerPage.value) || 1
  })

  /* ============================
     Overview Stats (Current Month or Filtered)
     ============================ */
  const overviewStats = computed<FinanceOverviewStats>(() => {
    const list = filteredTransactions.value
    let income = 0
    let expense = 0
    const catMap: Record<string, number> = {}

    list.forEach(t => {
      const amt = Number(t.amount) || 0
      if (t.type === 'income') {
        income += amt
      } else {
        expense += amt
        catMap[t.category] = (catMap[t.category] || 0) + amt
      }
    })

    const netSavings = income - expense
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 1000) / 10 : 0

    let topCat = '-'
    let maxSpent = 0
    for (const [cat, amt] of Object.entries(catMap)) {
      if (amt > maxSpent) {
        maxSpent = amt
        topCat = cat
      }
    }

    return {
      totalBalance: netSavings,
      totalIncome: Math.round(income * 100) / 100,
      totalExpense: Math.round(expense * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate,
      topExpenseCategory: topCat,
      transactionCount: list.length,
    }
  })

  /* ============================
     Budget Progress & Alerts
     ============================ */
  const budgetProgress = computed<BudgetCategoryProgress[]>(() => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Calculate actual spent per category in current month
    const startMonthStr = `${currentYear}-${(currentMonth).toString().padStart(2, '0')}-01`
    const endMonthDate = new Date(currentYear, currentMonth, 0)
    const endMonthStr = `${currentYear}-${(currentMonth).toString().padStart(2, '0')}-${endMonthDate.getDate().toString().padStart(2, '0')}`

    const monthExpenses = transactions.value.filter(
      t => t.type === 'expense' && t.date >= startMonthStr && t.date <= endMonthStr
    )

    const spentMap: Record<string, number> = {}
    monthExpenses.forEach(t => {
      spentMap[t.category] = (spentMap[t.category] || 0) + Number(t.amount)
    })

    // Map each budget
    return budgets.value
      .filter(b => b.month === currentMonth && b.year === currentYear)
      .map(b => {
        const spent = spentMap[b.category] || 0
        const percentage = b.monthly_limit > 0 ? Math.round((spent / b.monthly_limit) * 100) : 0
        const isOverBudget = spent > b.monthly_limit
        const isNearLimit = percentage >= 80 && !isOverBudget
        const remaining = Math.max(0, b.monthly_limit - spent)

        return {
          category: b.category,
          monthly_limit: Number(b.monthly_limit),
          actual_spent: Math.round(spent * 100) / 100,
          percentage,
          isOverBudget,
          isNearLimit,
          remaining: Math.round(remaining * 100) / 100,
        }
      })
  })

  /* ============================
     Last 6 Months History (For Chart)
     ============================ */
  const last6MonthsData = computed(() => {
    const now = new Date()
    const months: { label: string; income: number; expense: number; key: string }[] = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const key = `${year}-${month.toString().padStart(2, '0')}`
      const label = d.toLocaleDateString('id-ID', { month: 'short' })
      months.push({ label, key, income: 0, expense: 0 })
    }

    transactions.value.forEach(t => {
      const tMonthKey = t.date.substring(0, 7)
      const m = months.find(item => item.key === tMonthKey)
      if (m) {
        const amt = Number(t.amount) || 0
        if (t.type === 'income') m.income += amt
        else m.expense += amt
      }
    })

    return months
  })

  /* ============================
     Fetch Data from Supabase
     ============================ */
  async function fetchFinanceData() {
    isLoading.value = true
    error.value = null

    try {
      const spaceId = currentSpace.value?.id

      if (!spaceId) {
        transactions.value = [...DEMO_TRANSACTIONS]
        budgets.value = [...DEMO_BUDGETS]
        usingFallback.value = true
        return
      }

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('space_id', spaceId)
        .order('date', { ascending: false })

      // Fetch budgets
      const { data: bgData, error: bgError } = await supabase
        .from('budgets')
        .select('*')
        .eq('space_id', spaceId)

      if (txError || bgError) {
        console.warn('[Finance] Supabase query notice, using local storage fallback:', txError?.message || bgError?.message)
        loadFromLocalStorage(spaceId)
        usingFallback.value = true
        return
      }

      if (txData && txData.length > 0) {
        transactions.value = txData.map(r => ({
          ...r,
          amount: Number(r.amount),
        }))
        usingFallback.value = false
      } else {
        loadFromLocalStorage(spaceId)
      }

      if (bgData && bgData.length > 0) {
        budgets.value = bgData.map(b => ({
          ...b,
          monthly_limit: Number(b.monthly_limit),
        }))
      }
    } catch (err: any) {
      console.error('fetchFinanceData error:', err)
      error.value = err?.message || 'Gagal memuat data keuangan.'
      loadFromLocalStorage(currentSpace.value?.id || 'default')
    } finally {
      isLoading.value = false
    }
  }

  function loadFromLocalStorage(spaceId: string) {
    try {
      const txKey = `spaceos_tx_${spaceId}`
      const bgKey = `spaceos_bg_${spaceId}`
      const savedTx = localStorage.getItem(txKey)
      const savedBg = localStorage.getItem(bgKey)

      if (savedTx) {
        transactions.value = JSON.parse(savedTx)
      } else {
        const initial = DEMO_TRANSACTIONS.map(t => ({
          ...t,
          space_id: spaceId,
        }))
        transactions.value = initial
        saveToLocalStorage(spaceId)
      }

      if (savedBg) {
        budgets.value = JSON.parse(savedBg)
      } else {
        const initialBg = DEMO_BUDGETS.map(b => ({
          ...b,
          space_id: spaceId,
        }))
        budgets.value = initialBg
      }
      usingFallback.value = true
    } catch {
      transactions.value = [...DEMO_TRANSACTIONS]
      budgets.value = [...DEMO_BUDGETS]
      usingFallback.value = true
    }
  }

  function saveToLocalStorage(spaceId: string) {
    try {
      localStorage.setItem(`spaceos_tx_${spaceId}`, JSON.stringify(transactions.value))
      localStorage.setItem(`spaceos_bg_${spaceId}`, JSON.stringify(budgets.value))
    } catch (err) {
      console.warn('Failed saving to localStorage:', err)
    }
  }

  /* ============================
     CRUD: Add Transaction
     ============================ */
  async function addTransaction(formData: TransactionFormData): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    isSaving.value = true
    try {
      const spaceId = currentSpace.value?.id || 'demo-space'
      const userId = user.value?.id || 'demo-user'

      const newTxPayload = {
        space_id: spaceId,
        user_id: userId,
        type: formData.type,
        amount: formData.amount!,
        category: formData.category,
        description: formData.description?.trim() || null,
        date: formData.date || new Date().toISOString().split('T')[0],
        wallet: formData.wallet || 'Main Account',
        receipt_url: formData.receipt_url || null,
      }

      let createdTx: Transaction

      if (spaceId && !usingFallback.value) {
        const { data, error: insertErr } = await supabase
          .from('transactions')
          .insert(newTxPayload)
          .select()
          .single()

        if (insertErr) {
          console.warn('Supabase insert failed, fallback to local:', insertErr.message)
          createdTx = {
            ...newTxPayload,
            id: 'local-tx-' + Date.now().toString(36),
            created_at: new Date().toISOString(),
          } as Transaction
        } else {
          createdTx = { ...data, amount: Number(data.amount) }
        }
      } else {
        createdTx = {
          ...newTxPayload,
          id: 'local-tx-' + Date.now().toString(36),
          created_at: new Date().toISOString(),
        } as Transaction
      }

      transactions.value = [createdTx, ...transactions.value]
      if (spaceId) saveToLocalStorage(spaceId)

      toast.success(
        formData.type === 'income' ? 'Pemasukan Dicatat! 💰' : 'Pengeluaran Dicatat! 💸',
        `${formData.category} - Rp ${formData.amount?.toLocaleString('id-ID')}`
      )
      return { success: true, data: createdTx }
    } catch (err: any) {
      console.error('addTransaction error:', err)
      const msg = err?.message || 'Gagal menyimpan transaksi.'
      toast.error('Gagal Menyimpan', msg)
      return { success: false, error: msg }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Update Transaction
     ============================ */
  async function updateTransaction(id: string, formData: Partial<TransactionFormData>): Promise<{ success: boolean; data?: Transaction }> {
    isSaving.value = true
    try {
      const spaceId = currentSpace.value?.id
      const existing = transactions.value.find(t => t.id === id)
      if (!existing) throw new Error('Transaction not found')

      const updated = {
        ...existing,
        ...formData,
        amount: formData.amount !== undefined ? Number(formData.amount) : existing.amount,
      }

      if (spaceId && !usingFallback.value && !id.startsWith('tx-') && !id.startsWith('local-')) {
        await supabase
          .from('transactions')
          .update({
            type: updated.type,
            amount: updated.amount,
            category: updated.category,
            description: updated.description,
            date: updated.date,
            wallet: updated.wallet,
            receipt_url: updated.receipt_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
      }

      const idx = transactions.value.findIndex(t => t.id === id)
      if (idx !== -1) transactions.value[idx] = updated
      if (spaceId) saveToLocalStorage(spaceId)

      toast.success('Transaksi Diperbarui', 'Data transaksi berhasil diupdate.')
      return { success: true, data: updated }
    } catch (err: any) {
      toast.error('Gagal Update', err?.message || 'Terjadi kesalahan.')
      return { success: false }
    } finally {
      isSaving.value = false
    }
  }

  /* ============================
     CRUD: Delete Transaction
     ============================ */
  async function deleteTransaction(id: string): Promise<{ success: boolean }> {
    try {
      const spaceId = currentSpace.value?.id
      if (spaceId && !usingFallback.value && !id.startsWith('tx-') && !id.startsWith('local-')) {
        await supabase.from('transactions').delete().eq('id', id)
      }

      transactions.value = transactions.value.filter(t => t.id !== id)
      if (spaceId) saveToLocalStorage(spaceId)

      toast.info('Transaksi Dihapus', 'Catatan transaksi telah dihapus.')
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Hapus', err?.message || 'Terjadi kesalahan.')
      return { success: false }
    }
  }

  /* ============================
     CRUD: Save / Upsert Budget
     ============================ */
  async function setBudget(category: string, monthlyLimit: number): Promise<{ success: boolean }> {
    try {
      const spaceId = currentSpace.value?.id || 'demo-space'
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()

      const existingIdx = budgets.value.findIndex(
        b => b.category === category && b.month === month && b.year === year
      )

      if (spaceId && !usingFallback.value) {
        await supabase.from('budgets').upsert(
          {
            space_id: spaceId,
            category,
            monthly_limit: monthlyLimit,
            month,
            year,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'space_id,category,month,year' }
        )
      }

      if (existingIdx !== -1) {
        budgets.value[existingIdx].monthly_limit = monthlyLimit
      } else {
        budgets.value.push({
          id: 'b-' + Date.now(),
          space_id: spaceId,
          category,
          monthly_limit: monthlyLimit,
          month,
          year,
        })
      }

      if (spaceId) saveToLocalStorage(spaceId)
      toast.success('Budget Diperbarui 🎯', `Budget untuk ${category} diatur ke Rp ${monthlyLimit.toLocaleString('id-ID')}`)
      return { success: true }
    } catch (err: any) {
      toast.error('Gagal Mengatur Budget', err?.message || 'Terjadi kesalahan.')
      return { success: false }
    }
  }

  /* ============================
     Export to CSV
     ============================ */
  function exportTransactionsCSV() {
    const list = filteredTransactions.value
    if (list.length === 0) {
      toast.warning('Tidak Ada Data', 'Tidak ada transaksi yang cocok dengan filter.')
      return
    }

    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Deskripsi', 'Akun/Dompet']
    const rows = list.map(t => [
      t.id,
      t.date,
      t.type.toUpperCase(),
      t.category,
      t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.wallet,
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `SpaceOS_Finance_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Export Berhasil', `${list.length} transaksi diexport ke CSV.`)
  }

  watch(
    () => [filters.value.dateRange, filters.value.type, filters.value.category, filters.value.wallet, filters.value.search],
    () => {
      currentPage.value = 1
    }
  )

  return {
    transactions,
    budgets,
    filteredTransactions,
    paginatedTransactions,
    overviewStats,
    budgetProgress,
    last6MonthsData,
    availableCategories,
    filters,
    currentPage,
    itemsPerPage,
    totalPages,
    isLoading,
    isSaving,
    error,
    fetchFinanceData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setBudget,
    exportTransactionsCSV,
  }
}
