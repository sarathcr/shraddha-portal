import type { ApiResponse } from '@/types/index'
import type { User } from '@/types/user'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/constants'

export const UserService = {
  async getUsersData(pageNumber: number, pageSize: number): Promise<ApiResponse<User[]>> {
    const authStore = useAuthStore()
    const accessToken = authStore.accessToken

    if (!accessToken) {
      throw new Error('Authentication token not found. Please log in again.')
    }

    const payload = {
      multiSortedColumns: [],
      filterMap: {},
      pagination: {
        pageNumber,
        pageSize,
      },
    }

    const response = await api.post<ApiResponse<User[]>>('/authorization/users/pagination', payload)

    return response.data
  },
}
