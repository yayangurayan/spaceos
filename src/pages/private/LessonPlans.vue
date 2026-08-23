<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📋</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Library Rencana Pembelajaran (Lesson Plans)
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Koleksi template silabus, tujuan pembelajaran, dan alur kegiatan bimbingan belajar.
        </p>
      </div>

      <!-- Header Action -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="openAddPlan"
          class="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <Icon name="plus" :size="16" />
          <span>+ Buat Lesson Plan Baru</span>
        </button>
      </div>
    </div>

    <!-- 2. Search & Filter Bar -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <!-- Subject Filter -->
        <select
          v-model="selectedSubject"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Mata Pelajaran</option>
          <option v-for="sub in availableSubjects" :key="sub" :value="sub">{{ sub }}</option>
        </select>

        <!-- Grade Filter -->
        <select
          v-model="selectedGrade"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Jenjang</option>
          <option v-for="g in availableGrades" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>

      <div class="relative w-full sm:w-64">
        <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul materi, silabus..."
          class="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
        />
      </div>
    </div>

    <!-- 3. Lesson Plans Grid -->
    <div v-if="filteredPlans.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block">📋</span>
      <h3 class="text-base font-bold text-white">Tidak ada lesson plan yang ditemukan</h3>
      <p class="text-xs text-slate-500">Mulai buat template bimbingan terstruktur untuk mata pelajaran kamu.</p>
      <button
        type="button"
        @click="openAddPlan"
        class="btn-primary px-5 py-2 text-xs font-bold rounded-xl mt-2"
      >
        + Buat Lesson Plan
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="glass rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between gap-4 transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5"
      >
        <div class="space-y-3">
          <!-- Top Row: Subject & Duration -->
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {{ plan.subject }}
            </span>
            <span class="text-xs font-mono text-slate-400">
              ⏱️ {{ plan.duration_minutes }} mnt
            </span>
          </div>

          <!-- Title & Grade -->
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-accent transition-colors">
              {{ plan.title }}
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ plan.grade || 'Semua Jenjang' }}
            </p>
          </div>

          <!-- Objectives snippet -->
          <div v-if="plan.objectives" class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <span class="text-[10px] font-bold uppercase text-slate-400 block">Tujuan Pembelajaran:</span>
            <p class="line-clamp-3 leading-relaxed whitespace-pre-line">{{ plan.objectives }}</p>
          </div>

          <!-- Step-by-step preview -->
          <div v-if="plan.activities" class="text-[11px] text-slate-400 space-y-1">
            <span class="text-[10px] font-bold uppercase text-slate-500 block">Alur Pembelajaran:</span>
            <p class="line-clamp-2 leading-relaxed whitespace-pre-line">{{ plan.activities }}</p>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            @click="useTemplateToCreateLesson(plan)"
            class="px-3 py-1.5 rounded-xl bg-accent text-dark font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-cyan-300 transition-colors"
          >
            <span>🚀 Gunakan Plan</span>
          </button>

          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="openEditPlan(plan)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Edit Plan"
            >
              <Icon name="edit" :size="15" />
            </button>
            <button
              type="button"
              @click="confirmDelete(plan.id)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Hapus Plan"
            >
              <Icon name="trash" :size="15" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <LessonPlanModal
      v-if="showPlanModal"
      :plan="selectedPlan"
      @close="showPlanModal = false; selectedPlan = null"
      @save="handleSavePlan"
    />

    <RecordLessonModal
      v-if="showLessonModal"
      :lesson="templateLesson"
      :students="students"
      @close="showLessonModal = false; templateLesson = null"
      @save="handleSaveLesson"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import LessonPlanModal from '@/components/teacher/LessonPlanModal.vue'
import RecordLessonModal from '@/components/teacher/RecordLessonModal.vue'
import { useTeacher, TEACHER_SUBJECTS, GRADE_LEVELS } from '@/composables/useTeacher'
import type { LessonPlan, LessonPlanFormData, Lesson, LessonFormData } from '@/types'

const {
  students,
  lessonPlans,
  fetchTeacherData,
  createLessonPlan,
  updateLessonPlan,
  deleteLessonPlan,
  createLesson,
} = useTeacher()

const availableSubjects = TEACHER_SUBJECTS
const availableGrades = GRADE_LEVELS

const selectedSubject = ref('all')
const selectedGrade = ref('all')
const searchQuery = ref('')

// Modals
const showPlanModal = ref(false)
const selectedPlan = ref<LessonPlan | null>(null)

const showLessonModal = ref(false)
const templateLesson = ref<Lesson | null>(null)

const filteredPlans = computed(() => {
  return lessonPlans.value.filter(p => {
    if (selectedSubject.value !== 'all' && p.subject !== selectedSubject.value) return false
    if (selectedGrade.value !== 'all' && p.grade !== selectedGrade.value) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchTitle = p.title.toLowerCase().includes(q)
      const matchObj = p.objectives?.toLowerCase().includes(q)
      if (!matchTitle && !matchObj) return false
    }
    return true
  })
})

function openAddPlan() {
  selectedPlan.value = null
  showPlanModal.value = true
}

function openEditPlan(p: LessonPlan) {
  selectedPlan.value = p
  showPlanModal.value = true
}

async function handleSavePlan(formData: LessonPlanFormData) {
  if (selectedPlan.value) {
    await updateLessonPlan(selectedPlan.value.id, formData)
  } else {
    await createLessonPlan(formData)
  }
  showPlanModal.value = false
  selectedPlan.value = null
}

function useTemplateToCreateLesson(plan: LessonPlan) {
  templateLesson.value = {
    id: '',
    space_id: plan.space_id,
    student_id: students.value[0]?.id || '',
    datetime: new Date().toISOString(),
    duration_minutes: plan.duration_minutes || 90,
    topic: plan.title,
    material_covered: plan.objectives || '',
    activities: plan.activities || '',
    homework: '',
    performance: 'Good',
    next_lesson_notes: plan.assessment || '',
    status: 'scheduled',
    created_at: new Date().toISOString(),
  }
  showLessonModal.value = true
}

async function handleSaveLesson(formData: LessonFormData) {
  await createLesson(formData)
  showLessonModal.value = false
  templateLesson.value = null
}

async function confirmDelete(id: string) {
  if (confirm('Hapus template lesson plan ini?')) {
    await deleteLessonPlan(id)
  }
}

onMounted(() => {
  fetchTeacherData()
})
</script>
