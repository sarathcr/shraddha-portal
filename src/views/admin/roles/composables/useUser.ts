import { UserService } from '@/services/UserService'
import { isLoading } from '@/stores/loader'
import type { RowData } from '@/types/baseTable.model'
import type { APIError, ApiResponse } from '@/types/index'
import type { OptionItem, User } from '@/types/user'
import {
  createUser as apiCreateUser,
  editUser as apiEditUser,
  getRoles as apiGetRoles,
  getTeams as apiGetTeams,
} from '@/views/admin/services/roles-and-access.services'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import { ref, type Ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
export const useUsers = (): {
  users: Ref<User[]>
  roles: Ref<OptionItem[]>
  teams: Ref<OptionItem[]>
  isLoading: typeof isLoading
  editingRows: Ref<RowData[]>
  filters: Ref<{ global: { value: null | string; matchMode: string } }>
  clearFilter: () => void
  fetchInitialData: () => Promise<null | void>
  createUser: (payload: User) => Promise<true | false | null>
  editUser: (newData: User, oldData: User) => Promise<{ success: boolean; user: User } | null>
  deleteUser: (user: User, event?: Event) => void
} => {
  const toast = useToast()
  const confirm = useConfirm()
  const users = ref<User[]>([])
  const roles = ref<OptionItem[]>([])
  const teams = ref<OptionItem[]>([])
  const editingRows = ref<RowData[]>([])

  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  // Higher-order function for consistent error handling
  const withErrorHandling =
    <T extends unknown[], R>(
      asyncFn: (...args: T) => Promise<R>,
      defaultErrorMessage: string,
    ): ((...args: T) => Promise<R | null>) =>
    async (...args: T) => {
      try {
        return await asyncFn(...args)
      } catch (err) {
        const error = err as APIError
        const message = error?.error?.message || error.message || defaultErrorMessage
        toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
        return null
      }
    }

  const handleApiResponse = <T>(
    response: ApiResponse<T> | null,
    state: Ref<T>,
    defaultMessage: string,
  ): void => {
    if (response?.succeeded && Array.isArray(response.data)) {
      state.value = response.data
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: response?.message || defaultMessage,
        life: 3000,
      })
    }
  }

  const clearFilter = (): void => {
    filters.value.global.value = null
  }

  const fetchInitialData = withErrorHandling(async () => {
    const [usersResponse, rolesResponse, teamsResponse] = await Promise.all([
      UserService.getUsersData(),
      apiGetRoles(),
      apiGetTeams(),
    ])

    handleApiResponse(usersResponse, users, 'Failed to load user data.')
    handleApiResponse(rolesResponse, roles, 'Failed to load roles.')
    handleApiResponse(teamsResponse, teams, 'Failed to load teams.')
  }, 'Failed to load initial data')

  const createUser = withErrorHandling(async (payload: User) => {
    const res = await apiCreateUser(payload)
    if (res.succeeded) {
      users.value.push(res.data)
      toast.add({ severity: 'success', summary: 'Success', detail: res.message, life: 3000 })
      return true
    }
    return false
  }, 'Failed to create user')

  const editUser = withErrorHandling(async (newData: User, oldData: User) => {
    const payload: Partial<Omit<User, 'id' | 'dob'>> = {}
    const editableFields: Array<keyof Omit<User, 'id' | 'dob'>> = [
      'name',
      'employeeId',
      'email',
      'team',
      'role',
    ]

    editableFields.forEach((field) => {
      const oldValue = JSON.stringify(oldData[field])
      const newValue = JSON.stringify(newData[field])
      if (oldValue !== newValue) {
        payload[field] = newData[field]
      }
    })

    if (Object.keys(payload).length === 0) {
      toast.add({
        severity: 'info',
        summary: 'No Changes',
        detail: 'No modifications detected.',
        life: 3000,
      })
      return { success: true, user: oldData }
    }

    const res = await apiEditUser(newData.id, payload)
    if (res?.succeeded) {
      toast.add({ severity: 'success', summary: 'Success', detail: res.message, life: 3000 })

      const index = users.value.findIndex((u) => u.id === res.data.id)
      if (index !== -1) {
        users.value[index] = res.data
      }

      return { success: true, user: res.data }
    } else {
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: res?.message || 'The user could not be updated.',
        life: 3000,
      })

      const index = users.value.findIndex((u) => u.id === oldData.id)
      if (index !== -1) {
        users.value[index] = oldData
      }

      return { success: false, user: oldData }
    }
  }, 'An unexpected error occurred while updating the user.')
  const deleteUser = (user: User, event?: Event): void => {
    if (!event?.currentTarget) {
      console.error('ConfirmPopup requires a valid event target (event missing or invalid).')
      return
    }

    confirm.require({
      target: event.currentTarget as HTMLElement,
      message: `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        users.value = users.value.filter((u) => u.id !== user.id)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `User ${user.name} deleted successfully.`,
          life: 3000,
        })
      },
      reject: () => {
        console.warn('User deletion cancelled.')
      },
    })
  }

  return {
    users,
    roles,
    teams,
    isLoading,
    editingRows,
    filters,
    clearFilter,
    fetchInitialData,
    createUser,
    editUser,
    deleteUser,
  }
}
