import { api } from '@/shared/constants'
import { SECURITY_SERVICE_BASE_URL, normalizeUrl } from '@/api/apiConfig'
import { encryptPassword } from '@/shared/utils/rsaEncrypt'

export interface UserResponseDto {
  id: string
  name: string
  employeeId: string
  email: string
  team: string
  teamId: string
  dob: string
  avatarUrl: string | null
  roles: Array<{ roleId: string; roleName: string }>
  isActive: boolean
}

export interface UploadAvatarResponseDto {
  avatarUrl: string
  message: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfilePayload {
  name: string
  employeeId?: string
  email?: string
  dob: string
  teamId?: number
  roles?: string[]
  isActive?: boolean
}

/**
 * Resolves avatar relative URLs (e.g. /uploads/avatars/guid.png) to the Security microservice full URL
 */
export function resolveAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null
  if (
    avatarUrl.startsWith('http://') ||
    avatarUrl.startsWith('https://') ||
    avatarUrl.startsWith('blob:') ||
    avatarUrl.startsWith('data:')
  ) {
    return avatarUrl
  }
  const base = normalizeUrl(SECURITY_SERVICE_BASE_URL)
  const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`
  return `${base}${path}`
}

export const ProfileService = {
  async getProfile(userId: string): Promise<UserResponseDto> {
    const response = await api.get<UserResponseDto>(
      `/authorization/users/${encodeURIComponent(userId)}`,
    )
    return response.data
  },

  async uploadAvatar(file: File): Promise<UploadAvatarResponseDto> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<UploadAvatarResponseDto>(
      '/authorization/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return response.data
  },

  async deleteAvatar(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/authorization/users/avatar')
    return response.data
  },

  async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<void> {
    await api.put(`/authorization/users/${encodeURIComponent(userId)}`, payload)
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    const encryptedPayload = {
      currentPassword: encryptPassword(payload.currentPassword),
      newPassword: encryptPassword(payload.newPassword),
      confirmPassword: encryptPassword(payload.confirmPassword),
    }
    await api.post('/authorization/change-password', encryptedPayload)
  },
}
