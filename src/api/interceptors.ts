import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { useAuthStore } from '@/core/auth/authStore'
import { usePermissionStore } from '@/core/permissions/permissionStore'
import router from '@/core/router'
import { SECURITY_API_BASE_URL } from '@/api/apiConfig'

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

export const setupInterceptors = (instance: AxiosInstance): void => {
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
      const originalRequest = error.config as CustomRequestConfig | undefined

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (!authStore.refreshToken) {
          const permissionStore = usePermissionStore()
          authStore.clearTokens()
          permissionStore.clearPermissions()
          await router.push('/login')
          return Promise.reject(error)
        }

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return instance(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshResponse = await axios.post(
            `${SECURITY_API_BASE_URL}/authorization/refresh-token`,
            { refreshToken: authStore.refreshToken },
          )

          const newAccessToken: string = refreshResponse.data.accessToken
          const newRefreshToken: string = refreshResponse.data.refreshToken

          authStore.setTokens(newAccessToken, newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          processQueue(null, newAccessToken)

          return instance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          const permissionStore = usePermissionStore()
          authStore.clearTokens()
          permissionStore.clearPermissions()
          await router.push('/login')
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    },
  )
}
