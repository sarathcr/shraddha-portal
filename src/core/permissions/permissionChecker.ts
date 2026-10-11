import { usePermissionStore } from '@/core/permissions/permissionStore'
import type { Permission } from '@/core/permissions/permission.types'

export function hasModuleAccess(moduleName: string): boolean {
  const store = usePermissionStore()
  return store.userPermissions.some(
    (perm) =>
      perm.module?.toLowerCase() === moduleName.toLowerCase() &&
      (!perm.permissions || perm.permissions.length > 0),
  )
}

export function hasPermission(moduleName: string, requiredPermission: Permission): boolean {
  const store = usePermissionStore()

  return store.userPermissions.some((perm) => {
    if (perm.module?.toLowerCase() !== moduleName.toLowerCase()) {
      return false
    }
    return perm.permissions.some(
      (p) => String(p).toUpperCase() === String(requiredPermission).toUpperCase(),
    )
  })
}

export function hasAnyPermission(moduleName: string, requiredPermissions: Permission[]): boolean {
  const store = usePermissionStore()

  return store.userPermissions.some((perm) => {
    if (perm.module?.toLowerCase() !== moduleName.toLowerCase()) {
      return false
    }
    return requiredPermissions.some((req) =>
      perm.permissions.some((p) => String(p).toUpperCase() === String(req).toUpperCase()),
    )
  })
}

export function hasAllPermissions(moduleName: string, requiredPermissions: Permission[]): boolean {
  const store = usePermissionStore()

  return store.userPermissions.some((perm) => {
    if (perm.module?.toLowerCase() !== moduleName.toLowerCase()) {
      return false
    }
    return requiredPermissions.every((req) =>
      perm.permissions.some((p) => String(p).toUpperCase() === String(req).toUpperCase()),
    )
  })
}

export function canPerformAction(
  moduleName: string,
  specificPermission: Permission | 'MANAGE' | 'APPROVEREJECT',
): boolean {
  if (hasPermission(moduleName, specificPermission as Permission)) {
    return true
  }

  if (hasPermission(moduleName, 'MANAGE' as unknown as Permission)) {
    return true
  }

  const store = usePermissionStore()
  const isAdminRole = store.userPermissions.some((p) => {
    const role = (p.role || '').toLowerCase()
    return role === 'admin' || role === 'adminhr' || role === 'president' || role === 'director'
  })
  if (isAdminRole) {
    return true
  }

  return false
}
