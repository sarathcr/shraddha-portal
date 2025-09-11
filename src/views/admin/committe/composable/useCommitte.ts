import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'
import { simulateApiCall } from '@/stores/loader'
import type { Committee, Members } from '@/types/commitee'
import type { ColumnDef, RowData } from '@/types/baseTable.model'
import type { OptionItem, User } from '@/types/user'
import type { ApiResponse } from '@/types/index'
import { editCommittee, getCommittee, deleteCommittee } from '../../services/committee.services'

import { committeeData } from '@/services/CommiteeService'
import { useConfirm } from 'primevue/useconfirm'
import type { DataTableFilterMeta, DataTableSortMeta } from 'primevue'
import axios from 'axios'
import { UserService } from '@/services/UserService'

export const committeeUsers: Ref<OptionItem[]> = ref([])
export const getUsersData = async (): Promise<void> => {
  const users = await UserService.getUsersData(0, 0)

  committeeUsers.value = users.data.map((user: User) => {
    const newUsers: OptionItem = {
      label: user.name,
      value: user.id ?? '',
    }
    return newUsers
  })
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
  statusOptions: { label: string; value: string }[]
  pageNumber: Ref<number>
  pageSize: Ref<number>
  onLazyLoad: (event: LazyLoadEvent) => Promise<void>
  createCommittee: (payload: Committee) => Promise<ApiResponse<Committee>>
  handleEdit: (
    newData: Committee,
    oldData: Committee,
  ) => Promise<{ success: boolean; committee: Committee } | null>
  deleteUser: (commitee: Committee, event?: Event) => void
  isLoading: Ref<boolean>
  filters: Ref<{ global: { value: string | null; matchMode: string } }>
  clearFilter: () => void
  fetchInitialData: () => Promise<void>
  totalRecords: Ref<number>
} {
  const toast = useToast()
  const committee = ref<Committee[]>([])
  const allRows = ref<RowData[]>([])
  const editingRows = ref<RowData[]>([])
  const committeeUsers = ref<OptionItem[]>([])
  const confirm = useConfirm()
  const pageSize = ref(10)
  const isLoading = ref<boolean>(false)
  const pageNumber = ref(1)
  const totalRecords = ref(0)

  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const columns: ColumnDef[] = [
    { label: 'Committee Year', key: 'year', filterable: true },
    { label: 'Core Members', key: 'coreMembers', filterable: true },
    { label: 'Executive Members', key: 'executiveMembers', filterable: true },
    {
      label: 'Status',
      key: 'statusLabel',
      filterable: true,
      filterOption: true,
      useTag: true,
      useMultiSelect: false,
    },
  ]

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ]

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
      await getUsersData()

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
        console.error(response, 'response')
        committee.value = response.data || []
        allRows.value = (response.data || []).map((item) => ({
          id: item.id,
          year: item.year,
          coreMembers: (item.coreMembers || []).map((m: Members) => m.name).join(', '),
          executiveMembers: (item.executiveMembers || []).map((m: Members) => m.name).join(', '),
          statusLabel: item.status ? 'Active' : 'Inactive',
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
    await onLazyLoad({
      first: 0,
      rows: pageSize.value,
      filters: undefined,
      sortField: null,
      sortOrder: null,
    })
  }

  const createCommittee = (newCommittee: Committee): Promise<ApiResponse<Committee>> => {
    return simulateApiCall(async () => {
      newCommittee.id = (committeeData.data.length + 1).toString()
      newCommittee.createdAt = new Date().toISOString()
      committeeData.data.push(newCommittee)

      return {
        data: newCommittee,
        message: 'Committee created successfully',
        errors: null,
        succeeded: true,
        pageNumber: 1,
        pageSize: 1,
        totalPages: 1,
        totalRecords: 1,
      }
    })
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

      const response = await editCommittee(newData)

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

  const deleteUser = (committeeToDelete: Committee, event?: Event): void => {
    if (!event?.currentTarget) {
      console.error('ConfirmPopup requires a valid event target (event missing or invalid).')
      return
    }
    confirm.require({
      target: event.currentTarget as HTMLElement,
      message: `Are you sure you want to delete the committee for year "${committeeToDelete.year}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: async () => {
        try {
          const response = await deleteCommittee(committeeToDelete.id)
          if (response.succeeded) {
            committee.value = committee.value.filter((c) => c.id !== committeeToDelete.id)
            allRows.value = allRows.value.filter((r) => r.id !== committeeToDelete.id)

            toast.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `Committee for year ${committeeToDelete.year} deleted successfully.`,
              life: 3000,
            })
          }
        } catch (err) {
          const error = err as Error
          toast.add({
            severity: 'error',
            summary: 'Delete Failed',
            detail: error.message,
            life: 3000,
          })
        }
      },
      reject: () => {},
    })
  }

  return {
    committee,
    columns,
    committeeUsers,
    allRows,
    editingRows,
    statusOptions,
    createCommittee,
    handleEdit,
    deleteUser,
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
