import { usePermissionStore } from '@/stores/permission'
import type { Permission } from '@/types/permissions'

export function hasPermission(moduleName: string, requiredPermission: Permission): boolean {
  const permissionStore = usePermissionStore()
  const permissionsForModule = permissionStore.permissionMap[moduleName]

  if (!permissionsForModule) {
    return false
  }

  return permissionsForModule.includes(requiredPermission)
}

export function hasModuleAccess(moduleName: string): boolean {
  const permissionStore = usePermissionStore()
  const permissionsForModule = permissionStore.permissionMap[moduleName]

  return permissionsForModule !== undefined && permissionsForModule.length > 0
}
export function canPerformAction(
  moduleName: string,
  specificPermission: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'APPROVEREJECT' | 'MANAGE',
): boolean {
  if (hasPermission(moduleName, specificPermission)) {
    return true
  }

  if (hasPermission(moduleName, 'MANAGE')) {
    return true
  }

  return false
}
