export type EntityType = 'user' | 'team' | 'role' | 'committee' | 'eventType' | 'event'

export interface HistoryEntry {
  id: number | string
  action: string
  user: string
  field?: string
  oldValue?: string
  newValue?: string
  date: string
}

export interface HistoryRecord {
  id: string
  entityId: string
  action: string
  performedBy: string
  performedAt: string
  changes?: Record<string, { old: any; new: any }>
}
