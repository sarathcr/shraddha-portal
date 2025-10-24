import { encryptWithRSA } from '@/utils/rsaEncrypt'
import type { LoginCredentials } from '@/types/login.models'
import type { LoginApiResult } from '@/types/permissions'
import { api } from '@/constants'

export const UserLogin = async (credentials: LoginCredentials): Promise<LoginApiResult> => {
  const encryptedPassword = encryptWithRSA(credentials.password)
  if (!encryptedPassword) throw new Error('Password encryption failed')

  const response = await api.post<LoginApiResult>('/authorization/login', {
    ...credentials,
    password: encryptedPassword,
  })

  const data: LoginApiResult = response.data

  return data
}
