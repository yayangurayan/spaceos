import { ref } from 'vue'
import { useAI } from '@/composables/useAI'
import type { JournalEntry } from '@/types'

export function useJournalAI() {
  const { isLoading, error, generateAIResponse } = useAI()
  const isGenerating = ref(false)

  /* ============================
     1. Monthly Relationship Report
     ============================ */
  async function generateRelationshipReport(entries: JournalEntry[], coupleNames = 'Kita Berdua'): Promise<string> {
    isGenerating.value = true

    const moodCounts: Record<string, number> = {}
    entries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
    })

    const tagCounts: Record<string, number> = {}
    entries.forEach(e => {
      e.tags?.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1
      })
    })

    const prompt = `Analisis kumpulan journal pasangan ${coupleNames}:
Total Catatan: ${entries.length}
Distribusi Mood: ${JSON.stringify(moodCounts)}
Tag Aktivitas: ${JSON.stringify(tagCounts)}
Sample entries: ${entries.slice(0, 5).map(e => `[${e.mood}] ${e.title}: ${e.content.slice(0, 100)}...`).join('\n')}`

    const systemPrompt = `Anda adalah AI Relationship Counselor & Love Coach berkarakter hangat, suportif, dan penuh apresiasi. Buat laporan bulanan hubungan dalam format Markdown yang indah dan menyentuh hati.`

    const offlineGenerator = () => {
      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Loving 💕'
      const topTags = Object.keys(tagCounts).slice(0, 4).join(', ') || 'Liburan, Date Night, Deep Talk'

      return `## 💕 Laporan Bulanan Hubungan (${coupleNames})

### 1. 🌈 Iklim Emosi & Mood Dominan
* **Mood Terbanyak:** **${topMood}** mendominasi catatan kalian bulan ini. Ini menunjukkan suasana hubungan yang penuh kehangatan dan rasa aman.
* **Harmoni Emosional:** Dari ${entries.length} catatan yang terdata, kalian aktif saling berbagi kabar dan mendengarkan keluh kesah satu sama lain.

---

### 2. 🎡 Aktivitas & Momen Paling Berkesan
* 🌟 **Sorotan Kegiatan:** Topik terpopuler meliputi **${topTags}**.
* 🕯️ **Quality Time:** Kalian berhasil menyisihkan waktu berkualitas di tengah kesibukan masing-masing untuk kencan dan mengobrol santai.

---

### 3. 💬 Pola Komunikasi & Apresiasi
* Saling memberi komentar dan reaksi hati pada tulisan pasangan menciptakan ikatan emosional yang semakin kuat (*emotional validation*).
* Keterbukaan dalam menceritakan mimpi masa depan dan kekhawatiran pribadi membuktikan tingkat kepercayaan (*trust level*) yang sangat tinggi.

---

### 4. 🎁 3 Ide Kencan & Apresiasi untuk Bulan Depan
1. **Surprise Date Night:** Rencanakan satu malam kencan tanpa gadget, hanya obrolan dan musik favorit.
2. **Kupon Cinta:** Buat 3 kupon kecil (misal: "Pijat Bahu 15 Menit", "Bebas Pilih Tempat Makan").
3. **Dream Board Bersama:** Susun rencana perjalanan liburan impian berikutnya bersama-sama.`
    }

    try {
      const response = await generateAIResponse(
        prompt,
        systemPrompt,
        `couple_report_${entries.length}`,
        offlineGenerator
      )
      return response
    } finally {
      isGenerating.value = false
    }
  }

  /* ============================
     2. AI Conversation Starters / Prompts
     ============================ */
  const CONVERSATION_STARTER_PRESETS = [
    '✨ Apa momen paling lucu atau konyol yang kita lalui bersama minggu ini?',
    '🌟 Sebutkan satu hal kecil yang aku lakukan yang membuatmu merasa sangat dihargai.',
    '🏖️ Jika kita punya waktu libur 3 hari tanpa batas budget, ke mana tempat pertama yang ingin kamu tuju bersamaku?',
    '☕ Ceritakan hal paling membanggakan yang berhasil kamu capai bulan ini.',
    '🎶 Lagu apa yang paling mengingatkanmu pada awal kita pertama kali kencan?',
    '💭 Apa impian terbesarmu dalam 3 tahun ke depan yang ingin kita wujudkan bersama?',
  ]

  function getConversationStarters(): string[] {
    // Shuffle & return 4 items
    const shuffled = [...CONVERSATION_STARTER_PRESETS].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 4)
  }

  return {
    isLoading,
    isGenerating,
    error,
    generateRelationshipReport,
    getConversationStarters,
  }
}
