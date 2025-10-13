import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { PermissionOptions, Role } from '@/types/role'
import type { ApiResponse } from '@/types/index'
import { useAuthStore } from '@/stores/auth'
import type { DataTableFilterMeta, DataTableSortMeta } from 'primevue/datatable'
import axios from 'axios'
import { api } from '@/constants'
import { mapMatchModeToOperator } from '@/utils/filterUtils'

type LazyLoadEvent = {
  first: number
  rows: number
  filters: DataTableFilterMeta | undefined
  sortField?: string | ((item: unknown) => string) | null
  sortOrder?: 0 | 1 | -1 | null
  multiSortMeta?: DataTableSortMeta[] | null
}

export const useRoles = (): {
  roles: Ref<Role[]>
  permissions: Ref<PermissionOptions[]>
  isLoading: Ref<boolean>
  totalRecords: Ref<number>
  pageNumber: Ref<number>
  pageSize: Ref<number>
  editingRows: Ref<Role[]>
  statusOptions: { label: string; value: string }[]
  fetchInitialData: () => Promise<void>
  onLazyLoad: (event: LazyLoadEvent) => Promise<void>
  createRole: (role: Omit<Role, 'id'>) => Promise<boolean>
  editRole: (role: Role) => Promise<void>
  deleteRole: (role: Role) => Promise<boolean>
  onStatusToggle: (role: Role, newStatus: boolean) => Promise<void>
} => {
  const toast = useToast()
  const authStore = useAuthStore()

  const roles = ref<Role[]>([])
  const isLoading = ref<boolean>(false)
  const totalRecords = ref<number>(0)
  const pageNumber = ref<number>(1)
  const pageSize = ref<number>(20)
  const editingRows = ref<Role[]>([])
  const permissions = ref<PermissionOptions[]>([
    { label: 'Read', value: 'READ' },
    { label: 'Create', value: 'CREATE' },
    { label: 'Update', value: 'UPDATE' },
    { label: 'Delete', value: 'DELETE' },
  ])

  const onStatusToggle = async (role: Role, newStatus: boolean): Promise<void> => {
    const originalStatus = role.isActive
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      await api.put(`/authorization/Roles/${role.id}/status`, { status: newStatus })
      role.isActive = newStatus
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Role status updated successfully.',
        life: 3000,
      })
    } catch (error) {
      role.isActive = originalStatus

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
          detail: 'Failed to update role status.',
          life: 3000,
        })
      }
      console.error('Error updating role status:', error)
    }
  }

  const statusOptions = [
    { label: 'Active', value: 'True' },
    { label: 'Inactive', value: 'False' },
  ]

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

      // Map front-end filter keys to back-end keys
      const backendKeys: Record<string, string> = {
        roleName: 'roleName',
        description: 'description',
        isActive: 'isActive',
        permissions: 'permissions',
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

              // **CRITICAL FIX**: Use the mapping object to get the correct backend key
              const backendField = backendKeys[field] || field
              payload.filterMap[backendField] = filterString
            }
          }
        })
      }

      const response = await api.post<ApiResponse<Role[]>>(
        '/authorization/Roles/pagination',
        payload,
      )

      if (response.data.succeeded && response.data.data) {
        roles.value = response.data.data
        totalRecords.value = response.data.totalRecords ?? 0
        pageNumber.value = response.data.pageNumber ?? 1
        pageSize.value = response.data.pageSize ?? 20
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: response.data.message || 'Failed to load role data.',
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
          detail: 'An error occurred while fetching roles.',
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
      await Promise.all([
        onLazyLoad({
          first: 0,
          rows: pageSize.value,
          filters: undefined,
          sortField: null,
          sortOrder: null,
        }),
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch initial data.',
        life: 3000,
      })
    } finally {
      isLoading.value = false
    }
  }

  const createRole = async (role: Omit<Role, 'id'>): Promise<boolean> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      await api.post<ApiResponse<Role>>('/authorization/Roles', role)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Role created successfully.',
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
          detail: 'Failed to create role.',
          life: 3000,
        })
      }
      console.error('Error creating role:', error)
      return false
    }
  }

  const editRole = async (role: Role): Promise<void> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      await api.put<ApiResponse<Role>>(`/authorization/Roles/${role.id}`, role)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Role updated successfully.',
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

  const deleteRole = async (role: Role): Promise<boolean> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }
      await api.delete(`/authorization/Roles/${role.id}`)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Role deleted successfully.',
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
          detail: 'Failed to delete role.',
          life: 3000,
        })
      }
      console.error('Error deleting role:', error)
      return false
    }
  }

  return {
    roles,
    permissions,
    isLoading,
    totalRecords,
    pageNumber,
    pageSize,
    editingRows,
    statusOptions,
    onStatusToggle,
    fetchInitialData,
    onLazyLoad,
    createRole,
    editRole,
    deleteRole,
  }
}
