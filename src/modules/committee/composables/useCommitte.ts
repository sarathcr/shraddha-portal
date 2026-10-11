import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'
import type {
  Committee,
  CommitteeUser,
  CommitteeLazyLoadEvent as LazyLoadEvent,
} from '@/modules/committee/types/committee.types'
import type { RowData } from '@/shared/types/baseTable.model'
import type { ApiResponse } from '@/shared/types'
import {
  createCommittee,
  deleteCommittee,
  editCommittee,
  getCommittee,
} from '../services/committee.services'
import axios, { AxiosError } from 'axios'
import { committeeApi } from '@/shared/constants'
import { buildFilterMap } from '@/shared/utils/filterUtils'
import { committeeColumns, statusOptions } from '../utils/committeeColumns'
import { committeeUsers, committeeRoles, getUsersData, getRolesData } from './useCommitteeLookups'

export { committeeUsers, committeeRoles, getUsersData, getRolesData }

export function useCommittee() {
  const toast = useToast()
  const committee = ref<Committee[]>([])
  const allRows = ref<RowData[]>([])
  const editingRows = ref<RowData[]>([])
  const pageSize = ref(10)
  const isLoading = ref<boolean>(false)
  const pageNumber = ref(1)
  const totalRecords = ref(0)
  const error = ref<string | null>(null)
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })
  const lastLazyLoadEvent = ref<LazyLoadEvent | null>(null)

  const columns = committeeColumns

  const onStatusToggle = async (committeeItem: Committee, newStatus: boolean): Promise<boolean> => {
    if (newStatus) {
      const anyOtherActive = committee.value.some((c) => c.isActive && c.id !== committeeItem.id)
      if (anyOtherActive) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail:
            'Another committee is already active. Only one committee can be active at a time.',
          life: 3000,
        })
        return false
      }
    }

    try {
      const response = await committeeApi.put(`/committee/${committeeItem.id}/toggleStatus`, {
        status: newStatus,
      })

      if (response && response.status === 200) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Committee status updated successfully.',
          life: 3000,
        })
        return true
      } else {
        return false
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.errorValue) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.response.data.errorValue,
          life: 3000,
        })
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update committee status.',
          life: 3000,
        })
      }
      console.error('Error updating committee status:', error)
      return false
    }
  }

  const clearFilter = (): void => {
    filters.value.global.value = null
  }
  const onLazyLoad = async (event: LazyLoadEvent): Promise<void> => {
    isLoading.value = true
    lastLazyLoadEvent.value = event
    try {
      const payload: {
        pagination: { pageNumber: number; pageSize: number }
        multiSortedColumns: { active: string | undefined; direction: string }[]
        filterMap: Record<string, string>
      } = {
        pagination: {
          pageNumber: event.first / event.rows + 1,
          pageSize: event.rows,
        },
        multiSortedColumns: [],
        filterMap: {},
      }
      if (event.sortField) {
        payload.multiSortedColumns.push({
          active: event.sortField as string,
          direction: event.sortOrder === 1 ? 'asc' : 'desc',
        })
      }
      if (event.filters) {
        payload.filterMap = buildFilterMap(event.filters)
      }
      const response = await getCommittee(
        payload.pagination.pageNumber,
        payload.pagination.pageSize,
        payload.multiSortedColumns,
        payload.filterMap,
      )
      if (response?.succeeded) {
        committee.value = response.data || []
        allRows.value = (response.data || []).map((item: Committee) => ({
          id: item.id,
          year: item.year,
          startDate: item.startDate ?? null,
          endDate: item.endDate ?? null,
          coreMembers: (item.coreMembers || []).map((m: CommitteeUser) => m.userName).join(', '),
          executiveMembers: (item.executiveMembers || [])
            .map((m: CommitteeUser) => m.userName)
            .join(', '),
          isActive: item.isActive ?? false,
        }))
        totalRecords.value = response.totalRecords ?? 0
        pageNumber.value = response.pageNumber ?? payload.pagination.pageNumber
        pageSize.value = response.pageSize ?? payload.pagination.pageSize
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: response?.message || 'Failed to load committee data.',
          life: 3000,
        })
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.errorValue) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.response.data.errorValue,
          life: 3000,
        })
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while fetching committee data.',
          life: 3000,
        })
      }
      console.error('API call failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchInitialData = async (): Promise<void> => {
    isLoading.value = true
    try {
      await Promise.all([getUsersData(), getRolesData()])
      if (lastLazyLoadEvent.value) {
        await onLazyLoad(lastLazyLoadEvent.value)
      } else {
        await onLazyLoad({
          first: 0,
          rows: pageSize.value,
          filters: undefined,
          sortField: null,
          sortOrder: null,
        })
      }
    } finally {
      isLoading.value = false
    }
  }

  const addCommittee = async (committeeItem: Committee): Promise<ApiResponse<Committee>> => {
    try {
      const response = await createCommittee(committeeItem)
      committee.value.push(response.data)

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Committee created successfully',
        life: 3000,
      })
      if (lastLazyLoadEvent.value) await onLazyLoad(lastLazyLoadEvent.value)
      return {
        data: response.data,
        message: 'Committee created successfully',
        succeeded: true,
        errors: null,
        pageNumber: 1,
        pageSize: 1,
        totalPages: 1,
        totalRecords: 1,
      }
    } catch (err: unknown) {
      let message = 'Failed to create committee'

      const axiosErr = err as AxiosError<{ errorValue?: string }>
      if (axiosErr.response?.data?.errorValue) {
        message = axiosErr.response.data.errorValue
      }

      toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
      error.value = message

      return {
        data: undefined,
        message,
        succeeded: false,
        errors: [message],
        pageNumber: 0,
        pageSize: 0,
        totalPages: 0,
        totalRecords: 0,
      }
    }
  }
  const handleEdit = async (committeePayload: Committee): Promise<Committee | null> => {
    try {
      if (!committeePayload.id) throw new Error('Committee ID missing for edit')

      const response = await editCommittee(committeePayload.id, committeePayload)
      const index = committee.value.findIndex((c) => c.id === response.id)
      if (index !== -1) committee.value[index] = response
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Committee updated successfully.`,
        life: 3000,
      })
      if (lastLazyLoadEvent.value) await onLazyLoad(lastLazyLoadEvent.value)
      return response
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000,
      })
      return null
    }
  }

  const handleDelete = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!id) throw new Error('Committee ID missing for delete')

      const response = await deleteCommittee(id)

      if (response.success) {
        await fetchInitialData()
        toast.add({
          severity: 'success',
          summary: 'success',
          detail: response.message || 'Committee deleted successfully.',
          life: 3000,
        })
        if (lastLazyLoadEvent.value) await onLazyLoad(lastLazyLoadEvent.value)
        return { success: true, message: response.message || 'Committee deleted successfully.' }
      } else {
        toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: response.message || 'Failed to delete committee.',
          life: 3000,
        })
        return { success: false, message: response.message || 'Delete failed' }
      }
    } catch (error: unknown) {
      let errorMessage = 'An error occurred while deleting committee.'

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.errorValue ||
          error.response?.data?.message ||
          error.message ||
          errorMessage
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000,
      })
      console.error('API call failed:', error)
      return { success: false, message: errorMessage }
    }
  }

  return {
    committee,
    columns,
    committeeUsers,
    committeeRoles,
    allRows,
    editingRows,
    statusOptions,
    addCommittee,
    handleEdit,
    handleDelete,
    onStatusToggle,
    isLoading,
    filters,
    clearFilter,
    fetchInitialData,
    onLazyLoad,
    totalRecords,
    pageNumber,
    pageSize,
  }
}
