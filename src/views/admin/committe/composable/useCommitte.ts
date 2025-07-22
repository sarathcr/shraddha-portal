import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'
import { isLoading, simulateApiCall } from '@/stores/loader'
import type { Committee } from '@/types/commitee'
import type { ColumnDef, RowData } from '@/types/baseTable.model'
import type { OptionItem } from '@/types/user'
import type { APIError, ApiResponse } from '@/types'
import { getCommittee } from '../../services/committee.service'
import { getAllUsers } from '../../services/roles-and-access.services'
import { committeeData } from '@/services/CommiteeService'

export const committeeUsers = ref<OptionItem[]>([])
export const getUsersData = async (): Promise<void> => {
  const users = await getAllUsers()
  committeeUsers.value = users.map((user) => ({
    label: user.name,
    value: user.id,
  }))
}

export function useCommittee(): {
  committee: Ref<Committee[]>
  columns: ColumnDef[]
  allRows: Ref<RowData[]>
  editableRow: Ref<RowData | null>
  committeeUsers: Ref<OptionItem[]>
  statusOptions: { label: string; value: string }[]
  createCommittee: (payload: Committee) => Promise<ApiResponse<Committee>>
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
  const committeeUsers = ref<OptionItem[]>([])
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const columns: ColumnDef[] = [
    { label: 'Committee Year', key: 'year', filterable: true },
    { label: 'Core Members', key: 'coreMembers', filterable: true },
    { label: 'Executive Members', key: 'executiveMembers', filterable: true },
    {
      label: 'Status',
      key: 'statusLabel',
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

  const withErrorHandling =
    <T extends unknown[]>(
      asyncFn: (...args: T) => Promise<void>,
      defaultErrorMessage: string,
    ): ((...args: T) => Promise<void>) =>
    async (...args: T): Promise<void> => {
      try {
        await asyncFn(...args)
      } catch (err) {
        const error = err as APIError
        const message = error?.error?.message || error.message || defaultErrorMessage
        toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
      }
    }

  const handleApiResponse = <T>(
    response: ApiResponse<T> | null,
    state: Ref<T>,
    defaultMessage: string,
  ): void => {
    if (response?.succeeded && Array.isArray(response.data)) {
      state.value = response.data
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: response?.message || defaultMessage,
        life: 3000,
      })
    }
  }

  const fetchInitialData = withErrorHandling(async () => {
    await getUsersData()
    const response = await getCommittee()
    handleApiResponse(response, committee, 'Failed to load committee data.')
    allRows.value = (response?.data || []).map((item) => ({
      id: item.id,
      year: item.year,
      coreMembers: item.coreMembers.join(', '),
      executiveMembers: item.executiveMembers.join(', '),
      statusLabel: item.status ? 'Active' : 'Inactive',
      createdAt: new Date(item.createdAt),
    }))
  }, 'Failed to fetch data.')

  const createCommittee = (newCommittee: Committee): Promise<ApiResponse<Committee>> => {
    return simulateApiCall(async () => {
      newCommittee.id = (committeeData.data.length + 1).toString()
      newCommittee.createdAt = new Date().toISOString()
      committeeData.data.push(newCommittee)

      return {
        data: newCommittee,
        message: 'Committee created successfully',
        errors: null,
        succeeded: true,
      }
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
    committeeUsers,
    allRows,
    editableRow,
    statusOptions,
    createCommittee,
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
