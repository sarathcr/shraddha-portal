import type { RowData } from '@/types/baseTable.model'

export interface User extends RowData {
  id?: string
  name: string
  employeeId: string
  email: string
  team?: string
  teamId: number
  role?: string
  roleId: number
  dob?: string
}

export interface OptionItem {
  label: string
  value: string
}
