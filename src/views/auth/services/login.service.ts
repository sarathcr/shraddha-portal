import { encryptWithRSA } from '@/utils/rsaEncrypt'
import type { LoginCredentials } from '@/types/login.models'
import type { LoginResponse } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/constants'

export const UserLogin = async (
  credentials: LoginCredentials,
): Promise<LoginResponse<{ accessToken: string; refreshToken: string }>> => {
  const encryptedPassword = encryptWithRSA(credentials.password)
  if (!encryptedPassword) throw new Error('Password encryption failed')
  const response = await api.post<LoginResponse<{ accessToken: string; refreshToken: string }>>(
    '/authorization/login',
    {
      ...credentials,
      password: encryptedPassword,
    },
  )
  const data = response.data

  if (data?.accessToken && data?.refreshToken) {
    const authStore = useAuthStore()
    authStore.setTokens(data.accessToken, data.refreshToken)
    console.error(authStore)
  }

  return data
}
