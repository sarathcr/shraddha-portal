export type Permission = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'MANAGE' | 'APPROVEREJECT'

export interface ModulePermission {
  moduleId: string
  module: string
  permissions: { permissionId: string; permission: Permission }[]
}

export interface UserPermissionsData {
  roleId: string
  role: string
  modulePermissions: ModulePermission[]
}
export interface LoginApiResult {
  accessToken: string
  refreshToken: string
  userPermissions: UserPermissionsData[]
}

export type PermissionMap = Record<string, Permission[] | undefined>
