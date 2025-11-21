import { computed } from 'vue'
import { canPerformAction, hasModuleAccess } from '@/utils/permissionChecker'

interface ModulePermissions {
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  hasAnyAccess: boolean
  canApproveReject: boolean
}

export function useModulePermissions(moduleName: string): ModulePermissions {
  const hasAnyAccess = computed(() => hasModuleAccess(moduleName))

  const canRead = computed(() => canPerformAction(moduleName, 'READ'))
  const canCreate = computed(() => canPerformAction(moduleName, 'CREATE'))
  const canUpdate = computed(() => canPerformAction(moduleName, 'UPDATE'))
  const canDelete = computed(() => canPerformAction(moduleName, 'DELETE'))
  const canApproveReject = computed(() => canPerformAction(moduleName, 'APPROVEREJECT'))

  return {
    canRead: canRead.value,
    canCreate: canCreate.value,
    canUpdate: canUpdate.value,
    canDelete: canDelete.value,
    hasAnyAccess: hasAnyAccess.value,
    canApproveReject: canApproveReject.value,
  }
}
