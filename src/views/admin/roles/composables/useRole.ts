import { ref, type Ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import { isLoading } from '@/stores/loader'
import type { APIError } from '@/types'
import type { PermissionOptions, Role } from '@/types/role'
import type { RowData } from '@/types/baseTable.model'
import { roleService } from '@/views/admin/services/roles-and-access.services'

export const useRoles = (): {
  roles: Ref<Role[]>
  permissions: Ref<PermissionOptions[]>
  isLoading: typeof isLoading
  editingRows: Ref<RowData[]>
  filters: Ref<{ global: { value: null | string; matchMode: string } }>
  clearFilter: () => void
  fetchInitialData: () => Promise<null | void>
  createRole: (payload: Role) => Promise<boolean | null>
  editRole: (role: Role) => Promise<boolean | null>
  deleteRole: (role: Role, event?: Event) => void
} => {
  const toast = useToast()
  const confirm = useConfirm()

  const roles = ref<Role[]>([])
  const permissions = ref<PermissionOptions[]>([])
  const editingRows = ref<Role[]>([])

  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const clearFilter = (): void => {
    filters.value.global.value = null
  }

  const fetchInitialData = async (): Promise<null | void> => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getRolesData(),
        roleService.getPermissions(),
      ])

      if (rolesRes.succeeded) roles.value = rolesRes.data
      else throw new Error(rolesRes.message || 'Failed to load roles')

      if (permsRes.succeeded) permissions.value = permsRes.data
      else throw new Error(permsRes.message || 'Failed to load permissions')
    } catch (err) {
      const error = err as APIError
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to fetch roles and permissions.',
        life: 3000,
      })
    }
  }

  const createRole = async (payload: Role): Promise<boolean | null> => {
    try {
      const response = await roleService.createRole(payload)
      if (response.succeeded) {
        await fetchInitialData()

        toast.add({
          severity: 'success',
          summary: 'Role Created',
          detail: `Role "${response.data.roleName}" added.`,
          life: 3000,
        })
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const error = err as APIError
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.message || 'Failed to create role',
        life: 3000,
      })
      return null
    }
  }

  const editRole = async (updated: Role): Promise<boolean | null> => {
    try {
      const response = await roleService.editRole(updated.id, updated)
      if (response.succeeded) {
        const index = roles.value.findIndex((r) => r.id === updated.id)
        if (index !== -1) roles.value[index] = response.data

        toast.add({
          severity: 'success',
          summary: 'Role Updated',
          detail: `Role "${response.data.roleName}" updated.`,
          life: 3000,
        })
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const error = err as APIError
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.message || 'Failed to update role',
        life: 3000,
      })
      return null
    }
  }

  const deleteRole = (role: Role, event?: Event): void => {
    if (!event?.currentTarget) {
      console.error('ConfirmPopup requires a valid event target.')
      return
    }

    confirm.require({
      target: event.currentTarget as HTMLElement,
      message: `Are you sure you want to delete role "${role.roleName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        roles.value = roles.value.filter((r) => r.id !== role.id)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Role "${role.roleName}" deleted.`,
          life: 3000,
        })
      },
      reject: () => {
        console.warn('Role deletion cancelled.')
      },
    })
  }

  return {
    roles,
    permissions,
    isLoading,
    editingRows,
    filters,
    clearFilter,
    fetchInitialData,
    createRole,
    editRole,
    deleteRole,
  }
}
