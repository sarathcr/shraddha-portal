import type { RowData } from './baseTable.model'

export interface Committee extends RowData {
  id: string
  year: string
  coreMembers: string[]
  executiveMembers: string[]
  status: boolean
  createdAt: string
}
