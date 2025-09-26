import type { RowData } from '@/types/baseTable.model'

export interface User extends RowData {
  id?: string
  name: string
  employeeId: string
  email: string
  team?: string
  role?: string
  dob?: string | null
  isActive: boolean
}

export interface OptionItem {
  label: string
  value: string
}

export interface UserOptionItem {
  id?: string
  name?: string
  label: string
  roleId: string
  userId?: string
  value: string
}
