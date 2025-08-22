import { useRouter } from 'vue-router'
import type { LoginCredentials } from '@/types/login.models'
import { UserLogin } from '../../services/login.service'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { setLoading, isLoading } from '@/stores/loader' // <- import isLoading

interface UseLoginReturn {
  handleLogin: (credentials: LoginCredentials) => Promise<void>
  isLoading: typeof isLoading
}

export function useLogin(): UseLoginReturn {
  const router = useRouter()
  const toast = useToast()
  const authStore = useAuthStore()

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true)
    try {
      const response = await UserLogin(credentials)
      if (response) {
        await router.push('/admin/dashboard')
      } else {
        console.error('Login failed:')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          authStore.$reset()
          toast.add({
            severity: 'warn',
            summary: 'Session Expired',
            detail: 'Your session has expired. Please log in again.',
            life: 3000,
          })
          await router.push('/login')
        } else {
          const message = error.response?.data?.errorValue || 'An error occurred.'
          toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return { handleLogin, isLoading }
}
