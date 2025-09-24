import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'
import type { Committee, CommitteeRole, CommitteeUser } from '@/types/commitee'
import type { ColumnDef, RowData } from '@/types/baseTable.model'
import type { OptionItem, UserOptionItem } from '@/types/user'
import type { ApiResponse } from '@/types/index'
import type { DataTableFilterMeta, DataTableSortMeta } from 'primevue'
import {
  createCommittee,
  editCommittee,
  fetchRoles,
  fetchUsers,
  getCommittee,
} from '../../services/committee.services'
import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { committeeApi } from '@/constants'

export const committeeUsers: Ref<UserOptionItem[]> = ref([])
export const committeeRoles: Ref<OptionItem[]> = ref([])

export const getUsersData = async (): Promise<void> => {
  const users: ApiResponse<CommitteeUser[]> = await fetchUsers(-1, -1, { isActive: '= true' })
  if (users?.succeeded && users.data) {
    committeeUsers.value = users.data
      .filter((user) => user.id)
      .map((user: CommitteeUser) => ({
        label: user.name ?? '',
        roleId: user.roleId ?? '',
        value: user.id!,
      }))
  } else {
    committeeUsers.value = []
  }
}

export const getRolesData = async (): Promise<void> => {
  const roles: ApiResponse<CommitteeRole[]> = await fetchRoles(-1, 0)
  if (roles?.succeeded && roles.data) {
    committeeRoles.value = roles.data.map((role: CommitteeRole) => ({
      label: role.roleName,
      value: role.id,
    }))
  } else {
    committeeRoles.value = []
  }
}

type LazyLoadEvent = {
  first: number
  rows: number
  filters: DataTableFilterMeta | undefined
  sortField?: string | ((item: unknown) => string) | null
  sortOrder?: 0 | 1 | -1 | null
  multiSortMeta?: DataTableSortMeta[] | null
}
export function useCommittee(): {
  committee: Ref<Committee[]>
  columns: ColumnDef[]
  allRows: Ref<RowData[]>
  editingRows: Ref<RowData[]>
  committeeUsers: Ref<OptionItem[]>
  committeeRoles: Ref<OptionItem[]>
  statusOptions: { label: string; value: string }[]
  pageNumber: Ref<number>
  pageSize: Ref<number>
  onLazyLoad: (event: LazyLoadEvent) => Promise<void>
  addCommittee: (payload: Committee) => Promise<ApiResponse<Committee>>
  handleEdit: (
    newData: Committee,
    oldData: Committee,
  ) => Promise<{ success: boolean; committee: Committee } | null>
  isLoading: Ref<boolean>
  filters: Ref<{ global: { value: string | null; matchMode: string } }>
  clearFilter: () => void
  fetchInitialData: () => Promise<void>
  totalRecords: Ref<number>
  onStatusToggle: (committee: Committee, newStatus: boolean) => Promise<void>
} {
  const authStore = useAuthStore()
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

  const columns = [
    { label: 'Committee Year', key: 'year', filterable: true },
    { label: 'Start Date', key: 'startDate', filterable: true },
    { label: 'End Date', key: 'endDate', filterable: true },
    { label: 'Core Members', key: 'coreMembers', filterable: true },
    { label: 'Executive Members', key: 'executiveMembers', filterable: true },
    { label: 'Status', key: 'isActive', filterable: true, useToggle: true },
  ]

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ]

  const onStatusToggle = async (committee: Committee, newStatus: boolean): Promise<void> => {
    const originalStatus = committee.status
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      await committeeApi.put(`/committee/${committee.id}/toggleStatus`, {
        status: newStatus,
      })
      committee.status = newStatus
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Committee status updated successfully.',
        life: 3000,
      })
    } catch (error) {
      committee.status = originalStatus

      if (axios.isAxiosError(error) && error.response && error.response.data?.errorValue) {
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
          detail: 'Failed to update team status.',
          life: 3000,
        })
      }
      console.error('Error updating team status:', error)
    }
  }

  const clearFilter = (): void => {
    filters.value.global.value = null
  }

  const mapMatchModeToOperator = (matchMode: string, value: unknown): string => {
    switch (matchMode) {
      case FilterMatchMode.CONTAINS:
        return `like %${value}%`
      case FilterMatchMode.STARTS_WITH:
        return `like ${value}%`
      case FilterMatchMode.ENDS_WITH:
        return `like %${value}`
      case FilterMatchMode.EQUALS:
        return `= ${value}`
      case FilterMatchMode.NOT_EQUALS:
        return `!= ${value}`
      default:
        return `= ${value}`
    }
  }

  const onLazyLoad = async (event: LazyLoadEvent): Promise<void> => {
    isLoading.value = true
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
        const filters = event.filters as DataTableFilterMeta
        Object.entries(filters).forEach(([field, filterMeta]) => {
          const filter = filterMeta as {
            operator: string
            constraints: { value: unknown; matchMode: string }[]
          }

          if (filter.constraints?.length) {
            const validConstraints = filter.constraints.filter(
              (c) => c.value !== null && c.value !== undefined,
            )

            if (validConstraints.length > 0) {
              const filterString = validConstraints
                .map((constraint, index) => {
                  const operator =
                    index === 0 ? '' : filter.operator.toUpperCase() === 'OR' ? 'OR' : 'AND'
                  const condition = mapMatchModeToOperator(constraint.matchMode, constraint.value)
                  return `${operator} ${condition}`.trim()
                })
                .join(' ')

              payload.filterMap[field] = filterString
            }
          }
        })
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
          startDate: item.startDate,
          endDate: item.endDate,
          coreMembers: (item.coreMembers || []).map((m: CommitteeUser) => m.name).join(', '),
          executiveMembers: (item.executiveMembers || [])
            .map((m: CommitteeUser) => m.name)
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

      await onLazyLoad({
        first: 0,
        rows: pageSize.value,
        filters: undefined,
        sortField: null,
        sortOrder: null,
      })
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
      })

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

      toast.add({ severity: 'error', summary: 'Error', detail: message })
      error.value = message

      return {
        data: null,
        message,
        succeeded: false,
        errors: err,
        pageNumber: 0,
        pageSize: 0,
        totalPages: 0,
        totalRecords: 0,
      }
    }
  }

  const handleEdit = async (
    newData: Committee,
    oldData: Committee,
  ): Promise<{ success: boolean; committee: Committee } | null> => {
    try {
      const yearPattern = /^\d{4}-\d{4}$/
      if (!yearPattern.test(newData.year)) {
        toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Year must be in the format YYYY-YYYY',
          life: 3000,
        })
        return null
      }
      const [startYear, endYear] = newData.year.split('-').map(Number)
      if (endYear !== startYear + 1) {
        toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Years must be consecutive',
          life: 3000,
        })
        return null
      }

      if (JSON.stringify(newData) === JSON.stringify(oldData)) {
        toast.add({
          severity: 'info',
          summary: 'No Changes',
          detail: 'No modifications detected.',
          life: 3000,
        })
        return { success: true, committee: oldData }
      }

      const response = await editCommittee()

      if (response && response.succeeded && response.data) {
        const updatedCommittee = response.data
        const committeeIndex = committee.value.findIndex((c) => c.id === oldData.id)

        if (committeeIndex !== -1) {
          committee.value[committeeIndex] = updatedCommittee
        }

        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Committee for year ${updatedCommittee.year} updated successfully.`,
          life: 3000,
        })

        return { success: true, committee: updatedCommittee }
      } else {
        toast.add({
          severity: 'error',
          summary: 'Update Failed',
          life: 3000,
        })
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred while updating.'
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: errorMessage,
        life: 3000,
      })
    }

    return null
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
