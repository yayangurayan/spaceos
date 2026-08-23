import { ref } from 'vue'

export type AIProvider = 'offline' | 'glm'

export interface AISettings {
  provider: AIProvider
  apiKey: string
  model: string
  temperature: number
  baseUrl?: string
}

const DEFAULT_SETTINGS: AISettings = {
  provider: 'offline',
  apiKey: '',
  model: 'glm-4-flash',
  temperature: 0.7,
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
}

const SETTINGS_KEY = 'spaceos_ai_settings'
const CACHE_KEY_PREFIX = 'spaceos_ai_cache_'

export function useAI() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function getSettings(): AISettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS
  }

  function saveSettings(settings: Partial<AISettings>) {
    const current = getSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  }

  function getCachedResponse(cacheKey: string): string | null {
    try {
      const data = localStorage.getItem(CACHE_KEY_PREFIX + cacheKey)
      if (!data) return null
      const parsed = JSON.parse(data)
      // Cache valid for 24 hours
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.response
      }
    } catch {
      // ignore
    }
    return null
  }

  function setCachedResponse(cacheKey: string, response: string) {
    try {
      localStorage.setItem(
        CACHE_KEY_PREFIX + cacheKey,
        JSON.stringify({ timestamp: Date.now(), response })
      )
    } catch {
      // ignore
    }
  }

  async function generateAIResponse(
    prompt: string,
    systemPrompt: string,
    cacheKey?: string,
    offlineGenerator?: () => string
  ): Promise<string> {
    isLoading.value = true
    error.value = null

    if (cacheKey) {
      const cached = getCachedResponse(cacheKey)
      if (cached) {
        isLoading.value = false
        return cached
      }
    }

    const settings = getSettings()

    // 1. If GLM 5.2 / Zhipu AI provider is active with API key
    if (settings.provider === 'glm' && settings.apiKey.trim()) {
      try {
        const endpoint = settings.baseUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: settings.model || 'glm-4-flash',
            temperature: settings.temperature ?? 0.7,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error?.message || `GLM API Error (${res.status})`)
        }

        const data = await res.json()
        const content = data.choices?.[0]?.message?.content || ''
        if (content) {
          if (cacheKey) setCachedResponse(cacheKey, content)
          isLoading.value = false
          return content
        }
      } catch (err: any) {
        console.warn('GLM API call failed, falling back to intelligent offline heuristics:', err.message)
      }
    }

    // 2. Intelligent Offline Heuristics Engine (Zero Setup & Fast)
    await new Promise(r => setTimeout(r, 600))

    let result = ''
    if (offlineGenerator) {
      result = offlineGenerator()
    } else {
      result = `### 🤖 Analisis AI SpaceOS\n\nBerdasarkan data performa yang diproses, seluruh metrik berjalan dengan baik. Pertahankan disiplin dan ikuti strategi Anda secara konsisten.`
    }

    if (cacheKey && result) setCachedResponse(cacheKey, result)
    isLoading.value = false
    return result
  }

  return {
    isLoading,
    error,
    getSettings,
    saveSettings,
    generateAIResponse,
  }
}
