import { ref } from 'vue'
import type { ColumnDef, RowData, UseCommitteeTableReturn } from '@/types/baseTable.model'

export function useCommitteeTable(): UseCommitteeTableReturn {
  const columns: ColumnDef[] = [
    { label: 'Committee Year', key: 'year', filterable: true },
    { label: 'Core Members', key: 'coreMembers', filterable: true },
    { label: 'Executive Members', key: 'executiveMembers', filterable: true },
    {
      label: 'Status',
      key: 'status',
      filterable: true,
      filterOption: true,
      useTag: true,
    },
    {
      label: 'Created At',
      key: 'createdAt',
      filterable: true,
      useDateFilter: true,
    },
  ]

  const allRows = ref<RowData[]>([
    {
      year: '2024-2025',
      coreMembers: 'Sarath, Abhinaya, Chrsito',
      executiveMembers: 'Ratheesh, Refe',
      status: 'Inactive',
      createdAt: new Date('2025/07/08'),
    },
    {
      year: '2023-2024',
      coreMembers: 'Aarav, Diya',
      executiveMembers: 'Kabir, Meera',
      status: 'Active',
      createdAt: new Date('2025/07/08'),
    },
    {
      year: '2022-2023',
      coreMembers: 'Rohan, Sanya',
      executiveMembers: 'Nikhil, Priya',
      status: 'Inactive',
      createdAt: new Date('2025/07/08'),
    },
    {
      year: '2023-2024',
      coreMembers: 'Aarav, Diya',
      executiveMembers: 'Kabir, Meera',
      status: 'Active',
      createdAt: new Date('2025/07/08'),
    },
    {
      year: '2022-2023',
      coreMembers: 'Rohan, Sanya',
      executiveMembers: 'Nikhil, Priya',
      status: 'Inactive',
      createdAt: new Date('2025/07/08'),
    },
    {
      year: '2023-2024',
      coreMembers: 'Aarav, Diya',
      executiveMembers: 'Kabir, Meera',
      status: 'Active',
      createdAt: new Date('2025/07/08'),
    },
    {
      year: '2022-2023',
      coreMembers: 'Rohan, Sanya',
      executiveMembers: 'Nikhil, Priya',
      status: 'Inactive',
      createdAt: new Date('2025/07/08'),
    },
    {
      year: '2023-2024',
      coreMembers: 'Aarav, Diya',
      executiveMembers: 'Kabir, Meera',
      status: 'Active',
      createdAt: new Date('2025/07/08'),
    },
    {
      year: '2022-2023',
      coreMembers: 'Rohan, Sanya',
      executiveMembers: 'Nikhil, Priya',
      status: 'Inactive',
      createdAt: new Date('2025/07/08'),
    },
  ])

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ]

  const editableRow = ref<RowData | null>(null)

  const onEdit = (row: RowData): void => {
    editableRow.value = row
  }

  const onSave = (): void => {
    editableRow.value = null
  }

  const onCancel = (): void => {
    editableRow.value = null
  }

  const onDelete = (row: RowData): void => {
    const index = allRows.value.findIndex((r) => r === row)
    if (index !== -1) allRows.value.splice(index, 1)
  }

  return {
    columns,
    allRows,
    editableRow,
    statusOptions,
    onEdit,
    onSave,
    onCancel,
    onDelete,
  }
}
