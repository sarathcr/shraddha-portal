import { encryptWithRSA } from '@/utils/rsaEncrypt'
import type { LoginCredentials } from '@/types/login.models'
import type { LoginApiResult } from '@/types/permissions'
import { api } from '@/constants'

import { usePermissionStore } from '@/stores/permission'
import { useAuthStore } from '@/stores/auth'

export const UserLogin = async (credentials: LoginCredentials): Promise<LoginApiResult> => {
  const encryptedPassword = encryptWithRSA(credentials.password)
  if (!encryptedPassword) throw new Error('Password encryption failed')

  const response = await api.post<LoginApiResult>('/authorization/login', {
    ...credentials,
    password: encryptedPassword,
  })

  const data: LoginApiResult = response.data
  const authStore = useAuthStore()

  const permissionStore = usePermissionStore()
  authStore.setTokens(data.accessToken, data.refreshToken)

  permissionStore.setPermissions(data.userPermissions)

  await permissionStore.loadModuleNames(true)

  return data
}
