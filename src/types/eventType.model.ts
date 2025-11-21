import type { RowData } from './baseTable.model'

export interface EventType extends RowData {
  id: string
  eventTypeName: string
  description: string
}
