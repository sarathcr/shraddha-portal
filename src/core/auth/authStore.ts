import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AuthUser {
  id?: string
  name?: string
  email?: string
  avatarUrl?: string | null
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const user = ref<AuthUser | null>(null)

    function setTokens(newAccess: string, newRefresh: string): void {
      accessToken.value = newAccess
      refreshToken.value = newRefresh
    }

    function setUser(newUser: AuthUser | null): void {
      user.value = newUser
    }

    function setAvatar(newAvatarUrl: string | null): void {
      if (user.value) {
        user.value.avatarUrl = newAvatarUrl
      } else {
        user.value = { avatarUrl: newAvatarUrl }
      }
    }

    function clearTokens(): void {
      accessToken.value = null
      refreshToken.value = null
      user.value = null
    }

    return {
      accessToken,
      refreshToken,
      user,
      setTokens,
      setUser,
      setAvatar,
      clearTokens,
    }
  },
  {
    persist: true,
  },
)
