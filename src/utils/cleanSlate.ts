/**
 * Clean Slate Utility for SpaceOS
 * Ensures all spaces are 100% clean and free from any legacy dummy/demo records.
 */
export function purgeLegacyDummyData() {
  try {
    // Flag to track clean slate status
    const cleanVersion = '2026-09-26-v2'
    const lastCleanVersion = localStorage.getItem('spaceos_clean_version')

    if (lastCleanVersion === cleanVersion) {
      return
    }

    // Set clean slate flag
    localStorage.setItem('spaceos_clean_slate', 'true')
    localStorage.setItem('spaceos_clean_version', cleanVersion)

    // Keys that might contain dummy demo data
    const keysToCheck: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('spaceos_')) {
        keysToCheck.push(k)
      }
    }

    keysToCheck.forEach(key => {
      // 1. Purge legacy seeded flags
      if (key.includes('_seeded_')) {
        localStorage.removeItem(key)
        return
      }

      // 2. Inspect content for known dummy signatures
      if (
        key.startsWith('spaceos_trades_') ||
        key.startsWith('spaceos_backtest_trades_') ||
        key.startsWith('spaceos_tx_') ||
        key.startsWith('spaceos_bg_') ||
        key.startsWith('spaceos_habits_') ||
        key.startsWith('spaceos_logs_') ||
        key.startsWith('spaceos_teacher_') ||
        key.startsWith('spaceos_books_') ||
        key.startsWith('spaceos_reading_logs_') ||
        key.startsWith('spaceos_events_') ||
        key === 'spaceos_personal_journal'
      ) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const lower = raw.toLowerCase()
            // Check for dummy signatures: demo-1, welcome-journal, ahmad dahlan, etc.
            if (
              lower.includes('demo-1') ||
              lower.includes('demo-2') ||
              lower.includes('demo-3') ||
              lower.includes('welcome-journal') ||
              lower.includes('ahmad dahlan') ||
              lower.includes('atomic habits') ||
              lower.includes('gaji bulanan') ||
              lower.includes('london asian low sweep')
            ) {
              localStorage.setItem(key, '[]')
            }
          }
        } catch {
          // ignore
        }
      }
    })
  } catch (err) {
    console.warn('purgeLegacyDummyData notice:', err)
  }
}
