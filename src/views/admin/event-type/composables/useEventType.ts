import { ref, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'

import type { DataTableFilterMeta } from 'primevue/datatable'

import { mapMatchModeToOperator } from '@/utils/filterUtils'
import type { EventType } from '@/types/eventType.model'
import type { ColumnDef } from '@/types/baseTable.model'
import { createEventType, getEventTypes, removeEventType } from '../../services/eventTypeService'
import axios from 'axios'

type LazyLoadEvent = {
  first: number
  rows: number
  filters: DataTableFilterMeta | undefined
  sortField?: string | ((item: unknown) => string) | null
  sortOrder?: 0 | 1 | -1 | null
}

export const useEventType = (): {
  eventTypes: Ref<EventType[]>
  columns: ColumnDef[]
  isLoading: Ref<boolean>
  totalRecords: Ref<number>
  pageNumber: Ref<number>
  pageSize: Ref<number>
  editingRows: Ref<EventType[]>
  fetchInitialData: () => Promise<void>
  onLazyLoad: (event: LazyLoadEvent) => Promise<void>
  deleteEventType: (role: EventType) => Promise<boolean>
  addEventType: (payload: EventType) => Promise<boolean>
} => {
  const toast = useToast()
  const eventTypes = ref<EventType[]>([])
  const isLoading = ref<boolean>(false)
  const totalRecords = ref<number>(0)

  const pageNumber = ref<number>(1)
  const pageSize = ref<number>(20)
  const editingRows = ref<EventType[]>([])

  const lastLazyLoadEvent = ref<LazyLoadEvent | null>(null)

  const columns = [
    { label: 'Event Type Name', key: 'eventTypeName', filterable: true },

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

            payload.filterMap[field] = filterString
          }
        })
      }

      const response = await getEventTypes(
        payload.pagination.pageNumber,
        payload.pagination.pageSize,
        payload.filterMap,
      )

      if (response?.succeeded) {
        eventTypes.value = response.data ?? []
        totalRecords.value = response.totalRecords ?? 0
        pageNumber.value = response.pageNumber ?? payload.pagination.pageNumber
        pageSize.value = response.pageSize ?? payload.pagination.pageSize
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: response.data || 'Failed to load Event type data.',
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
            : 'An error occurred while fetching Event Types.',
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

  const addEventType = async (eventTypeItem: EventType): Promise<boolean> => {
    try {
      const response = await createEventType(eventTypeItem)
      eventTypes.value.push(response.data)

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Event type created successfully.',
        life: 3000,
      })

      if (lastLazyLoadEvent.value) {
        await onLazyLoad(lastLazyLoadEvent.value)
      }

      return true
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail:
          axios.isAxiosError(error) && error.response?.data?.errorValue
            ? error.response.data.errorValue
            : 'Failed to create event type.',
        life: 3000,
      })

      console.error('Error creating event type:', error)
      return false
    }
  }

  const deleteEventType = async (eventTypeItem: EventType): Promise<boolean> => {
    try {
      const { success, message } = await removeEventType(eventTypeItem.id)
      if (!success) {
        throw new Error(message || 'Failed to delete event type.')
      }
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: message || 'Event type deleted successfully.',
        life: 3000,
      })

      if (lastLazyLoadEvent.value) await onLazyLoad(lastLazyLoadEvent.value)
      return true
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail:
          axios.isAxiosError(error) && error.response?.data?.errorValue
            ? error.response.data.errorValue
            : 'Failed to delete Event Type.',
        life: 3000,
      })
      console.error('Error deleting Event Type:', error)
      return false
    }
  }

  return {
    eventTypes,
    columns,
    isLoading,
    totalRecords,
    pageNumber,
    pageSize,
    editingRows,
    fetchInitialData,
    onLazyLoad,
    deleteEventType,
    addEventType,
  }
}
