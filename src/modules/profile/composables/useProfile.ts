import { ref, reactive, computed } from 'vue'
import { formatDateForAPI, parseDDMMYYYY } from '@/utils/dateUtils'
import { useAuthStore } from '@/core/auth/authStore'
import { usePermissionStore } from '@/core/permissions/permissionStore'
import { ProfileService, resolveAvatarUrl, type UserResponseDto } from '../services/profileService'

export interface UserProfile {
  id?: string
  name: string
  email: string
  role: string
  roles?: string[]
  phone: string
  dob: string | null
  avatarUrl: string | null
  rawUserData?: UserResponseDto | null
}

export interface AvatarValidationResult {
  valid: boolean
  error?: string
}

export interface PasswordChangeResult {
  success: boolean
  message: string
}

function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      ),
    )
    return (
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      payload.nameid ||
      payload.sub ||
      payload.id ||
      null
    )
  } catch {
    return null
  }
}

export function filterDisplayRoles(roles: string[]): string[] {
  if (!roles || roles.length === 0) return []
  return roles.filter((r) => r && r.toLowerCase().replace(/\s+/g, '') !== 'normaluser')
}

const createDefaultProfile = (): UserProfile => {
  let authUser: { id?: string; name?: string; email?: string; avatarUrl?: string | null } | null =
    null
  try {
    const authStore = useAuthStore()
    authUser = authStore.user
  } catch {
    // Pinia not yet active in test or outside Vue context
  }

  let defaultRoles = ['Admin HR']
  try {
    const permStore = usePermissionStore()
    if (permStore.userPermissions.length > 0) {
      const permRoles = Array.from(
        new Set(permStore.userPermissions.map((p) => p.role).filter(Boolean)),
      )
      defaultRoles = filterDisplayRoles(permRoles)
    }
  } catch {
    // Pinia not yet active
  }

  return {
    id: authUser?.id,
    name: authUser?.name || 'System Administrator',
    email: authUser?.email || 'admin@shraddha.com',
    role: defaultRoles.join(', '),
    roles: defaultRoles,
    phone: '+91 98765 43210',
    dob: '15-05-1995',
    avatarUrl: authUser?.avatarUrl || null,
  }
}

const sharedProfile = reactive<UserProfile>(createDefaultProfile())
let inFlightFetchPromise: Promise<void> | null = null

export function resetSharedProfile(): void {
  inFlightFetchPromise = null
  Object.assign(sharedProfile, createDefaultProfile())
}

export function useProfile() {
  const profile = sharedProfile

  const displayRoles = computed((): string[] => {
    return filterDisplayRoles(
      sharedProfile.roles && sharedProfile.roles.length > 0
        ? sharedProfile.roles
        : [sharedProfile.role],
    )
  })

  const isEditProfileOpen = ref(false)
  const isChangePasswordOpen = ref(false)
  const isLoading = ref(false)

  const fetchProfile = async (force = false): Promise<void> => {
    // 1. If a fetch is currently in-flight, return the existing promise so duplicate requests are merged!
    if (inFlightFetchPromise) {
      return inFlightFetchPromise
    }

    // 2. If data is already populated and not forced, return immediately
    if (!force && sharedProfile.avatarUrl && sharedProfile.id) {
      return
    }

    inFlightFetchPromise = (async () => {
      try {
        const authStore = useAuthStore()
        const userId = getUserIdFromToken(authStore.accessToken)
        if (!userId) return

        isLoading.value = true
        const userData = await ProfileService.getProfile(userId)
        if (userData) {
          sharedProfile.id = userData.id
          sharedProfile.rawUserData = userData
          sharedProfile.name = userData.name || sharedProfile.name
          sharedProfile.email = userData.email || sharedProfile.email
          if (userData.dob) {
            sharedProfile.dob = userData.dob
          }
          if (userData.roles && userData.roles.length > 0) {
            const roleNames = userData.roles.map((r) => r.roleName)
            const filtered = filterDisplayRoles(roleNames)
            sharedProfile.roles = filtered
            sharedProfile.role = filtered.join(', ')
          }
          if (userData.avatarUrl) {
            const resolved = resolveAvatarUrl(userData.avatarUrl)
            sharedProfile.avatarUrl = resolved
            authStore.setAvatar(resolved)
          }
          authStore.setUser({
            id: userData.id,
            name: sharedProfile.name,
            email: sharedProfile.email,
            avatarUrl: sharedProfile.avatarUrl,
          })
        }
      } catch (err) {
        // In development or testing without active backend, keep initial state
        console.warn('Failed to fetch profile from server:', err)
      } finally {
        isLoading.value = false
        inFlightFetchPromise = null
      }
    })()

    return inFlightFetchPromise
  }

  const validateAvatar = (file: File): AvatarValidationResult => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only PNG, JPG, or JPEG images are supported.',
      }
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 2MB.',
      }
    }

    return { valid: true }
  }

  const handleAvatarUpload = async (file: File): Promise<AvatarValidationResult> => {
    const validation = validateAvatar(file)
    if (!validation.valid) {
      return validation
    }

    if (profile.avatarUrl && profile.avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(profile.avatarUrl)
    }

    // Set immediate preview
    profile.avatarUrl = URL.createObjectURL(file)

    try {
      const result = await ProfileService.uploadAvatar(file)
      if (result && result.avatarUrl) {
        if (profile.avatarUrl.startsWith('blob:')) {
          URL.revokeObjectURL(profile.avatarUrl)
        }
        const resolved = resolveAvatarUrl(result.avatarUrl)
        profile.avatarUrl = resolved
        const authStore = useAuthStore()
        authStore.setAvatar(resolved)
      }
    } catch (err) {
      console.warn('Avatar upload network call encountered error:', err)
    }

    return { valid: true }
  }

  const updateProfile = async (details: {
    name: string
    phone: string
    dob: Date | string | null
  }): Promise<void> => {
    profile.name = details.name.trim()
    profile.phone = details.phone.trim()

    let dobString = ''
    if (details.dob instanceof Date) {
      dobString = formatDateForAPI(details.dob)
      profile.dob = dobString
    } else if (typeof details.dob === 'string' && details.dob.trim()) {
      dobString = details.dob.trim()
      profile.dob = dobString
    } else {
      profile.dob = null
    }

    try {
      const authStore = useAuthStore()
      const userId = profile.id || getUserIdFromToken(authStore.accessToken)
      if (userId && profile.rawUserData) {
        await ProfileService.updateProfile(userId, {
          name: profile.name,
          employeeId: profile.rawUserData.employeeId,
          email: profile.email,
          dob: dobString || profile.rawUserData.dob,
          teamId: Number(profile.rawUserData.teamId) || 1,
          roles: profile.rawUserData.roles?.map((r) => r.roleId) || ['7'],
          isActive: profile.rawUserData.isActive ?? true,
        })
      }
    } catch (err) {
      console.warn('Failed to update profile on backend:', err)
    } finally {
      isEditProfileOpen.value = false
    }
  }

  const changePassword = async (
    currentPass: string,
    newPass: string,
    confirmPass: string,
  ): Promise<PasswordChangeResult> => {
    if (!currentPass.trim()) {
      return { success: false, message: 'Current password is required.' }
    }

    if (newPass.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters long.',
      }
    }

    if (newPass !== confirmPass) {
      return { success: false, message: 'New password and confirm password do not match.' }
    }

    try {
      await ProfileService.changePassword({
        currentPassword: currentPass,
        newPassword: newPass,
        confirmPassword: confirmPass,
      })
      isChangePasswordOpen.value = false
      return { success: true, message: 'Password updated successfully.' }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; errorValue?: string } }
        message?: string
      }
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.errorValue ||
        axiosErr?.message ||
        'Failed to update password.'
      return { success: false, message: msg }
    }
  }

  const getParsedDOB = (): Date | null => {
    return parseDDMMYYYY(profile.dob ?? undefined)
  }

  return {
    profile,
    displayRoles,
    isEditProfileOpen,
    isChangePasswordOpen,
    isLoading,
    fetchProfile,
    validateAvatar,
    handleAvatarUpload,
    updateProfile,
    changePassword,
    getParsedDOB,
  }
}
