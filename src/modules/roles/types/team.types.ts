import type { RowData } from '@/shared/types/baseTable.model'
export interface Team extends RowData {
  id: string
  teamName: string
  description: string
  isActive: boolean
  status?: string | boolean
}
