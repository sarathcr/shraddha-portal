import type { RowData } from '@/types/baseTable.model'

export interface User extends RowData {
  id: string
  name: string
  employeeId: string
  email: string
  team: string[]
  role: string
  dob?: string
}

export interface OptionItem {
  label: string
  value: string
}
