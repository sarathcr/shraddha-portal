import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)

    function setTokens(access: string, refresh: string): void {
      accessToken.value = access
      refreshToken.value = refresh
    }

    function clearTokens(): void {
      accessToken.value = null
      refreshToken.value = null
    }

    return { accessToken, refreshToken, setTokens, clearTokens }
  },
  {
    persist: {
      storage: sessionStorage,
    },
  },
)
