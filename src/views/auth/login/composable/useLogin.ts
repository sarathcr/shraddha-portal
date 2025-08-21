import { useRouter } from 'vue-router'
import type { LoginCredentials } from '@/types/login.models'
import { UserLogin } from '../../services/login.service'

interface UseLoginReturn {
  handleLogin: (credentials: LoginCredentials) => Promise<void>
}

export function useLogin(): UseLoginReturn {
  const router = useRouter()

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await UserLogin(credentials)
      if (response) {
        await router.push('/admin/dashboard')
      } else {
        console.error('Login failed:')
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during login:', error.message)
      } else {
        console.error('Unexpected error during login:', error)
      }
    }
  }

  return { handleLogin }
}
