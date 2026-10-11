import type { LoginResponse, LoginCredentials } from '@/modules/auth/types/login.types'
import { createApi } from '@/api/httpClient'
import { SECURITY_API_BASE_URL } from '@/api/apiConfig'
import { encryptPassword } from '@/shared/utils/rsaEncrypt'

const api = createApi(SECURITY_API_BASE_URL)

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  const encryptedPassword = encryptPassword(credentials.password)

  const response = await api.post<LoginResponse>('/authorization/login', {
    email: credentials.email,
    password: encryptedPassword,
  })

  return response.data
}
