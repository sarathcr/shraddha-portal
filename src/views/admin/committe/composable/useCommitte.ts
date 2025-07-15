import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'

import { CommiteeService } from '@/services/CommiteeService'
import type { ApiResponse, APIError } from '@/types/index'
import { FilterMatchMode } from '@primevue/core/api'
import { isLoading, simulateApiCall } from '@/stores/loader'
import type { ColumnDef, RowData } from '@/types/baseTable.model'
import type { Committee } from '@/types/commitee'

export function useCommittee(): {
  committee: Ref<Committee[]>
  columns: ColumnDef[]
  allRows: Ref<RowData[]>
  editableRow: Ref<RowData | null>
  statusOptions: { label: string; value: string }[]
  onEdit: (row: RowData) => void
  onSave: () => void
  onCancel: () => void
  onDelete: (row: RowData) => void
  isLoading: Ref<boolean>
  editingRows: Ref<unknown[]>
  filters: Ref<{ global: { value: string | null; matchMode: string } }>
  clearFilter: () => void
  fetchInitialData: () => Promise<void>
} {
  const toast = useToast()

  const committee = ref<Committee[]>([])
  const allRows = ref<RowData[]>([])
  const editableRow = ref<RowData | null>(null)

  const editingRows = ref<RowData[]>([])
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

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
      useMultiSelect: false,
    },
    {
      label: 'Created At',
      key: 'createdAt',
      filterable: true,
      useDateFilter: true,
    },
  ]

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ]

  const clearFilter = (): void => {
    filters.value.global.value = null
  }
  const fetchInitialData = async (): Promise<void> => {
    await simulateApiCall(async () => {
      const committeeResponse: ApiResponse<Committee[]> = await CommiteeService.getCommitteeData()

      if (committeeResponse.succeeded && Array.isArray(committeeResponse.data)) {
        committee.value = committeeResponse.data
        allRows.value = committeeResponse.data.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }))
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: committeeResponse.message || 'Failed to load committee data.',
          life: 3000,
        })
      }
    }).catch((err) => {
      const error = err as APIError
      const message = error?.error?.message || error.message || 'Failed to load data'
      toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
    })
  }

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
    if (index !== -1) {
      allRows.value.splice(index, 1)
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: `Committee ${row.year} deleted.`,
        life: 3000,
      })
    }
  }

  return {
    committee,
    columns,
    allRows,
    editableRow,
    statusOptions,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    isLoading,
    editingRows,
    filters,
    clearFilter,
    fetchInitialData,
  }
}
