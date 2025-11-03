export interface HistoryEntry {
  id: number
  action: 'created' | 'updated'
  user: string
  field?: string
  oldValue?: string
  newValue?: string
  date: string
}
