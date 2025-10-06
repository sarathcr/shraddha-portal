import { api, committeeApi } from '@/constants'
import type { ApiResponse } from '@/types'
import type { Committee, CommitteeRole, CommitteeUser } from '@/types/commitee'
import axios, { AxiosError, type AxiosResponse } from 'axios'

// Get committee list
export const getCommittee = async (
  pageNumber: number,
  pageSize: number,
  multiSortedColumns: { active: string | undefined; direction: string }[] = [],
  filterMap: Record<string, string> = {},
): Promise<ApiResponse<Committee[]>> => {
  try {
    const response = await committeeApi.post<ApiResponse<Committee[]>>('/committee/pagination', {
      pagination: { pageNumber, pageSize },
      multiSortedColumns,
      filterMap,
    })
    return response.data
  } catch (err: unknown) {
    let message = 'Failed to fetch committees'
    const errors: string[] | null = null

    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{ message?: string }>
      message = axiosErr.response?.data?.message ?? err.message
    }

    console.error('Failed to fetch committees:', err)

    return {
      data: [],
      message,
      succeeded: false,
      errors,
      pageNumber: 1,
      pageSize: 0,
      totalPages: 0,
      totalRecords: 0,
    }
  }
}

// Create new committee
export const createCommittee = (newCommittee: Committee): Promise<AxiosResponse<Committee>> => {
  return committeeApi.post<Committee>('/committee', newCommittee)
}

//Edit committee
export const editCommittee = async (
  id: string,
  updatedCommittee: Committee,
): Promise<Committee> => {
  try {
    const { data } = await committeeApi.put<Committee>(`/committee/${id}`, updatedCommittee)
    return data
  } catch (err: unknown) {
    let message = 'Failed to update committee'
    const axiosErr = err as AxiosError<{ errorValue?: string }>
    if (axiosErr.response?.data?.errorValue) {
      message = axiosErr.response.data.errorValue
    }
    throw new Error(message)
  }
}

// Delete committee
export const deleteCommittee = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await committeeApi.delete(`/committee/${id}`)
    const data = response.data
    if (typeof data === 'boolean') {
      return {
        success: data,
        message: data ? 'Committee deleted successfully.' : 'Delete failed',
      }
    }

    return {
      success: data?.succeeded ?? data?.success ?? true,
      message: data?.message ?? 'Committee deleted successfully.',
    }
  } catch (err: unknown) {
    console.error('Failed to delete committee:', err)
    throw err
  }
}

// Get Roles
export const fetchRoles = async (
  pageNumber = -1,
  pageSize = -1,
): Promise<ApiResponse<CommitteeRole[]>> => {
  try {
    const response = await api.post<ApiResponse<CommitteeRole[]>>(
      `/authorization/Roles/pagination`,
      {
        pagination: {
          pageNumber,
          pageSize,
        },
      },
    )
    return response.data
  } catch (err: unknown) {
    console.error('Failed to fetch roles:', err)
    throw err
  }
}

// Get Users
export const fetchUsers = async (
  pageNumber = 1,
  pageSize = 0,
  filterMap?: Record<string, string>,
): Promise<ApiResponse<CommitteeUser[]>> => {
  try {
    const payload = {
      pagination: {
        pageNumber,
        pageSize,
      },
      filterMap: filterMap || {},
    }

    const response = await api.post<ApiResponse<CommitteeUser[]>>(
      `/authorization/users/pagination`,
      payload,
    )

    return response.data
  } catch (err: unknown) {
    console.error('Failed to fetch users:', err)
    throw err
  }
}
