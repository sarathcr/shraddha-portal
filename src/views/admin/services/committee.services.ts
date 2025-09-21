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

// Edit committee
export const editCommittee = async (
  updatedCommittee: Committee,
): Promise<{ succeeded: boolean; data: Committee }> => {
  try {
    const response = await committeeApi.put<{ succeeded: boolean; data: Committee }>(
      `/committee/${updatedCommittee.id}`,
      updatedCommittee,
    )
    return response.data
  } catch (err: unknown) {
    console.error('Failed to edit committee:', err)
    throw err
  }
}

// Delete committee
export const deleteCommittee = async (
  id: string,
): Promise<{ succeeded: boolean; message: string }> => {
  try {
    const response = await committeeApi.delete<{ succeeded: boolean; message: string }>(
      `/committee/${id}`,
    )
    return response.data
  } catch (err: unknown) {
    console.error('Failed to delete committee:', err)
    throw err
  }
}

// Get Roles
export const fetchRoles = async (
  pageNumber = -1,
  pageSize = 0,
): Promise<ApiResponse<CommitteeRole[]>> => {
  try {
    const response = await api.post<ApiResponse<CommitteeRole[]>>(
      `/authorization/Roles/pagination`,
      { pageNumber, pageSize },
    )
    return response.data
  } catch (err: unknown) {
    console.error('Failed to fetch roles:', err)
    throw err
  }
}

// Get Users
export const fetchUsers = async (
  pageNumber: -1,
  pageSize: 0,
): Promise<ApiResponse<CommitteeUser[]>> => {
  try {
    const response = await api.post<ApiResponse<CommitteeUser[]>>(
      `/authorization/users/pagination`,
      {
        pageNumber,
        pageSize,
      },
    )
    return response.data
  } catch (err: unknown) {
    console.error('Failed to fetch users:', err)
    throw err
  }
}
