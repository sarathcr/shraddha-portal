import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import {
  createUser as apiCreateUser,
  getRoles as apiGetRoles,
  getTeams as apiGetTeams,
  editUser as apiEditUser,
} from '@/views/admin/services/roles-and-access.services'
import { UserService } from '@/services/UserService'
import type { User, OptionItem } from '@/types/user'
import type { ApiResponse, APIError } from '@/types/index'
import { FilterMatchMode } from '@primevue/core/api'
import { isLoading } from '@/stores/loader'
export function useUsers(): {
  users: Ref<User[]>
  roles: Ref<OptionItem[]>
  teams: Ref<OptionItem[]>
  isLoading: Ref<boolean>
  editingRows: Ref<unknown[]>
  filters: Ref<{ global: { value: string | null; matchMode: string } }>
  clearFilter: () => void
  fetchInitialData: () => Promise<void>
  createUser: (payload: Omit<User, 'id' | 'dob'>) => Promise<boolean>
  editUser: (newData: User, oldData: User) => Promise<{ success: boolean; user: User }>
  deleteUser: (row: User) => void
} {
  const toast = useToast()

  const users = ref<User[]>([])
  const roles = ref<OptionItem[]>([])
  const teams = ref<OptionItem[]>([])
  const editingRows = ref([])

  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const clearFilter = (): void => {
    filters.value.global.value = null
  }

  const fetchInitialData = async (): Promise<void> => {
    try {
      const usersResponse: ApiResponse<User[]> = UserService.getUsersData()

      if (usersResponse.succeeded && Array.isArray(usersResponse.data)) {
        users.value = usersResponse.data
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: usersResponse.message || 'Failed to load initial user data.',
          life: 3000,
        })
      }

      const [rolesResponse, teamsResponse] = await Promise.all([apiGetRoles(), apiGetTeams()])

      if (rolesResponse.succeeded && Array.isArray(rolesResponse.data)) {
        roles.value = rolesResponse.data
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: rolesResponse.message || 'Failed to load roles.',
          life: 3000,
        })
      }

      if (teamsResponse.succeeded && Array.isArray(teamsResponse.data)) {
        teams.value = teamsResponse.data
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: teamsResponse.message || 'Failed to load teams.',
          life: 3000,
        })
      }
    } catch (err) {
      const error = err as APIError
      const message = error?.error?.message || error.message || 'Failed to load initial data'
      toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
    }
  }

  const createUser = async (payload: Omit<User, 'id' | 'dob'>): Promise<boolean> => {
    try {
      const res: ApiResponse<User> = await apiCreateUser(payload)
      users.value.push(res.data)
      toast.add({ severity: 'success', summary: 'Success', detail: res.message, life: 3000 })
      return true
    } catch (err) {
      const error = err as APIError
      const message = error?.error?.message || error.message || 'Failed to create user'
      toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
      return false
    }
  }

  const editUser = async (
    newData: User,
    oldData: User,
  ): Promise<{ success: boolean; user: User }> => {
    try {
      const payload: Partial<Omit<User, 'id' | 'dob'>> = {}

      const editableFields: Array<keyof Omit<User, 'id' | 'dob'>> = [
        'name',
        'employeeId',
        'email',
        'team',
        'role',
      ]

      editableFields.forEach((field) => {
        if (field === 'team') {
          if (JSON.stringify(newData[field]) !== JSON.stringify(oldData[field])) {
            payload[field] = newData[field]
          }
        } else {
          if (newData[field] !== oldData[field]) {
            payload[field] = newData[field]
          }
        }
      })

      if (Object.keys(payload).length === 0) {
        toast.add({
          severity: 'info',
          summary: 'No Changes',
          detail: 'No modifications detected for this user.',
          life: 3000,
        })
        return { success: true, user: oldData }
      }

      const res: ApiResponse<User> = await apiEditUser(newData.id, payload)

      toast.add({ severity: 'success', summary: 'Success', detail: res.message, life: 3000 })
      return { success: true, user: res.data }
    } catch (err) {
      const error = err as APIError
      const message = error?.error?.message || error.message || 'Failed to update user'
      toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
      return { success: false, user: oldData }
    }
  }

  const deleteUser = (row: User): void => {
    users.value = users.value.filter((p) => p.id !== row.id)
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `User ${row.name} deleted successfully (simulated).`,
      life: 3000,
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
