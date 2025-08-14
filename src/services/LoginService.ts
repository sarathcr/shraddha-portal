import type { LoginResponse } from '@/types/index'
import api from '../constants/api'
import type { LoginCredentials } from '@/types/login.models'

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse<{ accessToken: string; refreshToken: string }>> => {
  const response = await api.post<LoginResponse<{ accessToken: string; refreshToken: string }>>(
    '/authorization/login',
    credentials,
  )
  return response.data
}
