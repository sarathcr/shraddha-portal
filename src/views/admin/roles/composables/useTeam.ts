import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { Team } from '@/types/team'
import type { ApiResponse } from '@/types/index'
import { useAuthStore } from '@/stores/auth'
import { FilterMatchMode } from '@primevue/core/api'
import type { DataTableFilterMeta, DataTableSortMeta } from 'primevue/datatable'
import axios from 'axios'
import { api } from '@/constants'

type LazyLoadEvent = {
  first: number
  rows: number
  filters: DataTableFilterMeta | undefined
  sortField?: string | ((item: unknown) => string) | null
  sortOrder?: 0 | 1 | -1 | null
  multiSortMeta?: DataTableSortMeta[] | null
}

export const useTeams = (): {
  teams: Ref<Team[]>
  isLoading: Ref<boolean>
  totalRecords: Ref<number>
  pageNumber: Ref<number>
  pageSize: Ref<number>
  editingRows: Ref<Team[]>
  statusOptions: { label: string; value: string }[]
  fetchInitialData: () => Promise<void>
  onLazyLoad: (event: LazyLoadEvent) => Promise<void>
  createTeam: (team: Omit<Team, 'id'>) => Promise<boolean>
  editTeam: (team: Team) => Promise<void>
  deleteTeam: (team: Team) => Promise<boolean>
  onStatusToggle: (team: Team, newStatus: boolean) => Promise<void>
} => {
  const toast = useToast()
  const authStore = useAuthStore()

  const teams = ref<Team[]>([])
  const isLoading = ref<boolean>(false)
  const totalRecords = ref<number>(0)
  const pageNumber = ref<number>(1)
  const pageSize = ref<number>(20)
  const editingRows = ref<Team[]>([])

  const onStatusToggle = async (team: Team, newStatus: boolean): Promise<void> => {
    const originalStatus = team.status
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      await api.put(`/authorization/Departments/${team.id}/status`, { status: newStatus })
      team.status = newStatus
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Team status updated successfully.',
        life: 3000,
      })
    } catch (error) {
      team.status = originalStatus

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
  const statusOptions = [
    { label: 'Active', value: 'True' },
    { label: 'Inactive', value: 'False' },
  ]
  const mapMatchModeToOperator = (matchMode: string, value: unknown): string => {
    switch (matchMode) {
      case FilterMatchMode.CONTAINS:
        return `like %${value}%`
      case FilterMatchMode.NOT_CONTAINS:
        return `not like %${value}%`
      case FilterMatchMode.STARTS_WITH:
        return `like ${value}%`
      case FilterMatchMode.ENDS_WITH:
        return `like %${value}`
      case FilterMatchMode.EQUALS:
        if (typeof value === 'boolean') {
          return `= ${value}`
        }
        return `= ${value}`
      case FilterMatchMode.NOT_EQUALS:
        return `!= ${value}`
      case FilterMatchMode.LESS_THAN:
        return `< ${value}`
      case FilterMatchMode.LESS_THAN_OR_EQUAL_TO:
        return `<= ${value}`
      case FilterMatchMode.GREATER_THAN:
        return `> ${value}`
      case FilterMatchMode.GREATER_THAN_OR_EQUAL_TO:
        return `>= ${value}`
      case FilterMatchMode.DATE_IS:
        return `= ${value}`
      case FilterMatchMode.DATE_IS_NOT:
        return `!= ${value}`
      case FilterMatchMode.DATE_BEFORE:
        return `< ${value}`
      case FilterMatchMode.DATE_AFTER:
        return `> ${value}`
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

          if (filter.constraints && filter.constraints.length > 0) {
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

      const response = await api.post<ApiResponse<Team[]>>(
        '/authorization/Departments/pagination',
        payload,
      )

      if (response.data.succeeded) {
        teams.value = response.data.data
        totalRecords.value = response.data.totalRecords
        pageNumber.value = response.data.pageNumber
        pageSize.value = response.data.pageSize
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: response.data.message || 'Failed to load team data.',
          life: 3000,
        })
      }
    } catch (error) {
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
          detail: 'An error occurred while fetching teams.',
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

  const createTeam = async (team: Omit<Team, 'id'>): Promise<boolean> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      await api.post<ApiResponse<Team>>('/authorization/Departments', team)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Team created successfully.',
        life: 3000,
      })
      await onLazyLoad({
        first: (pageNumber.value - 1) * pageSize.value,
        rows: pageSize.value,
        filters: undefined,
        sortField: null,
        sortOrder: null,
      })
      return true
    } catch (error) {
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
          detail: 'Failed to create team.',
          life: 3000,
        })
      }
      console.error('Error creating team:', error)
      return false
    }
  }

  const editTeam = async (team: Team): Promise<void> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      await api.put<ApiResponse<Team>>(`/authorization/Departments/${team.id}`, team)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Team updated successfully.',
        life: 3000,
      })
      await onLazyLoad({
        first: (pageNumber.value - 1) * pageSize.value,
        rows: pageSize.value,
        filters: undefined,
        sortField: null,
        sortOrder: null,
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorValue = error.response.data?.errorValue

        if (errorValue) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorValue,
            life: 3000,
          })
        } else {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An unexpected API error occurred.',
            life: 3000,
          })
        }
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An unexpected error occurred. Please try again.',
          life: 3000,
        })
      }
    }
  }

  const deleteTeam = async (team: Team): Promise<boolean> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }
      await api.delete(`/authorization/Departments/${team.id}`)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Team deleted successfully.',
        life: 3000,
      })
      await onLazyLoad({
        first: (pageNumber.value - 1) * pageSize.value,
        rows: pageSize.value,
        filters: undefined,
        sortField: null,
        sortOrder: null,
      })
      return true
    } catch (error) {
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
          detail: 'Failed to delete team.',
          life: 3000,
        })
      }
      console.error('Error deleting team:', error)
      return false
    }
  }

  return {
    teams,
    isLoading,
    totalRecords,
    pageNumber,
    pageSize,
    editingRows,
    statusOptions,
    onStatusToggle,
    fetchInitialData,
    onLazyLoad,
    createTeam,
    editTeam,
    deleteTeam,
  }
}
