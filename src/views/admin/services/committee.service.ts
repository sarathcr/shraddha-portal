import { simulateApiCall } from '@/stores/loader'
import type { ApiResponse } from '@/types'
import type { Committee } from '@/types/commitee'
import { committeeData } from '../../../services/CommiteeService'

export const CommitteeService = {
  getCommitee(): Promise<ApiResponse<Committee[]>> {
    return simulateApiCall(async () => {
      return committeeData
    })
  },
}
