import { computed, type ComputedRef } from 'vue'
import { canPerformAction, hasModuleAccess } from '@/core/permissions/permissionChecker'

export interface ModulePermissions {
  canRead: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  canDelete: ComputedRef<boolean>
  hasAnyAccess: ComputedRef<boolean>
  canApproveReject: ComputedRef<boolean>
}

export function useModulePermissions(moduleName: string): ModulePermissions {
  const hasAnyAccess = computed(() => hasModuleAccess(moduleName))

  const canRead = computed(() => canPerformAction(moduleName, 'READ'))
  const canCreate = computed(() => canPerformAction(moduleName, 'CREATE'))
  const canUpdate = computed(() => canPerformAction(moduleName, 'UPDATE'))
  const canDelete = computed(() => canPerformAction(moduleName, 'DELETE'))
  const canApproveReject = computed(() => canPerformAction(moduleName, 'APPROVEREJECT'))

  return {
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    hasAnyAccess,
    canApproveReject,
  }
}
