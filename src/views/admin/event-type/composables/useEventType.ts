import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'

import type { ApiResponse } from '@/types/index'
import type { DataTableFilterMeta, DataTableSortMeta } from 'primevue/datatable'
import axios, { AxiosError } from 'axios'
import { api } from '@/constants'
import { mapMatchModeToOperator } from '@/utils/filterUtils'
import type { EventType } from '@/types/eventType.model'
import type { ColumnDef, RowData } from '@/types/baseTable.model'
import { createEventType } from '../../services/eventType.services'

type LazyLoadEvent = {
  first: number
  rows: number
  filters: DataTableFilterMeta | undefined
  sortField?: string | ((item: unknown) => string) | null
  sortOrder?: 0 | 1 | -1 | null
  multiSortMeta?: DataTableSortMeta[] | null
}

export const useEventType = (): {
  eventTypes: Ref<EventType[]>
  columns: ColumnDef[]
  allRows: Ref<RowData[]>
  isLoading: Ref<boolean>
  totalRecords: Ref<number>
  pageNumber: Ref<number>
  pageSize: Ref<number>
  editingRows: Ref<EventType[]>

  fetchInitialData: () => Promise<void>
  onLazyLoad: (event: LazyLoadEvent) => Promise<void>
  addEventType: (payload: EventType) => Promise<ApiResponse<EventType>>
} => {
  const toast = useToast()

  const eventTypes = ref<EventType[]>([])
  const isLoading = ref<boolean>(false)
  const totalRecords = ref<number>(0)
  const error = ref<string | null>(null)
  const pageNumber = ref<number>(1)
  const pageSize = ref<number>(20)
  const editingRows = ref<EventType[]>([])
  const allRows = ref<RowData[]>([])

  const lastLazyLoadEvent = ref<LazyLoadEvent | null>(null)

  const columns = [
    { label: 'Event TypeName', key: 'eventTypeName', filterable: true },
    {
      label: 'Description',
      key: 'description',
      filterable: true,
    },
  ]

  const onLazyLoad = async (event: LazyLoadEvent): Promise<void> => {
    isLoading.value = true
    lastLazyLoadEvent.value = event
    try {
      const payload: {
        pagination: { pageNumber: number; pageSize: number }
        multiSortedColumns: { active: string | undefined; direction: string }[]
        filterMap: Record<string, string>
      } = {
        pagination: {
          pageNumber: event.first / event.rows + 1,
          pageSize: event.rows,
        },
        multiSortedColumns: [],
        filterMap: {},
      }

      if (event.sortField) {
        payload.multiSortedColumns.push({
          active: event.sortField as string,
          direction: event.sortOrder === 1 ? 'asc' : 'desc',
        })
      }

      const backendKeys: Record<string, string> = {
        eventTypeName: 'eventTypeName',
        description: 'description',
        permissions: 'permissions',
      }

      if (event.filters) {
        Object.entries(event.filters).forEach(([field, filterMeta]) => {
          const filter = filterMeta as {
            operator: string
            constraints: { value: unknown; matchMode: string }[]
          }
          const validConstraints = filter.constraints?.filter(
            (c) => c.value !== null && c.value !== undefined,
          )
          if (validConstraints && validConstraints.length) {
            const filterString = validConstraints
              .map((constraint, index) => {
                const operator =
                  index === 0 ? '' : filter.operator.toUpperCase() === 'OR' ? 'OR' : 'AND'
                const condition = mapMatchModeToOperator(constraint.matchMode, constraint.value)
                return `${operator} ${condition}`.trim()
              })
              .join(' ')
            const backendField = backendKeys[field] || field
            payload.filterMap[backendField] = filterString
          }
        })
      }

      const response = await api.post<ApiResponse<EventType[]>>(
        '/authorization/eventTypes/pagination',
        payload,
      )

      if (response.data.succeeded && response.data.data) {
        eventTypes.value = response.data.data
        totalRecords.value = response.data.totalRecords ?? 0
        pageNumber.value = response.data.pageNumber ?? 1
        pageSize.value = response.data.pageSize ?? 20
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: response.data.message || 'Failed to load role data.',
          life: 3000,
        })
      }
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail:
          axios.isAxiosError(error) && error.response?.data?.errorValue
            ? error.response.data.errorValue
            : 'An error occurred while fetching roles.',
        life: 3000,
      })
      console.error('API call failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchInitialData = async (): Promise<void> => {
    if (lastLazyLoadEvent.value) {
      await onLazyLoad(lastLazyLoadEvent.value)
    } else {
      await onLazyLoad({
        first: 0,
        rows: pageSize.value,
        filters: undefined,
        sortField: null,
        sortOrder: null,
      })
    }
  }

  const addEventType = async (eventTypeItem: EventType): Promise<ApiResponse<EventType>> => {
    try {
      const response = await createEventType(eventTypeItem)
      eventTypes.value.push(response.data)

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'EventType created successfully',
        life: 3000,
      })
      if (lastLazyLoadEvent.value) await onLazyLoad(lastLazyLoadEvent.value)
      return {
        data: response.data,
        message: 'EventType created successfully',
        succeeded: true,
        errors: null,
        pageNumber: 1,
        pageSize: 1,
        totalPages: 1,
        totalRecords: 1,
      }
    } catch (err: unknown) {
      let message = 'Failed to create EventType'

      const axiosErr = err as AxiosError<{ errorValue?: string }>
      if (axiosErr.response?.data?.errorValue) {
        message = axiosErr.response.data.errorValue
      }

      toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
      error.value = message

      return {
        data: null,
        message,
        succeeded: false,
        errors: err,
        pageNumber: 0,
        pageSize: 0,
        totalPages: 0,
        totalRecords: 0,
      }
    }
  }

  return {
    eventTypes,
    columns,
    isLoading,
    totalRecords,
    pageNumber,
    pageSize,
    allRows,
    editingRows,
    fetchInitialData,
    onLazyLoad,
    addEventType,
  }
}
