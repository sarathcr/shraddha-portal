import { committeeApi } from '@/constants'
import type { ApiResponse } from '@/types'
import type { EventType } from '@/types/event'
import axios, { AxiosError } from 'axios'

export const getEventTypes = async (
  pageNumber = 1,
  pageSize = 10,
  filterMap: Record<string, string> = {},
): Promise<ApiResponse<EventType[]>> => {
  try {
    const response = await committeeApi.post<ApiResponse<EventType[]>>(
      'committee/EventType/pagination',
      {
        pagination: {
          pageNumber,
          pageSize,
        },
        filterMap,
      },
    )

    return response.data
  } catch (err: unknown) {
    let message = 'Failed to fetch event types'
    const errors: string[] | null = null

    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{ message?: string }>
      message = axiosErr.response?.data?.message ?? err.message
    }

    console.error('Failed to fetch event types:', err)

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
