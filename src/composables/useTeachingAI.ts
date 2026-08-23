import { ref } from 'vue'
import { useAI } from '@/composables/useAI'
import type { LessonPlanFormData, Student } from '@/types'

export function useTeachingAI() {
  const { isLoading, error, generateAIResponse } = useAI()
  const isGenerating = ref(false)

  /* ============================
     1. AI Lesson Plan Generator
     ============================ */
  async function generateLessonPlan(params: {
    subject: string
    grade: string
    topic: string
    durationMinutes?: number
  }): Promise<LessonPlanFormData> {
    isGenerating.value = true
    const duration = params.durationMinutes || 60

    const prompt = `Buatkan Rencana Pelaksanaan Pembelajaran (Lesson Plan) bimbingan belajar:
Mata Pelajaran: ${params.subject}
Jenjang / Kelas: ${params.grade}
Topik Materi: ${params.topic}
Durasi: ${duration} menit`

    const systemPrompt = `Anda adalah Master Guru Kurikulum Merdeka & Edukator Berpengalaman. Buatkan silabus dan alur kegiatan les interaktif yang menyenangkan dan terstruktur.`

    const offlineGenerator = () => {
      return JSON.stringify({
        title: `Modul Pembelajaran: ${params.topic}`,
        subject: params.subject,
        grade: params.grade,
        duration_minutes: duration,
        objectives: `• Memahami konsep fundamental ${params.topic} secara komprehensif.\n• Mampu menyelesaikan latihan soal bertingkat secara mandiri.\n• Memiliki rasa percaya diri dalam mengaplikasikan konsep.`,
        materials: `• Lembar kerja ringkasan konsep & formula\n• Kumpulan 10 latihan soal bertingkat (Easy - Medium - HOTS)\n• Kuis kilat 5 menit`,
        activities: `1. Apersepsi & Ice-breaking (10 Menit): Review materi prasyarat & tanya jawab pemantik.\n2. Eksplorasi Konsep Inti (20 Menit): Pembahasan konsep visual & 2 contoh soal terpandu.\n3. Latihan Mandiri & Scaffolding (20 Menit): Pengerjaan soal dengan bimbingan tutor.\n4. Evaluasi & Refleksi Penutup (10 Menit): Kuis kilat & apresiasi hasil belajar.`,
        assessment: `Kuis kilat pemahaman konsep di akhir sesi dan 2 soal latihan mandiri di rumah.`,
      })
    }

    try {
      const raw = await generateAIResponse(
        prompt,
        systemPrompt,
        `lesson_plan_${params.subject}_${params.topic}`,
        offlineGenerator
      )

      try {
        const parsed = JSON.parse(raw)
        return {
          title: parsed.title || `Modul: ${params.topic}`,
          subject: parsed.subject || params.subject,
          grade: parsed.grade || params.grade,
          duration_minutes: Number(parsed.duration_minutes) || duration,
          objectives: typeof parsed.objectives === 'string' ? parsed.objectives : Array.isArray(parsed.objectives) ? parsed.objectives.join('\n') : '',
          materials: typeof parsed.materials === 'string' ? parsed.materials : Array.isArray(parsed.materials) ? parsed.materials.join('\n') : '',
          activities: typeof parsed.activities === 'string' ? parsed.activities : Array.isArray(parsed.activities) ? parsed.activities.map((a: any) => typeof a === 'string' ? a : `${a.phase}: ${a.description}`).join('\n') : '',
          assessment: typeof parsed.assessment === 'string' ? parsed.assessment : 'Kuis pemahaman di akhir sesi.',
        }
      } catch {
        return JSON.parse(offlineGenerator())
      }
    } finally {
      isGenerating.value = false
    }
  }

  /* ============================
     2. Student Progress Insights
     ============================ */
  async function evaluateStudentProgress(student: Student): Promise<string> {
    isGenerating.value = true

    const prompt = `Analisis kemajuan belajar siswa les berikut:
Nama: ${student.name}
Jenjang: ${student.grade || 'Umum'}
Mata Pelajaran: ${student.subjects.join(', ')}
Catatan Tutor: ${student.notes || 'Belum ada catatan khusus.'}`

    const systemPrompt = `Anda adalah Pedagogical Consultant & AI Student Progress Analyst. Berikan evaluasi komprehensif, analisis kekuatan/kelemahan, dan rekomendasi strategi belajar yang dipersonalisasi.`

    const offlineGenerator = () => {
      const subjectsStr = student.subjects.join(' & ')

      return `## 🎓 Laporan Evaluasi Kemajuan Siswa (${student.name})

### 1. 🌟 Profil & Kekuatan Belajar
* **Mata Pelajaran:** **${subjectsStr}** (${student.grade || 'Umum'}).
* **Karakteristik:** Memiliki daya tangkap yang baik terhadap materi konseptual dan aktif merespons saat sesi interaktif.
* **Tingkat Kehadiran & Partisipasi:** Sangat konsisten dalam mengikuti jadwal les yang telah disepakati.

---

### 2. 🔍 Area yang Memerlukan Penguatan (Growth Areas)
* **Kebutuhan Drill Soal:** Perlu peningkatan variasi latihan soal tingkat menengah (*HOTS*) untuk mengasah ketelitian perhitungan.
* **Manajemen Waktu Pengerjaan:** Siswa cenderung terburu-buru di bagian awal sehingga melewatkan detail kecil pada instruksi soal.

---

### 3. 🎯 Rekomendasi Strategi Pembelajaran Personal
1. **Metode Pomodoro Belajar:** Bagi sesi les 60 menit menjadi blok 25 menit fokus latihan + 5 menit diskusi ringan.
2. **Cheat-Sheet Formula:** Bantu siswa membuat rangkuman rumus atau konsep penting dalam bentuk kartu saku (*formula summary card*).
3. **Umpan Balik Positif ke Orang Tua:** Laporkan peningkatan pemahaman konsep dasar agar orang tua dapat memberikan apresiasi di rumah.`
    }

    try {
      const response = await generateAIResponse(
        prompt,
        systemPrompt,
        `student_eval_${student.id}`,
        offlineGenerator
      )
      return response
    } finally {
      isGenerating.value = false
    }
  }

  return {
    isLoading,
    isGenerating,
    error,
    generateLessonPlan,
    evaluateStudentProgress,
  }
}
