import { ref, type Ref } from 'vue'
import type { Event } from '@/types/event'
import type { ApiResponse } from '@/types'
import { getEvents } from '@/views/admin/services/event.services'

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)

  if (isNaN(date.getTime())) return dateString

  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()

  return `${d}/${m}/${y}`
}

export function useEvents(): {
  events: Ref<Event[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  hasMore: Ref<boolean>
  loadEvents: (filters?: Record<string, string>) => Promise<void>
  loadMore: (filters?: Record<string, string>) => Promise<void>
} {
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pageNumber = ref(1)
  const pageSize = ref(8)
  const totalRecords = ref(0)
  const hasMore = ref(true)

  const currentFilters = ref<Record<string, string>>({})

  const loadEvents = async (filters: Record<string, string> = {}): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      if (JSON.stringify(filters) !== JSON.stringify(currentFilters.value)) {
        events.value = []
        pageNumber.value = 1
        hasMore.value = true
      }

      currentFilters.value = filters

      const response: ApiResponse<Event[]> = await getEvents(
        pageNumber.value,
        pageSize.value,
        filters,
      )

      const safeData = (response.data ?? []).map((ev) => ({
        ...ev,
        startDate: formatDate(ev.startDate),
        endDate: formatDate(ev.endDate),
      }))

      if (response.succeeded) {
        events.value.push(...safeData)
        totalRecords.value = response.totalRecords ?? safeData.length
        hasMore.value = events.value.length < totalRecords.value
      } else {
        error.value = response.message
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load events'
    } finally {
      loading.value = false
    }
  }

  const loadMore = async (filters?: Record<string, string>): Promise<void> => {
    if (!hasMore.value || loading.value) return

    if (filters) currentFilters.value = filters

    pageNumber.value++
    await loadEvents(currentFilters.value)
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
