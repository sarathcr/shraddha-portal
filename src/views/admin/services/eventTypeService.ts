import { committeeApi } from '@/constants'
import type { ApiResponse } from '@/types'
import type { EventType } from '@/types/eventType.model'
import axios, { AxiosError, type AxiosResponse } from 'axios'

export const getEventTypes = async (
  pageNumber = 1,
  pageSize = 10,
  multiSortedColumns: { active: string | undefined; direction: string }[] = [],
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
        multiSortedColumns,
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

// Create new Eventype
export const createEventType = (newEventType: EventType): Promise<AxiosResponse<EventType>> => {
  return committeeApi.post<EventType>('/committee/EventType', newEventType)
}

//Edit EventType
export const editEventType = async (
  id: string,
  updatedEventType: EventType,
): Promise<EventType> => {
  try {
    const { data } = await committeeApi.put<EventType>(
      `/committee/EventType//${id}`,
      updatedEventType,
    )
    return data
  } catch (err: unknown) {
    let message = 'Failed to update event type'
    const axiosErr = err as AxiosError<{ errorValue?: string }>
    if (axiosErr.response?.data?.errorValue) {
      message = axiosErr.response.data.errorValue
    }
    throw new Error(message)
  }
}

// Delete Event Type
export const handleDeleteEventType = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await committeeApi.delete(`/committee/EventType/${id}`)

  return {
    success: data?.succeeded ?? data?.success ?? true,
    message: data?.message ?? 'Event type deleted successfully.',
  }
}
