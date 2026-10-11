import type { RowData } from '@/shared/types/baseTable.model'

export interface User extends RowData {
  id?: string
  name: string
  employeeId: string
  email: string
  team?: string
  teamId?: string
  role?: UserRole[]
  roles?: UserRole[] | string[]
  roleId?: string
  dob?: Date | string | null
  isActive: boolean
  status?: string | boolean
}

export interface OptionItem {
  isCommitteeRole?: boolean
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
export interface UserRole {
  role: string
  roleId: string
}
