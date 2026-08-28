<template>
  <div class="animate-fade-in">
    <h2 class="text-xl font-semibold text-white mb-1">{{ t('create_account') }}</h2>
    <p class="text-sm text-slate-400 mb-6">{{ t('start_spaceos_journey') }}</p>

    <!-- Register Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Full Name -->
      <div>
        <label for="reg-name" class="block text-sm font-medium text-slate-300 mb-1.5">
          {{ t('full_name_label') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            id="reg-name"
            v-model="form.fullName"
            type="text"
            required
            placeholder="John Doe"
            class="input-field pl-10"
            :class="{ 'border-red-500/50 focus:ring-red-500': errors.fullName }"
            @input="clearFieldError('fullName')"
          />
        </div>
        <p v-if="errors.fullName" class="mt-1 text-xs text-red-400">{{ errors.fullName }}</p>
      </div>

      <!-- Email -->
      <div>
        <label for="reg-email" class="block text-sm font-medium text-slate-300 mb-1.5">
          {{ t('email_address') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="reg-email"
            v-model="form.email"
            type="email"
            required
            placeholder="you@example.com"
            class="input-field pl-10"
            :class="{ 'border-red-500/50 focus:ring-red-500': errors.email }"
            @input="clearFieldError('email')"
          />
        </div>
        <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email }}</p>
      </div>

      <!-- Password -->
      <div>
        <label for="reg-password" class="block text-sm font-medium text-slate-300 mb-1.5">
          {{ t('password') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="reg-password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="••••••••"
            class="input-field pl-10 pr-10"
            :class="{ 'border-red-500/50 focus:ring-red-500': errors.password }"
            @input="onPasswordInput"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            @click="showPassword = !showPassword"
          >
            <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password }}</p>

        <!-- Password Strength Indicator -->
        <div v-if="form.password" class="mt-2">
          <div class="flex gap-1 mb-1">
            <div
              v-for="i in 4"
              :key="i"
              class="h-1 flex-1 rounded-full transition-all duration-300"
              :class="i <= passwordStrength.score ? strengthColors[passwordStrength.score] : 'bg-slate-700'"
            ></div>
          </div>
          <p class="text-xs" :class="strengthTextColors[passwordStrength.score]">
            {{ passwordStrength.label }}
          </p>
        </div>
      </div>

      <!-- Confirm Password -->
      <div>
        <label for="reg-confirm" class="block text-sm font-medium text-slate-300 mb-1.5">
          {{ t('confirm_password') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <input
            id="reg-confirm"
            v-model="form.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="••••••••"
            class="input-field pl-10"
            :class="{ 'border-red-500/50 focus:ring-red-500': errors.confirmPassword }"
            @input="clearFieldError('confirmPassword')"
          />
        </div>
        <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-400">{{ errors.confirmPassword }}</p>
      </div>

      <!-- Terms -->
      <div>
        <label class="flex items-start gap-2.5 cursor-pointer group">
          <input
            v-model="form.acceptTerms"
            type="checkbox"
            class="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-accent focus:ring-accent focus:ring-offset-0 focus:ring-offset-dark cursor-pointer"
          />
          <span class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-tight">
            {{ t('agree_to') }}
            <a href="#" class="text-accent hover:underline">{{ t('terms_service') }}</a>
            {{ currentLang === 'de' ? 'und' : 'dan' }}
            <a href="#" class="text-accent hover:underline">{{ t('privacy_policy') }}</a>
          </span>
        </label>
        <p v-if="errors.acceptTerms" class="mt-1 text-xs text-red-400 ml-6">{{ errors.acceptTerms }}</p>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="isLoading"
        class="btn-primary w-full relative"
      >
        <span :class="{ 'opacity-0': isLoading }">{{ t('create_account') }}</span>
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
          <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </button>
    </form>

    <!-- Sign in link -->
    <p class="mt-6 text-center text-sm text-slate-400">
      {{ t('has_account') }}
      <router-link to="/auth/login" class="text-accent hover:text-accent/80 font-medium transition-colors">
        {{ t('sign_in') }}
      </router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { currentLang, t } = useI18n()

const isLoading = ref(false)
const showPassword = ref(false)

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

const errors = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: '',
})

// Password strength colors mapped by score (1-4)
const strengthColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-amber-500',
  3: 'bg-yellow-400',
  4: 'bg-emerald-500',
}

const strengthTextColors: Record<number, string> = {
  1: 'text-red-400',
  2: 'text-amber-400',
  3: 'text-yellow-400',
  4: 'text-emerald-400',
}

const passwordStrength = computed(() => {
  const pw = form.password
  if (!pw) return { score: 0, label: '' }

  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++

  const labels: Record<number, string> = {
    0: 'Too short',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
  }

  return { score, label: labels[score] }
})

function clearFieldError(field: keyof typeof errors) {
  errors[field] = ''
}

function onPasswordInput() {
  clearFieldError('password')
  if (form.confirmPassword && form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  } else {
    errors.confirmPassword = ''
  }
}

function validate(): boolean {
  let valid = true

  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required'
    valid = false
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters'
    valid = false
  }

  if (!form.email) {
    errors.email = 'Email is required'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    valid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    valid = false
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true

  const result = await authStore.register(form.email, form.password, form.fullName.trim())

  if (result.success) {
    if (result.needsConfirmation) {
      toast.info('Check your email', result.message || 'Please confirm your email address.')
      router.push({ name: 'Login' })
    } else {
      toast.success('Account created!', 'Welcome to SpaceOS.')
      router.push({ name: 'SpaceSelector' })
    }
  } else {
    toast.error('Registration failed', result.error || 'Please try again.')
  }

  isLoading.value = false
}
</script>
