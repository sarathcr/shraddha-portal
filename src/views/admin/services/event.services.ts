import { committeeApi } from '@/constants'
import type { ApiResponse } from '@/types'
import type { Event } from '@/types/event'
import axios, { AxiosError } from 'axios'

export const getEvents = async (
  pageNumber: number,
  pageSize: number,
  filterMap: Record<string, string> = {},
): Promise<ApiResponse<Event[]>> => {
  try {
    const response = await committeeApi.post<ApiResponse<Event[]>>('event/pagination', {
      pagination: {
        pageNumber,
        pageSize,
      },
      filterMap,
    })

    return response.data
  } catch (err: unknown) {
    let message = 'Failed to fetch events'
    const errors: string[] | null = null

    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{ message?: string }>
      message = axiosErr.response?.data?.message ?? err.message
    }

    console.error('Failed to fetch events:', err)

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
