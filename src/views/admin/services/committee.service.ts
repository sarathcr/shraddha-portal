import { simulateApiCall } from '@/stores/loader'
import type { APIError, ApiResponse } from '@/types'
import type { Committee } from '@/types/commitee'
import { committeeData } from '@/services/CommiteeService'

/**
 * In-memory mock committee list.
 * This simulates your backend DB for testing purposes.
 */
const committeeList: Committee[] = []

/**
 * Utility to create an APIError matching internal structure
 */
const createApiError = (
  businessError: number,
  errorValue: string,
  type: 'ConflictError' | 'NotFoundError',
  failedAction: string,
): APIError => {
  const message = `Committee ${failedAction} failed`
  return {
    error: {
      businessError,
      message,
      errorValue,
      type,
    },
    message: `${message}: ${errorValue}`,
  }
}

/**
 * Utility to create a standard API response shape
 */
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

/**
 * Create a new committee (simulated)
 */
export const createCommittee = (payload: Committee): Promise<ApiResponse<Committee>> =>
  simulateApiCall(async () => {
    if (committeeList.some((c) => c.year === payload.year)) {
      throw createApiError(1003, 'Committee Year already exists', 'ConflictError', 'creation')
    }

    const newCommittee: Committee = {
      ...payload,
      id: Math.random().toString(36).substring(2),
    }

    committeeList.push(newCommittee)

    return createMockApiResponse(newCommittee, 'Committee created successfully')
  })

/**
 * Get list of committees (simulated)
 */
export const getCommittee = (): Promise<ApiResponse<Committee[]>> =>
  simulateApiCall(async () => {
    return createMockApiResponse(committeeData.data, 'Committee list fetched')
  })
