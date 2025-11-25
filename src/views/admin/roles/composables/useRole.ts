import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { PermissionOptions, Role } from '@/types/role'
import type { ApiResponse } from '@/types/index'
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

const cachedActiveRoles = ref<PermissionOptions[] | null>(null)
const isFetchingActiveRoles = ref<boolean>(false)

export const fetchActiveRoles = async (
  forceRefetch: boolean = false,
): Promise<PermissionOptions[]> => {
  if (!forceRefetch && cachedActiveRoles.value) {
    return cachedActiveRoles.value
  }

  if (isFetchingActiveRoles.value) {
    return cachedActiveRoles.value || []
  }

  isFetchingActiveRoles.value = true

  try {
    const response = await api.post<ApiResponse<Role[]>>('/authorization/Roles/pagination', {
      pagination: { pageNumber: 1, pageSize: -1 },
      filterMap: { isActive: '= true' },
    })

    if (response.data.succeeded && response.data.data) {
      const rolesData = response.data.data.map((role: Role) => ({
        label: role.roleName,
        value: role.id,
      }))
      cachedActiveRoles.value = rolesData
      return rolesData
    }
    return []
  } catch (error) {
    console.error('Error fetching active roles for lookups:', error)
    return []
  } finally {
    isFetchingActiveRoles.value = false
  }
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

  const lastLazyLoadEvent = ref<LazyLoadEvent | null>(null)

  const statusOptions = [
    { label: 'Active', value: 'True' },
    { label: 'Inactive', value: 'False' },
  ]

  const onStatusToggle = async (role: Role, newStatus: boolean): Promise<void> => {
    const originalStatus = role.isActive
    try {
      await api.put(`/authorization/Roles/${role.id}/status`, { status: newStatus })
      role.isActive = newStatus
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Role status updated successfully.',
        life: 3000,
      })

      if (role.isActive !== newStatus) {
        await fetchActiveRoles(true)
      }

      if (lastLazyLoadEvent.value) await onLazyLoad(lastLazyLoadEvent.value)
    } catch (error) {
      role.isActive = originalStatus
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail:
          axios.isAxiosError(error) && error.response?.data?.errorValue
            ? error.response.data.errorValue
            : 'Failed to update role status.',
        life: 4000,
      })
      console.error('Error updating role status:', error)
    }
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

      const sortFieldMap: Record<string, string> = {
        roleName: 'roleName',
        description: 'description',
        isActive: 'isActive',
        permissions: 'modulePermissions',
      }

      if (event.sortField) {
        const mappedSortField = sortFieldMap[event.sortField as string] || event.sortField

        payload.multiSortedColumns.push({
          active: mappedSortField as string,
          direction: event.sortOrder === 1 ? 'asc' : 'desc',
        })
      }

      const backendKeys: Record<string, string> = {
        roleName: 'roleName',
        description: 'description',
        isActive: 'isActive',
        permissions: 'permissions',
      }

      if (event.filters) {
        Object.entries(event.filters).forEach(([field, filterMeta]) => {
          const filter = filterMeta as {
            operator: string
            constraints: { value: unknown; matchMode: string }[]
          }
          const validConstraints = filter.constraints?.filter(
            (c) => c.value !== null && c.value !== undefined,
          )
          if (validConstraints && validConstraints.length) {
            const filterString = validConstraints
              .map((constraint, index) => {
                const operator =
                  index === 0 ? '' : filter.operator.toUpperCase() === 'OR' ? 'OR' : 'AND'
                const condition = mapMatchModeToOperator(constraint.matchMode, constraint.value)
                return `${operator} ${condition}`.trim()
              })
              .join(' ')
            const backendField = backendKeys[field] || field
            payload.filterMap[backendField] = filterString
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
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail:
          axios.isAxiosError(error) && error.response?.data?.errorValue
            ? error.response.data.errorValue
            : 'An error occurred while fetching roles.',
        life: 3000,
      })
      console.error('API call failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchInitialData = async (): Promise<void> => {
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
  }

  const createRole = async (role: Omit<Role, 'id'>): Promise<boolean> => {
    try {
      await api.post<ApiResponse<Role>>('/authorization/Roles', role)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Role created successfully.',
        life: 3000,
      })

      await fetchActiveRoles(true)
      if (lastLazyLoadEvent.value) await onLazyLoad(lastLazyLoadEvent.value)
      return true
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail:
          axios.isAxiosError(error) && error.response?.data?.errorValue
            ? error.response.data.errorValue
            : 'Failed to create role.',
        life: 3000,
      })
      console.error('Error creating role:', error)
      return false
    }
  }

  const editRole = async (role: Role): Promise<void> => {
    try {
      await api.put<ApiResponse<Role>>(`/authorization/Roles/${role.id}`, role)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Role updated successfully.',
        life: 3000,
      })

      await fetchActiveRoles(true)
      if (lastLazyLoadEvent.value) await onLazyLoad(lastLazyLoadEvent.value)
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail:
          axios.isAxiosError(error) && error.response?.data?.errorValue
            ? error.response.data.errorValue
            : 'Failed to edit role.',
        life: 3000,
      })
      console.error('Error editing role:', error)
    }
  }

  const deleteRole = async (role: Role): Promise<boolean> => {
    try {
      await api.delete(`/authorization/Roles/${role.id}`)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Role deleted successfully.',
        life: 3000,
      })

      await fetchActiveRoles(true)
      if (lastLazyLoadEvent.value) await onLazyLoad(lastLazyLoadEvent.value)
      return true
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail:
          axios.isAxiosError(error) && error.response?.data?.errorValue
            ? error.response.data.errorValue
            : 'Failed to delete role.',
        life: 3000,
      })
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
