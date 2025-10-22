import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'
import type { Committee, CommitteeRole, CommitteeUser } from '@/types/commitee'
import type { ColumnDef, RowData } from '@/types/baseTable.model'
import type { OptionItem } from '@/types/user'
import type { ApiResponse } from '@/types/index'
import type { DataTableFilterMeta, DataTableSortMeta } from 'primevue'
import {
  createCommittee,
  deleteCommittee,
  editCommittee,
  fetchRoles,
  fetchUsers,
  getCommittee,
} from '../../services/committee.services'
import axios, { AxiosError } from 'axios'
import { committeeApi } from '@/constants'

export const committeeUsers: Ref<CommitteeUser[]> = ref([])
export const committeeRoles: Ref<OptionItem[]> = ref([])

export const getUsersData = async (): Promise<CommitteeUser[]> => {
  const users: ApiResponse<CommitteeUser[]> = await fetchUsers(-1, -1, { isActive: '= true' })
  if (users?.succeeded && users.data) {
    committeeUsers.value = users.data
    return users.data
  } else {
    committeeUsers.value = []
    return []
  }
}

export const getRolesData = async (): Promise<void> => {
  const roles: ApiResponse<CommitteeRole[]> = await fetchRoles(-1, -1)
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
  committeeUsers: Ref<CommitteeUser[]>
  committeeRoles: Ref<OptionItem[]>
  statusOptions: { label: string; value: string }[]
  pageNumber: Ref<number>
  pageSize: Ref<number>
  onLazyLoad: (event: LazyLoadEvent) => Promise<void>
  addCommittee: (payload: Committee) => Promise<ApiResponse<Committee>>
  handleEdit: (committeePayload: Committee) => Promise<Committee | null>
  handleDelete: (id: string) => Promise<{ success: boolean; message: string }>
  isLoading: Ref<boolean>
  filters: Ref<{ global: { value: string | null; matchMode: string } }>
  clearFilter: () => void
  fetchInitialData: () => Promise<void>
  totalRecords: Ref<number>
  onStatusToggle: (committee: Committee, newStatus: boolean) => Promise<boolean>
} {
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
    { label: 'Start Date', key: 'startDate', filterable: true, useDateFilter: true },
    { label: 'End Date', key: 'endDate', filterable: true, useDateFilter: true },
    { label: 'Core Members', key: 'coreMembers', filterable: true },
    { label: 'Executive Members', key: 'executiveMembers', filterable: true },
    {
      label: 'Status',
      key: 'isActive',
      filterable: true,
      useToggle: true,
      showFilterMatchModes: false,
      showFilterOperator: false,
      showAddButton: false,
    },
  ]

  const statusOptions = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
  ]

  const onStatusToggle = async (committeeItem: Committee, newStatus: boolean): Promise<boolean> => {
    if (newStatus) {
      const anyOtherActive = committee.value.some((c) => c.isActive && c.id !== committeeItem.id)
      if (anyOtherActive) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail:
            'Another committee is already active. Only one committee can be active at a time.',
          life: 4000,
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
        life: 3000,
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

      toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
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
          summary: 'Deleted',
          detail: response.message || 'Committee deleted successfully.',
          life: 3000,
        })
        return { success: true, message: response.message }
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
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred during delete'
      toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })

      return { success: false, message }
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
