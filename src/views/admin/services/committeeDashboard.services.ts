import { committeeDashboards } from '@/services/CommiteeService'
import { simulateApiCall } from '@/stores/loader'
import type { ApiResponse } from '@/types/index'
import type { CommitteeDashboard } from '@/types/commitee'

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
    return createMockApiResponse(committeeDashboards.data, 'CommitteeDetail list fetched')
  })
