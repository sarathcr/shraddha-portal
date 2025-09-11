import { ref, type Ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
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
  fetchInitialData: () => Promise<void>
  onLazyLoad: (event: LazyLoadEvent) => Promise<void>
  createUser: (payload: User) => Promise<boolean>
  editUser: (newData: User) => Promise<void>
  deleteUser: (user: User, event?: Event) => void
} => {
  const confirm = useConfirm()
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
        filterMap: {
          isActive: '= true',
        },
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

      const response = await api.post<ApiResponse<User[]>>(
        '/authorization/users/pagination',
        payload,
      )

      if (response.data.succeeded) {
        users.value = response.data.data.map((u: User) => {
          const newUser: User = {
            ...u,
          }
          return newUser
        })

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
          detail: 'An error occurred while fetching users.',
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
      const [rolesResponse, teamsResponse] = await Promise.all([
        api.post<ApiResponse<Role[]>>('/authorization/Roles/pagination', {
          pagination: { pageNumber: 1, pageSize: 1000 },
        }),
        api.post<ApiResponse<Team[]>>('/authorization/Departments/pagination', {
          pagination: { pageNumber: 1, pageSize: 1000 },
        }),
      ])

      if (rolesResponse.data.succeeded) {
        roles.value = rolesResponse.data.data.map((role: Role) => {
          const newRoles: OptionItem = {
            label: role.roleName,
            value: role.id,
          }
          return newRoles
        })
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: rolesResponse.data.message || 'Failed to load roles.',
          life: 3000,
        })
      }
      if (teamsResponse.data.succeeded) {
        teams.value = teamsResponse.data.data.map((team: Team) => {
          const newTeam: OptionItem = {
            label: team.teamName ?? '',
            value: team.id,
          }
          return newTeam
        })
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

  const formatDateForAPI = (date: Date | string | null | undefined): string | null => {
    if (!date) return null
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const createUser = async (payload: User): Promise<boolean> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      const formattedPayload = {
        ...payload,
        dob: formatDateForAPI(payload.dob),
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
          detail: 'Failed to create user.',
          life: 3000,
        })
      }
      console.error('Error creating user:', error)
      return false
    }
  }

  const editUser = async (newData: User): Promise<void> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      const formattedNewData = {
        ...newData,
        dob: formatDateForAPI(newData.dob),
        id: newData.id,
        teamId: newData.teamId,
        roleId: newData.roleId,
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

  const deleteUser = (user: User, event?: Event): void => {
    confirm.require({
      target: event?.currentTarget as HTMLElement,
      message: 'Do you want to delete this user?',
      icon: 'pi pi-info-circle',
      acceptClass: 'p-button-danger',
      rejectClass: 'p-button-secondary p-button-outlined',
      accept: async () => {
        try {
          const accessToken = authStore.accessToken
          if (!accessToken) {
            throw new Error('Authentication token not found. Please log in again.')
          }
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
              detail: 'Failed to delete user.',
              life: 3000,
            })
          }
          console.error('Error deleting user:', error)
        }
      },
    })
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
    fetchInitialData,
    onLazyLoad,
    createUser,
    editUser,
    deleteUser,
  }
}
