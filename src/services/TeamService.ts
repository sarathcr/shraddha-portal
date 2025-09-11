import type { Team } from '@/types/team'
import type { ApiResponse } from '@/types/index'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/constants'

export const TeamService = {
  async getTeamsData(pageNumber: number, pageSize: number): Promise<ApiResponse<Team[]>> {
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

    const response = await api.post<ApiResponse<Team[]>>(
      '/authorization/Departments/pagination',
      payload,
    )

    return response.data
  },
}
