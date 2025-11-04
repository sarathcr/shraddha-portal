export type Permission = 'READ' | 'WRITE' | 'UPDATE' | 'DELETE' | 'MANAGE' | 'APPROVEREJECT'

export type ModuleName =
  | 'Dashboard'
  | 'RolesAndAccess'
  | 'Events'
  | 'Committee'
  | 'Approvals'
  | 'Finance'
  | 'BirthdayGifts'
  | 'Charity'
  | 'Tournaments'
  | 'Feedbacks'
  | 'MeetingMinutes'

export interface ModulePermission {
  moduleId: string
  module: ModuleName
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

export type PermissionMap = Record<ModuleName, Permission[] | undefined>
