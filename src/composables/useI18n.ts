import { ref } from 'vue'
import { translations } from '../i18n/translations'

const savedLang = localStorage.getItem('spaceos_lang') as 'id' | 'de' | null
const currentLang = ref<'id' | 'de'>(savedLang === 'de' ? 'de' : 'id')

export function useI18n() {
  function t(key: string, replacements?: Record<string, string | number>): string {
    const dict = translations[currentLang.value] as Record<string, string>
    let text = dict[key] || translations['id'][key as keyof typeof translations['id']] || key
    
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    
    return text
  }

  function toggleLang() {
    currentLang.value = currentLang.value === 'id' ? 'de' : 'id'
    localStorage.setItem('spaceos_lang', currentLang.value)
  }

  return {
    currentLang,
    t,
    toggleLang
  }
}
