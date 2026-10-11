export interface ColumnDef {
  key: string
  label: string
  type?: 'text' | 'select' | 'multi-select' | 'status' | 'date' | 'toggle' | 'custom'
  options?: { label: string; value: string }[]
  filterable?: boolean
  sortable?: boolean
  backendKey?: string
  required?: boolean
  filterOption?: any
  useToggle?: boolean
  useDateFilter?: boolean
  useMultiSelect?: boolean
  showFilterMatchModes?: boolean
  showFilterOperator?: boolean
  showAddButton?: boolean
}

export interface RowData {
  [key: string]: any
}
