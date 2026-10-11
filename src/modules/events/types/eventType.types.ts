import type { RowData } from '@/shared/types/baseTable.model'

export interface EventType extends RowData {
  id: string
  eventTypeName: string
  description: string
}
