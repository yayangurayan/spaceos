<template>
  <div class="animate-fade-in">
    <h2 class="text-xl font-semibold text-white mb-1">{{ t('sign_in_account') }}</h2>
    <p class="text-sm text-slate-400 mb-6">{{ t('welcome_spaceos') }}</p>

    <!-- Login Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email -->
      <div>
        <label for="login-email" class="block text-sm font-medium text-slate-300 mb-1.5">
          {{ t('email_address') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="login-email"
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
        <div class="flex items-center justify-between mb-1.5">
          <label for="login-password" class="block text-sm font-medium text-slate-300">
            {{ t('password') }}
          </label>
          <button
            type="button"
            class="text-xs text-accent hover:text-accent/80 transition-colors"
            @click="showForgotPassword = true"
          >
            {{ t('forgot_password') }}
          </button>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="login-password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="••••••••"
            class="input-field pl-10 pr-10"
            :class="{ 'border-red-500/50 focus:ring-red-500': errors.password }"
            @input="clearFieldError('password')"
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
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="isLoading"
        class="btn-primary w-full relative"
      >
        <span :class="{ 'opacity-0': isLoading }">{{ t('sign_in') }}</span>
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
          <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </button>
    </form>

    <!-- Sign up link -->
    <p class="mt-6 text-center text-sm text-slate-400">
      {{ t('no_account') }}
      <router-link to="/auth/register" class="text-accent hover:text-accent/80 font-medium transition-colors">
        {{ t('sign_up') }}
      </router-link>
    </p>

    <!-- Forgot Password Modal -->
    <teleport to="body">
      <transition name="modal">
        <div
          v-if="showForgotPassword"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showForgotPassword = false"></div>
          <div class="relative z-10 w-full max-w-sm glass rounded-2xl p-6 animate-slide-in">
            <h3 class="text-lg font-semibold text-white mb-2">{{ t('reset_password') }}</h3>
            <p class="text-sm text-slate-400 mb-4">{{ t('reset_password_desc') }}</p>
            <form @submit.prevent="handleForgotPassword">
              <input
                v-model="forgotEmail"
                type="email"
                required
                placeholder="you@example.com"
                class="input-field w-full mb-4"
              />
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                  @click="showForgotPassword = false"
                >
                  {{ t('cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="forgotLoading"
                  class="btn-primary flex-1 relative"
                >
                  <span :class="{ 'opacity-0': forgotLoading }">{{ t('send_link') }}</span>
                  <div v-if="forgotLoading" class="absolute inset-0 flex items-center justify-center">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/utils/supabase'
import { useI18n } from '@/composables/useI18n'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()

const isLoading = ref(false)
const showPassword = ref(false)
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

function clearFieldError(field: keyof typeof errors) {
  errors[field] = ''
}

function validate(): boolean {
  let valid = true

  if (!form.email) {
    errors.email = t('email_required')
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('email_invalid')
    valid = false
  }

  if (!form.password) {
    errors.password = t('password_required')
    valid = false
  } else if (form.password.length < 6) {
    errors.password = t('password_min_length')
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true

  const result = await authStore.login(form.email, form.password)

  if (result.success) {
    toast.success(t('welcome_back_toast'), t('signed_in_success'))
    router.push({ name: 'SpaceSelector' })
  } else {
    toast.error(t('login_failed'), result.error || t('invalid_credentials'))
  }

  isLoading.value = false
}

async function handleForgotPassword() {
  forgotLoading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.value, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
    toast.success('Email sent!', 'Check your inbox for the reset link.')
    showForgotPassword.value = false
    forgotEmail.value = ''
  } catch (err: any) {
    toast.error('Error', err?.message || 'Failed to send reset email.')
  } finally {
    forgotLoading.value = false
  }
}
</script>
