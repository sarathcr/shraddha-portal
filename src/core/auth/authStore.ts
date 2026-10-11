import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)

    function setTokens(newAccess: string, newRefresh: string): void {
      accessToken.value = newAccess
      refreshToken.value = newRefresh
    }

    function clearTokens(): void {
      accessToken.value = null
      refreshToken.value = null
    }

    return {
      accessToken,
      refreshToken,
      setTokens,
      clearTokens,
    }
  },
  {
    persist: true,
  },
)
