import type { RowData } from './baseTable.model'

export interface Role extends RowData {
  id: string
  roleName: string
  description: string
  permissions: string[]
}
export interface permissionOptions {
  label: string
  value: string
}
