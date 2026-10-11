import { committeeDashboards } from '@/modules/committee/services/CommiteeService'
import { simulateApiCall } from '@/core/loader/loaderStore'
import type { ApiResponse } from '@/shared/types'
import type { CommitteeDashboard } from '@/modules/committee/types/committee.types'

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

export const getCommitteeDashboard = (): Promise<ApiResponse<CommitteeDashboard[]>> =>
  simulateApiCall(async () => {
    return createMockApiResponse(committeeDashboards.data ?? [], 'CommitteeDetail list fetched')
  })
