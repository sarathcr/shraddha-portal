import { usePermissionStore } from '@/stores/permission'
import type { ModuleName, Permission } from '@/types/permissions'

export function hasPermission(moduleName: ModuleName, requiredPermission: Permission): boolean {
  const permissionStore = usePermissionStore()
  const permissionsForModule = permissionStore.permissionMap[moduleName]

  if (!permissionsForModule) {
    return false
  }

  return permissionsForModule.includes(requiredPermission)
}

export function hasModuleAccess(moduleName: ModuleName): boolean {
  const permissionStore = usePermissionStore()
  const permissionsForModule = permissionStore.permissionMap[moduleName]

  return permissionsForModule !== undefined && permissionsForModule.length > 0
}
