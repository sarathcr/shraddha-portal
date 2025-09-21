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
  status: boolean
}

export interface OptionItem {
  label: string
  value: string
}

export interface UserOptionItem {
  name?: string
  label: string
  value: string
  roleId: string
}
