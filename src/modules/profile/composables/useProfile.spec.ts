import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/core/auth/authStore'
import { useProfile, resetSharedProfile, filterDisplayRoles } from './useProfile'
import { ProfileService } from '../services/profileService'

vi.mock('../services/profileService', () => ({
  ProfileService: {
    getProfile: vi.fn(),
    uploadAvatar: vi
      .fn()
      .mockResolvedValue({ avatarUrl: '/uploads/avatars/new-avatar.png', message: 'Success' }),
    deleteAvatar: vi.fn().mockResolvedValue({ message: 'Deleted' }),
    updateProfile: vi.fn().mockResolvedValue(undefined),
    changePassword: vi.fn().mockResolvedValue(undefined),
  },
  resolveAvatarUrl: vi.fn((url: string | null) =>
    url ? `https://dev-shraddhaportal-gateway.runasp.net${url}` : null,
  ),
}))

describe('useProfile Composable', () => {
  let profileComposable: ReturnType<typeof useProfile>

  beforeEach(() => {
    setActivePinia(createPinia())
    resetSharedProfile()
    vi.clearAllMocks()
    profileComposable = useProfile()
    global.URL.createObjectURL = vi.fn((file: Blob) => `blob:mock-url-${file.size}`)
    global.URL.revokeObjectURL = vi.fn()
  })

  it('initializes with default profile state', () => {
    const { profile, isEditProfileOpen, isChangePasswordOpen } = profileComposable
    expect(profile.name).toBe('System Administrator')
    expect(profile.email).toBe('admin@shraddha.com')
    expect(profile.role).toBe('Admin HR')
    expect(profile.phone).toBe('+91 98765 43210')
    expect(profile.dob).toBe('15-05-1995')
    expect(profile.avatarUrl).toBeNull()
    expect(isEditProfileOpen.value).toBe(false)
    expect(isChangePasswordOpen.value).toBe(false)
  })

  describe('Avatar Validation & Upload', () => {
    it('validates correct image types and sizes', () => {
      const validPng = new File(['dummy content'], 'avatar.png', { type: 'image/png' })
      const result = profileComposable.validateAvatar(validPng)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects unsupported file formats', () => {
      const pdfFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' })
      const result = profileComposable.validateAvatar(pdfFile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Only PNG, JPG, or JPEG images are supported.')
    })

    it('rejects files larger than 2MB', () => {
      // 3MB buffer
      const largeBlob = new Blob([new Uint8Array(3 * 1024 * 1024)], { type: 'image/jpeg' })
      const largeFile = new File([largeBlob], 'heavy.jpg', { type: 'image/jpeg' })
      const result = profileComposable.validateAvatar(largeFile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Image size must be less than 2MB.')
    })

    it('handles successful avatar upload and sets resolved URL after backend call', async () => {
      const validJpg = new File(['photo content'], 'photo.jpg', { type: 'image/jpeg' })
      const result = await profileComposable.handleAvatarUpload(validJpg)

      expect(result.valid).toBe(true)
      expect(ProfileService.uploadAvatar).toHaveBeenCalledWith(validJpg)
      expect(profileComposable.profile.avatarUrl).toBe(
        'https://dev-shraddhaportal-gateway.runasp.net/uploads/avatars/new-avatar.png',
      )
    })

    it('revokes previous object URL when uploading a second avatar', async () => {
      const file1 = new File(['1'], '1.png', { type: 'image/png' })
      const file2 = new File(['2'], '2.png', { type: 'image/png' })

      await profileComposable.handleAvatarUpload(file1)
      await profileComposable.handleAvatarUpload(file2)
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('does not update avatarUrl when validation fails', async () => {
      const invalidFile = new File(['text'], 'text.txt', { type: 'text/plain' })
      const result = await profileComposable.handleAvatarUpload(invalidFile)

      expect(result.valid).toBe(false)
      expect(profileComposable.profile.avatarUrl).toBeNull()
      expect(ProfileService.uploadAvatar).not.toHaveBeenCalled()
    })
  })

  describe('Update Profile & DOB Normalization', () => {
    it('updates profile name, phone, and formats Date object DOB', async () => {
      profileComposable.isEditProfileOpen.value = true
      const newDob = new Date(1992, 9, 24) // 24-10-1992

      await profileComposable.updateProfile({
        name: 'Jane Doe',
        phone: '+91 91234 56789',
        dob: newDob,
      })

      expect(profileComposable.profile.name).toBe('Jane Doe')
      expect(profileComposable.profile.phone).toBe('+91 91234 56789')
      expect(profileComposable.profile.dob).toBe('24-10-1992')
      expect(profileComposable.isEditProfileOpen.value).toBe(false)
    })

    it('updates profile with string DOB', async () => {
      await profileComposable.updateProfile({
        name: 'John Smith',
        phone: '+91 99999 88888',
        dob: '01-01-2000',
      })

      expect(profileComposable.profile.dob).toBe('01-01-2000')
    })

    it('handles null DOB', async () => {
      await profileComposable.updateProfile({
        name: 'No DOB User',
        phone: '+91 99999 00000',
        dob: null,
      })

      expect(profileComposable.profile.dob).toBeNull()
    })

    it('correctly parses DD-MM-YYYY string to Date via getParsedDOB', () => {
      profileComposable.profile.dob = '15-05-1995'
      const parsed = profileComposable.getParsedDOB()

      expect(parsed).toBeInstanceOf(Date)
      expect(parsed?.getDate()).toBe(15)
      expect(parsed?.getMonth()).toBe(4) // 0-indexed month
      expect(parsed?.getFullYear()).toBe(1995)
    })
  })

  describe('Change Password Logic', () => {
    it('returns error when current password is empty', async () => {
      const result = await profileComposable.changePassword('   ', 'newpass123', 'newpass123')
      expect(result.success).toBe(false)
      expect(result.message).toBe('Current password is required.')
    })

    it('returns error when new password is too short', async () => {
      const result = await profileComposable.changePassword('current123', 'short', 'short')
      expect(result.success).toBe(false)
      expect(result.message).toBe('New password must be at least 6 characters long.')
    })

    it('returns error when confirm password does not match new password', async () => {
      const result = await profileComposable.changePassword(
        'current123',
        'password123',
        'different123',
      )
      expect(result.success).toBe(false)
      expect(result.message).toBe('New password and confirm password do not match.')
    })

    it('successfully changes password when inputs are valid', async () => {
      profileComposable.isChangePasswordOpen.value = true
      const result = await profileComposable.changePassword(
        'current123',
        'password123',
        'password123',
      )

      expect(result.success).toBe(true)
      expect(result.message).toBe('Password updated successfully.')
      expect(profileComposable.isChangePasswordOpen.value).toBe(false)
      expect(ProfileService.changePassword).toHaveBeenCalledWith({
        currentPassword: 'current123',
        newPassword: 'password123',
        confirmPassword: 'password123',
      })
    })

    it('filters out NormalUser and displays all other roles in fetchProfile', async () => {
      const authStore = useAuthStore()
      authStore.setTokens('dummy.eyJzdWIiOiIxIn0.sig', 'refresh')

      vi.spyOn(ProfileService, 'getProfile').mockResolvedValueOnce({
        id: '1',
        name: 'System Administrator',
        employeeId: 'EMP001',
        email: 'admin@shraddha.com',
        team: 'DotNet',
        teamId: '5',
        dob: '1995-05-15',
        avatarUrl: null,
        roles: [
          { roleId: '1', roleName: 'NormalUser' },
          { roleId: '7', roleName: 'AdminHR' },
          { roleId: '2', roleName: 'President' },
        ],
        isActive: true,
      })

      await profileComposable.fetchProfile(true)

      expect(profileComposable.displayRoles.value).toEqual(['AdminHR', 'President'])
      expect(profileComposable.profile.roles).toEqual(['AdminHR', 'President'])
      expect(profileComposable.profile.role).toBe('AdminHR, President')
      expect(profileComposable.displayRoles.value).not.toContain('NormalUser')
    })

    it('does not display any badge if user only has NormalUser role', async () => {
      const authStore = useAuthStore()
      authStore.setTokens('dummy.eyJzdWIiOiIxIn0.sig', 'refresh')

      vi.spyOn(ProfileService, 'getProfile').mockResolvedValueOnce({
        id: '2',
        name: 'Regular Employee',
        employeeId: 'EMP002',
        email: 'employee@shraddha.com',
        team: 'QA',
        teamId: '2',
        dob: '1998-01-01',
        avatarUrl: null,
        roles: [{ roleId: '1', roleName: 'NormalUser' }],
        isActive: true,
      })

      await profileComposable.fetchProfile(true)

      expect(profileComposable.displayRoles.value).toEqual([])
      expect(profileComposable.profile.roles).toEqual([])
      expect(profileComposable.profile.role).toBe('')
    })
  })

  describe('filterDisplayRoles utility', () => {
    it('removes NormalUser or Normal User when other roles exist', () => {
      expect(filterDisplayRoles(['NormalUser', 'AdminHR', 'President'])).toEqual([
        'AdminHR',
        'President',
      ])
      expect(filterDisplayRoles(['Normal User', 'Director'])).toEqual(['Director'])
    })

    it('returns empty array if user only has NormalUser role', () => {
      expect(filterDisplayRoles(['NormalUser'])).toEqual([])
      expect(filterDisplayRoles(['Normal User'])).toEqual([])
    })

    it('handles empty roles array safely', () => {
      expect(filterDisplayRoles([])).toEqual([])
    })
  })
})
