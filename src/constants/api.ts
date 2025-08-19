import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: 'https://shraddhaportalsecurity.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor → Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor → Handle expired token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()
    const originalRequest = error.config
    if (error.response?.status === 401 && authStore.refreshToken && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshResponse = await axios.post(
          'https://shraddhaportalsecurity.azurewebsites.net/api/auth/refresh',
          {
            refreshToken: authStore.refreshToken,
          },
        )
        const newAccessToken = refreshResponse.data.accessToken
        const newRefreshToken = refreshResponse.data.refreshToken
        authStore.setTokens(newAccessToken, newRefreshToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError)
        authStore.clearTokens()
      }
    }
    return Promise.reject(error)
  },
)

export default api
