import type { RowData } from './baseTable.model'
export interface Team extends RowData {
  id: string
  teamName: string
  description: string
  isActive: boolean
}
