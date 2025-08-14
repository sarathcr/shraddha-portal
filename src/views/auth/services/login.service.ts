import { encryptWithRSA } from '@/utils/rsaEncrypt'
import type { LoginCredentials } from '@/types/login.models'
import { login } from '@/services/LoginService'
import type { LoginResponse } from '@/types'
import { useAuthStore } from '@/stores/auth'

export const UserLogin = async (
  credentials: LoginCredentials,
): Promise<LoginResponse<{ accessToken: string; refreshToken: string }>> => {
  const encryptedPassword = encryptWithRSA(credentials.password)
  if (!encryptedPassword) throw new Error('Password encryption failed')

  const data = (await login({
    ...credentials,
    password: encryptedPassword,
  })) as LoginResponse<{ accessToken: string; refreshToken: string }>
  if (data?.accessToken && data?.refreshToken) {
    const authStore = useAuthStore()
    authStore.setTokens(data.accessToken, data.refreshToken)
  }

  return data
}
