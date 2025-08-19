import { useRouter } from 'vue-router'
import type { LoginCredentials } from '@/types/login.models'
import { UserLogin } from '../../services/login.service'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

interface UseLoginReturn {
  handleLogin: (credentials: LoginCredentials) => Promise<void>
}

export function useLogin(): UseLoginReturn {
  const router = useRouter()
  const toast = useToast()

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await UserLogin(credentials)
      if (response) {
        await router.push('/admin/dashboard')
      } else {
        console.error('Login failed:')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.errorValue
        toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
      } else {
        console.error('Unexpected error during login:', error)
      }
    }
  }

  return { handleLogin }
}
