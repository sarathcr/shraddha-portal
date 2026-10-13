import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLogin } from './useLogin'
import * as loginService from '@/modules/auth/services/loginService'
import { useAuthStore } from '@/core/auth/authStore'
import { usePermissionStore } from '@/core/permissions/permissionStore'

const pushMock = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
    }),
  }
})

const toastAddMock = vi.fn()
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: toastAddMock,
  }),
}))

describe('useLogin Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('handles successful login and redirects to dashboard', async () => {
    const authStore = useAuthStore()
    const permStore = usePermissionStore()

    vi.spyOn(loginService, 'loginApi').mockResolvedValue({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      userPermissions: [
        {
          role: 'Admin',
          module: 'Dashboard',
          permissions: ['READ', 'CREATE'],
        },
      ],
    })
    vi.spyOn(permStore, 'fetchAvailableModules').mockResolvedValue([])

    const { handleLogin, isLoading } = useLogin()
    expect(isLoading.value).toBe(false)

    await handleLogin({ email: 'admin@shraddha.com', password: 'password' })

    expect(authStore.accessToken).toBe('test-token')
    expect(permStore.userPermissions).toHaveLength(1)
    expect(pushMock).toHaveBeenCalledWith('/admin/dashboard')
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }))
    expect(isLoading.value).toBe(false)
  })

  it('handles login failure gracefully', async () => {
    vi.spyOn(loginService, 'loginApi').mockRejectedValue({
      response: { data: { message: 'Bad credentials' } },
    })

    const { handleLogin, isLoading } = useLogin()

    await handleLogin({ email: 'admin@shraddha.com', password: 'wrong' })

    expect(toastAddMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        detail: 'Bad credentials',
      }),
    )
    expect(isLoading.value).toBe(false)
  })

  it('stores user profile and avatar in authStore upon login', async () => {
    const authStore = useAuthStore()
    const permStore = usePermissionStore()

    vi.spyOn(loginService, 'loginApi').mockResolvedValue({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      avatarUrl: '/uploads/avatars/my-avatar.png',
      name: 'System Administrator',
      email: 'admin@shraddha.com',
      userPermissions: [],
    })
    vi.spyOn(permStore, 'fetchAvailableModules').mockResolvedValue([])

    const { handleLogin } = useLogin()
    await handleLogin({ email: 'admin@shraddha.com', password: 'password' })

    expect(authStore.user?.avatarUrl).toContain('/uploads/avatars/my-avatar.png')
    expect(authStore.user?.name).toBe('System Administrator')
    expect(authStore.user?.email).toBe('admin@shraddha.com')
  })
})
