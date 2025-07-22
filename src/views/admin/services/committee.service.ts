import { simulateApiCall } from '@/stores/loader'
import type { ApiResponse } from '@/types'
import type { Committee } from '@/types/commitee'
import { committeeData } from '@/services/CommiteeService'

const createMockApiResponse = <T>(data: T, message: string): ApiResponse<T> => ({
  data,
  message,
  succeeded: true,
  errors: null,
  pageNumber: 1,
  pageSize: Array.isArray(data) ? data.length : 1,
  totalPages: 1,
  totalRecords: Array.isArray(data) ? data.length : 1,
})

export const createCommittee = (newCommittee: Committee): Promise<Committee> => {
  return simulateApiCall(async () => {
    const yearExists = committeeData.data.some((committee) => committee.year === newCommittee.year)

    if (yearExists) {
      throw new Error(`Committee for year ${newCommittee.year} already exists`)
    }
    newCommittee.id = (committeeData.data.length + 1).toString()
    newCommittee.createdAt = new Date().toISOString()
    committeeData.data.push(newCommittee)

    return newCommittee
  })
}

export const getCommittee = (): Promise<ApiResponse<Committee[]>> =>
  simulateApiCall(async () => {
    return createMockApiResponse(committeeData.data, 'Committee list fetched')
  })
