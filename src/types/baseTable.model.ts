import type { Ref } from 'vue'

export interface ColumnDef {
  label: string
  key: string
  filterable?: boolean
  useTag?: boolean
  filterOption?: boolean
  useDateFilter?: boolean
}

export interface RowData {
  [key: string]: unknown
}
export interface UseCommitteeTableReturn {
  columns: ColumnDef[]
  allRows: Ref<RowData[]>
  editableRow: Ref<RowData | null>
  statusOptions: { label: string; value: string }[]
  onEdit: (row: RowData) => void
  onSave: () => void
  onCancel: () => void
  onDelete: (row: RowData) => void
}
