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
//get committe data
export const getCommittee = (): Promise<ApiResponse<Committee[]>> =>
  simulateApiCall(async () => {
    return createMockApiResponse(committeeData.data, 'Committee list fetched')
  })
//create new committee
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

//edit committee table
export const editCommittee = (
  updatedCommittee: Committee,
): Promise<{ succeeded: boolean; data: Committee }> => {
  return simulateApiCall(async () => {
    const index = committeeData.data.findIndex((committee) => committee.id === updatedCommittee.id)
    if (index === -1) {
      throw new Error(`Committee with ID ${updatedCommittee.id} not found`)
    }

    const yearExists = committeeData.data.some(
      (committee, i) => committee.year === updatedCommittee.year && i !== index,
    )
    if (yearExists) {
      throw new Error(`Another committee for year ${updatedCommittee.year} already exists`)
    }

    committeeData.data[index] = { ...committeeData.data[index], ...updatedCommittee }

    return {
      succeeded: true,
      data: committeeData.data[index],
    }
  })
}
// delete committee
export const deleteCommittee = (id: string): Promise<{ succeeded: boolean; message: string }> => {
  return simulateApiCall(async () => {
    const index = committeeData.data.findIndex((committee) => committee.id === id)
    if (index === -1) {
      throw new Error(`Committee with ID ${id} not found`)
    }

    committeeData.data.splice(index, 1)

    return {
      succeeded: true,
      message: `Committee with ID ${id} deleted successfully`,
    }
  })
}
