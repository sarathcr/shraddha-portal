// api/interceptors.ts
import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export const setupInterceptors = (instance: AxiosInstance): void => {
  const router = useRouter()

  // Request interceptor → attach token
  instance.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore()
      if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Response interceptor → refresh token
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const authStore = useAuthStore()
      const originalRequest = error.config

      if (error.response?.status === 401 && authStore.refreshToken && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          const refreshResponse = await axios.post(
            'https://shraddhaportalsecurity.azurewebsites.net/api/authorization/refresh-token',
            { refreshToken: authStore.refreshToken },
          )

          const newAccessToken = refreshResponse.data.accessToken
          const newRefreshToken = refreshResponse.data.refreshToken

          authStore.setTokens(newAccessToken, newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          return instance(originalRequest)
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError)
          authStore.clearTokens()
          void router.push('/login')
        }
      }

      return Promise.reject(error)
    },
  )
}
