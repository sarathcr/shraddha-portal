import type { Meta, StoryObj } from '@storybook/vue3'
import BaseTable from '@/shared/components/BaseTable.vue'
import type { ColumnDef } from '@/shared/types/baseTable.types'

const meta: Meta<typeof BaseTable> = {
  title: 'Shared/BaseTable',
  component: BaseTable,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BaseTable>

const mockColumns: ColumnDef[] = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status' },
]

const mockRows = [
  {
    id: '1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    role: 'Administrator',
    status: 'Active',
  },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com', role: 'Editor', status: 'Active' },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'Viewer',
    status: 'Inactive',
  },
]

export const Default: Story = {
  args: {
    columns: mockColumns,
    rows: mockRows,
    totalRecords: 3,
    rowsPerPage: 10,
    loading: false,
    paginator: true,
  },
}

export const LoadingState: Story = {
  args: {
    columns: mockColumns,
    rows: [],
    totalRecords: 0,
    rowsPerPage: 10,
    loading: true,
    paginator: true,
  },
}
