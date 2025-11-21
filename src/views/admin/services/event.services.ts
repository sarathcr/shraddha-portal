import { committeeApi } from '@/constants'
import type { ApiResponse } from '@/types'
import type { CommitteeList } from '@/types/event'
import type { Event, EventFormPayload } from '@/types/event'
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

export const getCommitteeList = async (): Promise<CommitteeList[]> => {
  try {
    const resp = await committeeApi.post<CommitteeList[]>('committee/CommitteeList')
    return resp.data ?? []
  } catch (err: unknown) {
    console.error('Failed to fetch committees', err)
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message ?? err.message)
    }
    throw new Error('Failed to fetch committees')
  }
}

export const createEvent = async (
  payload: EventFormPayload,
): Promise<ApiResponse<EventFormPayload>> => {
  try {
    const resp = await committeeApi.post<ApiResponse<EventFormPayload>>('event/activity', payload)
    return resp.data
  } catch (err: unknown) {
    console.error('Failed to create event', err)
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{ message?: string }>
      throw new Error(axiosErr.response?.data?.message ?? axiosErr.message)
    }
    throw new Error('Failed to create event')
  }
}
