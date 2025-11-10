import { ref, onMounted, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getEventTypes } from '../../services/eventTypeService'
import type { ApiResponse } from '@/types'
import type { EventType, UseEventTypesReturn } from '@/types/event'

export function useEventTypes(): UseEventTypesReturn {
  const eventTypes: Ref<EventType[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const toast = useToast()

  const fetchAllEventTypes = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const response: ApiResponse<EventType[]> = await getEventTypes(-1, -1)

      if (response.succeeded) {
        eventTypes.value = response.data ?? []
      } else {
        error.value = response.message || 'Failed to fetch event types.'
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.value,
          life: 3000,
        })
      }
    } catch (err: unknown) {
      error.value = 'An error occurred while fetching event types.'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.value,
        life: 3000,
      })
      console.error('Error fetching event types:', err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void fetchAllEventTypes()
  })

  return {
    eventTypes,
    loading,
    error,
    fetchAllEventTypes,
  }
}
