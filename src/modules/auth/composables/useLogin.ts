import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/auth/authStore'
import { usePermissionStore } from '@/core/permissions/permissionStore'
import type { LoginCredentials } from '@/modules/auth/types/login.types'
import { loginApi } from '@/modules/auth/services/loginService'
import { useToast } from 'primevue/usetoast'

export function useLogin() {
  const router = useRouter()
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()
  const toast = useToast()

  const isLoading = ref<boolean>(false)

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    isLoading.value = true
    try {
      const response = await loginApi(credentials)

      authStore.setTokens(response.accessToken, response.refreshToken)

      if (response.userPermissions && Array.isArray(response.userPermissions)) {
        permissionStore.setPermissions(response.userPermissions)
      } else {
        await permissionStore.fetchUserPermissions()
      }

      await permissionStore.fetchAvailableModules()

      toast.add({
        severity: 'success',
        summary: 'Welcome Back',
        detail: 'Logged in successfully',
        life: 3000,
      })

      await router.push('/admin/dashboard')
    } catch (error: any) {
      console.error('Login failed:', error)
      toast.add({
        severity: 'error',
        summary: 'Authentication Error',
        detail: error.response?.data?.message || 'Invalid username or password',
        life: 4000,
      })
    } finally {
      isLoading.value = false
    }
  }

  return {
    handleLogin,
    isLoading,
  }
}
