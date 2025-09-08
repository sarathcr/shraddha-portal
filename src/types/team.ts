import type { RowData } from './baseTable.model'
export interface Team extends RowData {
  id: number
  teamName: string
  description: string
}
