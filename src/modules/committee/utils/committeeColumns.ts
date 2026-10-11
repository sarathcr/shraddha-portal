import type { ColumnDef } from '@/shared/types/baseTable.model'

export const committeeColumns: ColumnDef[] = [
  { label: 'Committee Year', key: 'year', filterable: true },
  {
    label: 'Start Date',
    key: 'startDate',
    filterable: true,
    useDateFilter: true,
    showAddButton: false,
  },
  {
    label: 'End Date',
    key: 'endDate',
    filterable: true,
    useDateFilter: true,
    showAddButton: false,
  },
  { label: 'Core Members', key: 'coreMembers', filterable: true },
  { label: 'Executive Members', key: 'executiveMembers', filterable: true },
  {
    label: 'Status',
    key: 'isActive',
    filterable: true,
    useToggle: true,
    showFilterMatchModes: false,
    showFilterOperator: false,
    showAddButton: false,
  },
]

export const statusOptions = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]
