import type { RowData } from './baseTable.model'

export interface Role extends RowData {
  id: string
  roleName: string
  description: string
  permissions: string[]
}
export interface PermissionOptions {
  label: string
  value: string
}
