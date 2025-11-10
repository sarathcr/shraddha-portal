import { ref, onMounted, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { getEventsByEventType } from '../../services/EventService'
import type { ApiResponse } from '@/types'
import type { Event, UseEventsReturn } from '@/types/event'

export function useEvents(): UseEventsReturn {
  const route = useRoute()
  const toast = useToast()

  const events: Ref<Event[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const fetchEvents = async (eventTypeId: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const response: ApiResponse<Event[]> = await getEventsByEventType(eventTypeId)

      if (response.succeeded) {
        events.value = response.data ?? []
      } else {
        error.value = response.message || 'Failed to fetch events.'
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.value,
          life: 3000,
        })
      }
    } catch (err) {
      error.value = 'An unexpected error occurred while fetching events.'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.value,
        life: 3000,
      })
      console.error('Error fetching events:', err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    const eventTypeId = route.params.id as string
    if (eventTypeId) {
      void fetchEvents(eventTypeId)
    }
  })

  return { events, loading, error, fetchEvents }
}
