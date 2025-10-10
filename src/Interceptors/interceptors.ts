// api/interceptors.ts
import type {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export const setupInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const authStore = useAuthStore()
      if (authStore.accessToken) {
        if (config.headers && 'set' in config.headers && typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
        }
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Response interceptor → handle token refresh & login redirect
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const authStore = useAuthStore()
      const router = useRouter()
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
      const status = error.response?.status
      if ((status === 401 || status === 400) && authStore.refreshToken && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          const refreshResponse = await axios.post(
            'https://shraddhaportalsecurity.azurewebsites.net/api/authorization/refresh-token',
            { refreshToken: authStore.refreshToken },
          )

          const newAccessToken = refreshResponse.data.accessToken
          const newRefreshToken = refreshResponse.data.refreshToken

          authStore.setTokens(newAccessToken, newRefreshToken)
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          return instance(originalRequest)
        } catch (refreshError) {
          console.error('Refresh token failed', refreshError)
          authStore.clearTokens()
          void router.push('/login')
        }
      } else if (status === 401 || status === 400) {
        authStore.clearTokens()
        void router.push('/login')
      }

      return Promise.reject(error)
    },
  )
}
