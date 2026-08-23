<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📁</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bank Materi & Modul Belajar (Materials)
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Koleksi lembar soal, slide presentasi, ringkasan rumus, dan video pembelajaran.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="openAddMaterial"
          class="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <Icon name="plus" :size="16" />
          <span>+ Unggah Materi Baru</span>
        </button>
      </div>
    </div>

    <!-- 2. Tabs: All vs Favorites vs Types -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
      <button
        type="button"
        @click="activeTab = 'all'"
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
        :class="activeTab === 'all' ? 'bg-accent text-dark font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'"
      >
        📚 Semua Modul ({{ materials.length }})
      </button>

      <button
        type="button"
        @click="activeTab = 'favorites'"
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
        :class="activeTab === 'favorites' ? 'bg-accent text-dark font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'"
      >
        ⭐ Favorit ({{ favoriteMaterials.length }})
      </button>
    </div>

    <!-- 3. Filter & Search Toolbar -->
    <div class="glass rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <!-- Type Filter -->
        <select
          v-model="selectedType"
          class="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-accent"
        >
          <option value="all">Semua Tipe</option>
          <option value="Worksheet">📄 Worksheet (Soal)</option>
          <option value="Slides">🖥️ Slides</option>
          <option value="Video">🎥 Video</option>
          <option value="Quiz">📝 Quiz</option>
          <option value="Notes">📌 Notes (Ringkasan)</option>
        </select>

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

      <!-- Search -->
      <div class="relative w-full md:w-64">
        <Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul, tagar, topik..."
          class="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
        />
      </div>
    </div>

    <!-- 4. Materials Grid -->
    <div v-if="filteredMaterials.length === 0" class="glass rounded-2xl p-12 text-center text-slate-400 space-y-3">
      <span class="text-4xl block">📁</span>
      <h3 class="text-base font-bold text-white">Tidak ada materi yang ditemukan</h3>
      <p class="text-xs text-slate-500">Mulai unggah berkas modul, slide latihan, atau rangkuman materi les.</p>
      <button
        type="button"
        @click="openAddMaterial"
        class="btn-primary px-5 py-2 text-xs font-bold rounded-xl mt-2"
      >
        + Unggah Materi Baru
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="mat in filteredMaterials"
        :key="mat.id"
        class="glass rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between gap-4 transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5"
      >
        <div class="space-y-3">
          <!-- Top Row: Type & Favorite -->
          <div class="flex items-center justify-between">
            <span
              class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
              :class="getTypeBadge(mat.type)"
            >
              <span>{{ getTypeIcon(mat.type) }}</span>
              <span>{{ mat.type }}</span>
            </span>

            <button
              type="button"
              @click="toggleMaterialFavorite(mat.id)"
              class="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 transition-colors"
              :class="{ 'text-amber-400': mat.is_favorite }"
              title="Favorit"
            >
              <Icon :name="mat.is_favorite ? 'star-filled' : 'star'" :size="16" />
            </button>
          </div>

          <!-- Title & Subject/Grade -->
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-accent transition-colors">
              {{ mat.title }}
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ mat.subject }} · {{ mat.grade || 'Umum' }}
            </p>
          </div>

          <p v-if="mat.description" class="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {{ mat.description }}
          </p>

          <!-- Tags -->
          <div v-if="mat.tags && mat.tags.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="tag in mat.tags"
              :key="tag"
              class="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Footer: Action Links -->
        <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <a
            :href="mat.file_url"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Icon name="external-link" :size="13" />
            <span>Buka Berkas</span>
          </a>

          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="openEditMaterial(mat)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Edit Materi"
            >
              <Icon name="edit" :size="15" />
            </button>
            <button
              type="button"
              @click="confirmDelete(mat.id)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Hapus Materi"
            >
              <Icon name="trash" :size="15" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add / Edit Material -->
    <MaterialModal
      v-if="showModal"
      :material="selectedMaterial"
      @close="showModal = false; selectedMaterial = null"
      @save="handleSaveMaterial"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import MaterialModal from '@/components/teacher/MaterialModal.vue'
import { useTeacher, TEACHER_SUBJECTS, GRADE_LEVELS } from '@/composables/useTeacher'
import type { TeacherMaterial, MaterialFormData } from '@/types'

const {
  materials,
  fetchTeacherData,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  toggleMaterialFavorite,
} = useTeacher()

const availableSubjects = TEACHER_SUBJECTS
const availableGrades = GRADE_LEVELS

const activeTab = ref<'all' | 'favorites'>('all')
const selectedType = ref('all')
const selectedSubject = ref('all')
const selectedGrade = ref('all')
const searchQuery = ref('')

// Modal
const showModal = ref(false)
const selectedMaterial = ref<TeacherMaterial | null>(null)

const favoriteMaterials = computed(() => {
  return materials.value.filter(m => m.is_favorite)
})

const filteredMaterials = computed(() => {
  const baseList = activeTab.value === 'favorites' ? favoriteMaterials.value : materials.value
  return baseList.filter(m => {
    if (selectedType.value !== 'all' && m.type !== selectedType.value) return false
    if (selectedSubject.value !== 'all' && m.subject !== selectedSubject.value) return false
    if (selectedGrade.value !== 'all' && m.grade !== selectedGrade.value) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchTitle = m.title.toLowerCase().includes(q)
      const matchDesc = m.description?.toLowerCase().includes(q)
      const matchTags = m.tags.some(t => t.toLowerCase().includes(q))
      if (!matchTitle && !matchDesc && !matchTags) return false
    }
    return true
  })
})

function getTypeIcon(t: string) {
  switch (t) {
    case 'Worksheet': return '📄'
    case 'Slides': return '🖥️'
    case 'Video': return '🎥'
    case 'Quiz': return '📝'
    default: return '📌'
  }
}

function getTypeBadge(t: string) {
  switch (t) {
    case 'Worksheet': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
    case 'Slides': return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    case 'Video': return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    case 'Quiz': return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    default: return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  }
}

function openAddMaterial() {
  selectedMaterial.value = null
  showModal.value = true
}

function openEditMaterial(m: TeacherMaterial) {
  selectedMaterial.value = m
  showModal.value = true
}

async function handleSaveMaterial(formData: MaterialFormData) {
  if (selectedMaterial.value) {
    await updateMaterial(selectedMaterial.value.id, formData)
  } else {
    await createMaterial(formData)
  }
  showModal.value = false
  selectedMaterial.value = null
}

async function confirmDelete(id: string) {
  if (confirm('Hapus file materi ini?')) {
    await deleteMaterial(id)
  }
}

onMounted(() => {
  fetchTeacherData()
})
</script>
