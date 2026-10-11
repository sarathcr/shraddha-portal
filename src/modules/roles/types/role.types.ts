import type { RowData } from '@/shared/types/baseTable.model'

export interface ModulePermission {
  moduleId: string
  permissions: string[]
}
export interface Role extends RowData {
  id: string
  roleName: string
  description: string
  modulePermissions: ModulePermission[]
  isActive: boolean
}
export interface PermissionOptions {
  label: string
  value: string
}
