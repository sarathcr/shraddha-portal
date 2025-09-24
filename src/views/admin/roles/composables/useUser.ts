import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { User, OptionItem } from '@/types/user'
import type { ApiResponse } from '@/types/index'
import { useAuthStore } from '@/stores/auth'
import type { DataTableFilterMeta, DataTableSortMeta } from 'primevue/datatable'
import axios from 'axios'
import { mapMatchModeToOperator } from '@/utils/filterUtils'
import type { Role } from '@/types/role'
import type { Team } from '@/types/team'
import { api } from '@/constants'
import { formatDateForAPI } from '@/utils/dateUtils'

type LazyLoadEvent = {
  first: number
  rows: number
  filters: DataTableFilterMeta | undefined
  sortField?: string | ((item: unknown) => string) | null
  sortOrder?: 0 | 1 | -1 | null
  multiSortMeta?: DataTableSortMeta[] | null
}

export const useUsers = (): {
  users: Ref<User[]>
  roles: Ref<OptionItem[]>
  teams: Ref<OptionItem[]>
  isLoading: Ref<boolean>
  totalRecords: Ref<number>
  pageNumber: Ref<number>
  pageSize: Ref<number>
  editingRows: Ref<User[]>
  statusOptions: { label: string; value: string }[]
  fetchInitialData: () => Promise<void>
  onLazyLoad: (event: LazyLoadEvent) => Promise<void>
  createUser: (payload: User) => Promise<boolean>
  editUser: (newData: User) => Promise<void>
  deleteUser: (user: User) => Promise<void>
  onStatusToggle: (user: User, newStatus: boolean) => Promise<void>
} => {
  const toast = useToast()
  const authStore = useAuthStore()

  const users = ref<User[]>([])
  const roles = ref<OptionItem[]>([])
  const teams = ref<OptionItem[]>([])
  const isLoading = ref<boolean>(false)
  const totalRecords = ref<number>(0)
  const pageNumber = ref<number>(1)
  const pageSize = ref<number>(20)
  const editingRows = ref<User[]>([])

  const statusOptions = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
  ]

  const onStatusToggle = async (user: User, newStatus: boolean): Promise<void> => {
    const originalStatus = user.isActive
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) throw new Error('Authentication token not found. Please log in again.')

      const response = await api.put<{ message: string }>(
        `/authorization/users/${user.id}/toggleStatus`,
        { isActive: newStatus },
      )

      user.isActive = newStatus

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: response.data.message || 'User status updated successfully.',
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
      user.isActive = originalStatus
      const detail =
        axios.isAxiosError(error) && error.response?.data?.errorValue
          ? error.response.data.errorValue
          : 'Failed to update user status.'
      toast.add({ severity: 'error', summary: 'Error', detail, life: 3000 })
      console.error('Error updating user status:', error)
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
        Object.entries(event.filters).forEach(([field, filterMeta]) => {
          const filter = filterMeta as {
            operator: string
            constraints: { value: unknown; matchMode: string }[]
          }
          if (filter.constraints && filter.constraints.length > 0) {
            const validConstraints = filter.constraints.filter((c) => c.value != null)
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
      function formatDateForDisplay(dob: string | null): string | null {
        if (!dob) return null
        const [year, month, day] = dob.split('-')
        return `${day}-${month}-${year}`
      }

      const response = await api.post<ApiResponse<User[]>>(
        '/authorization/users/pagination',
        payload,
      )

      if (response.data.succeeded) {
        users.value = response.data.data.map((user: User) => ({
          ...user,
          dob: user.dob ? formatDateForDisplay(user.dob) : null,
        }))

        totalRecords.value = response.data.totalRecords
        pageNumber.value = response.data.pageNumber
        pageSize.value = response.data.pageSize
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: response.data.message || 'Failed to load user data.',
          life: 3000,
        })
      }
    } catch (error) {
      const detail =
        axios.isAxiosError(error) && error.response?.data?.errorValue
          ? error.response.data.errorValue
          : 'An error occurred while fetching users.'
      toast.add({ severity: 'error', summary: 'Error', detail, life: 3000 })
      console.error('API call failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchInitialData = async (): Promise<void> => {
    isLoading.value = true
    try {
      const [rolesResponse, teamsResponse] = await Promise.all([
        api.post<ApiResponse<Role[]>>('/authorization/Roles/pagination', {
          pagination: { pageNumber: 1, pageSize: 1000 },
        }),
        api.post<ApiResponse<Team[]>>('/authorization/Departments/pagination', {
          pagination: { pageNumber: 1, pageSize: 1000 },
        }),
      ])

      if (rolesResponse.data.succeeded) {
        roles.value = rolesResponse.data.data.map((role: Role) => ({
          label: role.roleName,
          value: role.id,
        }))
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: rolesResponse.data.message || 'Failed to load roles.',
          life: 3000,
        })
      }

      if (teamsResponse.data.succeeded) {
        teams.value = teamsResponse.data.data.map((team: Team) => ({
          label: team.teamName ?? '',
          value: team.id,
        }))
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: teamsResponse.data.message || 'Failed to load teams.',
          life: 3000,
        })
      }

      await onLazyLoad({
        first: 0,
        rows: pageSize.value,
        filters: undefined,
        sortField: undefined,
        sortOrder: undefined,
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while fetching initial data.',
        life: 3000,
      })
      console.error('Initial data fetch failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (payload: User): Promise<boolean> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) throw new Error('Authentication token not found. Please log in again.')

      const formattedPayload = {
        ...payload,
        dob: payload.dob ? formatDateForAPI(new Date(payload.dob)) : null,
        TeamID: payload.team,
        RoleID: payload.role,
      }

      await api.post<ApiResponse<User>>('/authorization/users', formattedPayload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'User created successfully.',
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
      const detail =
        axios.isAxiosError(error) && error.response?.data?.errorValue
          ? error.response.data.errorValue
          : 'Failed to create user.'
      toast.add({ severity: 'error', summary: 'Error', detail, life: 3000 })
      console.error('Error creating user:', error)
      return false
    }
  }

  const editUser = async (newData: User): Promise<void> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) throw new Error('Authentication token not found. Please log in again.')

      const formattedNewData = {
        ...newData,
        dob: newData.dob ? formatDateForAPI(new Date(newData.dob)) : null,
        id: newData.id,
        teamId: newData.teamId ?? newData.TeamID,
        roleId: newData.roleId ?? newData.RoleID,
      }

      await api.put<ApiResponse<User>>(`/authorization/users/${newData.id}`, formattedNewData)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'User updated successfully.',
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
      const detail =
        axios.isAxiosError(error) && error.response?.data?.errorValue
          ? error.response.data.errorValue
          : 'An unexpected error occurred. Please try again.'
      toast.add({ severity: 'error', summary: 'Error', detail, life: 3000 })
      console.error('Error editing user:', error)
    }
  }

  const deleteUser = async (user: User): Promise<void> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) throw new Error('Authentication token not found. Please log in again.')

      await api.delete(`/authorization/users/${user.id}`)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'User deleted successfully.',
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
      const detail =
        axios.isAxiosError(error) && error.response?.data?.errorValue
          ? error.response.data.errorValue
          : 'Failed to delete user.'
      toast.add({ severity: 'error', summary: 'Error', detail, life: 3000 })
      console.error('Error deleting user:', error)
    }
  }

  return {
    users,
    roles,
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
    createUser,
    editUser,
    deleteUser,
  }
}
