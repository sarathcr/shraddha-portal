import { ref } from 'vue'
import type { Event, UseEventsReturn } from '@/modules/events/types/event.types'
import type { ApiResponse } from '@/shared/types'
import { getEvents } from '@/modules/events/services/event.services'

import { formatDateDDMMYYYY as formatDate } from '@/shared/utils/dateUtils'

export function useEvents(): UseEventsReturn {
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pageNumber = ref(1)
  const pageSize = ref(8)
  const totalRecords = ref(0)
  const hasMore = ref(true)

  const loadEvents = async (filters: Record<string, string> = {}): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const cleanFilters: Record<string, string> = {}
      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== 'undefined' && val !== 'null') {
          cleanFilters[key] = val
        }
      })

      const response: ApiResponse<Event[]> = await getEvents(
        pageNumber.value,
        pageSize.value,
        cleanFilters,
      )

      const safeData = (response.data ?? []).map((event) => ({
        ...event,
        startDate: formatDate(event.startDate),
        endDate: formatDate(event.endDate),
      }))

      if (response.succeeded) {
        events.value.push(...safeData)
        totalRecords.value = response.totalRecords ?? safeData.length
        hasMore.value = events.value.length < totalRecords.value
      } else {
        error.value = response.message ?? null
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load events'
    } finally {
      loading.value = false
    }
  }

  const loadMore = async (filters: Record<string, string>): Promise<void> => {
    if (!hasMore.value || loading.value) return

    pageNumber.value++
    await loadEvents(filters)
  }

  return {
    events,
    loading,
    error,
    hasMore,
    loadEvents,
    loadMore,
  }
}
